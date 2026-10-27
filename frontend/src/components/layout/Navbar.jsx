import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FaFilm,
  FaTicketAlt,
  FaBuilding,
  FaShieldAlt,
  FaBars,
  FaTimes,
  FaGlobeAmericas,
  FaFire,
} from 'react-icons/fa';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <FaFilm className="brand-icon" />
          <span className="brand-name">IMovies</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Nav Links */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar-start">
            <NavLink
              to="/movies"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              <FaFilm /> All Movies
            </NavLink>

            <NavLink
              to="/movies?category=hollywood"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              <FaGlobeAmericas /> Hollywood
            </NavLink>

            <NavLink
              to="/movies?category=bollywood"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              <FaFire /> Bollywood
            </NavLink>

            <NavLink
              to="/cinemas"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              <FaBuilding /> Cinemas
            </NavLink>
          </div>

          <div className="navbar-end">
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                `nav-link btn-my-tickets ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              <FaTicketAlt /> My Bookings
            </NavLink>

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link admin-pill ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              <FaShieldAlt /> Admin
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
