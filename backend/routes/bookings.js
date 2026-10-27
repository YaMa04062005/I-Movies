const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * Validate that seat labels are valid for the given screen layout.
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
    const rowIndex = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

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
    const rowIndex = match[1].charCodeAt(0) - 'A'.charCodeAt(0) + 1;

    let seatPrice = 0;
    if (screen && screen.seatTypes && screen.seatTypes.length > 0) {
      for (const seatType of screen.seatTypes) {
        if (seatType.rows.includes(rowIndex)) {
          const pricingEntry = showtime.pricing.find(
            (p) => p.seatType === seatType.type
          );
          seatPrice = pricingEntry ? pricingEntry.price : seatType.price;
          break;
        }
      }
    }

    if (seatPrice === 0 && showtime.pricing.length > 0) {
      seatPrice = showtime.pricing[0].price;
    }

    total += seatPrice;
  }

  return total;
};

// @route   GET /api/bookings
// @desc    Get bookings (optionally filtered by email, reference, or list recent)
// @access  Public (No auth required)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { email, reference, ids } = req.query;
    const query = {};

    if (email) {
      query.customerEmail = { $regex: email, $options: 'i' };
    }
    if (reference) {
      query.bookingReference = reference.toUpperCase();
    }
    if (ids) {
      const idArray = ids.split(',').filter(Boolean);
      query._id = { $in: idArray };
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title posterUrl duration rating category' },
          { path: 'cinema', select: 'name location city' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  })
);

// @route   GET /api/bookings/admin/all
// @desc    Get all bookings
// @access  Public
router.get(
  '/admin/all',
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
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
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate({
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

    res.status(200).json({
      success: true,
      data: booking,
    });
  })
);

// @route   POST /api/bookings
// @desc    Create a booking directly (no authentication required)
// @access  Public
router.post(
  '/',
  [
    body('showtime')
      .custom((val, { req }) => !!(val || req.body.showtimeId))
      .withMessage('Showtime is required'),
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

    const showtimeId = req.body.showtime || req.body.showtimeId;
    const rawSeats = req.body.seats || [];
    const requestedSeats = rawSeats.map((s) =>
      typeof s === 'string' ? s : s.seatLabel || s.label || String(s)
    );
    const {
      customerName = 'Movie Fan',
      customerEmail = 'guest@imovies.com',
      customerPhone = '',
    } = req.body;

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

    const invalidSeats = validateSeats(requestedSeats, screen);
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seats: ${invalidSeats.join(', ')}`,
      });
    }

    // Atomically reserve seats
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
        message: 'One or more seats were just booked by another customer',
      });
    }

    const totalPrice = calculateTotalPrice(requestedSeats, showtime, screen);

    const booking = await Booking.create({
      customerName,
      customerEmail,
      customerPhone,
      showtime: showtimeId,
      seats: requestedSeats,
      totalPrice,
    });

    await booking.populate({
      path: 'showtime',
      populate: [
        { path: 'movie', select: 'title posterUrl duration rating' },
        { path: 'cinema', select: 'name location' },
      ],
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  })
);

// @route   PATCH /api/bookings/:id/cancel & PUT /api/bookings/:id/cancel
// @desc    Cancel a booking and release seats
// @access  Public
const handleCancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Booking is already cancelled',
    });
  }

  // Release seats atomically back to showtime
  await Showtime.findByIdAndUpdate(booking.showtime, {
    $pullAll: { bookedSeats: booking.seats },
  });

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
  });
});

router.patch('/:id/cancel', handleCancelBooking);
router.put('/:id/cancel', handleCancelBooking);

module.exports = router;
