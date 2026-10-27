import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/common/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  FaTicketAlt,
  FaSearch,
  FaFire,
  FaGlobeAmericas,
  FaFilm,
  FaStar,
} from 'react-icons/fa';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/movies');
      if (res.data && res.data.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movie catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const hollywoodMovies = movies.filter((m) => m.category === 'hollywood');
  const bollywoodMovies = movies.filter((m) => m.category === 'bollywood');

  return (
    <div className="home-page bookmyshow-theme">
      {/* Hero Banner with Live Search */}
      <section className="bms-hero-banner">
        <div className="hero-content">
          <div className="live-ticker">
            <span className="live-pulse" />
            <FaFire className="ticker-icon" />
            <span>Over 14,200 moviegoers browsing live showtimes right now</span>
          </div>

          <h1 className="hero-main-title">
            Book Movies, IMAX & 4DX Experiences
          </h1>
          <p className="hero-subtext">
            Reserve your favorite seats with instant e-tickets. No login required.
          </p>

          {/* BookMyShow Style Search Box */}
          <form onSubmit={handleSearchSubmit} className="bms-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for Hollywood, Bollywood movies, actors, or directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bms-search-btn">
              Find Shows
            </button>
          </form>

          {/* Popular Search Tags */}
          <div className="popular-tags-row">
            <span className="tags-label">Trending Now:</span>
            {movies.slice(0, 4).map((m) => (
              <Link
                key={m._id}
                to={`/movies/${m._id}`}
                className="trending-tag-pill"
              >
                {m.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="page-container">
        {/* Features Ribbon */}
        <section className="bms-features-strip">
          <div className="bms-feature">
            <div className="bms-feature-icon">
              <FaTicketAlt />
            </div>
            <div>
              <h4>Frictionless Booking</h4>
              <p>Direct seat selection without mandatory login</p>
            </div>
          </div>
          <div className="bms-feature">
            <div className="bms-feature-icon">
              <FaStar />
            </div>
            <div>
              <h4>Verified IMDb Ratings</h4>
              <p>Real-time ratings, duration & audience reviews</p>
            </div>
          </div>
          <div className="bms-feature">
            <div className="bms-feature-icon">
              <FaFilm />
            </div>
            <div>
              <h4>IMAX & 4DX Formats</h4>
              <p>Dolby Atmos sound and luxury recliners</p>
            </div>
          </div>
        </section>

        {loading ? (
          <LoadingSpinner message="Fetching cinema listings..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchMovies} />
        ) : (
          <>
            {/* LATEST HOLLYWOOD SECTION */}
            <section className="movie-shelf-section">
              <div className="shelf-header">
                <div className="shelf-title-box">
                  <span className="shelf-badge badge-hollywood">
                    <FaGlobeAmericas /> GLOBAL BLOCKBUSTERS
                  </span>
                  <h2>Latest Hollywood Movies</h2>
                  <p>Catch the biggest English blockbusters on IMAX & 3D screens</p>
                </div>
                <Link
                  to="/movies?category=hollywood"
                  className="shelf-see-all"
                >
                  See All ({hollywoodMovies.length}) &rarr;
                </Link>
              </div>

              <div className="movies-grid">
                {hollywoodMovies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </section>

            {/* LATEST BOLLYWOOD SECTION */}
            <section className="movie-shelf-section" style={{ marginTop: '3.5rem' }}>
              <div className="shelf-header">
                <div className="shelf-title-box">
                  <span className="shelf-badge badge-bollywood">
                    <FaFire /> DESI BLOCKBUSTERS
                  </span>
                  <h2>Trending Bollywood Releases</h2>
                  <p>Mass action, horror-comedies, and chart-topping Hindi cinema</p>
                </div>
                <Link
                  to="/movies?category=bollywood"
                  className="shelf-see-all"
                >
                  See All ({bollywoodMovies.length}) &rarr;
                </Link>
              </div>

              <div className="movies-grid">
                {bollywoodMovies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
