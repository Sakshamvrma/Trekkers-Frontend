import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo);
    }
  }, [user, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []); // Remove clearError and formData dependencies

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo);
    }

    setIsLoading(false);
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Log into your account</h2>

        {error && <div className="alert alert--error">{error}</div>}

        <form className="form form--login" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="email">
              Email address
            </label>
            <input
              className="form__input"
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="password">
              Password
            </label>
            <input
              className="form__input"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength="8"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form__group">
            <button
              className="btn btn--green"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="form__group">
          <p className="form__text">
            Don't have an account?{' '}
            <Link to="/signup" className="btn-text">
              Sign up here!
            </Link>
          </p>
          <p className="form__text">
            <Link to="/forgot-password" className="btn-text">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
