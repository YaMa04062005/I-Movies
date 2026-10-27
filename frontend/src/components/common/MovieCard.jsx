import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaTicketAlt } from 'react-icons/fa';

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80';

const MovieCard = ({ movie }) => {
  const [imgSrc, setImgSrc] = useState(movie.posterUrl || FALLBACK_POSTER);

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_POSTER) {
      setImgSrc(FALLBACK_POSTER);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'now_showing':
        return 'badge-now-showing';
      case 'coming_soon':
        return 'badge-coming-soon';
      default:
        return 'badge-ended';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'now_showing':
        return 'Now Showing';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return 'Ended';
    }
  };

  return (
    <div className="movie-card">
      <div className="movie-card-poster">
        <img
          src={imgSrc}
          alt={movie.title}
          onError={handleImageError}
          loading="lazy"
        />
        <span className={`movie-status-badge ${getStatusBadgeClass(movie.status)}`}>
          {getStatusLabel(movie.status)}
        </span>
        {movie.rating && (
          <span className="movie-rating-badge">{movie.rating}</span>
        )}
      </div>

      <div className="movie-card-content">
        <h3 className="movie-card-title" title={movie.title}>
          <Link to={`/movies/${movie._id}`}>{movie.title}</Link>
        </h3>

        <div className="movie-card-meta">
          {movie.duration && (
            <span className="meta-item">
              <FaClock /> {movie.duration}m
            </span>
          )}
          {movie.genre && movie.genre.length > 0 && (
            <span className="meta-genre">
              {movie.genre.slice(0, 2).join(', ')}
            </span>
          )}
        </div>

        <div className="movie-card-actions">
          <Link to={`/movies/${movie._id}`} className="btn-details">
            Details
          </Link>
          {movie.status === 'now_showing' && (
            <Link to={`/movies/${movie._id}/showtimes`} className="btn-book">
              <FaTicketAlt /> Book
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
