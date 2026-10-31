import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import { authApi } from "./api/authApi";
import { contentApi } from "./api/ContentApi";
import { administrationApi } from "./api/AdministrationApi";
import { reportsApi } from "./api/ReportsApi";
import { usersApi } from "./api/UsersApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [contentApi.reducerPath]: contentApi.reducer,
    [administrationApi.reducerPath]: administrationApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(contentApi.middleware)
      .concat(administrationApi.middleware)
      .concat(reportsApi.middleware)
      .concat(usersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
