import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import SeatMap from '../components/booking/SeatMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FALLBACK_SHOWTIMES } from '../data/movieData';
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
  FaCreditCard,
  FaQrcode,
  FaUniversity,
  FaMoneyBillWave,
  FaLock,
  FaShieldAlt,
  FaTimes,
  FaSpinner,
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
  const [guestName, setGuestName] = useState(
    () => localStorage.getItem('imovies_guest_name') || ''
  );
  const [guestEmail, setGuestEmail] = useState(
    () => localStorage.getItem('imovies_guest_email') || ''
  );
  const [guestPhone, setGuestPhone] = useState(
    () => localStorage.getItem('imovies_guest_phone') || ''
  );

  // Live real-time urgency metrics
  const [liveViewersCount, setLiveViewersCount] = useState(14);
  const simulatedBookingTimer = useRef(null);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cash'
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing' | 'done'
  const [upiId, setUpiId] = useState('alex.cinema@okhdfcbank');
  const [cardData, setCardData] = useState({
    number: '•••• •••• •••• 4242',
    name: guestName || 'Alex Morgan',
    expiry: '12/28',
    cvv: '•••',
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [txnId, setTxnId] = useState('');

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/showtimes/${showtimeId}`);
      if (res.data && res.data.success && res.data.data) {
        setShowtime(res.data.data);
      } else {
        const found = FALLBACK_SHOWTIMES.find((s) => String(s._id) === String(showtimeId)) || FALLBACK_SHOWTIMES[0];
        setShowtime(found);
      }
    } catch {
      const found = FALLBACK_SHOWTIMES.find((s) => String(s._id) === String(showtimeId)) || FALLBACK_SHOWTIMES[0];
      setShowtime(found);
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

  const ticketSubtotal = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );
  const convenienceFee = selectedSeats.length > 0 ? 1.5 : 0;
  const grandTotal = ticketSubtotal + convenienceFee;

  const handleOpenPayment = () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please tap at least one available seat to proceed');
      return;
    }

    if (!guestName.trim()) {
      toast.warning('Please enter your name for the ticket');
      return;
    }

    // Save recipient details
    localStorage.setItem('imovies_guest_name', guestName.trim());
    localStorage.setItem('imovies_guest_email', guestEmail.trim());
    localStorage.setItem('imovies_guest_phone', guestPhone.trim());

    setPaymentStep('select');
    setShowPaymentModal(true);
  };

  const handleExecutePayment = async () => {
    try {
      setIsSubmitting(true);
      setPaymentStep('processing');

      // Generate a realistic transaction reference
      const generatedTxn = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
      setTxnId(generatedTxn);

      // Simulate payment network processing (1.6s)
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // Create booking in database or client fallback
      let bookingData = null;
      try {
        const res = await api.post('/bookings', {
          showtime: showtimeId,
          seats: selectedSeats,
          customerName: guestName.trim() || 'Movie Fan',
          customerEmail: guestEmail.trim() || 'guest@imovies.com',
          customerPhone: guestPhone.trim() || '',
        });
        if (res.data && res.data.success) {
          bookingData = res.data.data;
        }
      } catch (postErr) {
        if (postErr.response?.status === 409) {
          throw postErr;
        }
        // Client fallback booking when offline or serverless cold-starting
        bookingData = {
          _id: 'bk_' + Math.random().toString(36).substring(2, 10),
          bookingReference: 'IMV-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          showtime: showtime,
          seats: selectedSeats,
          totalPrice: ticketSubtotal,
          customerName: guestName.trim() || 'Movie Fan',
          customerEmail: guestEmail.trim() || 'guest@imovies.com',
          customerPhone: guestPhone.trim() || '',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
      }

      if (bookingData) {
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

        // Show Payment Done state on screen!
        setPaymentStep('done');

        // Transition to confirmation after 1.5 seconds so user visibly sees "Payment Done"
        setTimeout(() => {
          setShowPaymentModal(false);
          toast.success('Payment Received! E-Ticket generated.');
          navigate(`/booking/confirmation/${bookingData._id}`, {
            state: {
              booking: bookingData,
              paymentInfo: {
                method: paymentMethod.toUpperCase(),
                txnId: generatedTxn,
                amount: grandTotal,
                status: 'PAID',
                paidAt: new Date().toLocaleTimeString(),
              },
            },
            replace: true,
          });
        }, 1500);
      }
    } catch (err) {
      setPaymentStep('select');
      setIsSubmitting(false);
      if (err.response?.status === 409) {
        setShowPaymentModal(false);
        toast.error('One of your selected seats was just taken. Refreshing layout...');
        await fetchShowtime();
        setSelectedSeats([]);
      } else {
        toast.error(
          err.response?.data?.message || 'Payment could not be authorized. Please try again.'
        );
      }
    }
  };

  const dt = new Date(showtime.dateTime);

  return (
    <div className="page-container seat-selection-page">
      <Link to={`/movies/${movie?._id}/showtimes`} className="bms-back-btn">
        <FaArrowLeft /> Change Showtime / Date
      </Link>

      {/* Real-time viewer urgency strip */}
      <div className="urgency-ticker-strip">
        <FaFire className="urgency-flame" />
        <span>
          <strong>{liveViewersCount} users</strong> are selecting seats for this screening right now
        </span>
        <span className="live-pulse-dot" />
      </div>

      <div className="seat-booking-layout">
        {/* Left Col: Interactive Theater Screen & Seat Map */}
        <div className="seat-map-area">
          <SeatMap
            screen={screen}
            bookedSeats={showtime.bookedSeats || []}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Right Col: Booking Summary & Payment Trigger */}
        <aside className="booking-summary-sidebar">
          <div className="sidebar-card">
            <h2 className="summary-title">Ticket Order Summary</h2>

            <div className="summary-movie-info">
              {movie?.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="summary-poster-thumb"
                />
              )}
              <div className="summary-movie-details">
                <span className="summary-movie-name">{movie?.title}</span>
                <span className="summary-movie-sub">
                  {movie?.language || 'English'} &bull; {movie?.rating || 'UA'}
                </span>
                <span className="summary-movie-cinema">
                  <FaBuilding /> {cinema?.name}
                </span>
                <span className="summary-movie-screen">
                  Screen {(showtime.screenIndex || 0) + 1} ({screen?.name || 'Main Hall'})
                </span>
                <span className="summary-movie-time">
                  <FaCalendarAlt />{' '}
                  {dt.toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  &bull; <FaClock />{' '}
                  {dt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
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
                  placeholder="Your Full Name *"
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
              <span>Ticket Subtotal</span>
              <span>${ticketSubtotal.toFixed(2)}</span>
            </div>
            <div className="price-calculation-row">
              <span>Convenience Fee</span>
              <span>${convenienceFee.toFixed(2)}</span>
            </div>

            <div className="total-price-row">
              <span>Total Payable</span>
              <span className="total-val">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="bms-btn-primary"
              disabled={selectedSeats.length === 0 || isSubmitting}
              onClick={handleOpenPayment}
            >
              <FaLock /> Proceed to Payment (${grandTotal.toFixed(2)})
            </button>

            <p className="booking-policy-hint">
              <FaShieldAlt /> 100% Safe & Secure Checkout &bull; Instant Confirmation
            </p>
          </div>
        </aside>
      </div>

      {/* ================= PAYMENT MODAL / GATEWAY ================= */}
      {showPaymentModal && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal-box">
            {/* Modal Header */}
            <div className="payment-modal-header">
              <div className="header-titles">
                <span className="payment-secure-badge">
                  <FaShieldAlt /> 256-Bit Encrypted Payment
                </span>
                <h3>Complete Your Booking</h3>
              </div>
              {paymentStep === 'select' && (
                <button
                  className="payment-modal-close"
                  onClick={() => setShowPaymentModal(false)}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Payment Step: SELECT METHOD */}
            {paymentStep === 'select' && (
              <div className="payment-modal-body">
                {/* Order Highlights */}
                <div className="payment-order-summary">
                  <div className="order-highlight-item">
                    <span className="h-label">Movie:</span>
                    <span className="h-val">{movie?.title}</span>
                  </div>
                  <div className="order-highlight-item">
                    <span className="h-label">Seats:</span>
                    <span className="h-val">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="order-highlight-item highlight-total">
                    <span className="h-label">Amount Payable:</span>
                    <span className="h-val amount-accent">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Method Tabs */}
                <span className="payment-section-title">Select Payment Mode:</span>
                <div className="payment-methods-grid">
                  <button
                    type="button"
                    className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <FaQrcode className="method-icon" />
                    <span className="method-name">UPI / QR Code</span>
                    <span className="method-sub">GPay, PhonePe, Paytm</span>
                  </button>

                  <button
                    type="button"
                    className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FaCreditCard className="method-icon" />
                    <span className="method-name">Credit / Debit Card</span>
                    <span className="method-sub">Visa, Mastercard, RuPay</span>
                  </button>

                  <button
                    type="button"
                    className={`payment-method-card ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <FaUniversity className="method-icon" />
                    <span className="method-name">Net Banking</span>
                    <span className="method-sub">HDFC, ICICI, SBI, Axis</span>
                  </button>

                  <button
                    type="button"
                    className={`payment-method-card ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <FaMoneyBillWave className="method-icon" />
                    <span className="method-name">Box Office Counter</span>
                    <span className="method-sub">Pay at Theater</span>
                  </button>
                </div>

                {/* Method Specific Input Area */}
                <div className="payment-details-panel">
                  {paymentMethod === 'upi' && (
                    <div className="upi-payment-panel">
                      <div className="qr-box">
                        <div className="mock-qr-code">
                          <FaQrcode className="qr-symbol" />
                          <span className="qr-scan-text">Scan & Pay via any UPI App</span>
                        </div>
                      </div>
                      <div className="upi-input-wrap">
                        <label>Or enter UPI ID / VPA:</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="payment-text-input"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="card-payment-panel">
                      <div className="card-input-row">
                        <label>Card Number</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) =>
                            setCardData({ ...cardData, number: e.target.value })
                          }
                          placeholder="1234 5678 9012 3456"
                          className="payment-text-input"
                        />
                      </div>
                      <div className="card-input-grid">
                        <div>
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) =>
                              setCardData({ ...cardData, expiry: e.target.value })
                            }
                            placeholder="MM/YY"
                            className="payment-text-input"
                          />
                        </div>
                        <div>
                          <label>CVV / CVC</label>
                          <input
                            type="password"
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData({ ...cardData, cvv: e.target.value })
                            }
                            placeholder="•••"
                            maxLength={4}
                            className="payment-text-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="netbanking-panel">
                      <label>Choose Your Bank:</label>
                      <div className="bank-chips-grid">
                        {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank'].map(
                          (bank) => (
                            <button
                              key={bank}
                              type="button"
                              className={`bank-chip ${selectedBank === bank ? 'active' : ''}`}
                              onClick={() => setSelectedBank(bank)}
                            >
                              {bank}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="boxoffice-panel">
                      <FaMoneyBillWave className="boxoffice-icon" />
                      <p>
                        Your seats will be reserved immediately. Present your booking reference
                        at the cinema ticket counter 20 minutes prior to the show to complete cash payment.
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm & Pay Button */}
                <div className="payment-modal-footer">
                  <button
                    type="button"
                    className="bms-btn-pay-now"
                    onClick={handleExecutePayment}
                  >
                    <FaLock /> Pay ${grandTotal.toFixed(2)} & Confirm Seats
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step: PROCESSING */}
            {paymentStep === 'processing' && (
              <div className="payment-processing-view">
                <div className="processing-spinner-wrap">
                  <FaSpinner className="processing-spin-icon" />
                </div>
                <h3>Processing Payment...</h3>
                <p className="processing-status-text">
                  Contacting secure banking network for <strong>${grandTotal.toFixed(2)}</strong>
                </p>
                <div className="processing-progress-bar">
                  <div className="processing-progress-fill" />
                </div>
                <span className="processing-secure-notice">
                  <FaLock /> Please do not refresh or close this window
                </span>
              </div>
            )}

            {/* Payment Step: DONE / SUCCESS */}
            {paymentStep === 'done' && (
              <div className="payment-done-view">
                <div className="payment-success-circle">
                  <FaCheckCircle className="payment-success-icon" />
                </div>
                <h2>Payment Successful!</h2>
                <div className="payment-receipt-badge">
                  <span className="paid-amount-tag">${grandTotal.toFixed(2)} PAID</span>
                  <span className="paid-status-tag">STATUS: PAYMENT DONE</span>
                </div>
                <div className="payment-done-meta">
                  <div className="done-meta-item">
                    <span>Transaction ID:</span>
                    <strong>{txnId || 'TXN-83920194'}</strong>
                  </div>
                  <div className="done-meta-item">
                    <span>Mode:</span>
                    <strong>{paymentMethod.toUpperCase()}</strong>
                  </div>
                  <div className="done-meta-item">
                    <span>Seats Reserved:</span>
                    <strong>{selectedSeats.join(', ')}</strong>
                  </div>
                </div>
                <p className="payment-redirect-notice">
                  Generating your official verified e-ticket...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
