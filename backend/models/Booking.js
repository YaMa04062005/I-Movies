const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user'],
  },
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: [true, 'Please add a showtime'],
  },
  seats: {
    type: [String],
    required: [true, 'Please add at least one seat'],
    validate: {
      validator: function (v) {
        return v.length >= 1;
      },
      message: 'At least one seat is required',
    },
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please add total price'],
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
  bookingReference: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate booking reference before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    const randomStr = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .slice(0, 8);
    this.bookingReference = `IMV-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
