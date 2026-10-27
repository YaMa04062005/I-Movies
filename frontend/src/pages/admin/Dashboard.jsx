import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import {
  FaDollarSign,
  FaTicketAlt,
  FaFilm,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
  FaPlus,
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStats} />;

  return (
    <div className="page-container admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Administration Dashboard</h1>
          <p>Real-time analytics, revenue tracking, and cinema management controls</p>
        </div>
        <div className="admin-quick-actions">
          <Link to="/admin/movies" className="btn-admin-action">
            <FaPlus /> Manage Movies
          </Link>
          <Link to="/admin/showtimes" className="btn-admin-action">
            <FaPlus /> Manage Showtimes
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon icon-revenue">
            <FaDollarSign />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-val">${stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-bookings">
            <FaTicketAlt />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-val">{stats?.totalBookings || 0}</span>
            <span className="stat-sub">
              {stats?.activeBookings || 0} confirmed, {stats?.cancelledBookings || 0} cancelled
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-movies">
            <FaFilm />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Movies</span>
            <span className="stat-val">{stats?.totalMovies || 0}</span>
            <span className="stat-sub">
              {stats?.nowShowingMovies || 0} currently showing
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-cinemas">
            <FaBuilding />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Theaters / Multiplexes</span>
            <span className="stat-val">{stats?.totalCinemas || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-users">
            <FaUsers />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Registered Customers</span>
            <span className="stat-val">{stats?.totalUsers || 0}</span>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="admin-nav-cards">
        <Link to="/admin/movies" className="admin-nav-card">
          <FaFilm className="nav-card-icon" />
          <h4>Movies Catalogue</h4>
          <p>Add, edit, or remove movies and posters</p>
        </Link>
        <Link to="/admin/cinemas" className="admin-nav-card">
          <FaBuilding className="nav-card-icon" />
          <h4>Cinemas & Screens</h4>
          <p>Configure screen sizes and seat tier pricing</p>
        </Link>
        <Link to="/admin/showtimes" className="admin-nav-card">
          <FaCalendarAlt className="nav-card-icon" />
          <h4>Showtime Scheduler</h4>
          <p>Schedule movie screenings across auditoriums</p>
        </Link>
        <Link to="/admin/bookings" className="admin-nav-card">
          <FaTicketAlt className="nav-card-icon" />
          <h4>Booking Ledger</h4>
          <p>Inspect customer reservations and cancellations</p>
        </Link>
      </div>

      {/* Two Column Section: Popular Movies & Recent Bookings */}
      <div className="admin-split-grid">
        {/* Popular Movies */}
        <div className="admin-panel">
          <h3>Top Performing Movies</h3>
          {stats?.popularMovies?.length === 0 ? (
            <p className="no-data-hint">No movie sales recorded yet.</p>
          ) : (
            <div className="popular-movies-list">
              {stats?.popularMovies?.map((pm) => (
                <div key={pm._id} className="popular-movie-row">
                  <div className="popular-movie-details">
                    <span className="popular-title">{pm.title}</span>
                    <span className="popular-counts">
                      {pm.bookingCount} booking{pm.bookingCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="popular-revenue">
                    ${pm.totalRevenue?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="admin-panel">
          <h3>Recent Bookings</h3>
          {stats?.recentBookings?.length === 0 ? (
            <p className="no-data-hint">No bookings placed yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentBookings?.map((b) => (
                    <tr key={b._id}>
                      <td className="mono">{b.bookingReference}</td>
                      <td>{b.user?.name || 'Customer'}</td>
                      <td>{b.showtime?.movie?.title || 'Movie'}</td>
                      <td>${b.totalPrice?.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${b.status}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
