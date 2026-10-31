import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["reports"],
  endpoints: (builder) => ({
    ///api/reports/get_account_type
    getAccountsByType: builder.query({
      query: ({ type, fromD, toD }) => {
        return {
          url: `/reports/get_account_type?type=${type}&fromD=${fromD}&toD=${toD}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_account_type_monthly
    getAccountsByTypeMonthly: builder.query({
      query: ({ type, fromD, toD, type1 }) => {
        return {
          url: `/reports/get_account_type_monthly?type=${type}&type1=${type1}&fromD=${fromD}&toD=${toD}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    getAccountsByTypeMonthlyBS: builder.query({
      query: ({ type, fromD, toD }) => {
        return {
          url: `/reports/get_account_type_monthly_bs?type=${type}&fromD=${fromD}&toD=${toD}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_net_income
    getNetIncome: builder.query({
      query: ({ fromD, toD }) => {
        return {
          url: `/reports/get_net_income?fromD=${fromD}&toD=${toD}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_net_income_monthly
    getNetIncomeMonthly: builder.query({
      query: ({ fromD, toD }) => {
        return {
          url: `/reports/get_net_income_monthly?fromD=${fromD}&toD=${toD}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    // /api/reports/get_gen_ledger
    getGenLedger: builder.query({
      query: ({ fromD, toD, acc }) => {
        return {
          url: `/reports/get_gen_ledger?fromD=${fromD}&toD=${toD}&acc=${acc}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_journal_report
    getJournalReport: builder.query({
      query: ({ fromD, toD }) => {
        return {
          url: `/reports/get_journal_report?fromD=${fromD}&toD=${toD}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_cash_flow
    getCashFlow: builder.query({
      query: ({ fromD, toD }) => {
        return {
          url: `/reports/get_cash_flow?fromD=${fromD}&toD=${toD}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/pk/print_ar_invoice
    getPrintAR: builder.query({
      query: (id) => {
        return {
          url: `/reports/${id}/print_ar_invoice`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/pk/print_ap_invoice
    getPrintAP: builder.query({
      query: (id) => {
        return {
          url: `/reports/${id}/print_ap_invoice`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_ar_aging_client
    getARAgingClient: builder.query({
      query: ({ counter }) => {
        return {
          url: `/reports/get_ar_aging_client?counter=${counter}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    //get_ar_aging_invoices
    getARAgingClientInv: builder.query({
      query: ({ cid, counter }) => {
        return {
          url: `/reports/get_ar_aging_invoices?cid=${cid}&counter=${counter}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_ap_aging_client
    getAPAgingClient: builder.query({
      query: () => {
        return {
          url: `/reports/get_ap_aging_client`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    //get_ap_aging_invoices
    getAPAgingClientInv: builder.query({
      query: ({ cid }) => {
        return {
          url: `/reports/get_ap_aging_invoices?cid=${cid}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    //get_account_type_cust
    getAccountsByCust: builder.query({
      query: ({ type, fromD, toD, search, page = 1, pageSize = 20, exportAll = false }) => {
        const params = new URLSearchParams({
          type: String(type),
          fromD,
          toD,
        });

        if (search?.trim()) {
          params.append("search", search.trim());
        }

        if (exportAll) {
          params.append("export_all", "1");
        } else {
          params.append("page", String(page));
          params.append("page_size", String(pageSize));
        }

        return {
          url: `/reports/get_account_type_cust?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    //get_account_type_vendor
    getAccountsByVendor: builder.query({
      query: ({ type, fromD, toD, search, page = 1, pageSize = 20, exportAll = false }) => {
        const params = new URLSearchParams({
          type: String(type),
          fromD,
          toD,
        });

        if (search?.trim()) {
          params.append("search", search.trim());
        }

        if (exportAll) {
          params.append("export_all", "1");
        } else {
          params.append("page", String(page));
          params.append("page_size", String(pageSize));
        }

        return {
          url: `/reports/get_account_type_vendor?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_ap_cal
    getAPCal: builder.query({
      query: ({ date, counter }) => {
        return {
          url: `/reports/get_ap_cal?date=${date}&counter=${counter}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    //get_ar_cal
    getARCal: builder.query({
      query: ({ date, counter }) => {
        return {
          url: `/reports/get_ar_cal?date=${date}&counter=${counter}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_dash1
    getDash1: builder.query({
      query: ({ from, to }) => {
        return {
          url: `/reports/get_dash1?from=${from}&to=${to}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_cash_flow_monthly
    getCashFlowMonthly: builder.query({
      query: ({ from, to }) => {
        return {
          url: `/reports/get_cash_flow_monthly?fromD=${from}&toD=${to}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_cash_flow2
    getCashFlow2: builder.query({
      query: ({ from, to, bankId }) => {
        const bankFilter = bankId ? `&bank_id=${bankId}` : "";
        return {
          url: `/reports/get_cash_flow2?fromD=${from}&toD=${to}${bankFilter}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/get_notifications
    getNotif: builder.query({
      query: ({ page }) => {
        return {
          url: `/reports/get_notifications?page=${page}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
    ///api/reports/up_notif
    upNotif: builder.mutation({
      query: (id) => {
        return {
          url: `/reports/${id}/up_notif/`,
          method: "PUT",
        };
      },
      invalidatesTags: ["reports"],
    }),
    ///api/reports/get_tb
    getTB: builder.query({
      query: ({ from, to }) => {
        return {
          url: `/reports/get_tb?from=${from}&to=${to}`,
          method: "GET",
        };
      },
      providesTags: ["reports"],
    }),
  }),
});

export const {
  useGetAccountsByTypeQuery,
  useGetAccountsByTypeMonthlyQuery,
  useGetAccountsByTypeMonthlyBSQuery,
  useGetNetIncomeQuery,
  useGetNetIncomeMonthlyQuery,
  useGetGenLedgerQuery,
  useGetJournalReportQuery,
  useGetCashFlowQuery,
  useGetPrintARQuery,
  useGetPrintAPQuery,
  useGetARAgingClientQuery,
  useGetARAgingClientInvQuery,
  useGetAPAgingClientQuery,
  useGetAPAgingClientInvQuery,
  useGetAccountsByCustQuery,
  useLazyGetAccountsByCustQuery,
  useGetAccountsByVendorQuery,
  useLazyGetAccountsByVendorQuery,
  useGetAPCalQuery,
  useGetARCalQuery,
  useGetDash1Query,
  useGetCashFlowMonthlyQuery,
  useGetCashFlow2Query,
  useGetNotifQuery,
  useUpNotifMutation,
  useGetTBQuery,
} = reportsApi;
