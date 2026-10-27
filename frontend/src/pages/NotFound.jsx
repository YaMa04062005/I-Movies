import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="page-container not-found-page">
      <div className="not-found-card">
        <FaFilm className="not-found-icon" />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The reel you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn-primary-large">
          <FaHome /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
