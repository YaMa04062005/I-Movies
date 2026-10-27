import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaTicketAlt, FaStar, FaFire } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const [imgSrc, setImgSrc] = useState(movie.posterUrl);

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="movie-card bookmyshow-card">
      <Link to={`/movies/${movie._id}`} className="movie-card-poster-link">
        <div className="movie-card-poster">
          <img
            src={imgSrc}
            alt={movie.title}
            onError={() => setImgSrc('/posters/interstellar.jpg')}
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="card-top-badges">
            <span className={`badge-category category-${movie.category || 'hollywood'}`}>
              {movie.category === 'bollywood' ? 'Bollywood' : 'Hollywood'}
            </span>
            {movie.rating && (
              <span className="badge-cert">{movie.rating}</span>
            )}
          </div>

          {/* IMDb Rating Ribbon */}
          <div className="imdb-rating-ribbon">
            <FaStar className="star-icon" />
            <span className="rating-num">{movie.imdbRating || 8.0}</span>
            <span className="rating-scale">/10</span>
            <span className="votes-count">({movie.votesCount || '100K+'})</span>
          </div>
        </div>
      </Link>

      <div className="movie-card-content">
        <h3 className="movie-card-title" title={movie.title}>
          <Link to={`/movies/${movie._id}`}>{movie.title}</Link>
        </h3>

        <div className="movie-card-meta">
          <span className="meta-lang">{movie.language || 'English'}</span>
          <span className="meta-dot">&bull;</span>
          <span className="meta-duration">
            <FaClock /> {formatDuration(movie.duration)}
          </span>
        </div>

        {movie.genre && movie.genre.length > 0 && (
          <div className="card-genre-tags">
            {movie.genre.slice(0, 3).join(' / ')}
          </div>
        )}

        {/* Live Viewing Activity */}
        <div className="live-viewers-tag">
          <FaFire className="fire-icon" />
          <span>{movie.liveViewers || 1200} people viewing</span>
        </div>

        {/* Formats Pills */}
        <div className="card-formats-row">
          {movie.formats?.slice(0, 3).map((f) => (
            <span key={f} className="format-chip">
              {f}
            </span>
          ))}
        </div>

        <div className="movie-card-actions">
          <Link
            to={`/movies/${movie._id}/showtimes`}
            className="btn-book-now"
          >
            <FaTicketAlt /> Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
