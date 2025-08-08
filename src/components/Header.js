import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <nav className="nav nav--tours">
        <Link className="nav__el" to="/">
          All tours
        </Link>
      </nav>

      <div className="header__logo">
        <img src="/img/logo-white.png" alt="Natours logo" />
      </div>

      <nav className="nav nav--user">
        {user ? (
          <>
            <button className="nav__el nav__el--logout" onClick={handleLogout}>
              Log out
            </button>
            <Link className="nav__el" to="/me">
              <img
                className="nav__user-img"
                src={`/img/users/${user.photo || 'default.jpg'}`}
                alt={user.name}
              />
              <span>{user.name ? user.name.split(' ')[0] : 'User'}</span>
            </Link>
          </>
        ) : (
          <>
            <Link className="nav__el" to="/login">
              Log in
            </Link>
            <Link className="nav__el nav__el--cta" to="/signup">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
