const request = require('supertest');
const app = require('../server');
const Movie = require('../models/Movie');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Movie Endpoints', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    const user = await User.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
    });

    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
  });

  describe('GET /api/movies', () => {
    beforeEach(async () => {
      await Movie.insertMany([
        {
          title: 'Inception',
          description: 'Dream within a dream',
          genre: ['Action', 'Sci-Fi'],
          duration: 148,
          rating: 'PG-13',
          releaseDate: new Date('2010-07-16'),
          status: 'now_showing',
        },
        {
          title: 'Interstellar',
          description: 'Space travel across galaxies',
          genre: ['Adventure', 'Drama', 'Sci-Fi'],
          duration: 169,
          rating: 'PG-13',
          releaseDate: new Date('2014-11-07'),
          status: 'coming_soon',
        },
      ]);
    });

    it('should list all movies', async () => {
      const res = await request(app).get('/api/movies');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter movies by status', async () => {
      const res = await request(app).get('/api/movies?status=now_showing');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Inception');
    });

    it('should filter movies by search query', async () => {
      const res = await request(app).get('/api/movies?search=stellar');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Interstellar');
    });
  });

  describe('POST /api/movies', () => {
    it('should allow admin to create a new movie', async () => {
      const newMovie = {
        title: 'Oppenheimer',
        description: 'Story of J. Robert Oppenheimer',
        genre: ['Biography', 'Drama', 'History'],
        duration: 180,
        rating: 'R',
        releaseDate: '2023-07-21',
        status: 'now_showing',
      };

      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMovie);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Oppenheimer');
    });

    it('should forbid non-admin user from creating a movie', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Movie',
          description: 'test',
          genre: ['Drama'],
          duration: 120,
          releaseDate: '2024-01-01',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/movies/:id', () => {
    it('should allow admin to update a movie', async () => {
      const movie = await Movie.create({
        title: 'Old Title',
        description: 'Old Description',
        genre: ['Drama'],
        duration: 100,
        rating: 'PG',
        releaseDate: new Date('2020-01-01'),
        status: 'now_showing',
      });

      const res = await request(app)
        .put(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'New Updated Title' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Updated Title');
    });
  });

  describe('DELETE /api/movies/:id', () => {
    it('should allow admin to delete a movie', async () => {
      const movie = await Movie.create({
        title: 'Movie To Delete',
        description: 'Will be deleted',
        genre: ['Action'],
        duration: 90,
        rating: 'PG',
        releaseDate: new Date('2022-01-01'),
      });

      const res = await request(app)
        .delete(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Movie.findById(movie._id);
      expect(check).toBeNull();
    });
  });
});

