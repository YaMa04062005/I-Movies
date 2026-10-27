import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaShieldAlt, FaCalendarCheck } from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  return (
    <div className="page-container profile-page">
      <div className="profile-card">
        <div className="profile-avatar-circle">
          <FaUser />
        </div>

        <h2>{user?.name || 'User Profile'}</h2>
        <span className={`role-badge role-${user?.role || 'user'}`}>
          {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
        </span>

        <div className="profile-info-grid">
          <div className="info-box">
            <FaEnvelope className="info-icon" />
            <div>
              <span className="info-label">Email Address</span>
              <span className="info-val">{user?.email}</span>
            </div>
          </div>

          <div className="info-box">
            <FaShieldAlt className="info-icon" />
            <div>
              <span className="info-label">Account Role</span>
              <span className="info-val">{user?.role}</span>
            </div>
          </div>

          <div className="info-box">
            <FaCalendarCheck className="info-icon" />
            <div>
              <span className="info-label">Member Since</span>
              <span className="info-val">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
