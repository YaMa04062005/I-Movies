const express = require('express');
const { body, validationResult } = require('express-validator');
const Cinema = require('../models/Cinema');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// @route   GET /api/cinemas
// @desc    Get all cinemas
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cinemas = await Cinema.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cinemas.length,
      data: cinemas,
    });
  })
);

// @route   GET /api/cinemas/:id
// @desc    Get single cinema
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found',
      });
    }

    res.status(200).json({
      success: true,
      data: cinema,
    });
  })
);

// @route   POST /api/cinemas
// @desc    Create a cinema
// @access  Private/Admin
router.post(
  '/',
  auth,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Cinema name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('screens')
      .isArray({ min: 1 })
      .withMessage('At least one screen is required'),
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

    const cinema = await Cinema.create(req.body);

    res.status(201).json({
      success: true,
      data: cinema,
    });
  })
);

// @route   PUT /api/cinemas/:id
// @desc    Update a cinema
// @access  Private/Admin
router.put(
  '/:id',
  auth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    let cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found',
      });
    }

    cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: cinema,
    });
  })
);

// @route   DELETE /api/cinemas/:id
// @desc    Delete a cinema
// @access  Private/Admin
router.delete(
  '/:id',
  auth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found',
      });
    }

    await cinema.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  })
);

module.exports = router;
