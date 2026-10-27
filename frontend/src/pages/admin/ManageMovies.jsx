import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaFilm,
} from 'react-icons/fa';

const INITIAL_FORM = {
  title: '',
  description: '',
  genre: '',
  duration: '',
  rating: 'PG-13',
  releaseDate: '',
  posterUrl: '',
  director: '',
  cast: '',
  language: 'English',
  status: 'now_showing',
};

const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/movies');
      if (res.data && res.data.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openCreateModal = () => {
    setEditingMovie(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre ? movie.genre.join(', ') : '',
      duration: movie.duration || '',
      rating: movie.rating || 'PG-13',
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      posterUrl: movie.posterUrl || '',
      director: movie.director || '',
      cast: movie.cast ? movie.cast.join(', ') : '',
      language: movie.language || 'English',
      status: movie.status || 'now_showing',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMovie(null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.genre.trim()) errs.genre = 'At least one genre is required';
    if (!formData.duration || Number(formData.duration) <= 0)
      errs.duration = 'Valid duration in minutes is required';
    if (!formData.releaseDate) errs.releaseDate = 'Release date is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      duration: Number(formData.duration),
      genre: formData.genre.split(',').map((g) => g.trim()).filter(Boolean),
      cast: formData.cast ? formData.cast.split(',').map((c) => c.trim()).filter(Boolean) : [],
    };

    try {
      setIsSubmitting(true);
      if (editingMovie) {
        const res = await api.put(`/movies/${editingMovie._id}`, payload);
        if (res.data && res.data.success) {
          toast.success('Movie updated successfully');
          setMovies((prev) =>
            prev.map((m) => (m._id === editingMovie._id ? res.data.data : m))
          );
          closeModal();
        }
      } else {
        const res = await api.post('/movies', payload);
        if (res.data && res.data.success) {
          toast.success('Movie added successfully');
          setMovies((prev) => [res.data.data, ...prev]);
          closeModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (movieId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await api.delete(`/movies/${movieId}`);
      if (res.data && res.data.success) {
        toast.success(`"${title}" deleted successfully`);
        setMovies((prev) => prev.filter((m) => m._id !== movieId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  return (
    <div className="page-container admin-manage-page">
      <Link to="/admin" className="back-link">
        <FaArrowLeft /> Back to Dashboard
      </Link>

      <div className="admin-header">
        <div>
          <h1>Movie Management</h1>
          <p>Add new titles, edit release schedules, or remove archived films</p>
        </div>
        <button className="btn-admin-action" onClick={openCreateModal}>
          <FaPlus /> Add New Movie
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading movies..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMovies} />
      ) : movies.length === 0 ? (
        <div className="empty-admin-table">
          <FaFilm />
          <p>No movies exist in database. Click "Add New Movie" to create one.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id}>
                  <td>
                    <img
                      src={m.posterUrl || 'https://via.placeholder.com/60x90'}
                      alt={m.title}
                      className="admin-table-thumb"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x90?text=No+Img';
                      }}
                    />
                  </td>
                  <td>
                    <strong>{m.title}</strong>
                    <div className="admin-subtext">{m.director || 'No director'}</div>
                  </td>
                  <td>{m.genre?.join(', ')}</td>
                  <td>{m.duration}m</td>
                  <td>
                    <span className="badge badge-rating">{m.rating || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${m.status}`}>
                      {m.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="btn-icon btn-edit"
                        title="Edit movie"
                        onClick={() => openEditModal(m)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        title="Delete movie"
                        onClick={() => handleDelete(m._id, m.title)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form" noValidate>
              <div className="form-group">
                <label>Movie Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={formErrors.title ? 'input-error' : ''}
                  placeholder="e.g. Interstellar"
                />
                {formErrors.title && (
                  <span className="field-error">{formErrors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label>Description / Synopsis *</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={formErrors.description ? 'input-error' : ''}
                  placeholder="Summary of the film..."
                />
                {formErrors.description && (
                  <span className="field-error">{formErrors.description}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Genres (comma separated) *</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) =>
                      setFormData({ ...formData, genre: e.target.value })
                    }
                    className={formErrors.genre ? 'input-error' : ''}
                    placeholder="Action, Sci-Fi, Thriller"
                  />
                  {formErrors.genre && (
                    <span className="field-error">{formErrors.genre}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className={formErrors.duration ? 'input-error' : ''}
                    placeholder="120"
                  />
                  {formErrors.duration && (
                    <span className="field-error">{formErrors.duration}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                  >
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="NC-17">NC-17</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Theatrical Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Release Date *</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, releaseDate: e.target.value })
                    }
                    className={formErrors.releaseDate ? 'input-error' : ''}
                  />
                  {formErrors.releaseDate && (
                    <span className="field-error">{formErrors.releaseDate}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Poster Image URL</label>
                <input
                  type="url"
                  value={formData.posterUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, posterUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Director</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) =>
                      setFormData({ ...formData, director: e.target.value })
                    }
                    placeholder="Christopher Nolan"
                  />
                </div>
                <div className="form-group">
                  <label>Cast (comma separated)</label>
                  <input
                    type="text"
                    value={formData.cast}
                    onChange={(e) =>
                      setFormData({ ...formData, cast: e.target.value })
                    }
                    placeholder="Actor 1, Actor 2"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingMovie ? 'Save Changes' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMovies;
