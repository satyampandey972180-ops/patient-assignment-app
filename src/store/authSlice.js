import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/firebase/authService';

// Async thunks for Firebase authentication
export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await authService.login(email, password);
      return {
        user: {
          uid: result.user.uid,
          email: result.user.email,
        },
        profile: result.profile,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signupAsync = createAsyncThunk(
  'auth/signupAsync',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const result = await authService.signup(email, password, role);
      return {
        user: {
          uid: result.user.uid,
          email: result.user.email,
        },
        profile: result.profile,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
  profile: null,
  role: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions for local auth (backward compatibility)
    login: (state, action) => {
      const { username, password } = action.payload;
      state.isAuthenticated = true;
      state.user = { username };
      state.error = null;
    },
    signup: (state, action) => {
      const { username, password } = action.payload;
      state.isAuthenticated = true;
      state.user = { username };
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
      state.role = null;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.role = action.payload.profile?.role;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.role = action.payload.profile.role;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      });

    // Signup
    builder
      .addCase(signupAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.loading = false;
        // DO NOT authenticate user after signup - they need to verify email first
        state.isAuthenticated = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.role = action.payload.profile.role;
        state.error = null;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.profile = null;
        state.role = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { login, signup, logout, setUser, clearError } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectProfile = (state) => state.auth.profile;
export const selectRole = (state) => state.auth.role;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
