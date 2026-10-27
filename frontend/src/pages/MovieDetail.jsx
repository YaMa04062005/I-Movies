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
} from 'react-icons/fa';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState(FALLBACK_POSTER);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/movies/${id}`);
      if (res.data && res.data.success) {
        setMovie(res.data.data);
        setImgSrc(res.data.data.posterUrl || FALLBACK_POSTER);
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

  const formattedReleaseDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBA';

  return (
    <div className="page-container">
      <Link to="/movies" className="back-link">
        <FaArrowLeft /> Back to Movies
      </Link>

      <div className="movie-detail-card">
        <div className="movie-detail-poster-container">
          <img
            src={imgSrc}
            alt={movie.title}
            onError={() => setImgSrc(FALLBACK_POSTER)}
            className="movie-detail-poster"
          />
        </div>

        <div className="movie-detail-info">
          <div className="movie-header">
            <h1 className="movie-detail-title">{movie.title}</h1>
            <div className="badges-row">
              {movie.rating && (
                <span className="badge badge-rating">{movie.rating}</span>
              )}
              <span
                className={`badge badge-${
                  movie.status === 'now_showing'
                    ? 'success'
                    : movie.status === 'coming_soon'
                    ? 'warning'
                    : 'secondary'
                }`}
              >
                {movie.status === 'now_showing'
                  ? 'Now Showing'
                  : movie.status === 'coming_soon'
                  ? 'Coming Soon'
                  : 'Ended'}
              </span>
            </div>
          </div>

          <div className="meta-strip">
            {movie.duration && (
              <span className="meta-strip-item">
                <FaClock /> {movie.duration} minutes
              </span>
            )}
            <span className="meta-strip-item">
              <FaCalendarAlt /> {formattedReleaseDate}
            </span>
            {movie.language && (
              <span className="meta-strip-item">
                <FaLanguage /> {movie.language}
              </span>
            )}
          </div>

          {movie.genre && movie.genre.length > 0 && (
            <div className="genres-list">
              {movie.genre.map((g) => (
                <span key={g} className="genre-tag">
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="movie-synopsis">
            <h3>Synopsis</h3>
            <p>{movie.description}</p>
          </div>

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

          <div className="movie-detail-cta">
            {movie.status === 'now_showing' ? (
              <Link
                to={`/movies/${movie._id}/showtimes`}
                className="btn-primary-large"
              >
                <FaTicketAlt /> Book Tickets Now
              </Link>
            ) : (
              <div className="coming-soon-notice">
                {movie.status === 'coming_soon'
                  ? 'Tickets will become available once showtimes are scheduled.'
                  : 'This movie has concluded its theatrical run.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
