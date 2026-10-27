import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaTicketAlt,
  FaTimesCircle,
  FaCheckCircle,
  FaBan,
} from 'react-icons/fa';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/bookings/admin/all', { params });
      if (res.data && res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleAdminCancel = async (bookingId, ref) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel booking ${ref}? Seats will be released back to the auditorium immediately.`
      )
    )
      return;

    try {
      setCancellingId(bookingId);
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      if (res.data && res.data.success) {
        toast.success(`Booking ${ref} cancelled successfully`);
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page-container admin-manage-page">
      <Link to="/admin" className="back-link">
        <FaArrowLeft /> Back to Dashboard
      </Link>

      <div className="admin-header">
        <div>
          <h1>Booking Ledger</h1>
          <p>Inspect all customer ticket reservations, transaction totals, and cancellations</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="status-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${statusFilter === '' ? 'active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          All Bookings
        </button>
        <button
          className={`tab-btn ${statusFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={`tab-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setStatusFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading customer bookings..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <div className="empty-admin-table">
          <FaTicketAlt />
          <p>No bookings match the selected status filter.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Movie</th>
                <th>Cinema</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const isConfirmed = b.status === 'confirmed';
                return (
                  <tr key={b._id}>
                    <td className="mono">
                      <strong>{b.bookingReference}</strong>
                    </td>
                    <td>
                      <div>{b.user?.name || 'Customer'}</div>
                      <div className="admin-subtext">{b.user?.email}</div>
                    </td>
                    <td>{b.showtime?.movie?.title || 'Movie'}</td>
                    <td>{b.showtime?.cinema?.name || 'Cinema'}</td>
                    <td>
                      <div className="table-seats-pills">
                        {b.seats?.map((s) => (
                          <span key={s} className="table-seat-tag">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong>${b.totalPrice?.toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {isConfirmed && (
                        <button
                          className="btn-icon btn-cancel-sm"
                          title="Cancel booking"
                          disabled={cancellingId === b._id}
                          onClick={() =>
                            handleAdminCancel(b._id, b.bookingReference)
                          }
                        >
                          <FaTimesCircle />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
