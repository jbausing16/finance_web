import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";
// import { Quiz } from "@/lib/types";

interface PaginatedQuizResponse {
  count: number;
  next: string | null;
  previous: string | null;
  // results: Quiz[];
}

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["quiz"],
  endpoints: (builder) => ({
    // all published quizzes
    getPubQuizzes: builder.query<
      PaginatedQuizResponse,
      { page: number; pageSize: number }
    >({
      query: ({ page, pageSize }) => ({
        url: `/quiz/get_published_quizzes/?page=${page}&page_size=${pageSize}`,
        method: "GET",
      }),
      transformResponse: (response: PaginatedQuizResponse) => response,
      providesTags: ["quiz"],
    }),
    // all unpublished quizzes
    getUnPubQuizzes: builder.query<
      PaginatedQuizResponse,
      { page: number; pageSize: number }
    >({
      query: ({ page, pageSize }) => ({
        url: `/quiz/get_unpublished_quizzes/?page=${page}&page_size=${pageSize}`,
        method: "GET",
      }),
      transformResponse: (response: PaginatedQuizResponse) => response,
      providesTags: ["quiz"],
    }),
    // add quiz
    addQuiz: builder.mutation({
      query: (formBody) => {
        return {
          url: `/quiz/add_quiz/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["quiz"],
    }),
    //get quiz
    getQuiz: builder.query({
      query: (id) => {
        return {
          url: `/quiz/${id}/get_quiz/`,
          method: "GET",
        };
      },
    }),
    //update quiz
    updateQuiz: builder.mutation({
      query: ({ id, formBody }) => {
        return {
          url: `/quiz/${id}/update_quiz/`,
          body: formBody,
          method: "PUT",
        };
      },
    }),
    //partial update quiz
    partialUpdateQuiz: builder.mutation({
      query: ({ id, formBody }) => {
        return {
          url: `/quiz/${id}/partial_update_quiz/`,
          body: formBody,
          method: "PATCH",
        };
      },
    }),
    //archive unarchive quiz
    archiveUnarchiveQuiz: builder.mutation({
      query: ({ id }) => {
        return {
          url: `/quiz/${id}/archive_unarchive_quiz/`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["quiz"],
    }),
  }),
});

export const {
  useGetPubQuizzesQuery,
  useGetUnPubQuizzesQuery,
  useAddQuizMutation,
  useGetQuizQuery,
  useUpdateQuizMutation,
  usePartialUpdateQuizMutation,
  useArchiveUnarchiveQuizMutation,
} = quizApi;
