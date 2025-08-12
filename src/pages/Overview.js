import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { tourAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const TourCard = ({ tour, onTourUpdate }) => {
  const { user } = useAuth(); // Add auth context
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [currentUpvotes, setCurrentUpvotes] = useState(tour.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [error, setError] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Function to check if current user has upvoted this tour
  const checkUserUpvoteStatus = useCallback(async () => {
    if (!user || !tour._id) return;

    try {
      const response = await tourAPI.checkUpvoteStatus(tour._id);
      setHasUpvoted(response.data.hasUpvoted || false);
    } catch (error) {
      console.log("Could not check upvote status:", error);
      // If API doesn't exist yet, default to false
      setHasUpvoted(false);
    }
  }, [user, tour._id]);

  // Reset upvote state when user changes (login/logout)
  useEffect(() => {
    if (!user) {
      // User logged out - reset upvote state
      setHasUpvoted(false);
    } else {
      // User logged in - check if they've upvoted this tour
      checkUserUpvoteStatus();
    }
  }, [user, tour._id, checkUserUpvoteStatus]);

  useEffect(() => {
    const fetchWeatherStatus = async () => {
      try {
        setLoadingWeather(true);
        const res = await tourAPI.getTourWeatherStatus(tour._id);
        setWeatherStatus(res.data.data);
      } catch (err) {
        console.error("Error fetching weather status:", err);
        setWeatherStatus(null);
      } finally {
        setLoadingWeather(false);
      }
    };

    if (tour._id) {
      fetchWeatherStatus();
    }
  }, [tour._id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-us", { month: "long", year: "numeric" });
  };

  const getWeatherIcon = (conditions) => {
    if (!conditions) return "icon-cloud";

    const condition = conditions.toLowerCase();

    if (condition.includes("sunny") || condition.includes("clear")) {
      return "icon-sun";
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return "icon-cloud-drizzle";
    } else if (condition.includes("storm") || condition.includes("thunder")) {
      return "icon-zap";
    } else if (condition.includes("snow")) {
      return "icon-cloud-snow";
    } else if (condition.includes("cloud") || condition.includes("overcast")) {
      return "icon-cloud";
    } else if (condition.includes("wind")) {
      return "icon-wind";
    } else {
      return "icon-cloud"; // default
    }
  };

  const handleUpvote = async () => {
    if (isUpvoting) return; // Prevent multiple clicks

    // Check if user is logged in
    if (!user) {
      setError("Please log in to upvote tours");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setIsUpvoting(true);
      setError(null);

      console.log(
        "Attempting to upvote tour:",
        tour._id,
        "Current hasUpvoted:",
        hasUpvoted
      );

      // Call API first to ensure backend validation
      const response = hasUpvoted
        ? await tourAPI.downvoteTour(tour._id)
        : await tourAPI.upvoteTour(tour._id);

      console.log("API response:", response.data);

      // Update local state based on successful API response
      if (response.data.success !== false) {
        setHasUpvoted(!hasUpvoted);

        // Update upvote count from backend response or local calculation
        if (response.data.data?.upvotes !== undefined) {
          setCurrentUpvotes(response.data.data.upvotes);
        } else {
          // Fallback to local calculation
          setCurrentUpvotes((prev) =>
            hasUpvoted ? Math.max(0, prev - 1) : prev + 1
          );
        }
      }
    } catch (error) {
      console.error("Failed to toggle upvote:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        setError("Please log in again to upvote");
      } else if (error.response?.status === 409) {
        setError("You have already voted on this tour");
        // Refresh the upvote status from backend
        checkUserUpvoteStatus();
      } else {
        setError("Failed to update vote. Please try again.");
      }

      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUpvoting(false);
    }
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
              : "Date TBA"}
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

        {/* Weather Info */}
        <div className="card__data card__data--weather">
          <svg className="card__icon card__icon--weather">
            <use
              xlinkHref={`/img/icons.svg#${getWeatherIcon(
                weatherStatus?.conditions
              )}`}
            ></use>
          </svg>
          {loadingWeather ? (
            <div className="weather-info">
              <span className="weather-loading">Loading weather...</span>
            </div>
          ) : weatherStatus ? (
            <div className="weather-info">
              <span className="weather-temp">{weatherStatus.temperature}</span>
              <span className="weather-conditions">
                {weatherStatus.conditions}
              </span>
              <span
                className={`weather-status ${weatherStatus.safetyStatus
                  ?.toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {weatherStatus.safetyStatus}
              </span>
            </div>
          ) : (
            <div className="weather-info">
              <span className="weather-unavailable">Weather unavailable</span>
            </div>
          )}
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
            {" "}
            rating ({tour.ratingsQuantity})
          </span>
        </p>
        <div className="card__upvote">
          <button
            className={`btn-upvote ${isUpvoting ? "btn-upvote--loading" : ""} ${
              hasUpvoted ? "btn-upvote--liked" : ""
            }`}
            onClick={handleUpvote}
            disabled={isUpvoting}
            title={hasUpvoted ? "Remove upvote" : "Upvote this tour"}
          >
            <svg className="upvote-icon">
              <use xlinkHref="/img/icons.svg#icon-heart"></use>
            </svg>
            <span className="upvote-count">{currentUpvotes}</span>
          </button>
          {error && <div className="upvote-error">{error}</div>}
        </div>
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

  const handleTourUpdate = (tourId, updates) => {
    setTours((prevTours) =>
      prevTours.map((tour) =>
        tour._id === tourId ? { ...tour, ...updates } : tour
      )
    );
  };

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await tourAPI.getAllTours();
        setTours(response.data.data.data); // Assuming your API structure
        setError(null);
      } catch (err) {
        setError("Failed to load tours. Please try again later.");
        console.error("Error fetching tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <main className="main">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading tours...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="card-container">
        {tours.map((tour) => (
          <TourCard
            key={tour._id}
            tour={tour}
            onTourUpdate={handleTourUpdate}
          />
        ))}
      </div>
    </main>
  );
};

export default Overview;
