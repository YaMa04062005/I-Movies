import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/common/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { FaSearch, FaFilter, FaFilm } from 'react-icons/fa';

const ALL_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Drama',
  'History',
  'Horror',
  'Sci-Fi',
  'Thriller',
];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [selectedGenre, setSelectedGenre] = useState('');

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (status) params.status = status;
      if (selectedGenre) params.genre = selectedGenre;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/movies', { params });
      if (res.data && res.data.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [status, selectedGenre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus) {
      setSearchParams({ status: newStatus });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Movies Catalogue</h1>
          <p>Discover currently running films and upcoming releases</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="movies-toolbar">
        {/* Status Filter Tabs */}
        <div className="status-tabs">
          <button
            className={`tab-btn ${status === '' ? 'active' : ''}`}
            onClick={() => handleStatusChange('')}
          >
            All Movies
          </button>
          <button
            className={`tab-btn ${status === 'now_showing' ? 'active' : ''}`}
            onClick={() => handleStatusChange('now_showing')}
          >
            Now Showing
          </button>
          <button
            className={`tab-btn ${status === 'coming_soon' ? 'active' : ''}`}
            onClick={() => handleStatusChange('coming_soon')}
          >
            Coming Soon
          </button>
        </div>

        {/* Search & Genre Controls */}
        <div className="filter-controls">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="genre-select"
            aria-label="Filter by genre"
          >
            <option value="">All Genres</option>
            {ALL_GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" title="Search">
              <FaSearch />
            </button>
          </form>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <LoadingSpinner message="Loading movies..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMovies} />
      ) : movies.length === 0 ? (
        <EmptyState
          icon={FaFilm}
          title="No movies found"
          description="Try adjusting your search query, genre, or status filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setStatus('');
            setSelectedGenre('');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies;
