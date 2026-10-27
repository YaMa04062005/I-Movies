import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/common/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FaTicketAlt, FaFilm, FaCompass, FaRegStar } from 'react-icons/fa';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeaturedMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/movies');
      if (res.data && res.data.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load featured movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedMovies();
  }, []);

  const nowShowing = movies.filter((m) => m.status === 'now_showing');
  const comingSoon = movies.filter((m) => m.status === 'coming_soon');

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">PREMIUM CINEMA EXPERIENCE</span>
          <h1 className="hero-title">Experience Stories on the Big Screen</h1>
          <p className="hero-subtitle">
            Book the best seats at IMAX, Dolby Atmos, and luxury auditoriums.
            Live updates, zero booking hassle, instant e-tickets.
          </p>
          <div className="hero-cta">
            <Link to="/movies" className="btn-primary-large">
              <FaTicketAlt /> Browse Movies
            </Link>
            <Link to="/cinemas" className="btn-secondary-large">
              <FaCompass /> Find Cinemas
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="page-container">
        {/* Features Row */}
        <section className="features-ribbon">
          <div className="feature-item">
            <FaFilm className="feature-icon" />
            <div>
              <h4>Ultra HD & IMAX</h4>
              <p>Cutting-edge audio & crystal visuals</p>
            </div>
          </div>
          <div className="feature-item">
            <FaTicketAlt className="feature-icon" />
            <div>
              <h4>Instant Seat Selection</h4>
              <p>Pick your favorite view in real-time</p>
            </div>
          </div>
          <div className="feature-item">
            <FaRegStar className="feature-icon" />
            <div>
              <h4>VIP & Luxury Lounges</h4>
              <p>Plush recliners and concierge dining</p>
            </div>
          </div>
        </section>

        {/* Now Showing Section */}
        <section className="home-section">
          <div className="section-header">
            <div>
              <h2>Now Showing</h2>
              <p>Catch these blockbusters in theaters today</p>
            </div>
            <Link to="/movies?status=now_showing" className="view-all-link">
              View All ({nowShowing.length}) &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading now showing movies..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchFeaturedMovies} />
          ) : nowShowing.length === 0 ? (
            <p className="no-data-hint">No movies currently showing.</p>
          ) : (
            <div className="movies-grid">
              {nowShowing.slice(0, 4).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <div>
                <h2>Coming Soon</h2>
                <p>Anticipated releases coming to screens near you</p>
              </div>
              <Link to="/movies?status=coming_soon" className="view-all-link">
                View All ({comingSoon.length}) &rarr;
              </Link>
            </div>

            <div className="movies-grid">
              {comingSoon.slice(0, 4).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
