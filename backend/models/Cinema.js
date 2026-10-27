const mongoose = require('mongoose');

const seatTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rows: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    screenNumber: {
      type: Number,
      required: [true, 'Please add a screen number'],
    },
    name: {
      type: String,
      required: [true, 'Please add a screen name'],
    },
    rows: {
      type: Number,
      required: [true, 'Please add number of rows'],
      min: [1, 'Minimum 1 row'],
      max: [26, 'Maximum 26 rows'],
    },
    seatsPerRow: {
      type: Number,
      required: [true, 'Please add seats per row'],
      min: [1, 'Minimum 1 seat per row'],
      max: [30, 'Maximum 30 seats per row'],
    },
    seatTypes: [seatTypeSchema],
  },
  { _id: false }
);

const cinemaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a cinema name'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
  },
  screens: [screenSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cinema', cinemaSchema);
