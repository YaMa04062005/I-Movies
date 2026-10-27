const express = require('express');
const { body, validationResult } = require('express-validator');
const Showtime = require('../models/Showtime');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// @route   GET /api/showtimes
// @desc    Get all showtimes with optional filters
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { movie, cinema, date } = req.query;
    const query = {};

    if (movie) {
      query.movie = movie;
    }

    if (cinema) {
      query.cinema = cinema;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.dateTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const showtimes = await Showtime.find(query)
      .populate('movie', 'title duration posterUrl rating')
      .populate('cinema', 'name location city')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: showtimes,
    });
  })
);

// @route   GET /api/showtimes/:id
// @desc    Get single showtime
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('cinema');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    res.status(200).json({
      success: true,
      data: showtime,
    });
  })
);

// @route   POST /api/showtimes
// @desc    Create a showtime
// @access  Private/Admin
router.post(
  '/',
  auth,
  authorize('admin'),
  [
    body('movie').notEmpty().withMessage('Movie is required'),
    body('cinema').notEmpty().withMessage('Cinema is required'),
    body('screenIndex')
      .isNumeric()
      .withMessage('Screen index is required'),
    body('dateTime')
      .isISO8601()
      .withMessage('Valid date and time is required'),
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

    const showtime = await Showtime.create(req.body);

    // Populate for response
    await showtime.populate('movie', 'title duration');
    await showtime.populate('cinema', 'name location');

    res.status(201).json({
      success: true,
      data: showtime,
    });
  })
);

// @route   PUT /api/showtimes/:id
// @desc    Update a showtime
// @access  Private/Admin
router.put(
  '/:id',
  auth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    let showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: showtime,
    });
  })
);

// @route   DELETE /api/showtimes/:id
// @desc    Delete a showtime
// @access  Private/Admin
router.delete(
  '/:id',
  auth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    await showtime.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  })
);

module.exports = router;
