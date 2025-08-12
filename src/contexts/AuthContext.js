import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { authAPI } from "../services/api";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  error: null,
};

// Actions
const authActions = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER: "UPDATE_USER",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.SET_LOADING:
      return { ...state, loading: action.payload };

    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };

    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };

    case authActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case authActions.CLEAR_ERROR:
      return { ...state, error: null };

    case authActions.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token
  useEffect(() => {
    if (state.token) {
      localStorage.setItem("token", state.token);
      // Add token to axios defaults
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [state.token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Set token in axios headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Get current user
          const response = await authAPI.getCurrentUser();
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: {
              user: response.data.data.data,
              token,
            },
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          dispatch({ type: authActions.LOGOUT });
        }
      } else {
        dispatch({ type: authActions.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });
      dispatch({ type: authActions.CLEAR_ERROR });

      const response = await authAPI.login({ email, password });
      const { token, data: userData } = response.data;

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: {
          user: userData.user,
          token,
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({
        type: authActions.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });
      dispatch({ type: authActions.CLEAR_ERROR });

      const response = await authAPI.signup(userData);
      const { token, data } = response.data;

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token,
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      dispatch({
        type: authActions.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");

    // Clear axios default header
    delete axios.defaults.headers.common["Authorization"];

    // Dispatch logout action
    dispatch({ type: authActions.LOGOUT });
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });
      const response = await authAPI.updateCurrentUser(userData);

      dispatch({
        type: authActions.UPDATE_USER,
        payload: response.data.data.user,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Update failed";
      dispatch({
        type: authActions.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: authActions.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
