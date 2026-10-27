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
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please add a release date'],
  },
  posterUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x450?text=No+Poster',
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movie', movieSchema);
