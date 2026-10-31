import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["course"],
  endpoints: (builder) => ({
    ///api/content/get_emp_list
    getEmpList: builder.query({
      query: ({ client }) => {
        return {
          url: `/content/get_emp_list/?client=${client}`,
          method: "GET",
        };
      },
      // providesTags: ["course"],
    }),
    //get_dept_list
    getDepList: builder.query({
      query: ({ client }) => {
        return {
          url: `/content/get_dept_list/?client=${client}`,
          method: "GET",
        };
      },
      // providesTags: ["course"],
    }),
    addCourse: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/add_course/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["course"],
    }),
    //get_course_id
    getCourseId: builder.query({
      query: ({ id }) => {
        return {
          url: `/content/get_course_id/?id=${id}`,
          method: "GET",
        };
      },
      providesTags: ["course"],
    }),
    //get_course_creator
    getCourseCreator: builder.query<any, void>({
      query: () => {
        return {
          url: `/content/get_course_creator/`,
          method: "GET",
        };
      },
      providesTags: ["course"],
    }),
    ///api/content/add_lesson/
    addLesson: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/add_lesson/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["course"],
    }),
    getCourse: builder.query({
      query: (params: {
        page_size: number;
        page: number;
        search?: string;
        status?: string;
        filtDue?: number;
        filtVisi?: number;
        sortTitle?: number;
        sortCreated?: number;
        sortDue?: number;
      }) => {
        const queryString = new URLSearchParams(
          params as Record<string, any>
        ).toString();
        return {
          url: `/content/get_course/?${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["course"],
    }),
    //up_course_visibility
    upCourseVisi: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/up_course_visibility/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["course"],
    }),
    //get_lesson
    getLesson: builder.query({
      query: (params: {
        page_size: number;
        page: number;
        cid?: string;
        search?: string;
        status?: string;
        filtDue?: number;
        filtPub?: number;
        sortTitle?: number;
        sortCreated?: number;
        sortDue?: number;
      }) => {
        const queryString = new URLSearchParams(
          params as Record<string, any>
        ).toString();
        return {
          url: `/content/get_lesson/?${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["course"],
    }),
    // up_course
    upCourse: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/up_course/`,
          body: formBody,
          method: "PUT",
        };
      },
      invalidatesTags: ["course"],
    }),
    //up_course_archive
    upCourseArchive: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/up_course_archive/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["course"],
    }),
    //up_lesson_visibility
    upLessonVisi: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/up_lesson_visibility/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["course"],
    }),
    //up_lesson_archive
    upLessonArchive: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/up_lesson_archive/`,
          body: formBody,
          method: "POST",
        };
      },
      invalidatesTags: ["course"],
    }),
    //get_lesson_id
    getLessonId: builder.query({
      query: ({ id }) => {
        return {
          url: `/content/get_lesson_id/?id=${id}`,
          method: "GET",
        };
      },
      providesTags: ["course"],
    }),
    //up_lesson
    upLesson: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/up_lesson/`,
          body: formBody,
          method: "PUT",
        };
      },
      invalidatesTags: ["course"],
    }),
    //add_temp_file
    addTempFile: builder.mutation({
      query: (formBody) => {
        return {
          url: `/content/add_temp_file/`,
          body: formBody,
          method: "POST",
        };
      },
    }),
  }),
});

export const {
  useGetEmpListQuery,
  useAddCourseMutation,
  useGetDepListQuery,
  useGetCourseIdQuery,
  useGetCourseCreatorQuery,
  useAddLessonMutation,
  useGetCourseQuery,
  useUpCourseVisiMutation,
  useGetLessonQuery,
  useUpCourseMutation,
  useUpCourseArchiveMutation,
  useUpLessonVisiMutation,
  useUpLessonArchiveMutation,
  useGetLessonIdQuery,
  useUpLessonMutation,
  useAddTempFileMutation,
} = contentApi;
