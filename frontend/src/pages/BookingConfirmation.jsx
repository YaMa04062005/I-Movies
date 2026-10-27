import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  FaCheckCircle,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaHome,
} from 'react-icons/fa';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await api.get(`/bookings/${bookingId}`);
          if (res.data && res.data.success) {
            setBooking(res.data.data);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load booking details');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [bookingId, booking]);

  if (loading) return <LoadingSpinner message="Retrieving booking confirmation..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!booking) return <ErrorMessage message="Booking not found" />;

  const showtime = booking.showtime;
  const movie = showtime?.movie;
  const cinema = showtime?.cinema;
  const dt = showtime?.dateTime ? new Date(showtime.dateTime) : null;

  return (
    <div className="page-container confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <FaCheckCircle className="confirmation-icon" />
          <h1>Booking Confirmed!</h1>
          <p className="confirmation-subtitle">
            Your e-ticket has been generated. Show your booking reference at the box office or entrance.
          </p>
        </div>

        {/* Reference Banner */}
        <div className="reference-box">
          <span className="ref-label">BOOKING REFERENCE</span>
          <span className="ref-code">{booking.bookingReference}</span>
        </div>

        {/* Ticket Details */}
        <div className="ticket-details-grid">
          <div className="ticket-movie-col">
            {movie?.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title || 'Movie'}
                className="ticket-poster"
              />
            )}
            <div>
              <h3>{movie?.title}</h3>
              <p className="ticket-cinema-info">
                <FaBuilding /> {cinema?.name}
              </p>
              <p className="ticket-cinema-loc">{cinema?.location}, {cinema?.city}</p>
            </div>
          </div>

          <div className="ticket-meta-col">
            <div className="ticket-meta-item">
              <span className="meta-label">Date & Time</span>
              <span className="meta-val">
                {dt && (
                  <>
                    <FaCalendarAlt /> {dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                    &bull; <FaClock /> {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </>
                )}
              </span>
            </div>

            <div className="ticket-meta-item">
              <span className="meta-label">Seats Reserved</span>
              <div className="meta-seats-tags">
                {booking.seats?.map((seat) => (
                  <span key={seat} className="ticket-seat-pill">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            <div className="ticket-meta-item">
              <span className="meta-label">Total Amount Paid</span>
              <span className="meta-val total-highlight">
                ${booking.totalPrice?.toFixed(2)}
              </span>
            </div>

            <div className="ticket-meta-item">
              <span className="meta-label">Status</span>
              <span className="badge badge-success">
                {booking.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <Link to="/my-bookings" className="btn-primary-large">
            <FaTicketAlt /> View My Bookings
          </Link>
          <Link to="/movies" className="btn-secondary-large">
            <FaHome /> Browse More Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
