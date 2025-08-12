import axios from "axios";

// Create axios instance
const api = axios.create({
  //baseURL: 'https://trekkers-backend.onrender.com/api/v1',
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Changed from 'jwt' to 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Changed from 'jwt' to 'token'
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Tour API calls
export const tourAPI = {
  getAllTours: () => api.get("/tours"),
  getTour: (slug) => api.get(`/tours/slug/${slug}`),
  getTourStats: () => api.get("/tours/tour-stats"),
  getTopCheapTours: () => api.get("/tours/top-5-cheap"),
  createTour: (data) => api.post("/tours", data),
  updateTour: (id, data) => api.patch(`/tours/${id}`, data),
  deleteTour: (id) => api.delete(`/tours/${id}`),
  upvoteTour: (tourId) => api.patch(`/tours/${tourId}/upvote`),
  downvoteTour: (tourId) => api.patch(`/tours/${tourId}/downvote`),
  checkUpvoteStatus: (tourId) => api.get(`/tours/${tourId}/upvote-status`),
  getTourWeatherStatus: (id) => api.get(`/tours/${id}/weather-status`),
};

// User API calls
export const userAPI = {
  getAllUsers: () => api.get("/users"),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getCurrentUser: () => api.get("/users/me"),
  updateCurrentUser: (data) => api.patch("/users/updateMe", data),
  deleteCurrentUser: () => api.delete("/users/deleteMe"),
};

// Auth API calls
export const authAPI = {
  signup: (data) => api.post("/users/signup", data),
  login: (data) => api.post("/users/login", data),
  getCurrentUser: () => api.get("/users/me"),
  forgotPassword: (data) => api.post("/users/forgotPassword", data),
  resetPassword: (token, data) =>
    api.patch(`/users/resetPassword/${token}`, data),
  updatePassword: (data) => api.patch("/users/updateMyPassword", data),
  updateCurrentUser: (data) => api.patch("/users/updateMe", data),
};

// Review API calls
export const reviewAPI = {
  getAllReviews: () => api.get("/reviews"),
  getReview: (id) => api.get(`/reviews/${id}`),
  createReview: (data) => api.post("/reviews", data),
  updateReview: (id, data) => api.patch(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getTourReviews: (tourId) => api.get(`/tours/${tourId}/reviews`),
  createTourReview: (tourId, data) =>
    api.post(`/tours/${tourId}/reviews`, data),
};

// Booking API calls
export const bookingAPI = {
  getAllBookings: () => api.get("/bookings"),
  getBooking: (id) => api.get(`/bookings/${id}`),
};

export default api;
