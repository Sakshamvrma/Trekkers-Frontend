import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, authAPI } from '../services/api';

const UserDashboard = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userAPI.updateCurrentUser(profileData);
      
      // Update user in auth context
      await updateUser(response.data.data.user);
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordData.password !== passwordData.passwordConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authAPI.updatePassword(passwordData);
      
      setSuccess('Password updated successfully!');
      setPasswordData({
        passwordCurrent: '',
        password: '',
        passwordConfirm: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="main">
        <div className="user-view">
          <div className="error">
            <h2>Please log in to access your dashboard</h2>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="user-view">
        {/* Sidebar Navigation */}
        <nav className="user-view__menu">
          <ul className="side-nav">
            <li className={activeTab === 'profile' ? 'side-nav--active' : ''}>
              <button 
                className="nav__el"
                onClick={() => setActiveTab('profile')}
              >
                <svg className="nav__icon">
                  <use xlinkHref="/img/icons.svg#icon-settings"></use>
                </svg>
                Settings
              </button>
            </li>
            <li className={activeTab === 'bookings' ? 'side-nav--active' : ''}>
              <button 
                className="nav__el"
                onClick={() => setActiveTab('bookings')}
              >
                <svg className="nav__icon">
                  <use xlinkHref="/img/icons.svg#icon-briefcase"></use>
                </svg>
                My bookings
              </button>
            </li>
            <li className={activeTab === 'reviews' ? 'side-nav--active' : ''}>
              <button 
                className="nav__el"
                onClick={() => setActiveTab('reviews')}
              >
                <svg className="nav__icon">
                  <use xlinkHref="/img/icons.svg#icon-star"></use>
                </svg>
                My reviews
              </button>
            </li>
            <li className={activeTab === 'password' ? 'side-nav--active' : ''}>
              <button 
                className="nav__el"
                onClick={() => setActiveTab('password')}
              >
                <svg className="nav__icon">
                  <use xlinkHref="/img/icons.svg#icon-key"></use>
                </svg>
                Password
              </button>
            </li>
          </ul>

          {user.role === 'admin' && (
            <>
              <div className="admin-nav__heading">Admin</div>
              <ul className="side-nav">
                <li>
                  <button className="nav__el">
                    <svg className="nav__icon">
                      <use xlinkHref="/img/icons.svg#icon-map"></use>
                    </svg>
                    Manage tours
                  </button>
                </li>
                <li>
                  <button className="nav__el">
                    <svg className="nav__icon">
                      <use xlinkHref="/img/icons.svg#icon-users"></use>
                    </svg>
                    Manage users
                  </button>
                </li>
                <li>
                  <button className="nav__el">
                    <svg className="nav__icon">
                      <use xlinkHref="/img/icons.svg#icon-star"></use>
                    </svg>
                    Manage reviews
                  </button>
                </li>
                <li>
                  <button className="nav__el">
                    <svg className="nav__icon">
                      <use xlinkHref="/img/icons.svg#icon-briefcase"></use>
                    </svg>
                    Manage bookings
                  </button>
                </li>
              </ul>
            </>
          )}
        </nav>

        {/* Main Content */}
        <div className="user-view__content">
          <div className="user-view__form-container">
            {/* Alert Messages */}
            {error && (
              <div className="alert alert--error">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert--success">
                {success}
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <form className="form form-user-data" onSubmit={handleProfileSubmit}>
                <h2 className="heading-secondary ma-bt-md">Your account settings</h2>
                
                <div className="form__group">
                  <label className="form__label" htmlFor="name">Name</label>
                  <input
                    className="form__input"
                    id="name"
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="email">Email address</label>
                  <input
                    className="form__input"
                    id="email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form__group form__photo-upload">
                  <img 
                    className="form__user-photo" 
                    src={`/img/users/${user.photo || 'default.jpg'}`} 
                    alt="User photo" 
                  />
                  <input 
                    className="form__upload" 
                    type="file" 
                    accept="image/*" 
                    id="photo" 
                    name="photo"
                  />
                  <label htmlFor="photo">Choose new photo</label>
                </div>

                <div className="form__group right">
                  <button 
                    className="btn btn--small btn--green" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save settings'}
                  </button>
                </div>
              </form>
            )}

            {/* My Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="heading-secondary ma-bt-md">My tour bookings</h2>
                <div className="booking-card">
                  <p>No bookings yet. Start exploring our amazing tours!</p>
                  <a href="/" className="btn btn--green btn--small">Browse tours</a>
                </div>
              </div>
            )}

            {/* My Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="heading-secondary ma-bt-md">My reviews</h2>
                <div className="review-card">
                  <p>You haven't written any reviews yet.</p>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form className="form form-user-password" onSubmit={handlePasswordSubmit}>
                <h2 className="heading-secondary ma-bt-md">Password change</h2>
                
                <div className="form__group">
                  <label className="form__label" htmlFor="passwordCurrent">Current password</label>
                  <input
                    className="form__input"
                    id="passwordCurrent"
                    type="password"
                    name="passwordCurrent"
                    placeholder="••••••••"
                    value={passwordData.passwordCurrent}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                  />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="password">New password</label>
                  <input
                    className="form__input"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                  />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="passwordConfirm">Confirm password</label>
                  <input
                    className="form__input"
                    id="passwordConfirm"
                    type="password"
                    name="passwordConfirm"
                    placeholder="••••••••"
                    value={passwordData.passwordConfirm}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                  />
                </div>

                <div className="form__group right">
                  <button 
                    className="btn btn--small btn--green" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserDashboard;
