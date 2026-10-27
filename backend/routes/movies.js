const express = require('express');
const { body, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// @route   GET /api/movies
// @desc    Get all movies with optional filters (category: hollywood/bollywood, status, genre, search)
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, genre, search, category } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    if (genre) {
      query.genre = { $in: genre.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'cast': { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
      ];
    }

    const movies = await Movie.find(query).sort({ imdbRating: -1, releaseDate: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  })
);

// @route   GET /api/movies/:id
// @desc    Get single movie
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  })
);

// @route   POST /api/movies
// @desc    Create a movie
// @access  Public
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
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

    const movie = await Movie.create(req.body);

    res.status(201).json({
      success: true,
      data: movie,
    });
  })
);

// @route   PUT /api/movies/:id
// @desc    Update a movie
// @access  Public
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: movie,
    });
  })
);

// @route   DELETE /api/movies/:id
// @desc    Delete a movie
// @access  Public
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    await movie.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  })
);

module.exports = router;
