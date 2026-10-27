const express = require('express');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get(
  '/stats',
  auth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    // Booking stats
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({
      status: 'cancelled',
    });

    // Revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Movie stats
    const totalMovies = await Movie.countDocuments();
    const nowShowingMovies = await Movie.countDocuments({
      status: 'now_showing',
    });

    // Cinema stats
    const totalCinemas = await Cinema.countDocuments();

    // User stats
    const totalUsers = await User.countDocuments();

    // Recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title' },
          { path: 'cinema', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Popular movies (top 5 by booking count)
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
      { $limit: 5 },
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
          bookingCount: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Revenue by movie
    const revenueByMovie = await Booking.aggregate([
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
          revenue: { $sum: '$totalPrice' },
        },
      },
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
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        activeBookings,
        cancelledBookings,
        totalRevenue,
        totalMovies,
        nowShowingMovies,
        totalCinemas,
        totalUsers,
        recentBookings,
        popularMovies,
        revenueByMovie,
      },
    });
  })
);

module.exports = router;
