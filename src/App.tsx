import { useState } from "react";
import viteLogo from "/vite.svg";
import { ThemeProvider } from "./components/utils/theme-provider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PublicRoute from "./components/utils/PublicRoute";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./components/pages/Dashboard";
import Users from "./components/pages/administration/Users";
import Approval from "./components/pages/administration/Approval";
import AutomaticEntries from "./components/pages/administration/AutomaticEntries";
import PostingPeriod from "./components/pages/administration/PostingPeriod";
import BusinessPartner from "./components/pages/BusinessPartner";
import ARInvoice from "./components/pages/sales/ARInvoice";
import ARCreditMemo from "./components/pages/sales/ARCreditMemo";
import RecurringTransaction from "./components/pages/sales/RecurringTransaction";
import RecurringTransaction1 from "./components/pages/purchasing/RecurringTransaction";
import APInvoice from "./components/pages/purchasing/APInvoice";
import APCreditMemo from "./components/pages/purchasing/APCreditMemo";
import IncomingPayment from "./components/pages/banking/IncomingPayment";
import OutgoingPayment from "./components/pages/banking/OutgoingPayment";
import JournalEntry from "./components/pages/financials/JournalEntry";
import ChartOfAccounts from "./components/pages/financials/ChartOfAccounts";
import BalanceSheet from "./components/pages/reports/BalanceSheet";
import Login from "./components/pages/Login";
import DocumentNumber from "./components/pages/administration/DocumentNumber";
import BankSetUp from "./components/pages/administration/BankSetUp";
import ProfitLoss from "./components/pages/reports/ProfitLoss";
import GeneralLedger from "./components/pages/reports/GeneralLedger";
import JournalReport from "./components/pages/financials/JournalReport";
import BankRecon from "./components/pages/banking/BankRecon";
import Projection from "./components/pages/reports/Projection";
import FinancialPerformance from "./components/pages/reports/FinancialPerformance";
import Inventory from "./components/pages/Inventory";
import CashFlow from "./components/pages/reports/CashFlow";
import PaymentTerms from "./components/pages/administration/PaymentTerms";
import Approval1 from "./components/pages/Approval";
import AdminRoute from "./components/utils/AdminRoute";
import Admin from "./components/pages/Admin";
// import "./App.css";
import "./index.css";
import Access from "./components/pages/Access";
import TrialBalance from "./components/pages/reports/TrialBalance";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        {/* <GlobalVarProvider> */}
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              {/* <Route path="/login" element={<Login />} /> */}
              <Route index element={<Login />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/administration/users" element={<Users />} />
              <Route path="/administration/approval" element={<Approval />} />
              <Route
                path="/administration/automatic-entries"
                element={<AutomaticEntries />}
              />
              <Route
                path="/administration/posting-period"
                element={<PostingPeriod />}
              />
              <Route
                path="/administration/document-number"
                element={<DocumentNumber />}
              />
              <Route path="/administration/bank" element={<BankSetUp />} />
              <Route
                path="/administration/payment-terms"
                element={<PaymentTerms />}
              />

              <Route path="/reports/trial-balance" element={<TrialBalance />} />
              <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
              <Route path="/reports/profit-loss" element={<ProfitLoss />} />
              <Route path="/reports/cash-flow" element={<CashFlow />} />
              <Route
                path="/reports/general-ledger"
                element={<GeneralLedger />}
              />
              <Route
                path="/reports/financial-performance"
                element={<FinancialPerformance />}
              />
              <Route path="/reports/projection" element={<Projection />} />

              <Route
                path="/financials/chart-of-accounts"
                element={<ChartOfAccounts />}
              />
              <Route
                path="/financials/journal-entry"
                element={<JournalEntry />}
              />
              <Route
                path="/financials/journal-report"
                element={<JournalReport />}
              />

              <Route path="/sales/invoice" element={<ARInvoice />} />
              <Route path="/sales/credit-memo" element={<ARCreditMemo />} />
              <Route
                path="/sales/recurring-transactions"
                element={<RecurringTransaction />}
              />

              <Route path="/purchasing/invoice" element={<APInvoice />} />
              <Route
                path="/purchasing/credit-memo"
                element={<APCreditMemo />}
              />
              <Route
                path="/purchasing/recurring-transactions"
                element={<RecurringTransaction1 />}
              />

              <Route
                path="/banking/incoming-payment"
                element={<IncomingPayment />}
              />
              <Route
                path="/banking/outgoing-payment"
                element={<OutgoingPayment />}
              />
              <Route path="/banking/bank-recon" element={<BankRecon />} />

              <Route path="/business-partner" element={<BusinessPartner />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/approval" element={<Approval1 />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin/client" element={<Admin />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/access" element={<Access />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster richColors closeButton />
        </BrowserRouter>
        {/* </GlobalVarProvider> */}
      </ThemeProvider>
    </>
  );
}

export default App;
