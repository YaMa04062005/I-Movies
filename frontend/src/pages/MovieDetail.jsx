import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  FaArrowLeft,
  FaClock,
  FaCalendarAlt,
  FaLanguage,
  FaTicketAlt,
  FaUserTie,
  FaUsers,
  FaStar,
  FaFire,
  FaGlobeAmericas,
} from 'react-icons/fa';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState('');

  const fetchMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/movies/${id}`);
      if (res.data && res.data.success) {
        setMovie(res.data.data);
        setImgSrc(res.data.data.posterUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading movie details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMovie} />;
  if (!movie) return <ErrorMessage message="Movie not found" />;

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m (${mins} mins)` : `${mins} mins`;
  };

  const formattedReleaseDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : 'In Theaters Now';

  return (
    <div className="page-container movie-detail-page">
      <Link to="/movies" className="back-link">
        <FaArrowLeft /> Back to All Movies
      </Link>

      <div className="movie-detail-card bookmyshow-detail-card">
        {/* Poster Column */}
        <div className="movie-detail-poster-container">
          <img
            src={imgSrc || movie.posterUrl}
            alt={movie.title}
            onError={() => setImgSrc('/posters/interstellar.jpg')}
            className="movie-detail-poster"
          />

          {/* Formats banner underneath poster */}
          <div className="detail-formats-box">
            <span className="formats-label">Available in:</span>
            <div className="formats-chips">
              {movie.formats?.map((f) => (
                <span key={f} className="format-tag-pill">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="movie-detail-info">
          {/* Industry Category & Certificate */}
          <div className="detail-category-row">
            <span className={`badge-category category-${movie.category || 'hollywood'}`}>
              {movie.category === 'bollywood' ? (
                <>
                  <FaFire /> Bollywood Feature
                </>
              ) : (
                <>
                  <FaGlobeAmericas /> Hollywood Feature
                </>
              )}
            </span>
            {movie.rating && (
              <span className="badge-cert-large">{movie.rating}</span>
            )}
          </div>

          <h1 className="movie-detail-title">{movie.title}</h1>

          {/* IMDb Rating Ribbon */}
          <div className="detail-rating-banner">
            <div className="imdb-score-box">
              <FaStar className="star-gold" />
              <span className="score-num">{movie.imdbRating || 8.0}</span>
              <span className="score-den">/10</span>
              <span className="score-votes">
                ({movie.votesCount || '150K+'} votes on IMDb)
              </span>
            </div>

            <div className="live-interest-box">
              <FaFire className="flame-icon" />
              <span>
                <strong>{movie.liveViewers || 1800}</strong> people browsing right now
              </span>
            </div>
          </div>

          {/* Quick Meta Strip */}
          <div className="meta-strip">
            <span className="meta-strip-item">
              <FaClock /> {formatDuration(movie.duration)}
            </span>
            <span className="meta-strip-item">
              <FaLanguage /> {movie.language || 'English'}
            </span>
            <span className="meta-strip-item">
              <FaCalendarAlt /> Released: {formattedReleaseDate}
            </span>
          </div>

          {/* Genres */}
          {movie.genre && movie.genre.length > 0 && (
            <div className="genres-list">
              {movie.genre.map((g) => (
                <span key={g} className="genre-tag">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div className="movie-synopsis">
            <h3>About the Movie</h3>
            <p>{movie.description}</p>
          </div>

          {/* Cast & Crew */}
          <div className="crew-cast-details">
            {movie.director && (
              <div className="crew-row">
                <FaUserTie className="crew-icon" />
                <strong>Director:</strong>
                <span>{movie.director}</span>
              </div>
            )}
            {movie.cast && movie.cast.length > 0 && (
              <div className="crew-row">
                <FaUsers className="crew-icon" />
                <strong>Cast:</strong>
                <span>{movie.cast.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Prominent "Book Tickets" Call to Action */}
          <div className="movie-detail-cta">
            <Link
              to={`/movies/${movie._id}/showtimes`}
              className="btn-book-tickets-primary"
            >
              <FaTicketAlt /> Book Tickets Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
