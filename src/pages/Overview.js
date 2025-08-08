import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tourAPI } from '../services/api';

const TourCard = ({ tour }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-us', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="card">
      <div className="card__header">
        <div className="card__picture">
          <div className="card__picture-overlay">&nbsp;</div>
          <img
            className="card__picture-img"
            src={`/img/tours/${tour.imageCover}`}
            alt={tour.name}
          />
        </div>
        <h3 className="heading-tertirary">
          <span>{tour.name}</span>
        </h3>
      </div>

      <div className="card__details">
        <h4 className="card__sub-heading">
          {tour.difficulty} {tour.duration}-day tour
        </h4>
        <p className="card__text">{tour.summary}</p>

        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-map-pin"></use>
          </svg>
          <span>{tour.startLocation?.description}</span>
        </div>

        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-calendar"></use>
          </svg>
          <span>
            {tour.startDates && tour.startDates.length > 0
              ? formatDate(tour.startDates[0])
              : 'Date TBA'}
          </span>
        </div>

        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-flag"></use>
          </svg>
          <span>{tour.locations?.length || 0} stops</span>
        </div>

        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-user"></use>
          </svg>
          <span>{tour.maxGroupSize} people</span>
        </div>
      </div>

      <div className="card__footer">
        <p>
          <span className="card__footer-value">${tour.price}</span>
          <span className="card__footer-text"> per person</span>
        </p>
        <p className="card__ratings">
          <span className="card__footer-value">{tour.ratingsAverage}</span>
          <span className="card__footer-text">
            {' '}
            rating ({tour.ratingsQuantity})
          </span>
        </p>
        <Link className="btn btn--green btn--small" to={`/tour/${tour.slug}`}>
          Details
        </Link>
      </div>
    </div>
  );
};

const Overview = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await tourAPI.getAllTours();
        setTours(response.data.data.data); // Assuming your API structure
        setError(null);
      } catch (err) {
        setError('Failed to load tours. Please try again later.');
        console.error('Error fetching tours:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading tours...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="card-container">
        {tours.map((tour) => (
          <TourCard key={tour._id} tour={tour} />
        ))}
      </div>
    </main>
  );
};

export default Overview;
