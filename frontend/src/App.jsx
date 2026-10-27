import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';

// Public Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Cinemas from './pages/Cinemas';
import CinemaDetail from './pages/CinemaDetail';
import Showtimes from './pages/Showtimes';
import NotFound from './pages/NotFound';

// Direct Booking Pages (No login required)
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';

// Admin Pages (Directly accessible)
import Dashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageCinemas from './pages/admin/ManageCinemas';
import ManageShowtimes from './pages/admin/ManageShowtimes';
import ManageBookings from './pages/admin/ManageBookings';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Main User Workflow */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/movies/:id/showtimes" element={<Showtimes />} />
          <Route path="/cinemas" element={<Cinemas />} />
          <Route path="/cinemas/:id" element={<CinemaDetail />} />

          {/* Direct Seat Selection & Booking */}
          <Route path="/booking/:showtimeId" element={<SeatSelection />} />
          <Route
            path="/booking/confirmation/:bookingId"
            element={<BookingConfirmation />}
          />
          <Route path="/my-bookings" element={<MyBookings />} />

          {/* Admin Management Tools */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/movies" element={<ManageMovies />} />
          <Route path="/admin/cinemas" element={<ManageCinemas />} />
          <Route path="/admin/showtimes" element={<ManageShowtimes />} />
          <Route path="/admin/bookings" element={<ManageBookings />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>

      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  );
}

export default App;
