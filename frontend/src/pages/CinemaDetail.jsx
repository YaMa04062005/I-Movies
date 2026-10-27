import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaTv,
  FaCouch,
  FaClock,
  FaTicketAlt,
} from 'react-icons/fa';

const CinemaDetail = () => {
  const { id } = useParams();
  const [cinema, setCinema] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cinRes, showRes] = await Promise.all([
        api.get(`/cinemas/${id}`),
        api.get('/showtimes', { params: { cinema: id } }),
      ]);

      if (cinRes.data && cinRes.data.success) {
        setCinema(cinRes.data.data);
      }
      if (showRes.data && showRes.data.success) {
        setShowtimes(showRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cinema details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading cinema details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!cinema) return <ErrorMessage message="Cinema not found" />;

  return (
    <div className="page-container">
      <Link to="/cinemas" className="back-link">
        <FaArrowLeft /> Back to Cinemas
      </Link>

      {/* Cinema Header Card */}
      <div className="cinema-detail-header-card">
        <div className="cinema-detail-badge">
          <FaBuilding /> Multiplex
        </div>
        <h1>{cinema.name}</h1>
        <p className="cinema-address">
          <FaMapMarkerAlt /> {cinema.location}, {cinema.city}
        </p>
      </div>

      {/* Screens Section */}
      <div className="cinema-screens-section">
        <h2>Auditoriums & Screens</h2>
        <div className="screens-grid">
          {cinema.screens?.map((screen, idx) => {
            const totalCapacity = screen.rows * screen.seatsPerRow;
            return (
              <div key={idx} className="screen-detail-card">
                <div className="screen-header">
                  <h3>{screen.name}</h3>
                  <span className="screen-number-pill">Screen #{screen.screenNumber}</span>
                </div>

                <div className="screen-stats">
                  <div className="stat-box">
                    <span className="stat-label">Capacity</span>
                    <span className="stat-val"><FaCouch /> {totalCapacity} Seats</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Layout</span>
                    <span className="stat-val">{screen.rows} Rows &times; {screen.seatsPerRow} Seats</span>
                  </div>
                </div>

                <div className="seat-tier-list">
                  <span className="tier-header-label">Pricing Tiers:</span>
                  <div className="tiers-badges">
                    {screen.seatTypes?.map((st, sIdx) => (
                      <span key={sIdx} className={`tier-pill tier-${st.type}`}>
                        {st.type.toUpperCase()}: ${st.price}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="cinema-showtimes-section">
        <h2>Upcoming Showtimes at this Cinema</h2>
        {showtimes.length === 0 ? (
          <p className="no-showtimes-hint">
            No active showtimes currently scheduled at this cinema.
          </p>
        ) : (
          <div className="showtimes-grid">
            {showtimes.map((st) => {
              const dt = new Date(st.dateTime);
              return (
                <div key={st._id} className="showtime-card">
                  <div className="showtime-movie-title">
                    <h4>{st.movie?.title || 'Movie'}</h4>
                  </div>
                  <div className="showtime-info">
                    <div className="showtime-time">
                      <FaClock /> {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="showtime-date">
                      {dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="showtime-screen">
                      <FaTv /> Screen {st.screenIndex + 1}
                    </div>
                  </div>
                  <Link
                    to={`/booking/${st._id}`}
                    className="btn-select-seats"
                  >
                    <FaTicketAlt /> Select Seats
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaDetail;
