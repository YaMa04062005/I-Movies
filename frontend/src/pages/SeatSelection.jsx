import React, { useState, useEffect, useRef } from 'react';
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
  FaCheckCircle,
  FaFire,
  FaUser,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guest details form (no auth required)
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('imovies_guest_name') || 'Movie Fan';
  });
  const [guestEmail, setGuestEmail] = useState(() => {
    return localStorage.getItem('imovies_guest_email') || 'fan@imovies.com';
  });
  const [guestPhone, setGuestPhone] = useState(() => {
    return localStorage.getItem('imovies_guest_phone') || '+91 98765 43210';
  });

  // Simulated live viewers in this theater auditorium
  const [liveViewersCount, setLiveViewersCount] = useState(14);
  const simulatedBookingTimer = useRef(null);

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/showtimes/${showtimeId}`);
      if (res.data && res.data.success) {
        setShowtime(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load showtime layout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  // Real-time booking simulation: occasionally mark a random seat as booked by another guest
  const selectedSeatsRef = useRef(selectedSeats);
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    if (!showtime) return;

    const screen = showtime.cinema?.screens?.[showtime.screenIndex];
    if (!screen) return;

    const scheduleFakeBooking = () => {
      const delay = Math.floor(Math.random() * 12000) + 10000; // 10-22 seconds
      simulatedBookingTimer.current = setTimeout(() => {
        setShowtime((prevSt) => {
          if (!prevSt) return prevSt;
          const rows = screen.rows || 6;
          const seatsPerRow = screen.seatsPerRow || 10;
          const currentBooked = prevSt.bookedSeats || [];

          // Find candidate seats not already booked and not selected by current user
          const availableCandidates = [];
          for (let r = 0; r < rows; r++) {
            const rowL = String.fromCharCode(65 + r);
            for (let s = 1; s <= seatsPerRow; s++) {
              const seatLabel = `${rowL}${s}`;
              if (
                !currentBooked.includes(seatLabel) &&
                !selectedSeatsRef.current.includes(seatLabel)
              ) {
                availableCandidates.push(seatLabel);
              }
            }
          }

          if (availableCandidates.length > 3) {
            const randomPick =
              availableCandidates[
                Math.floor(Math.random() * availableCandidates.length)
              ];

            toast.info(
              `⚡ Seat ${randomPick} was just reserved by another guest.`,
              { autoClose: 2500 }
            );

            // Update live viewers counter slightly
            setLiveViewersCount((prev) =>
              Math.min(28, Math.max(8, prev + (Math.random() > 0.5 ? 1 : -1)))
            );

            return {
              ...prevSt,
              bookedSeats: [...currentBooked, randomPick],
            };
          }
          return prevSt;
        });

        // Schedule next one
        scheduleFakeBooking();
      }, delay);
    };

    scheduleFakeBooking();

    return () => {
      if (simulatedBookingTimer.current) {
        clearTimeout(simulatedBookingTimer.current);
      }
    };
  }, [showtime?._id]);

  if (loading) return <LoadingSpinner message="Loading live theater seating matrix..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchShowtime} />;
  if (!showtime) return <ErrorMessage message="Showtime not found" />;

  const cinema = showtime.cinema;
  const screen = cinema?.screens?.[showtime.screenIndex];
  const movie = showtime.movie;

  const handleSeatClick = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= 8) {
          toast.warning('Maximum 8 seats allowed per reservation transaction');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const getSeatPrice = (seatId) => {
    const match = seatId.match(/^([A-Z])(\d+)$/);
    if (!match) return 12;
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
    return 12;
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );

  const handleBookingSubmit = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please tap at least one available seat to proceed');
      return;
    }

    if (!guestName.trim()) {
      toast.warning('Please enter your name for the ticket');
      return;
    }

    try {
      setIsSubmitting(true);

      // Save guest info locally for future visits
      localStorage.setItem('imovies_guest_name', guestName.trim());
      localStorage.setItem('imovies_guest_email', guestEmail.trim());
      localStorage.setItem('imovies_guest_phone', guestPhone.trim());

      const res = await api.post('/bookings', {
        showtime: showtimeId,
        seats: selectedSeats,
        customerName: guestName.trim(),
        customerEmail: guestEmail.trim(),
        customerPhone: guestPhone.trim(),
      });

      if (res.data && res.data.success) {
        const bookingData = res.data.data;

        // Save booking ID to local bookings array so "My Bookings" displays it instantly
        try {
          const savedBookings = JSON.parse(
            localStorage.getItem('imovies_my_bookings') || '[]'
          );
          if (!savedBookings.includes(bookingData._id)) {
            savedBookings.unshift(bookingData._id);
            localStorage.setItem(
              'imovies_my_bookings',
              JSON.stringify(savedBookings)
            );
          }
        } catch {
          // ignore localStorage error
        }

        toast.success('Tickets confirmed! E-Ticket generated.');
        navigate(`/booking/confirmation/${bookingData._id}`, {
          state: { booking: bookingData },
          replace: true,
        });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('One of your selected seats was just taken. Refreshing layout...');
        await fetchShowtime();
        setSelectedSeats([]);
      } else {
        toast.error(
          err.response?.data?.message || 'Booking could not be processed. Please try again.'
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
        <FaArrowLeft /> Change Showtime / Date
      </Link>

      {/* Live urgency banner */}
      <div className="live-urgency-strip">
        <div className="live-urgency-left">
          <FaFire className="flame-icon" />
          <span>
            <strong>{liveViewersCount} users</strong> are selecting seats for this auditorium right now!
          </span>
        </div>
        <div className="live-urgency-right">
          <span>⚡ Fast-filling show</span>
        </div>
      </div>

      <div className="booking-layout-wrapper">
        {/* Left: Seat Map */}
        <div className="seat-map-section">
          <div className="seat-map-header">
            <div>
              <h2>{movie?.title}</h2>
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
          </div>

          <SeatMap
            rows={screen?.rows || 8}
            seatsPerRow={screen?.seatsPerRow || 14}
            seatTypes={screen?.seatTypes || []}
            pricing={showtime.pricing || []}
            bookedSeats={showtime.bookedSeats || []}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Right: Booking Summary & Direct Guest Checkout */}
        <aside className="booking-summary-sidebar">
          <div className="summary-card">
            <h3>Booking Summary</h3>

            <div className="summary-movie-info">
              {movie?.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="summary-poster"
                  onError={(e) => {
                    e.target.src = '/posters/interstellar.jpg';
                  }}
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

            {/* Selected Seats */}
            <div className="selected-seats-breakdown">
              <span className="seats-count-label">
                Selected Seats ({selectedSeats.length}):
              </span>
              {selectedSeats.length === 0 ? (
                <p className="no-seats-selected">Tap seats on the layout to select</p>
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

            {/* Direct Ticket Recipient Form (No login needed!) */}
            <div className="direct-ticket-form">
              <span className="recipient-label">Ticket Recipient Details:</span>
              <div className="guest-input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <div className="guest-input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Email for E-Ticket"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
              <div className="guest-input-group">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  placeholder="Mobile for SMS Ticket"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
            </div>

            <hr className="summary-divider" />

            {/* Price Calculation */}
            <div className="price-calculation-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="price-calculation-row">
              <span>Convenience Fee</span>
              <span className="free-tag">FREE</span>
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
                'Reserving Seats...'
              ) : (
                <>
                  <FaCheckCircle /> Pay & Confirm (${totalPrice.toFixed(2)})
                </>
              )}
            </button>

            <p className="booking-policy-hint">
              Instant digital reservation. No login required. Confirmation will be displayed on screen.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SeatSelection;
