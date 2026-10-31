import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { contentApi } from "./ContentApi";

export const academyApi = createApi({
  reducerPath: "academyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["academy"],
  endpoints: (builder) => ({
    //api/academy/get_emp_list
    getTask: builder.query({
      query: (params: {
        page_size: number;
        page: number;
        search?: string;
        filtStatus?: number;
        filtDue?: number;
      }) => {
        const queryString = new URLSearchParams(
          params as Record<string, any>
        ).toString();
        return {
          url: `/academy/get_task/?${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["academy"],
    }),
    //api/academy/add_task
    addTask: builder.mutation({
      query: (formBody) => {
        return {
          url: `/academy/add_task/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["academy"],
    }),
    //up_task_done
    upTask: builder.mutation({
      query: (formBody) => {
        return {
          url: `/academy/up_task_done/`,
          body: formBody,
          method: "PUT",
        };
      },
      invalidatesTags: ["academy"],
    }),
    //del_task
    delTask: builder.mutation({
      query: (formBody) => {
        return {
          url: `/academy/del_task/`,
          body: formBody,
          method: "PUT",
        };
      },
      invalidatesTags: ["academy"],
    }),
    //up_task
    upTaskEdit: builder.mutation({
      query: (formBody) => {
        return {
          url: `/academy/up_task_edit/`,
          body: formBody,
          method: "PUT",
        };
      },
      invalidatesTags: ["academy"],
    }),
  }),
});

export const {
  useAddTaskMutation,
  useGetTaskQuery,
  useUpTaskMutation,
  useDelTaskMutation,
  useUpTaskEditMutation,
} = academyApi;
