import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["users"],
  endpoints: (builder) => ({
    ///api/users/check_email
    checkEmail: builder.query({
      query: ({ email }) => {
        return {
          url: `/users/check_email?email=${email}`,
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),
    ///api/users/check_pin
    checkPIN: builder.query({
      query: ({ email, pin }) => {
        return {
          url: `/users/check_pin?email=${email}&pin=${pin}`,
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),
    ///api/users/change_pass
    changePass: builder.mutation({
      query: (formBody) => {
        return {
          url: `/users/change_pass/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useLazyCheckEmailQuery,
  useLazyCheckPINQuery,
  useChangePassMutation,
} = usersApi;
