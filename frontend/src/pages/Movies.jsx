import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/common/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { FALLBACK_MOVIES } from '../data/movieData';
import {
  FaSearch,
  FaFilm,
  FaGlobeAmericas,
  FaFire,
  FaTimes,
} from 'react-icons/fa';

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
  'Mythology',
  'Sci-Fi',
  'Thriller',
  'War',
];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [selectedGenre, setSelectedGenre] = useState('');

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    setCategory(cat);
    setSearch(q);
  }, [searchParams]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (category) params.category = category;
      if (selectedGenre) params.genre = selectedGenre;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/movies', { params });
      if (res.data && res.data.success && res.data.data?.length > 0) {
        setMovies(res.data.data);
      } else {
        filterLocalFallback();
      }
    } catch {
      filterLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  const filterLocalFallback = () => {
    let filtered = [...FALLBACK_MOVIES];
    if (category) {
      filtered = filtered.filter((m) => m.category === category);
    }
    if (selectedGenre) {
      filtered = filtered.filter((m) => m.genre?.includes(selectedGenre));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.director?.toLowerCase().includes(q) ||
          m.cast?.some((c) => c.toLowerCase().includes(q))
      );
    }
    setMovies(filtered);
  };

  useEffect(() => {
    fetchMovies();
  }, [category, selectedGenre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const newParams = {};
    if (newCat) newParams.category = newCat;
    if (search) newParams.search = search;
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('');
    setSelectedGenre('');
    setSearchParams({});
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Now Showing & Upcoming Releases</h1>
          <p>Book tickets for the latest Hollywood & Bollywood blockbusters</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="movies-toolbar">
        {/* Category Tabs: All / Hollywood / Bollywood */}
        <div className="status-tabs category-tabs">
          <button
            className={`tab-btn ${category === '' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All Movies
          </button>
          <button
            className={`tab-btn ${category === 'hollywood' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('hollywood')}
          >
            <FaGlobeAmericas /> Hollywood
          </button>
          <button
            className={`tab-btn ${category === 'bollywood' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('bollywood')}
          >
            <FaFire /> Bollywood
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
              placeholder="Search title, actor, director..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearch('');
                  fetchMovies();
                }}
              >
                <FaTimes />
              </button>
            )}
            <button type="submit" className="search-btn" title="Search">
              <FaSearch />
            </button>
          </form>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <LoadingSpinner message="Searching movie directory..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMovies} />
      ) : movies.length === 0 ? (
        <EmptyState
          icon={FaFilm}
          title="No movies found"
          description="Try adjusting your search criteria, industry category, or genre."
          actionLabel="Reset All Filters"
          onAction={clearAllFilters}
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
