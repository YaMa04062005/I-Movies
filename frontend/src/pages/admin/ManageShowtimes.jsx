import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaTimes,
} from 'react-icons/fa';

const ManageShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    movie: '',
    cinema: '',
    screenIndex: 0,
    dateTime: '',
    standardPrice: 12,
    premiumPrice: 18,
    vipPrice: 25,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [showRes, movRes, cinRes] = await Promise.all([
        api.get('/showtimes'),
        api.get('/movies'),
        api.get('/cinemas'),
      ]);

      if (showRes.data && showRes.data.success) {
        setShowtimes(showRes.data.data);
      }
      if (movRes.data && movRes.data.success) {
        setMovies(movRes.data.data);
      }
      if (cinRes.data && cinRes.data.success) {
        setCinemas(cinRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setFormData({
      movie: movies[0]?._id || '',
      cinema: cinemas[0]?._id || '',
      screenIndex: 0,
      dateTime: '',
      standardPrice: 12,
      premiumPrice: 18,
      vipPrice: 25,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const selectedCinema = cinemas.find((c) => c._id === formData.cinema);

  const validate = () => {
    const errs = {};
    if (!formData.movie) errs.movie = 'Please select a movie';
    if (!formData.cinema) errs.cinema = 'Please select a cinema';
    if (!formData.dateTime) errs.dateTime = 'Date and time is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      movie: formData.movie,
      cinema: formData.cinema,
      screenIndex: Number(formData.screenIndex),
      dateTime: new Date(formData.dateTime).toISOString(),
      pricing: [
        { seatType: 'standard', price: Number(formData.standardPrice) },
        { seatType: 'premium', price: Number(formData.premiumPrice) },
        { seatType: 'vip', price: Number(formData.vipPrice) },
      ],
    };

    try {
      setIsSubmitting(true);
      const res = await api.post('/showtimes', payload);
      if (res.data && res.data.success) {
        toast.success('Showtime scheduled successfully');
        setShowtimes((prev) => [res.data.data, ...prev]);
        closeModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule showtime');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) return;

    try {
      const res = await api.delete(`/showtimes/${id}`);
      if (res.data && res.data.success) {
        toast.success('Showtime deleted successfully');
        setShowtimes((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete showtime');
    }
  };

  return (
    <div className="page-container admin-manage-page">
      <Link to="/admin" className="back-link">
        <FaArrowLeft /> Back to Dashboard
      </Link>

      <div className="admin-header">
        <div>
          <h1>Showtime Scheduler</h1>
          <p>Schedule movie screenings, assign auditoriums, and configure showtime rates</p>
        </div>
        <button
          className="btn-admin-action"
          onClick={openModal}
          disabled={movies.length === 0 || cinemas.length === 0}
        >
          <FaPlus /> Schedule Showtime
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading showtimes..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : showtimes.length === 0 ? (
        <div className="empty-admin-table">
          <FaCalendarAlt />
          <p>No showtimes scheduled. Click "Schedule Showtime" to plan your first screening.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Movie</th>
                <th>Cinema</th>
                <th>Screen</th>
                <th>Date & Time</th>
                <th>Seats Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((st) => {
                const dt = new Date(st.dateTime);
                return (
                  <tr key={st._id}>
                    <td>
                      <strong>{st.movie?.title || 'Movie'}</strong>
                    </td>
                    <td>{st.cinema?.name || 'Cinema'}</td>
                    <td>Screen {st.screenIndex + 1}</td>
                    <td>
                      {dt.toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      &bull;{' '}
                      {dt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <span className="booked-count-badge">
                        {st.bookedSeats?.length || 0} seats
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${st.status}`}>
                        {st.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-delete"
                        title="Delete showtime"
                        onClick={() => handleDelete(st._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Showtime Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Schedule New Screening</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form" noValidate>
              <div className="form-group">
                <label>Movie *</label>
                <select
                  value={formData.movie}
                  onChange={(e) =>
                    setFormData({ ...formData, movie: e.target.value })
                  }
                  className={formErrors.movie ? 'input-error' : ''}
                >
                  <option value="">Select a movie...</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.duration}m - {m.rating})
                    </option>
                  ))}
                </select>
                {formErrors.movie && (
                  <span className="field-error">{formErrors.movie}</span>
                )}
              </div>

              <div className="form-group">
                <label>Cinema *</label>
                <select
                  value={formData.cinema}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cinema: e.target.value,
                      screenIndex: 0,
                    })
                  }
                  className={formErrors.cinema ? 'input-error' : ''}
                >
                  <option value="">Select a cinema venue...</option>
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
                {formErrors.cinema && (
                  <span className="field-error">{formErrors.cinema}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Auditorium Screen</label>
                  <select
                    value={formData.screenIndex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        screenIndex: Number(e.target.value),
                      })
                    }
                  >
                    {selectedCinema?.screens?.map((scr, idx) => (
                      <option key={idx} value={idx}>
                        Screen #{scr.screenNumber}: {scr.name}
                      </option>
                    )) || <option value={0}>Screen 1</option>}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date & Showtime *</label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) =>
                      setFormData({ ...formData, dateTime: e.target.value })
                    }
                    className={formErrors.dateTime ? 'input-error' : ''}
                  />
                  {formErrors.dateTime && (
                    <span className="field-error">{formErrors.dateTime}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Standard Seat ($)</label>
                  <input
                    type="number"
                    value={formData.standardPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        standardPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Premium Seat ($)</label>
                  <input
                    type="number"
                    value={formData.premiumPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        premiumPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>VIP Seat ($)</label>
                  <input
                    type="number"
                    value={formData.vipPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vipPrice: Number(e.target.value),
                      })
                    }
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
                  {isSubmitting ? 'Scheduling...' : 'Save Showtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShowtimes;
