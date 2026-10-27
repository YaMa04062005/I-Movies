import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import SeatMap from '../components/booking/SeatMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaTicketAlt,
  FaCheckCircle,
} from 'react-icons/fa';

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/showtimes/${showtimeId}`);
      if (res.data && res.data.success) {
        setShowtime(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load showtime details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  if (loading) return <LoadingSpinner message="Loading seat layout..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchShowtime} />;
  if (!showtime) return <ErrorMessage message="Showtime not found" />;

  const cinema = showtime.cinema;
  const screen = cinema?.screens?.[showtime.screenIndex];
  const movie = showtime.movie;

  // Toggle seat selection
  const handleSeatClick = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= 8) {
          toast.warning('Maximum 8 seats per booking transaction');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  // Helper to calculate seat price based on seat tier
  const getSeatPrice = (seatId) => {
    const match = seatId.match(/^([A-Z])(\d+)$/);
    if (!match) return 10;
    const rowIndex = match[1].charCodeAt(0) - 'A'.charCodeAt(0) + 1;

    let tier = 'standard';
    if (screen?.seatTypes) {
      for (const st of screen.seatTypes) {
        if (st.rows.includes(rowIndex)) {
          tier = st.type;
          break;
        }
      }
    }

    if (showtime.pricing) {
      const p = showtime.pricing.find((entry) => entry.seatType === tier);
      if (p) return p.price;
    }
    return 10;
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );

  const handleBookingSubmit = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat to proceed');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/bookings', {
        showtime: showtimeId,
        seats: selectedSeats,
      });

      if (res.data && res.data.success) {
        toast.success('Seats booked successfully!');
        navigate(`/booking/confirmation/${res.data.data._id}`, {
          state: { booking: res.data.data },
          replace: true,
        });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('One or more selected seats were just taken. Refreshing layout...');
        // Refresh showtime to update bookedSeats
        await fetchShowtime();
        setSelectedSeats([]);
      } else {
        toast.error(
          err.response?.data?.message || 'Booking failed. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const dt = new Date(showtime.dateTime);

  return (
    <div className="page-container seat-selection-page">
      <Link to={`/movies/${movie?._id}/showtimes`} className="back-link">
        <FaArrowLeft /> Back to Showtimes
      </Link>

      <div className="booking-layout-wrapper">
        {/* Left Column: Visual Seat Map */}
        <div className="seat-map-section">
          <div className="seat-map-header">
            <h2>Select Your Seats</h2>
            <div className="showtime-quick-meta">
              <span>
                <FaBuilding /> {cinema?.name} ({screen?.name || `Screen ${showtime.screenIndex + 1}`})
              </span>
              <span>
                <FaCalendarAlt />{' '}
                {dt.toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span>
                <FaClock />{' '}
                {dt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <SeatMap
            rows={screen?.rows || 6}
            seatsPerRow={screen?.seatsPerRow || 10}
            seatTypes={screen?.seatTypes || []}
            pricing={showtime.pricing || []}
            bookedSeats={showtime.bookedSeats || []}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <aside className="booking-summary-sidebar">
          <div className="summary-card">
            <h3>Booking Summary</h3>

            <div className="summary-movie-info">
              {movie?.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="summary-poster"
                />
              )}
              <div>
                <h4>{movie?.title}</h4>
                <p className="summary-cinema-name">{cinema?.name}</p>
                <p className="summary-screen-name">
                  {screen?.name || `Screen ${showtime.screenIndex + 1}`}
                </p>
                <p className="summary-datetime">
                  {dt.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  &bull;{' '}
                  {dt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <hr className="summary-divider" />

            <div className="selected-seats-breakdown">
              <span className="seats-count-label">
                Selected Seats ({selectedSeats.length}):
              </span>
              {selectedSeats.length === 0 ? (
                <p className="no-seats-selected">No seats selected yet</p>
              ) : (
                <div className="selected-seats-chips">
                  {selectedSeats.map((seat) => (
                    <span key={seat} className="seat-chip">
                      {seat} (${getSeatPrice(seat)})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr className="summary-divider" />

            <div className="price-calculation-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="price-calculation-row">
              <span>Booking Fee</span>
              <span className="free-tag">Free</span>
            </div>

            <div className="total-price-row">
              <span>Total Amount</span>
              <span className="total-val">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="btn-confirm-booking"
              disabled={selectedSeats.length === 0 || isSubmitting}
              onClick={handleBookingSubmit}
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <FaCheckCircle /> Confirm Booking (${totalPrice.toFixed(2)})
                </>
              )}
            </button>

            <p className="booking-policy-hint">
              Tickets are reserved instantly. Cancellations available prior to showtime.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SeatSelection;
