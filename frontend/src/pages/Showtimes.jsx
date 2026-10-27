import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { FALLBACK_MOVIES, FALLBACK_SHOWTIMES } from '../data/movieData';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaTicketAlt,
  FaStar,
  FaTv,
  FaMapMarkerAlt,
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
        api.get(`/movies/${id}`).catch(() => null),
        api.get('/showtimes', { params: { movie: id } }).catch(() => null),
      ]);

      let mData = movieRes?.data?.data;
      if (!mData) {
        mData = FALLBACK_MOVIES.find((m) => String(m._id) === String(id)) || FALLBACK_MOVIES[0];
      }
      setMovie(mData);

      let stData = showtimesRes?.data?.data;
      if (!stData || stData.length === 0) {
        stData = FALLBACK_SHOWTIMES.filter((st) => String(st.movie?._id || st.movie) === String(id));
        if (stData.length === 0) {
          stData = FALLBACK_SHOWTIMES.slice(0, 8);
        }
      }
      setShowtimes(stData);
    } catch {
      const fallbackMovie = FALLBACK_MOVIES.find((m) => String(m._id) === String(id)) || FALLBACK_MOVIES[0];
      setMovie(fallbackMovie);
      const fallbackSt = FALLBACK_SHOWTIMES.filter((st) => String(st.movie?._id || st.movie) === String(id));
      setShowtimes(fallbackSt.length > 0 ? fallbackSt : FALLBACK_SHOWTIMES.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner message="Finding theaters & showtimes..." />;
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

  const formatRuntime = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m (${mins} mins)`;
  };

  return (
    <div className="page-container showtimes-page-wrapper">
      <div className="showtimes-navigation">
        <Link to={`/movies/${id}`} className="bms-back-btn">
          <FaArrowLeft /> Back to Movie Overview
        </Link>
      </div>

      {/* Header Banner */}
      <div className="showtimes-movie-banner">
        <div className="banner-poster-wrap">
          <img
            src={movie.posterUrl || '/posters/interstellar.jpg'}
            alt={movie.title}
            className="banner-poster-thumb"
          />
        </div>
        <div className="banner-info-wrap">
          <div className="banner-top-badges">
            <span className="bms-cert-pill">{movie.rating || 'UA'}</span>
            <span className="bms-category-pill">
              {movie.category === 'bollywood' ? 'Bollywood' : 'Hollywood'}
            </span>
            {movie.imdbRating && (
              <span className="bms-imdb-pill">
                <FaStar /> {movie.imdbRating.toFixed(1)}/10
              </span>
            )}
          </div>
          <h1 className="banner-movie-title">{movie.title}</h1>
          <div className="banner-meta-row">
            <span className="banner-meta-item">
              <FaClock /> {formatRuntime(movie.duration)}
            </span>
            <span className="banner-dot">&bull;</span>
            <span className="banner-meta-item">
              {movie.genre?.join(', ')}
            </span>
            <span className="banner-dot">&bull;</span>
            <span className="banner-meta-item">{movie.language || 'English'}</span>
          </div>
          {movie.formats && movie.formats.length > 0 && (
            <div className="banner-formats-list">
              {movie.formats.map((fmt) => (
                <span key={fmt} className="banner-fmt-chip">
                  {fmt}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="date-filter-section">
        <div className="date-filter-label">
          <FaCalendarAlt /> Select Screening Date:
        </div>
        <div className="date-filter-tabs">
          <button
            className={`date-tab ${selectedDate === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDate('all')}
          >
            <span className="tab-day">ALL</span>
            <span className="tab-date">{showtimes.length}</span>
            <span className="tab-month">Shows</span>
          </button>
          {availableDates.map((dStr) => {
            const d = new Date(dStr);
            const isToday = new Date().toDateString() === dStr;
            const dayName = isToday ? 'TODAY' : d.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
            const dateNum = d.getDate();
            const monthName = d.toLocaleDateString([], { month: 'short' }).toUpperCase();

            return (
              <button
                key={dStr}
                className={`date-tab ${selectedDate === dStr ? 'active' : ''}`}
                onClick={() => setSelectedDate(dStr)}
              >
                <span className="tab-day">{dayName}</span>
                <span className="tab-date">{dateNum}</span>
                <span className="tab-month">{monthName}</span>
              </button>
            );
          })}
        </div>
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
                <div className="cinema-name-col">
                  <h3>
                    <FaBuilding className="cinema-icon" /> {cinema?.name || 'Cinema Multiplex'}
                  </h3>
                  <p className="cinema-location-text">
                    <FaMapMarkerAlt /> {cinema?.location}, {cinema?.city}
                  </p>
                </div>
                <div className="cinema-amenities-col">
                  <span className="amenity-chip">M-Ticket</span>
                  <span className="amenity-chip">Food & Beverages</span>
                  <span className="amenity-chip">Dolby Atmos</span>
                </div>
              </div>

              <div className="showtimes-pills-grid">
                {cShowtimes.map((st) => {
                  const dt = new Date(st.dateTime);
                  const minPrice = st.pricing?.length
                    ? Math.min(...st.pricing.map((p) => p.price))
                    : 12;

                  return (
                    <Link
                      key={st._id}
                      to={`/booking/${st._id}`}
                      className="showtime-pill-card"
                    >
                      <div className="pill-time-wrap">
                        <span className="pill-time">
                          {dt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="pill-format">Screen {st.screenIndex + 1}</span>
                      </div>

                      <div className="pill-bottom-info">
                        <span className="pill-price">${minPrice}</span>
                        <span className="pill-btn-label">
                          <FaTicketAlt /> Select
                        </span>
                      </div>
                    </Link>
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
