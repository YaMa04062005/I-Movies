import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { FaBuilding, FaMapMarkerAlt, FaTv, FaEye } from 'react-icons/fa';

const Cinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/cinemas');
      if (res.data && res.data.success) {
        setCinemas(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cinemas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Cinemas & Theaters</h1>
          <p>Find luxury multiplexes, IMAX screens, and standard auditoriums near you</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading cinemas..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchCinemas} />
      ) : cinemas.length === 0 ? (
        <EmptyState
          icon={FaBuilding}
          title="No cinemas found"
          description="There are currently no cinemas listed."
        />
      ) : (
        <div className="cinemas-grid">
          {cinemas.map((cinema) => (
            <div key={cinema._id} className="cinema-card">
              <div className="cinema-card-header">
                <FaBuilding className="cinema-icon" />
                <span className="cinema-city">{cinema.city}</span>
              </div>

              <div className="cinema-card-body">
                <h3 className="cinema-name">{cinema.name}</h3>
                <p className="cinema-location">
                  <FaMapMarkerAlt /> {cinema.location}
                </p>

                <div className="cinema-screens-meta">
                  <FaTv />
                  <span>
                    {cinema.screens?.length || 0} Screen
                    {cinema.screens?.length === 1 ? '' : 's'} Available
                  </span>
                </div>

                <div className="screen-tags">
                  {cinema.screens?.slice(0, 3).map((screen, sIdx) => (
                    <span key={sIdx} className="screen-tag">
                      {screen.name}
                    </span>
                  ))}
                  {cinema.screens?.length > 3 && (
                    <span className="screen-tag">
                      +{cinema.screens.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="cinema-card-footer">
                <Link
                  to={`/cinemas/${cinema._id}`}
                  className="btn-view-cinema"
                >
                  <FaEye /> View Screens & Showtimes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cinemas;
