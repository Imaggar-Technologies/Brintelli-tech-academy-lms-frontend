import { createSlice } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // Start as true to wait for rehydration
  _persist: null, // Track rehydration status
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state) => {
      // Reset all auth state to initial values
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Handle rehydration from redux-persist
    builder.addCase(REHYDRATE, (state, action) => {
      if (action.payload && action.payload.auth) {
        const persistedAuth = action.payload.auth;
        // Restore persisted auth state
        state.user = persistedAuth.user;
        state.token = persistedAuth.token;
        state.refreshToken = persistedAuth.refreshToken;
        state.isAuthenticated = persistedAuth.isAuthenticated || false;
        state.isLoading = false; // Rehydration complete
      } else {
        // No persisted state, set loading to false
        state.isLoading = false;
      }
    });
  },
});

export const { setCredentials, logout, setLoading, updateUser } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectRefreshToken = (state) => state.auth.refreshToken;

