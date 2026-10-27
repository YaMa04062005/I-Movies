const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a movie title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  genre: {
    type: [String],
    required: [true, 'Please add at least one genre'],
  },
  duration: {
    type: Number,
    required: [true, 'Please add movie duration in minutes'],
  },
  rating: {
    type: String,
    default: 'UA',
  },
  imdbRating: {
    type: Number,
    default: 8.0,
  },
  votesCount: {
    type: String,
    default: '120K+',
  },
  category: {
    type: String,
    enum: ['hollywood', 'bollywood'],
    default: 'hollywood',
  },
  formats: {
    type: [String],
    default: ['2D', 'IMAX 2D', 'Dolby Atmos'],
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please add a release date'],
  },
  posterUrl: {
    type: String,
    default: '/posters/interstellar.jpg',
  },
  bannerUrl: {
    type: String,
  },
  director: {
    type: String,
  },
  cast: {
    type: [String],
  },
  language: {
    type: String,
    default: 'English',
  },
  status: {
    type: String,
    enum: ['now_showing', 'coming_soon', 'ended'],
    default: 'now_showing',
  },
  liveViewers: {
    type: Number,
    default: 1250,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movie', movieSchema);
