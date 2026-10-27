import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'react-toastify';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaTimesCircle,
  FaCheckCircle,
  FaBan,
  FaSearch,
  FaUser,
} from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [searchRef, setSearchRef] = useState('');

  const fetchBookings = async (customRef = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (customRef.trim()) {
        params.reference = customRef.trim();
      } else {
        // Check saved booking IDs in localStorage
        try {
          const saved = JSON.parse(
            localStorage.getItem('imovies_my_bookings') || '[]'
          );
          if (saved.length > 0) {
            params.ids = saved.join(',');
          }
        } catch {
          // fallback
        }
      }

      const res = await api.get('/bookings', { params });
      if (res.data && res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(searchRef);
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking? The reserved seats will be released back immediately.'
    );
    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      if (res.data && res.data.success) {
        toast.success('Booking cancelled and seats released successfully');
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to cancel booking'
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Bookings & E-Tickets</h1>
          <p>View your confirmed movie reservations and digital entry passes</p>
        </div>

        {/* Quick Ticket Lookup */}
        <form onSubmit={handleSearchSubmit} className="ticket-search-form">
          <input
            type="text"
            placeholder="Find by Reference (e.g. IMV-XXXX)..."
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
          />
          <button type="submit" className="btn-search-ref">
            <FaSearch /> Search
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your tickets..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchBookings()} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={FaTicketAlt}
          title="No bookings found"
          description="You haven't reserved any tickets yet, or no booking matched your search reference."
          actionLabel="Browse Movies Now"
          onAction={() => (window.location.href = '/movies')}
        />
      ) : (
        <div className="my-bookings-list">
          {bookings.map((booking) => {
            const showtime = booking.showtime;
            const movie = showtime?.movie;
            const cinema = showtime?.cinema;
            const dt = showtime?.dateTime ? new Date(showtime.dateTime) : null;
            const isConfirmed = booking.status === 'confirmed';

            return (
              <div
                key={booking._id}
                className={`booking-card ${
                  isConfirmed ? 'confirmed' : 'cancelled'
                }`}
              >
                <div className="booking-card-poster">
                  <img
                    src={movie?.posterUrl || '/posters/interstellar.jpg'}
                    alt={movie?.title || 'Movie'}
                    onError={(e) => {
                      e.target.src = '/posters/interstellar.jpg';
                    }}
                  />
                </div>

                <div className="booking-card-main">
                  <div className="booking-card-header">
                    <div>
                      <span className="booking-ref">
                        Ref: {booking.bookingReference}
                      </span>
                      <h3 className="booking-movie-title">{movie?.title}</h3>
                    </div>
                    <span
                      className={`booking-status-badge ${
                        isConfirmed ? 'badge-confirmed' : 'badge-cancelled'
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <FaCheckCircle /> Confirmed
                        </>
                      ) : (
                        <>
                          <FaBan /> Cancelled
                        </>
                      )}
                    </span>
                  </div>

                  <div className="booking-card-details">
                    <div className="detail-item">
                      <FaBuilding />
                      <span>
                        {cinema?.name} ({cinema?.city})
                      </span>
                    </div>
                    {dt && (
                      <div className="detail-item">
                        <FaCalendarAlt />
                        <span>
                          {dt.toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    {dt && (
                      <div className="detail-item">
                        <FaClock />
                        <span>
                          {dt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    {booking.customerName && (
                      <div className="detail-item">
                        <FaUser />
                        <span>{booking.customerName}</span>
                      </div>
                    )}
                  </div>

                  <div className="booking-seats-strip">
                    <span className="seats-label">Seats Reserved:</span>
                    <div className="seats-chips-row">
                      {booking.seats?.map((seat) => (
                        <span key={seat} className="seat-badge">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="booking-card-footer">
                    <div className="booking-price-box">
                      <span className="price-label">Total Amount Paid:</span>
                      <span className="price-val">
                        ${booking.totalPrice?.toFixed(2)}
                      </span>
                    </div>

                    {isConfirmed && (
                      <button
                        type="button"
                        className="btn-cancel-booking"
                        disabled={cancellingId === booking._id}
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        <FaTimesCircle />{' '}
                        {cancellingId === booking._id
                          ? 'Cancelling...'
                          : 'Cancel Reservation'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
