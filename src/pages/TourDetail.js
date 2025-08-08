import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tourAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TourDetail = () => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true);
        const response = await tourAPI.getTour(slug);
        setTour(response.data.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tour:', err);
        setError('Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTour();
    }
  }, [slug]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-us', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (duration) => {
    return duration === 1 ? '1 day' : `${duration} days`;
  };

  const handleBookingAction = () => {
    if (user) {
      // User is logged in - proceed to booking (we'll implement this later)
      alert(
        `Booking ${tour.name} for $${tour.price}! (Booking system coming soon...)`,
      );
    } else {
      // User not logged in - redirect to login with return path
      navigate('/login', {
        state: { returnTo: `/tour/${tour.slug}` },
      });
    }
  };

  if (loading) {
    return (
      <main className="main">
        <div className="tour-detail__loading">
          <p>Loading tour details...</p>
        </div>
      </main>
    );
  }

  if (error || !tour) {
    return (
      <main className="main">
        <div className="tour-detail__error">
          <h2>Oops! Something went wrong</h2>
          <p>{error || 'Tour not found'}</p>
          <button className="btn btn--green" onClick={() => navigate('/')}>
            Back to Tours
          </button>
        </div>
      </main>
    );
  }

  // Additional safety check - don't render if tour data is incomplete
  if (!tour.name || !tour.duration) {
    return (
      <main className="main">
        <div className="tour-detail__loading">
          <p>Loading tour information...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="section-header">
        <div className="header__hero">
          <div className="header__hero-overlay">&nbsp;</div>
          <img
            className="header__hero-img"
            src={`/img/tours/${tour.imageCover || 'tour-1-cover.jpg'}`}
            alt={tour.name || 'Tour'}
          />
        </div>
        <div className="heading-box">
          <h1 className="heading-primary">
            <span>{tour.name || 'Tour'} tour</span>
          </h1>
          <div className="heading-box__group">
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-clock"></use>
              </svg>
              <span className="heading-box__text">
                {formatDuration(tour.duration || 0)}
              </span>
            </div>
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use xlinkHref="/img/icons.svg#icon-map-pin"></use>
              </svg>
              <span className="heading-box__text">
                {tour.startLocation?.description}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="section-description">
        <div className="overview-box">
          <div>
            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Quick facts</h2>

              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-calendar"></use>
                </svg>
                <span className="overview-box__label">Next date</span>
                <span className="overview-box__text">
                  {tour.startDates && tour.startDates.length > 0
                    ? formatDate(tour.startDates[0])
                    : 'Date TBA'}
                </span>
              </div>

              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-trending-up"></use>
                </svg>
                <span className="overview-box__label">Difficulty</span>
                <span className="overview-box__text">{tour.difficulty}</span>
              </div>

              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-user"></use>
                </svg>
                <span className="overview-box__label">Participants</span>
                <span className="overview-box__text">
                  {tour.maxGroupSize} people
                </span>
              </div>

              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use xlinkHref="/img/icons.svg#icon-star"></use>
                </svg>
                <span className="overview-box__label">Rating</span>
                <span className="overview-box__text">
                  {tour.ratingsAverage} / 5 ({tour.ratingsQuantity} reviews)
                </span>
              </div>
            </div>

            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Your tour guides</h2>

              {tour.guides &&
                tour.guides.map((guide, index) => (
                  <div key={index} className="overview-box__detail">
                    <img
                      className="overview-box__img"
                      src={`/img/users/${guide.photo || 'default.jpg'}`}
                      alt={guide.name}
                    />
                    <span className="overview-box__label">
                      {guide.role === 'lead-guide'
                        ? 'Lead guide'
                        : 'Tour guide'}
                    </span>
                    <span className="overview-box__text">{guide.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="description-box">
          <h2 className="heading-secondary ma-bt-lg">About {tour.name}</h2>
          {tour.description &&
            tour.description.split('\n').map((paragraph, index) => (
              <p key={index} className="description__text">
                {paragraph}
              </p>
            ))}
        </div>
      </section>

      {/* Pictures Section */}
      <section className="section-pictures">
        {tour.images &&
          tour.images.map((image, index) => (
            <div key={index} className="picture-box">
              <img
                className={`picture-box__img picture-box__img--${index + 1}`}
                src={`/img/tours/${image}`}
                alt={`${tour.name} ${index + 1}`}
              />
            </div>
          ))}
      </section>

      {/* Reviews Section */}
      <section className="section-reviews">
        <div className="reviews">
          {tour.reviews &&
            tour.reviews.slice(0, 6).map((review, index) => (
              <div key={index} className="reviews__card">
                <div className="reviews__avatar">
                  <img
                    className="reviews__avatar-img"
                    src={`/img/users/${review.user?.photo || 'default.jpg'}`}
                    alt={review.user?.name}
                  />
                  <h6 className="reviews__user">{review.user?.name}</h6>
                </div>
                <p className="reviews__text">{review.review}</p>
                <div className="reviews__rating">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`reviews__star reviews__star--${
                        i < review.rating ? 'active' : 'inactive'
                      }`}
                    >
                      <use xlinkHref="/img/icons.svg#icon-star"></use>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-cta">
        <div className="cta">
          <div className="cta__img cta__img--logo">
            <img src="/img/logo-white.png" alt="Natours logo" />
          </div>
          <img
            className="cta__img cta__img--1"
            src={`/img/tours/${tour.images ? tour.images[1] : tour.imageCover}`}
            alt="Tour"
          />
          <img
            className="cta__img cta__img--2"
            src={`/img/tours/${tour.images ? tour.images[2] : tour.imageCover}`}
            alt="Tour"
          />
          <div className="cta__content">
            <h2 className="heading-secondary">What are you waiting for?</h2>
            <p className="cta__text">
              {tour.duration} days. 1 adventure. Infinite memories. Make it
              yours today!
            </p>
            <button
              className="btn btn--green span-all-rows"
              onClick={handleBookingAction}
            >
              {user ? `Book tour for $${tour.price}` : 'Login to book tour'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TourDetail;
