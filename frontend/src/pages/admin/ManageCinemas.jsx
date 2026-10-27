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
  FaBuilding,
  FaTimes,
  FaTv,
} from 'react-icons/fa';

const DEFAULT_SCREEN = {
  screenNumber: 1,
  name: 'Screen 1 - Standard',
  rows: 6,
  seatsPerRow: 10,
  seatTypes: [
    { type: 'standard', price: 12, rows: [1, 2, 3, 4] },
    { type: 'premium', price: 18, rows: [5] },
    { type: 'vip', price: 25, rows: [6] },
  ],
};

const ManageCinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: '',
    screens: [{ ...DEFAULT_SCREEN }],
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/cinemas');
      if (res.data && res.data.success) {
        setCinemas(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cinemas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: '',
      location: '',
      city: '',
      screens: [{ ...DEFAULT_SCREEN }],
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleAddScreen = () => {
    const nextNumber = formData.screens.length + 1;
    setFormData({
      ...formData,
      screens: [
        ...formData.screens,
        {
          screenNumber: nextNumber,
          name: `Screen ${nextNumber}`,
          rows: 6,
          seatsPerRow: 10,
          seatTypes: [
            { type: 'standard', price: 12, rows: [1, 2, 3, 4] },
            { type: 'premium', price: 18, rows: [5, 6] },
          ],
        },
      ],
    });
  };

  const handleRemoveScreen = (idx) => {
    if (formData.screens.length <= 1) {
      toast.warning('A cinema must have at least one screen');
      return;
    }
    setFormData({
      ...formData,
      screens: formData.screens.filter((_, i) => i !== idx),
    });
  };

  const handleScreenChange = (idx, field, value) => {
    const updatedScreens = [...formData.screens];
    updatedScreens[idx][field] = value;
    setFormData({ ...formData, screens: updatedScreens });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Cinema name is required';
    if (!formData.location.trim()) errs.location = 'Location address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.screens || formData.screens.length === 0) {
      errs.screens = 'At least one screen is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/cinemas', formData);
      if (res.data && res.data.success) {
        toast.success('Cinema created successfully');
        setCinemas((prev) => [res.data.data, ...prev]);
        closeModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create cinema');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await api.delete(`/cinemas/${id}`);
      if (res.data && res.data.success) {
        toast.success(`"${name}" deleted successfully`);
        setCinemas((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete cinema');
    }
  };

  return (
    <div className="page-container admin-manage-page">
      <Link to="/admin" className="back-link">
        <FaArrowLeft /> Back to Dashboard
      </Link>

      <div className="admin-header">
        <div>
          <h1>Cinema & Screen Management</h1>
          <p>Add theater locations and configure auditoriums, seating grids, and pricing tiers</p>
        </div>
        <button className="btn-admin-action" onClick={openCreateModal}>
          <FaPlus /> Add New Cinema
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading cinemas..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchCinemas} />
      ) : cinemas.length === 0 ? (
        <div className="empty-admin-table">
          <FaBuilding />
          <p>No cinemas found. Click "Add New Cinema" to configure your first venue.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cinema Name</th>
                <th>Location</th>
                <th>City</th>
                <th>Auditoriums</th>
                <th>Total Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cinemas.map((c) => {
                const totalCap = c.screens?.reduce(
                  (sum, s) => sum + s.rows * s.seatsPerRow,
                  0
                );

                return (
                  <tr key={c._id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.location}</td>
                    <td>{c.city}</td>
                    <td>
                      <span className="screen-count-pill">
                        <FaTv /> {c.screens?.length || 0} Screen
                        {c.screens?.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td>{totalCap} seats</td>
                    <td>
                      <button
                        className="btn-icon btn-delete"
                        title="Delete cinema"
                        onClick={() => handleDelete(c._id, c.name)}
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

      {/* Add Cinema Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3>Add New Cinema Venue</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form" noValidate>
              <div className="form-group">
                <label>Cinema Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={formErrors.name ? 'input-error' : ''}
                  placeholder="e.g. IMovies Grand Cineplex"
                />
                {formErrors.name && (
                  <span className="field-error">{formErrors.name}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={formErrors.location ? 'input-error' : ''}
                    placeholder="123 Broadway Avenue"
                  />
                  {formErrors.location && (
                    <span className="field-error">{formErrors.location}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className={formErrors.city ? 'input-error' : ''}
                    placeholder="New York"
                  />
                  {formErrors.city && (
                    <span className="field-error">{formErrors.city}</span>
                  )}
                </div>
              </div>

              {/* Screens Sub-form */}
              <div className="screens-subform-section">
                <div className="screens-subform-header">
                  <h4>Screens & Seating Layouts</h4>
                  <button
                    type="button"
                    className="btn-add-screen"
                    onClick={handleAddScreen}
                  >
                    <FaPlus /> Add Screen
                  </button>
                </div>

                {formData.screens.map((screen, sIdx) => (
                  <div key={sIdx} className="screen-form-card">
                    <div className="screen-form-card-header">
                      <h5>Screen #{screen.screenNumber}</h5>
                      {formData.screens.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-screen"
                          onClick={() => handleRemoveScreen(sIdx)}
                        >
                          <FaTimes /> Remove
                        </button>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Screen Name</label>
                        <input
                          type="text"
                          value={screen.name}
                          onChange={(e) =>
                            handleScreenChange(sIdx, 'name', e.target.value)
                          }
                          placeholder="Screen 1 - IMAX"
                        />
                      </div>
                      <div className="form-group">
                        <label>Rows (Max 26: A-Z)</label>
                        <input
                          type="number"
                          min="1"
                          max="26"
                          value={screen.rows}
                          onChange={(e) =>
                            handleScreenChange(
                              sIdx,
                              'rows',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Seats Per Row</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={screen.seatsPerRow}
                          onChange={(e) =>
                            handleScreenChange(
                              sIdx,
                              'seatsPerRow',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  {isSubmitting ? 'Saving...' : 'Save Cinema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCinemas;
