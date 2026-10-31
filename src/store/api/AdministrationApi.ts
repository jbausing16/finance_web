import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const administrationApi = createApi({
  reducerPath: "administrationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["administration"],
  endpoints: (builder) => ({
    //api/administration/get_acc_types
    getAccTypes: builder.query({
      query: () => {
        return {
          url: `/administration/get_acc_types`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_accounts
    getAccounts: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/get_accounts`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_account
    addAccount: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_account/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_account
    upAccount: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_account/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_roles
    getRoles: builder.query({
      query: ({ cid }) => {
        return {
          url: `/administration/get_roles?cid=${cid}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_types
    getTypes: builder.query({
      query: () => {
        return {
          url: `/administration/get_types`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    // /api/administration/get_clients
    getClients: builder.query({
      query: () => {
        return {
          url: `/administration/get_clients`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_user
    addUser: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_user/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_users
    getUsers: builder.query({
      query: ({ search, page }) => {
        return {
          url: `/administration/get_users?search=${search}&page=${page}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_user
    upUser: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_user/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_users_client
    getUsersClient: builder.query({
      query: () => {
        return {
          url: `/administration/get_users_client`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approvals
    getApprovals: builder.query({
      query: ({ search }) => {
        return {
          url: `/administration/get_approvals?search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_approval
    upApproval: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_approval/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_auto_entries
    getAutoEntries: builder.query({
      query: ({ search }) => {
        return {
          url: `/administration/get_auto_entries?search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_all_accounts
    getAllAccounts: builder.query({
      query: () => {
        return {
          url: `/administration/get_all_accounts`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_auto_entries
    upAutoEntries: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_auto_entries/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    // /api/administration/add_period
    addPeriod: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_period/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_period
    upPeriod: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_period/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_periods
    getPeriod: builder.query({
      query: ({ search, page }) => {
        return {
          url: `/administration/get_period?search=${search}&page=${page}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/del_period
    delPeriod: builder.mutation({
      query: (pk) => {
        return {
          url: `/administration/${pk}/del_period/`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_banks
    getBanks: builder.query({
      query: ({ search }) => {
        return {
          url: `/administration/get_banks?search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_wtax
    getWtax: builder.query({
      query: () => {
        return {
          url: `/administration/get_wtax`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_ar_terms
    getARTerms: builder.query({
      query: () => {
        return {
          url: `/administration/get_ar_terms`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/region_list
    getRegion: builder.query({
      query: () => {
        return {
          url: `/administration/region_list`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/<region_id>/province_list
    getProvince: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/province_list`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/<province_id>/city_list
    getCity: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/city_list`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/<city_id>/barangay_list
    getBarangay: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/barangay_list`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_bp
    addBP: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_bp/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_bp
    getBP: builder.query({
      query: ({ search, filter }) => {
        return {
          url: `/administration/get_bp?search=${search}&filter=${filter}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_bp
    upBP: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_bp/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_doc_no
    getDocNo: builder.query({
      query: ({ search }) => {
        return {
          url: `/administration/get_doc_no?search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_doc_no
    upDocNo: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_doc_no/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_autoDocNo
    getAutoDocNo: builder.query({
      query: ({ name }) => {
        return {
          url: `/administration/get_autoDocNo?name=${name}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_bp_invoice
    getBPs: builder.query({
      query: ({ type }) => {
        return {
          url: `/administration/get_bp_invoice?type=${type}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_wtax_rate
    getWtaxRate: builder.query({
      query: () => {
        return {
          url: `/administration/get_wtax_rate`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_account_type
    getAccountType: builder.query({
      query: ({ type }) => {
        return {
          url: `/administration/get_account_type?type=${type}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_account_type_head
    getAccountTypeHead: builder.query({
      query: ({ type }) => {
        return {
          url: `/administration/get_account_type_head?type=${type}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_auto_account
    getAutoAccount: builder.query({
      query: ({ type }) => {
        return {
          url: `/administration/get_auto_account?type=${type}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_ar_invoice
    addARInvoice: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_ar_invoice/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_invoices
    getInvoices: builder.query({
      query: ({ page, search, type, from, to, status, date, mod }) => {
        return {
          url: `/administration/get_invoices?page=${page}&search=${search}&type=${type}&from=${from}&to=${to}&status=${status}&date=${date}&mod=${mod}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/id/get_invoice_preview
    getInvoicePreview: builder.query({
      query: ({ id, count }) => {
        return {
          url: `/administration/get_invoice_preview?id=${id}&count=${count}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //get_invoice_preview_ap
    getInvoicePreviewAP: builder.query({
      query: ({ id, count }) => {
        return {
          url: `/administration/get_invoice_preview_ap?id=${id}&count=${count}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_invoice_entry
    getInvoiceEntry: builder.query({
      query: ({ origin, id, type }) => {
        return {
          url: `/administration/get_invoice_entry?origin=${origin}&id=${id}&type=${type}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //cancel_ar_invoice
    cancelARInvoice: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/cancel_ar_invoice/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    //add_ar_cm
    addARCM: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_ar_cm/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    //get_cm_invoices
    getCMInvoices: builder.query({
      query: ({ page, search, type, from, to, status, date }) => {
        return {
          url: `/administration/get_cm_invoices?page=${page}&search=${search}&type=${type}&from=${from}&to=${to}&status=${status}&date=${date}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //get_cm_preview
    getCMPreview: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/get_cm_preview`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //get_ar_dashboard
    getARDashboard: builder.query({
      query: () => {
        return {
          url: `/administration/get_ar_dashboard`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    // /api/administration/get_ap_dashboard
    getAPDashboard: builder.query({
      query: () => {
        return {
          url: `/administration/get_ap_dashboard`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_recur
    addRecur: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_recur/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_recurring
    getRecurring: builder.query({
      query: ({ page, search, type, type1, from, to, status, date }) => {
        return {
          url: `/administration/get_recurring?page=${page}&search=${search}&type=${type}&type1=${type1}&from=${from}&to=${to}&status=${status}&date=${date}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_recur
    upRecur: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_recur/`,
          method: "PUT",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/add_ap_invoice
    addAPInvoice: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_ap_invoice/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_ap_invoices
    getAPInvoices: builder.query({
      query: ({ page, search, type, from, to, status, date, mod }) => {
        return {
          url: `/administration/get_ap_invoices?page=${page}&search=${search}&type=${type}&from=${from}&to=${to}&status=${status}&date=${date}&mod=${mod}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //cancel_ap_invoice
    cancelAPInvoice: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/cancel_ap_invoice/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/add_ap_cm
    addAPCM: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_ap_cm/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_cm_ap_invoices
    getCMAPInvoices: builder.query({
      query: ({ page, search, type, from, to, status, date }) => {
        return {
          url: `/administration/get_cm_ap_invoices?page=${page}&search=${search}&type=${type}&from=${from}&to=${to}&status=${status}&date=${date}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //api/administration/id/get_cm_ap_preview
    getCMAPPreview: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/get_cm_ap_preview`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_rec_trans
    getRecTrans: builder.query({
      query: ({ id, page }) => {
        return {
          url: `/administration/get_rec_trans?id=${id}&page=${page}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_account_cash
    getAccountCash: builder.query({
      query: () => {
        return {
          url: `/administration/get_account_cash`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //get_incoming_invoices
    getIncominInvoices: builder.query({
      query: ({ id, count }) => {
        return {
          url: `/administration/get_incoming_invoices?id=${id}&count=${count}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_account_all
    getAccountAll: builder.query({
      query: () => {
        return {
          url: `/administration/get_account_all`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //add_incoming
    addIncoming: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_incoming/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_incoming_trans
    getIncomingTrans: builder.query({
      query: ({ page, search, type, from, to, status, date, bp, bank }) => {
        return {
          url: `/administration/get_incoming_trans?page=${page}&search=${search}&type=${type}&from=${from}&to=${to}&status=${status}&date=${date}&bp=${bp}&bank=${bank}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_incoming_trans1
    getIncomingTrans1: builder.query({
      query: ({ page, bank }) => {
        return {
          url: `/administration/get_incoming_trans1?page=${page}&bank=${bank}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/id/get_transaction_preview
    getIncTransPreview: builder.query({
      query: ({ id, count }) => {
        return {
          url: `/administration/get_transaction_preview?id=${id}&count=${count}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    //get_outgoing_invoices
    getOutgoingInvoices: builder.query({
      query: ({ id }) => {
        return {
          url: `/administration/get_outgoing_invoices?id=${id}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    // up_bank
    upBank: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_bank/`,
          method: "PATCH",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    //get_check_no
    getCheckNo: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/get_check_no`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_outgoing
    addOutgoing: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_outgoing/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_outgoing_trans
    getOutgoingTrans: builder.query({
      query: ({ page, search, type, from, to, status, date, bp, bank }) => {
        return {
          url: `/administration/get_outgoing_trans?page=${page}&search=${search}&type=${type}&from=${from}&to=${to}&status=${status}&date=${date}&bp=${bp}&bank=${bank}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_outgoing_trans1
    getOutgoingTrans1: builder.query({
      query: ({ page, bank }) => {
        return {
          url: `/administration/get_outgoing_trans1?page=${page}&bank=${bank}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/id/get_out_transaction_preview
    getOutTransPreview: builder.query({
      query: ({ id, count }) => {
        return {
          url: `/administration/get_out_transaction_preview?id=${id}&count=${count}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_je
    addJE: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_je/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_je_trans
    getJETrans: builder.query({
      query: ({ page, type, from, to, search, date }) => {
        return {
          url: `/administration/get_je_trans?page=${page}&type=${type}&from=${from}&to=${to}&search=${search}&date=${date}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/id/get_je_transaction_preview
    getJETransPreview: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/get_je_transaction_preview`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/id/get_je_transaction_temp_preview
    getJETempTransPreview: builder.query({
      query: (id) => {
        return {
          url: `/administration/${id}/get_je_transaction_temp_preview`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_bs
    addBS: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_bs/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_bank_statement
    getBankStatement: builder.query({
      query: ({ page, bid, stat }) => {
        return {
          url: `/administration/get_bank_statement?page=${page}&bid=${bid}&stat=${stat}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_inventory
    addInventory: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_inventory/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_inventory
    upInventory: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_inventory/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_inventory
    getInventory: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_inventory?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/id/get_inventory_items
    getInventoryItems: builder.query({
      query: () => {
        return {
          url: `/administration/get_inventory_items`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/add_ar_terms
    addARTerms: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_ar_terms/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_ar_terms
    upARTerms: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_ar_terms/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_ar_terms_payment
    getARTermsPayment: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_ar_terms_payment?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_bank_statement
    upBankStatement: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_bank_statement/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/add_client
    addClient: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_client/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_client
    upClient: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_client/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_clients_all
    getClientsAll: builder.query({
      query: ({ page }) => {
        return {
          url: `/administration/get_clients_all?page=${page}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approval_1
    getApproval1: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_approval_1?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approval_2
    getApproval2: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_approval_2?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approval_3
    getApproval3: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_approval_3?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approval_4
    getApproval4: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_approval_4?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approval_5
    getApproval5: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_approval_5?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approval_6
    getApproval6: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_approval_6?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_approval_7
    getApproval7: builder.query({
      query: ({ page, search }) => {
        return {
          url: `/administration/get_approval_7?page=${page}&search=${search}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/up_app2
    upApp2: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_app2/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_app3
    upApp3: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_app3/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_app4
    upApp4: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_app4/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_app5
    upApp5: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_app5/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_app6
    upApp6: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_app6/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_app7
    upApp7: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_app7/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/up_app1
    upApp1: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_app1/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_customers
    getCustomers: builder.query({
      query: () => {
        return {
          url: `/administration/get_customers`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_vendors
    getVendors: builder.query({
      query: () => {
        return {
          url: `/administration/get_vendors`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_coa
    getCOA: builder.query({
      query: () => {
        return {
          url: `/administration/get_coa`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_account_type_head_ap
    getAccountTypeHeadAP: builder.query({
      query: () => {
        return {
          url: `/administration/get_account_type_head_ap`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/check_pending
    checkPending: builder.query({
      query: ({ id, type, counter, client }) => {
        return {
          url: `/administration/check_pending?id=${id}&type=${type}&counter=${counter}&client=${client}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_roles1
    getRolesClient: builder.query({
      query: ({ client, page }) => {
        return {
          url: `/administration/get_roles1?client=${client}&page=${page}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_modules
    getModules: builder.query({
      query: ({ role, counter }) => {
        return {
          url: `/administration/get_modules?role=${role}&counter=${counter}`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    // /api/administration/up_roles1
    upRoles1: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/up_roles1/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/add_role
    addRole: builder.mutation({
      query: (formBody) => {
        return {
          url: `/administration/add_role/`,
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/get_sidebar
    getSideBar: builder.query({
      query: () => {
        return {
          url: `/administration/get_sidebar`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/get_sidebar_sub
    getSideBarSub: builder.query({
      query: () => {
        return {
          url: `/administration/get_sidebar_sub`,
          method: "GET",
        };
      },
      providesTags: ["administration"],
    }),
    ///api/administration/id/cancel_inc/
    cancelInc: builder.mutation({
      query: (id) => {
        return {
          url: `/administration/${id}/cancel_inc/`,
          method: "POST",
        };
      },
      invalidatesTags: ["administration"],
    }),
    ///api/administration/id/cancel_out/
    cancelOut: builder.mutation({
      query: (id) => {
        return {
          url: `/administration/${id}/cancel_out/`,
          method: "POST",
        };
      },
      invalidatesTags: ["administration"],
    }),
  }),
});

export const {
  useGetAccTypesQuery,
  useGetAccountsQuery,
  useAddAccountMutation,
  useUpAccountMutation,
  useGetRolesQuery,
  useGetTypesQuery,
  useGetClientsQuery,
  useAddUserMutation,
  useGetUsersQuery,
  useUpUserMutation,
  useGetUsersClientQuery,
  useGetApprovalsQuery,
  useUpApprovalMutation,
  useGetAutoEntriesQuery,
  useGetAllAccountsQuery,
  useUpAutoEntriesMutation,
  useAddPeriodMutation,
  useUpPeriodMutation,
  useGetPeriodQuery,
  useDelPeriodMutation,
  useGetBanksQuery,
  useGetWtaxQuery,
  useGetARTermsQuery,
  useGetRegionQuery,
  useGetProvinceQuery,
  useGetCityQuery,
  useGetBarangayQuery,
  useAddBPMutation,
  useGetBPQuery,
  useUpBPMutation,
  useGetDocNoQuery,
  useUpDocNoMutation,
  useGetAutoDocNoQuery,
  useGetBPsQuery,
  useGetWtaxRateQuery,
  useGetAccountTypeQuery,
  useGetAccountTypeHeadQuery,
  useGetAutoAccountQuery,
  useAddARInvoiceMutation,
  useGetInvoicesQuery,
  useGetInvoicePreviewQuery,
  useGetInvoicePreviewAPQuery,
  useGetInvoiceEntryQuery,
  useCancelARInvoiceMutation,
  useAddARCMMutation,
  useGetCMInvoicesQuery,
  useGetCMPreviewQuery,
  useGetARDashboardQuery,
  useAddRecurMutation,
  useGetRecurringQuery,
  useUpRecurMutation,
  useAddAPInvoiceMutation,
  useGetAPInvoicesQuery,
  useCancelAPInvoiceMutation,
  useAddAPCMMutation,
  useGetCMAPInvoicesQuery,
  useGetCMAPPreviewQuery,
  useGetRecTransQuery,
  useGetAccountCashQuery,
  useGetIncominInvoicesQuery,
  useGetAccountAllQuery,
  useAddIncomingMutation,
  useGetIncomingTransQuery,
  useGetIncTransPreviewQuery,
  useGetOutgoingInvoicesQuery,
  useUpBankMutation,
  useGetCheckNoQuery,
  useAddOutgoingMutation,
  useGetOutgoingTransQuery,
  useGetOutTransPreviewQuery,
  useAddJEMutation,
  useGetJETransQuery,
  useGetJETransPreviewQuery,
  useGetJETempTransPreviewQuery,
  useAddBSMutation,
  useGetBankStatementQuery,
  useAddInventoryMutation,
  useUpInventoryMutation,
  useGetInventoryQuery,
  useGetInventoryItemsQuery,
  useAddARTermsMutation,
  useUpARTermsMutation,
  useGetARTermsPaymentQuery,
  useUpBankStatementMutation,
  useGetIncomingTrans1Query,
  useGetOutgoingTrans1Query,
  useAddClientMutation,
  useUpClientMutation,
  useGetClientsAllQuery,
  useGetAPDashboardQuery,
  useGetApproval1Query,
  useGetApproval2Query,
  useGetApproval3Query,
  useGetApproval4Query,
  useGetApproval5Query,
  useGetApproval6Query,
  useGetApproval7Query,
  useUpApp2Mutation,
  useUpApp3Mutation,
  useUpApp4Mutation,
  useUpApp5Mutation,
  useUpApp6Mutation,
  useUpApp7Mutation,
  useUpApp1Mutation,
  useGetVendorsQuery,
  useGetCustomersQuery,
  useGetCOAQuery,
  useGetAccountTypeHeadAPQuery,
  useCheckPendingQuery,
  useGetModulesQuery,
  useGetRolesClientQuery,
  useUpRoles1Mutation,
  useAddRoleMutation,
  useGetSideBarQuery,
  useGetSideBarSubQuery,
  useLazyGetSideBarSubQuery,
  useCancelIncMutation,
  useCancelOutMutation,
} = administrationApi;
