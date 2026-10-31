// store/auth/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LogoutReason =
  | "logged_in_elsewhere"
  | "refresh_invalid"
  | "refresh_missing"
  | "session_invalid"
  | "unknown";

interface AuthState {
  isAuthenticated: boolean;
  role: number | null;
  name: string | null;
  email: string | null;
  image: string | null;
  loading: boolean;
  error: string | null;
  sideBar: string | null;
  access: any[];
  logoutReason: LogoutReason | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  name: null,
  email: null,
  image: null,
  loading: false,
  error: null,
  sideBar: "expanded",
  access: [],
  logoutReason: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ role: number }>) => {
      state.isAuthenticated = true;
      state.role = Number(action.payload.role);
      state.logoutReason = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.name = null;
      state.email = null;
      state.image = null;
      state.access = [];
    },
    logoutWithReason: (state, action: PayloadAction<{ reason: LogoutReason }>) => {
      state.isAuthenticated = false;
      state.role = null;
      state.name = null;
      state.email = null;
      state.image = null;
      state.access = [];
      state.logoutReason = action.payload.reason;
    },
    clearLogoutReason: (state) => {
      state.logoutReason = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    viewSide: (state, action: PayloadAction<{ stat: string }>) => {
      state.sideBar = action.payload.stat;
    },
    viewUser: (
      state,
      action: PayloadAction<{ name: string; email: string; image: string }>,
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.image = action.payload.image;
    },
    access: (state, action: PayloadAction<{ access: any[] }>) => {
      state.access = action.payload.access;
    },
  },
});

export const {
  loginSuccess,
  logout,
  logoutWithReason,
  clearLogoutReason,
  setLoading,
  setError,
  viewSide,
  viewUser,
  access,
} = authSlice.actions;
export default authSlice.reducer;
