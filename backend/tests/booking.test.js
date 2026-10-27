const request = require('supertest');
const app = require('../server');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

describe('Booking Endpoints & Concurrency Verification', () => {
  let movie, cinema, showtime;

  beforeEach(async () => {
    movie = await Movie.create({
      title: 'Interstellar',
      description: 'Space epic',
      genre: ['Sci-Fi'],
      duration: 169,
      rating: 'UA',
      imdbRating: 8.7,
      category: 'hollywood',
      releaseDate: new Date('2014-11-07'),
      posterUrl: '/posters/interstellar.jpg',
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

  describe('POST /api/bookings (Frictionless Direct Booking)', () => {
    it('should create booking directly without auth and calculate price accurately', async () => {
      // Row A is row 1 (standard = $10), Row D is row 4 (premium = $15)
      const res = await request(app)
        .post('/api/bookings')
        .send({
          showtime: showtime._id.toString(),
          seats: ['A1', 'D1'],
          customerName: 'Alice Fan',
          customerEmail: 'alice@example.com',
          customerPhone: '+1 555-0199',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPrice).toBe(25); // 10 + 15
      expect(res.body.data.seats).toEqual(['A1', 'D1']);
      expect(res.body.data.customerName).toBe('Alice Fan');
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
        .send({
          showtime: showtime._id.toString(),
          seats: ['A1', 'A2'],
          customerName: 'Guest 1',
        });

      // Second customer tries to book the same seat A2
      const res = await request(app)
        .post('/api/bookings')
        .send({
          showtime: showtime._id.toString(),
          seats: ['A2', 'A3'],
          customerName: 'Guest 2',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/booked/i);

      // Verify A3 was NOT booked because atomic operation failed
      const updatedShowtime = await Showtime.findById(showtime._id);
      expect(updatedShowtime.bookedSeats).not.toContain('A3');
    });

    it('should handle simulated concurrent booking race conditions safely', async () => {
      // Both customers send booking request concurrently for seat B5
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/api/bookings')
          .send({
            showtime: showtime._id.toString(),
            seats: ['B5'],
            customerName: 'Racer 1',
          }),
        request(app)
          .post('/api/bookings')
          .send({
            showtime: showtime._id.toString(),
            seats: ['B5'],
            customerName: 'Racer 2',
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
        .send({
          showtime: showtime._id.toString(),
          seats: ['C1', 'C2'],
          customerName: 'Cancel Tester',
        });
      bookingId = res.body.data._id;
    });

    it('should allow customer to cancel booking and release seats back to pool', async () => {
      const cancelRes = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`);

      expect(cancelRes.statusCode).toBe(200);
      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.data.status).toBe('cancelled');

      // Verify seats are removed from showtime bookedSeats
      const updatedShowtime = await Showtime.findById(showtime._id);
      expect(updatedShowtime.bookedSeats).not.toContain('C1');
      expect(updatedShowtime.bookedSeats).not.toContain('C2');

      // Another customer can now re-book those released seats
      const rebookRes = await request(app)
        .post('/api/bookings')
        .send({
          showtime: showtime._id.toString(),
          seats: ['C1', 'C2'],
          customerName: 'Rebooker',
        });

      expect(rebookRes.statusCode).toBe(201);
      expect(rebookRes.body.success).toBe(true);
    });

    it('should prevent cancelling an already cancelled booking', async () => {
      await request(app).patch(`/api/bookings/${bookingId}/cancel`);

      const res = await request(app).patch(`/api/bookings/${bookingId}/cancel`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already cancelled/i);
    });
  });
});
