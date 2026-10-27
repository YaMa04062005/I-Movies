import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaTicketAlt,
} from 'react-icons/fa';

const Showtimes = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [movieRes, showtimesRes] = await Promise.all([
        api.get(`/movies/${id}`),
        api.get('/showtimes', { params: { movie: id } }),
      ]);

      if (movieRes.data && movieRes.data.success) {
        setMovie(movieRes.data.data);
      }
      if (showtimesRes.data && showtimesRes.data.success) {
        setShowtimes(showtimesRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading showtimes..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!movie) return <ErrorMessage message="Movie not found" />;

  // Filter showtimes by selected date
  const filteredShowtimes = showtimes.filter((st) => {
    if (selectedDate === 'all') return true;
    const stDate = new Date(st.dateTime).toDateString();
    return stDate === selectedDate;
  });

  // Unique dates for tabs
  const availableDates = Array.from(
    new Set(showtimes.map((st) => new Date(st.dateTime).toDateString()))
  );

  // Group filtered showtimes by cinema
  const groupedByCinema = filteredShowtimes.reduce((acc, st) => {
    const cinemaId = st.cinema?._id || 'unknown';
    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        cinema: st.cinema,
        showtimes: [],
      };
    }
    acc[cinemaId].showtimes.push(st);
    return acc;
  }, {});

  return (
    <div className="page-container">
      <Link to={`/movies/${id}`} className="back-link">
        <FaArrowLeft /> Back to Movie Details
      </Link>

      <div className="showtimes-movie-banner">
        <h2>{movie.title}</h2>
        <div className="showtimes-meta">
          <span>{movie.duration}m</span>
          <span>{movie.rating}</span>
          <span>{movie.genre?.join(', ')}</span>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="date-filter-tabs">
        <button
          className={`date-tab ${selectedDate === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedDate('all')}
        >
          All Dates ({showtimes.length})
        </button>
        {availableDates.map((dStr) => {
          const d = new Date(dStr);
          const isToday = new Date().toDateString() === dStr;
          return (
            <button
              key={dStr}
              className={`date-tab ${selectedDate === dStr ? 'active' : ''}`}
              onClick={() => setSelectedDate(dStr)}
            >
              <FaCalendarAlt />{' '}
              {isToday ? 'Today' : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
          );
        })}
      </div>

      {/* Showtimes by Cinema */}
      {Object.keys(groupedByCinema).length === 0 ? (
        <EmptyState
          icon={FaTicketAlt}
          title="No showtimes available"
          description="There are currently no scheduled screenings for this movie on the selected date."
          actionLabel="Show All Dates"
          onAction={() => setSelectedDate('all')}
        />
      ) : (
        <div className="cinema-groups-container">
          {Object.values(groupedByCinema).map(({ cinema, showtimes: cShowtimes }) => (
            <div key={cinema?._id || Math.random()} className="cinema-showtime-block">
              <div className="cinema-block-header">
                <div>
                  <h3>
                    <FaBuilding /> {cinema?.name || 'Cinema Multiplex'}
                  </h3>
                  <p className="cinema-location-text">
                    {cinema?.location}, {cinema?.city}
                  </p>
                </div>
              </div>

              <div className="showtimes-pills-grid">
                {cShowtimes.map((st) => {
                  const dt = new Date(st.dateTime);
                  const minPrice = st.pricing?.length
                    ? Math.min(...st.pricing.map((p) => p.price))
                    : 10;
                  const bookedCount = st.bookedSeats?.length || 0;

                  return (
                    <div key={st._id} className="showtime-pill-card">
                      <div className="pill-header">
                        <span className="pill-time">
                          <FaClock />{' '}
                          {dt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="pill-screen">
                          Screen {st.screenIndex + 1}
                        </span>
                      </div>

                      <div className="pill-meta">
                        <span className="pill-date">
                          {dt.toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="pill-price">From ${minPrice}</span>
                      </div>

                      <div className="pill-action">
                        <Link
                          to={`/booking/${st._id}`}
                          className="btn-book-pill"
                        >
                          <FaTicketAlt /> Select Seats
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Showtimes;
