import { persistor } from "../store";
import { logout, selectToken, selectRefreshToken } from "../store/slices/authSlice";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

/**
 * Handles user logout by:
 * 1. Calling the logout API to invalidate refresh token
 * 2. Dispatching logout action to clear Redux state
 * 3. Purging persisted storage
 * 4. Showing toast notification
 * 5. Navigating to login page
 */
export const handleLogout = async (dispatch, navigate = null, getState = null) => {
  console.log("Logging out user...");
  try {
    // Get refresh token from state if available
    let refreshToken = null;
    if (getState) {
      const state = getState();
      refreshToken = selectRefreshToken(state);
    } else {
      // Fallback: try to get from localStorage
      const persistedState = localStorage.getItem('persist:root');
      if (persistedState) {
        try {
          const parsed = JSON.parse(persistedState);
          const authState = parsed.auth ? JSON.parse(parsed.auth) : {};
          refreshToken = authState.refreshToken;
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    // Call logout API to invalidate refresh token on server
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch (error) {
        console.warn('Logout API call failed:', error);
        // Continue with local logout even if API call fails
      }
    }
    let id = localStorage.getItem("visitor-id");
    console.log("Removing local session for id:", id);
    if (id) {
      localStorage.removeItem("visitor-id");
    }
  } catch (error) {
    console.warn('Error during logout API call:', error);
    // Continue with local logout even if API call fails
  }

  // Dispatch logout action to clear Redux state
  dispatch(logout());
  
  // Purge persisted storage to clear all persisted data
  await persistor.purge();
  
  // Clear any remaining localStorage items
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  
  // Show success toast notification
  toast.success('Logged out successfully', {
    position: 'bottom-center',
    duration: 2000,
  });
  
  // Small delay to show toast before navigation
  setTimeout(() => {
    // Navigate to login page if navigate function provided
    if (navigate) {
      navigate("/");
    } else {
      // Fallback: redirect using window.location
      window.location.href = "/";
    }
  }, 500);
};

