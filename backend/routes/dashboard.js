const express = require('express');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Public
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({
      status: 'cancelled',
    });

    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    const totalMovies = await Movie.countDocuments();
    const hollywoodMovies = await Movie.countDocuments({ category: 'hollywood' });
    const bollywoodMovies = await Movie.countDocuments({ category: 'bollywood' });
    const totalCinemas = await Cinema.countDocuments();

    const recentBookings = await Booking.find()
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title' },
          { path: 'cinema', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(10);

    const popularMovies = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtime',
          foreignField: '_id',
          as: 'showtimeData',
        },
      },
      { $unwind: '$showtimeData' },
      {
        $group: {
          _id: '$showtimeData.movie',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieData',
        },
      },
      { $unwind: '$movieData' },
      {
        $project: {
          _id: 1,
          title: '$movieData.title',
          posterUrl: '$movieData.posterUrl',
          imdbRating: '$movieData.imdbRating',
          category: '$movieData.category',
          bookingCount: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        activeBookings,
        cancelledBookings,
        totalRevenue,
        totalMovies,
        hollywoodMovies,
        bollywoodMovies,
        totalCinemas,
        recentBookings,
        popularMovies,
      },
    });
  })
);

module.exports = router;
