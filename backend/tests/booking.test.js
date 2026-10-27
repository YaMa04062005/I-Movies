const request = require('supertest');
const app = require('../server');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Booking Endpoints & Concurrency Verification', () => {
  let user1, user2;
  let user1Token, user2Token;
  let movie, cinema, showtime;

  beforeEach(async () => {
    user1 = await User.create({
      name: 'User One',
      email: 'user1@test.com',
      password: 'password123',
      role: 'user',
    });
    user2 = await User.create({
      name: 'User Two',
      email: 'user2@test.com',
      password: 'password123',
      role: 'user',
    });

    user1Token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    user2Token = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    movie = await Movie.create({
      title: 'Interstellar',
      description: 'Space epic',
      genre: ['Sci-Fi'],
      duration: 169,
      rating: 'PG-13',
      releaseDate: new Date('2014-11-07'),
      status: 'now_showing',
    });

    cinema = await Cinema.create({
      name: 'Grand Cinema',
      location: '100 Main St',
      city: 'Metropolis',
      screens: [
        {
          screenNumber: 1,
          name: 'Screen 1',
          rows: 5,
          seatsPerRow: 10,
          seatTypes: [
            { type: 'standard', price: 10, rows: [1, 2, 3] },
            { type: 'premium', price: 15, rows: [4, 5] },
          ],
        },
      ],
    });

    const showDate = new Date();
    showDate.setDate(showDate.getDate() + 1);

    showtime = await Showtime.create({
      movie: movie._id,
      cinema: cinema._id,
      screenIndex: 0,
      dateTime: showDate,
      pricing: [
        { seatType: 'standard', price: 10 },
        { seatType: 'premium', price: 15 },
      ],
      bookedSeats: [],
    });
  });

  describe('POST /api/bookings', () => {
    it('should create booking and calculate price accurately', async () => {
      // Row A is row 1 (standard = $10), Row D is row 4 (premium = $15)
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          showtime: showtime._id.toString(),
          seats: ['A1', 'D1'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPrice).toBe(25); // 10 + 15
      expect(res.body.data.seats).toEqual(['A1', 'D1']);
      expect(res.body.data.bookingReference).toMatch(/^IMV-[A-F0-9]{8}$/);

      // Verify showtime has seats marked booked
      const updatedShowtime = await Showtime.findById(showtime._id);
      expect(updatedShowtime.bookedSeats).toContain('A1');
      expect(updatedShowtime.bookedSeats).toContain('D1');
    });

    it('should prevent booking seats that are already booked', async () => {
      // First booking succeeds
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          showtime: showtime._id.toString(),
          seats: ['A1', 'A2'],
        });

      // Second user tries to book the same seat A2
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          showtime: showtime._id.toString(),
          seats: ['A2', 'A3'],
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already booked/i);

      // Verify A3 was NOT booked because atomic operation failed
      const updatedShowtime = await Showtime.findById(showtime._id);
      expect(updatedShowtime.bookedSeats).not.toContain('A3');
    });

    it('should handle simulated concurrent booking race conditions safely', async () => {
      // Both users send booking request concurrently for seat B5
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            showtime: showtime._id.toString(),
            seats: ['B5'],
          }),
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            showtime: showtime._id.toString(),
            seats: ['B5'],
          }),
      ]);

      const statuses = [res1.statusCode, res2.statusCode].sort();
      // Exactly one must succeed (201) and the other must be rejected (409)
      expect(statuses).toEqual([201, 409]);

      // Exactly one seat B5 in bookedSeats array
      const updatedShowtime = await Showtime.findById(showtime._id);
      const countB5 = updatedShowtime.bookedSeats.filter((s) => s === 'B5').length;
      expect(countB5).toBe(1);
    });

    it('should reject invalid seat labels outside screen layout bounds', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          showtime: showtime._id.toString(),
          seats: ['Z99'], // Screen only has 5 rows (A-E) and 10 seats
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid seats/i);
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    let bookingId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          showtime: showtime._id.toString(),
          seats: ['C1', 'C2'],
        });
      bookingId = res.body.data._id;
    });

    it('should allow user to cancel booking and release seats back to pool', async () => {
      const cancelRes = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(cancelRes.statusCode).toBe(200);
      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.data.status).toBe('cancelled');

      // Verify seats are removed from showtime bookedSeats
      const updatedShowtime = await Showtime.findById(showtime._id);
      expect(updatedShowtime.bookedSeats).not.toContain('C1');
      expect(updatedShowtime.bookedSeats).not.toContain('C2');

      // User 2 can now book those released seats
      const rebookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          showtime: showtime._id.toString(),
          seats: ['C1', 'C2'],
        });

      expect(rebookRes.statusCode).toBe(201);
      expect(rebookRes.body.success).toBe(true);
    });

    it('should reject non-owner from cancelling another user booking', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent cancelling an already cancelled booking', async () => {
      await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${user1Token}`);

      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already cancelled/i);
    });
  });
});

