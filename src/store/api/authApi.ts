// store/api/authApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

// const baseUrl = `${import.meta.env.VITE_API_BASE}/api`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<
      { success: boolean; rid: number; cid: number; uid: number; land: number },
      { email: string; password: string }
    >({
      query: ({ email, password }) => ({
        url: "/user/login/",
        method: "POST",
        body: { email, password },
      }),
    }),

    getUser: builder.query<{ id: number; land: number }, {}>({
      query: () => "/user/me",
      transformResponse: (response: {
        success: boolean;
        data: number;
        land: number;
      }) => ({
        id: response.data,
        land: response.land,
      }),
    }),

    getUsersWithRole: builder.query<
      { user_type: number; name: string; email: string; image: string },
      void
    >({
      query: () => ({
        url: `/users/view_user_account/`,
        method: "GET",
      }),
      transformResponse: (response: {
        success: boolean;
        data: { user_type: number; name: string; email: string; image: string };
      }) => ({
        user_type: response.data?.user_type ?? 0,
        name: response.data?.name ?? "",
        email: response.data?.email ?? "",
        image: response.data?.image ?? "",
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/user/logout/",
        method: "POST",
      }),
    }),

    refreshToken: builder.mutation<{ access: string }, void>({
      query: () => ({
        url: "/user/refresh-token/",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUserQuery,
  useLazyGetUserQuery,
  useGetUsersWithRoleQuery,
  useLazyGetUsersWithRoleQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;
