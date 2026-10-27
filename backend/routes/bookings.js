const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * Validate that seat labels are valid for the given screen layout.
 * Seat format: "A1", "B12", etc. where letter = row, number = seat in row.
 */
const validateSeats = (seats, screen) => {
  const invalidSeats = [];
  for (const seat of seats) {
    const match = seat.match(/^([A-Z])(\d+)$/);
    if (!match) {
      invalidSeats.push(seat);
      continue;
    }
    const rowLetter = match[1];
    const seatNum = parseInt(match[2], 10);
    const rowIndex = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // 1-based

    if (rowIndex > screen.rows || seatNum < 1 || seatNum > screen.seatsPerRow) {
      invalidSeats.push(seat);
    }
  }
  return invalidSeats;
};

/**
 * Calculate total price based on seat positions and showtime pricing.
 */
const calculateTotalPrice = (seats, showtime, screen) => {
  let total = 0;

  for (const seat of seats) {
    const match = seat.match(/^([A-Z])(\d+)$/);
    const rowIndex = match[1].charCodeAt(0) - 'A'.charCodeAt(0) + 1; // 1-based

    // Find the seat type for this row
    let seatPrice = 0;
    if (screen && screen.seatTypes && screen.seatTypes.length > 0) {
      for (const seatType of screen.seatTypes) {
        if (seatType.rows.includes(rowIndex)) {
          // Find matching price from showtime pricing
          const pricingEntry = showtime.pricing.find(
            (p) => p.seatType === seatType.type
          );
          seatPrice = pricingEntry ? pricingEntry.price : seatType.price;
          break;
        }
      }
    }

    // Fallback: use first pricing entry or 0
    if (seatPrice === 0 && showtime.pricing.length > 0) {
      seatPrice = showtime.pricing[0].price;
    }

    total += seatPrice;
  }

  return total;
};

// @route   GET /api/bookings
// @desc    Get current user's bookings
// @access  Private
router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title posterUrl duration rating' },
          { path: 'cinema', select: 'name location city' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  })
);

// @route   GET /api/bookings/admin/all
// @desc    Get all bookings (admin)
// @access  Private/Admin
router.get(
  '/admin/all',
  auth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { status, user: userId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (userId) {
      query.user = userId;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title' },
          { path: 'cinema', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  })
);

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private (owner or admin)
router.get(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie' },
          { path: 'cinema' },
        ],
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check ownership or admin
    if (
      booking.user._id.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  })
);

// @route   POST /api/bookings
// @desc    Create a booking
// @access  Private
router.post(
  '/',
  auth,
  [
    body('showtime').notEmpty().withMessage('Showtime is required'),
    body('seats')
      .isArray({ min: 1 })
      .withMessage('At least one seat is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { showtime: showtimeId, seats: requestedSeats } = req.body;

    // Get the showtime
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    if (showtime.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'This showtime is not available for booking',
      });
    }

    // Get the cinema and screen
    const cinema = await Cinema.findById(showtime.cinema);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found',
      });
    }

    const screen = cinema.screens[showtime.screenIndex];
    if (!screen) {
      return res.status(400).json({
        success: false,
        message: 'Invalid screen configuration',
      });
    }

    // Validate seat labels
    const invalidSeats = validateSeats(requestedSeats, screen);
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seats: ${invalidSeats.join(', ')}`,
      });
    }

    // Atomically try to book the seats using $addToSet
    // Only succeeds if none of the requested seats are already booked
    const result = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: requestedSeats },
      },
      {
        $addToSet: { bookedSeats: { $each: requestedSeats } },
      },
      { new: true }
    );

    if (!result) {
      return res.status(409).json({
        success: false,
        message: 'One or more seats are already booked',
      });
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(requestedSeats, showtime, screen);

    // Create the booking
    const booking = await Booking.create({
      user: req.user.id,
      showtime: showtimeId,
      seats: requestedSeats,
      totalPrice,
    });

    // Populate for response
    await booking.populate({
      path: 'showtime',
      populate: [
        { path: 'movie', select: 'title posterUrl' },
        { path: 'cinema', select: 'name location' },
      ],
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  })
);

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private (owner or admin)
router.patch(
  '/:id/cancel',
  auth,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check ownership or admin
    if (
      booking.user.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Remove seats from showtime atomically
    await Showtime.findByIdAndUpdate(booking.showtime, {
      $pullAll: { bookedSeats: booking.seats },
    });

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  })
);

module.exports = router;
