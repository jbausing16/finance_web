import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { logout, logoutWithReason, type LogoutReason } from "../auth/authSlice";

export const FORCED_LOGOUT_REASON_STORAGE_KEY = "forced_logout_reason";

const baseUrl = `${import.meta.env.VITE_API_BASE}/api`;

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
});

const getLogoutReason = (error: FetchBaseQueryError): LogoutReason => {
  const data = (error as FetchBaseQueryError & { data?: any }).data;
  const reason = data?.reason;

  if (
    reason === "logged_in_elsewhere" ||
    reason === "refresh_invalid" ||
    reason === "refresh_missing" ||
    reason === "session_invalid"
  ) {
    return reason;
  }

  return "unknown";
};

export const getForcedLogoutMessage = (reason: string | null | undefined) => {
  if (reason === "logged_in_elsewhere") {
    return "You were logged out because your account signed in on another device/browser.";
  }

  if (reason === "refresh_invalid" || reason === "session_invalid") {
    return "Your session ended. Please sign in again.";
  }

  return null;
};

const shouldStoreForcedLogoutReason = (reason: LogoutReason) => {
  return (
    reason === "logged_in_elsewhere" ||
    reason === "refresh_invalid" ||
    reason === "session_invalid"
  );
};

export const baseQueryWithReauth: BaseQueryFn<any, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);
  const requestUrl = typeof args === "string" ? args : args?.url;

  if (result.error && result.error.status === 401) {
    if (requestUrl === "/user/login/" || requestUrl === "/user/refresh-token/") {
      return result;
    }

    const refreshResult = await baseQuery(
      { url: "/user/refresh-token/", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.error) {
      const reason = getLogoutReason(refreshResult.error as FetchBaseQueryError);

      if (shouldStoreForcedLogoutReason(reason)) {
        sessionStorage.setItem(FORCED_LOGOUT_REASON_STORAGE_KEY, reason);
        api.dispatch(logoutWithReason({ reason }));
      } else {
        sessionStorage.removeItem(FORCED_LOGOUT_REASON_STORAGE_KEY);
        api.dispatch(logout());
      }

      return refreshResult;
    }

    // Retry the original request with the new token
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};
