const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Please add a movie'],
  },
  cinema: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: [true, 'Please add a cinema'],
  },
  screenIndex: {
    type: Number,
    required: [true, 'Please add a screen index'],
  },
  dateTime: {
    type: Date,
    required: [true, 'Please add a date and time'],
  },
  endTime: {
    type: Date,
  },
  pricing: [
    {
      seatType: { type: String, required: true },
      price: { type: Number, required: true },
      _id: false,
    },
  ],
  bookedSeats: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate endTime from movie duration before saving
showtimeSchema.pre('save', async function (next) {
  if (this.isModified('dateTime') || this.isNew) {
    try {
      const Movie = mongoose.model('Movie');
      const movie = await Movie.findById(this.movie);
      if (movie && movie.duration) {
        this.endTime = new Date(
          this.dateTime.getTime() + movie.duration * 60 * 1000
        );
      }
    } catch (error) {
      // If movie not found, leave endTime unset
    }
  }
  next();
});

module.exports = mongoose.model('Showtime', showtimeSchema);
