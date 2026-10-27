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
  FaPrint,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaQrcode,
  FaReceipt,
} from 'react-icons/fa';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const paymentInfo = location.state?.paymentInfo || {
    method: 'UPI / DIGITAL PAYMENT',
    txnId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
    amount: booking?.totalPrice ? (booking.totalPrice + 1.5) : 25.5,
    status: 'PAID',
    paidAt: new Date().toLocaleTimeString(),
  };

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

  if (loading) return <LoadingSpinner message="Retrieving your confirmed ticket..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!booking) return <ErrorMessage message="Booking not found" />;

  const showtime = booking.showtime;
  const movie = showtime?.movie;
  const cinema = showtime?.cinema;
  const dt = showtime?.dateTime ? new Date(showtime.dateTime) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container confirmation-page-wrapper">
      <div className="confirmation-ticket-card">
        {/* Success Header */}
        <div className="confirmation-header-block">
          <div className="confirmation-tick-ring">
            <FaCheckCircle className="confirmation-tick-icon" />
          </div>
          <h1 className="confirmation-title">Booking Confirmed!</h1>
          <p className="confirmation-subtitle">
            Your e-ticket has been generated and payment is completed. Show this booking reference at the theater entrance.
          </p>
        </div>

        {/* Payment Verification Banner */}
        <div className="payment-verified-banner">
          <div className="banner-badge-group">
            <span className="payment-done-pill">
              <FaCheckCircle /> PAYMENT DONE
            </span>
            <span className="payment-mode-pill">
              {paymentInfo.method}
            </span>
          </div>
          <div className="banner-txn-group">
            <span className="txn-label">Transaction ID:</span>
            <span className="txn-val">{paymentInfo.txnId}</span>
          </div>
        </div>

        {/* Reference Ribbon */}
        <div className="ticket-reference-ribbon">
          <div className="ref-info-col">
            <span className="ref-label">BOOKING REFERENCE NUMBER</span>
            <span className="ref-code-text">{booking.bookingReference}</span>
          </div>
          <div className="ref-qr-col">
            <FaQrcode className="ticket-qr-icon" />
            <span className="qr-hint">Scan at Entrance</span>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="ticket-content-layout">
          {/* Movie Thumbnail & Info (Properly shaped and compact) */}
          <div className="ticket-movie-section">
            <div className="ticket-poster-frame">
              <img
                src={movie?.posterUrl || '/posters/interstellar.jpg'}
                alt={movie?.title || 'Movie Poster'}
                className="ticket-poster-compact"
              />
            </div>

            <div className="ticket-movie-text">
              <div className="ticket-title-badges">
                <span className="ticket-cert-pill">{movie?.rating || 'UA'}</span>
                <span className="ticket-cat-pill">
                  {movie?.category === 'bollywood' ? 'Bollywood' : 'Hollywood'}
                </span>
              </div>
              <h2 className="ticket-movie-title">{movie?.title}</h2>
              <p className="ticket-cinema-name">
                <FaBuilding /> {cinema?.name || 'Multiplex Cinema'}
              </p>
              <p className="ticket-screen-name">
                Screen {(showtime?.screenIndex || 0) + 1}
              </p>
              <p className="ticket-location-text">
                <FaMapMarkerAlt /> {cinema?.location}, {cinema?.city}
              </p>
            </div>
          </div>

          <div className="ticket-meta-section">
            <div className="ticket-data-row">
              <span className="data-row-label">Showtime & Date</span>
              <span className="data-row-val">
                {dt && (
                  <>
                    <FaCalendarAlt /> {dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                    &bull; <FaClock /> {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </>
                )}
              </span>
            </div>

            <div className="ticket-data-row">
              <span className="data-row-label">Seats Reserved ({booking.seats?.length})</span>
              <div className="ticket-seats-cluster">
                {booking.seats?.map((seat) => (
                  <span key={seat} className="ticket-seat-badge">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            <div className="ticket-data-row">
              <span className="data-row-label">Ticket Recipient</span>
              <span className="data-row-val font-semibold">
                {booking.customerName || 'Movie Fan'}
                {booking.customerEmail ? ` (${booking.customerEmail})` : ''}
              </span>
            </div>

            <div className="ticket-data-row total-highlight-row">
              <span className="data-row-label">Total Amount Paid</span>
              <span className="data-row-val ticket-total-price">
                ${(paymentInfo.amount || booking.totalPrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ticket-action-bar">
          <Link to="/my-bookings" className="bms-btn-action-primary">
            <FaTicketAlt /> View My Bookings
          </Link>
          <button type="button" onClick={handlePrint} className="bms-btn-action-secondary">
            <FaPrint /> Print E-Ticket
          </button>
          <Link to="/movies" className="bms-btn-action-outline">
            <FaHome /> Browse More Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
