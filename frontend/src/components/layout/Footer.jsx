import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <FaFilm className="brand-icon" />
            <span>IMovies</span>
          </div>
          <p className="footer-tagline">
            Your premier destination for blockbuster movies, immersive screen experiences, and seamless seat reservations.
          </p>
        </div>

        <div className="footer-links-group">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/movies">Now Showing</Link></li>
            <li><Link to="/movies?status=coming_soon">Coming Soon</Link></li>
            <li><Link to="/cinemas">Cinemas & Screens</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Account</h4>
          <ul>
            <li><Link to="/my-bookings">My Bookings</Link></li>
            <li><Link to="/profile">Profile Settings</Link></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} IMovies Cinema Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
