import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { AppSidebar } from "../../reusables/sidebar/app-sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, HandCoins, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/reusables/sidebar/search-form";
import CustomDialog from "@/components/reusables/CustomDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/reusables/Header";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatDate1, formatMoney, hasAccess, round2 } from "@/lib/utils";
import Wtax from "./../sales/Wtax";
import { SelectWithSearch } from "@/components/ui/SelectWithSearch";
import {
  getStatus,
  initialRows,
  initialWtax,
  type customer,
  type idName,
  type wtaxRate,
} from "../sales/ARInvoice";
import {
  useAddAPCMMutation,
  useAddAPInvoiceMutation,
  useCancelAPInvoiceMutation,
  useGetAccountTypeHeadAPQuery,
  useGetAccountTypeHeadQuery,
  useGetAccountTypeQuery,
  useGetAPDashboardQuery,
  useGetAPInvoicesQuery,
  useGetAutoAccountQuery,
  useGetAutoDocNoQuery,
  useGetBPsQuery,
  useGetInventoryItemsQuery,
  useGetInvoicePreviewAPQuery,
  useGetVendorsQuery,
  useGetWtaxRateQuery,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import ViewEntry from "@/components/reusables/ViewEntry";
import PrintAPInvoice from "@/components/reusables/PrintAPInvoice";
import {
  useGetAPAgingClientInvQuery,
  useGetAPAgingClientQuery,
} from "@/store/api/ReportsApi";
import AnimatedNumber from "@/components/reusables/AnimatedNumber";
import { SelectWithSearch1 } from "@/components/ui/SelectWithSearch1";
import CalendarExpense from "./CalendarExpense";
import { Spinner } from "@/components/ui/spinner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";
import CreditMemoModalAP from "./CreditMemoModalAP";

export type wtax = {
  id: number;
  code: string;
  name: string;
  tax_amt: number;
  wtax_amt: number;
};

type choices = {
  id: number;
  code: string;
  type: number;
  level: number;
  name: string;
  child: any[];
};

type invoices = {
  id: number;
  date: string;
  invoice: string;
  vendor: string;
  status: number;
  balance: number;
  total: number;
  due_date?: string;
  po_num?: string;
};

type items = {
  id: number;
  code: string;
  name: string;
  vendor: number;
  p_cost: string;
  p_sales: string;
  stock: number;
  p_cogs: string;
  p_income: string;
  uom: string;
  status: number;
};

const initialData = {
  cid: 0,
  ccode: "",
  cname: "",
  cperson: "",
  c_terms: 0,
  c_wtax: 0,
  c_tax_stat: 1,
  po: "",
  invoice: "",
  post_date: new Date().toLocaleDateString("en-CA"),
  due_date: "",
  doc_date: new Date().toLocaleDateString("en-CA"),
  remarks: "",
  pricebefvat: 0,
  discount: 0,
  vat: 0,
  wtax: 0,
  total: 0,
  appliedAmount: 0,
  status: 0,
};

const hasIncompleteRows = (rows: any[]) => {
  return rows.some(
    (row) =>
      (row.account === "" || row.customer === "") &&
      Number(row.amount.replace(/,/g, "")) > 0,
  );
};

const hasInvalidDiscount = (rows: any[]) => {
  return rows.some((row) => {
    const amount = Number(row.amount.replace(/,/g, ""));
    const discount = Number(row.discount.replace(/,/g, ""));

    // ignore empty or zero rows
    if (!amount || !discount) return false;

    const maxDiscount = row.vatable === "1" ? amount / 1.12 : amount;

    return discount > maxDiscount;
  });
};

function APInvoice() {
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [type, setType] = useState(1);

  const [docType, setDocType] = useState(2);
  const [invAcc, setInvAcc] = useState(0);

  const [invoiceNo, setInvoiceNo] = useState(0);
  const [invoiceNoC, setInvoiceNoC] = useState(0);
  const [invoiceNoCM, setInvoiceNoCM] = useState(0);

  const [vendor, setVendor] = useState<customer[]>([]);
  const [customer, setCustomer] = useState<customer[]>([]);
  const [invoices, setInvoices] = useState<invoices[]>([]);

  const [openCancel, setOpenCancel] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(0);

  const [currId, setCurrId] = useState(0);
  const [openEntry, setOpenEntry] = useState(false);

  const [totalWTax, setTotalWTax] = useState(0);

  const [filtDate, setFiltDate] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [openAgingClient, setOpenAgingClient] = useState(false);
  const [openAgingInvoices, setOpenAgingInvoices] = useState(false);
  const [activeClient, setActiveClient] = useState(0);
  const [activeClientN, setActiveClientN] = useState("");

  const [openAddC, setOpenAddC] = useState(false);

  const [dashboard, setDashboard] = useState({
    expense: 0,
    coverdue: 0,
    overdue: 0,
    copen: 0,
    open: 0,
    paid: 0,
  });

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const [rows, setRows] = useState(initialRows);
  const [oldRows, setOldRows] = useState(initialRows);

  const [wtax, setWtax] = useState<wtax[]>(initialWtax);

  const [data1, setData1] = useState(initialData);
  const [rows1, setRows1] = useState(initialRows);
  const [wtax1, setWtax1] = useState<wtax[]>(initialWtax);

  const [items, setItems] = useState<items[]>([]);
  const [rowsI, setRowsI] = useState(initialRows);

  const [addLoading, setAddLoading] = useState(false);

  const [search1, setSearch1] = useState("");
  const [filter, setFilter] = useState({
    type: 0,
    date: 0,
    from: "",
    to: "",
    status: 0,
  });

  const [filter1, setFilter1] = useState({
    type: 0,
    date: 0,
    from: "",
    to: "",
    status: 0,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch1(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const [vend, setVend] = useState([]);
  const getVendors = useGetVendorsQuery({});

  useEffect(() => {
    if (getVendors.isSuccess && getVendors.data) {
      setVend(getVendors?.data?.data);
    }
  }, [getVendors.isSuccess, getVendors.data]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
    ]);
  };

  const addRowI = () => {
    setRowsI([
      ...rowsI,
      {
        id: rows.length + 1,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
    ]);
  };

  const reset = () => {
    setRows(initialRows);
  };

  const resetWtax = () => {
    setWtax(initialWtax);
  };

  const resetData = () => {
    setData(initialData);
  };

  //   const newTotalDebit = newTableRows.reduce(
  //       (sum, row) => sum + (parseFloat(row.debit) || 0),
  //       0
  //     );
  // const totalBefDiscountAmt = rows.reduce((sum, row) => {
  //   const amount = parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;

  //   const value = String(row.vatable) === "1" ? amount / 1.12 : amount;

  //   return sum + round2(value);
  // }, 0);
  const totalBefDiscountAmt =
    docType === 2
      ? rows.reduce((sum, row) => {
          const amount =
            parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;

          // const value =
          //   String(row.vatable) === "1" ? round2(amount / 1.12) : amount;

          const value =
            String(row.vatable) === "1"
              ? round2(Number(amount / 1.12))
              : amount;

          return sum + round2(value);
        }, 0)
      : rowsI.reduce((sum, row) => {
          const amount =
            parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;

          // const value = String(row.vatable) === "1" ? amount / 1.12 : amount;
          const value =
            String(row.vatable) === "1"
              ? round2(Number(amount / 1.12))
              : amount;

          return sum + round2(value);
        }, 0);

  const discountAmt =
    docType === 2
      ? rows.reduce((sum, row) => {
          const discount =
            parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

          return sum + round2(discount);
        }, 0)
      : rowsI.reduce((sum, row) => {
          const discount =
            parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

          return sum + round2(discount);
        }, 0);

  const vatAmt =
    docType === 2
      ? rows.reduce((sum, row) => {
          const amount =
            parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
          const discount =
            parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

          // const vat =
          //   String(row.vatable) === "1"
          //     ? round2(
          //         round2(parseFloat(Number(amount / 1.12).toFixed(3))) -
          //           discount,
          //       ) * 0.12
          //     : 0;
          // const vat =
          //   String(row.vatable) === "1"
          //     ? Math.round((amount / 1.12 - discount) * 0.12 * 100) / 100
          //     : 0;

          // const vat =
          //   String(row.vatable) === "1"
          //     ? (round2(Number(amount / 1.12)) - discount) * 0.12
          //     : 0;

          const vat =
            String(row.vatable) === "1"
              ? Number(amount) - (round2(Number(amount / 1.12)) - discount)
              : 0;

          return sum + round2(vat);
        }, 0)
      : rowsI.reduce((sum, row) => {
          const amount =
            parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
          const discount =
            parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

          // const vat =
          //   String(row.vatable) === "1"
          //     ? amount - round2(round2(amount / 1.12) - discount)
          //     : 0;

          // {Number(
          //   Number(
          //     Number(
          //       (
          //         Number(
          //           item.amount.replace(/,/g, ""),
          //         ) / 1.12
          //       ).toFixed(2),
          //     ) - 500,
          //   ) * 0.12,
          // ).toFixed(2)}

          // const vat =
          //   String(row.vatable) === "1" ? Number(Number(amount / 1.12).toFixed(2) - discount) * 0.12 : 0;

          // const vat =
          //   String(row.vatable) === "1"
          //     ? Math.round((amount / 1.12 - discount) * 0.12 * 100) / 100
          //     : 0;

          const vat =
            String(row.vatable) === "1"
              ? (round2(Number(amount / 1.12)) - discount) * 0.12
              : 0;

          // const vat =
          //   String(row.vatable) === "1" ? (amount / 1.12 - discount) * 0.12 : 0;

          return sum + round2(vat);
        }, 0);

  const taxableAmt =
    docType === 2
      ? rows.reduce((sum, row) => {
          const amount =
            parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
          const discount =
            parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

          const taxable =
            String(row.wtax) === "1"
              ? String(row.vatable) === "1"
                ? amount / 1.12 - discount
                : amount - discount
              : 0;

          return sum + round2(taxable);
        }, 0)
      : rowsI.reduce((sum, row) => {
          const amount =
            parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
          const discount =
            parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

          const taxable =
            String(row.wtax) === "1"
              ? String(row.vatable) === "1"
                ? amount / 1.12 - discount
                : amount - discount
              : 0;

          return sum + round2(taxable);
        }, 0);

  // const discountAmt = rows.reduce((sum, row) => {
  //   const discount =
  //     parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

  //   return sum + round2(discount);
  // }, 0);

  // const vatAmt = rows.reduce((sum, row) => {
  //   const amount = parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
  //   const discount =
  //     parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

  //   const vat =
  //     String(row.vatable) === "1" ? (amount / 1.12 - discount) * 0.12 : 0;

  //   return sum + round2(vat);
  // }, 0);

  // const taxableAmt = rows.reduce((sum, row) => {
  //   const amount = parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
  //   const discount =
  //     parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

  //   const taxable =
  //     String(row.wtax) === "1"
  //       ? String(row.vatable) === "1"
  //         ? amount / 1.12 - discount
  //         : amount - discount
  //       : 0;

  //   return sum + round2(taxable);
  // }, 0);

  useEffect(() => {
    if (data.c_wtax !== 0) {
      let newRate = wtaxOpt.find((item) => data.c_wtax === item.id);
      setWtax((prev) => {
        const newWtax = [...prev];
        newWtax[0] = {
          ...newWtax[0],
          tax_amt: taxableAmt,
          wtax_amt: taxableAmt * (newRate?.rate || 0),
        };
        return newWtax;
      });
    }
  }, [taxableAmt]);

  const wTaxAmt = wtax.reduce((sum, row) => sum + (row.wtax_amt || 0), 0);

  const [accounts, setAccounts] = useState<choices[]>([]);
  const [accountsAll, setAccountsAll] = useState<choices[]>([]);
  const [incomeAcc, setIncomeAcc] = useState(0);
  const [wtaxOpt, setWtaxOpt] = useState<wtaxRate[]>([]);
  const [counter, setCounter] = useState(0);
  const [counter1, setCounter1] = useState(0);

  const getWtax = useGetWtaxRateQuery({});
  useEffect(() => {
    if (getWtax.isSuccess && getWtax.data) {
      setWtaxOpt(getWtax.data.data);
    }
  }, [getWtax.isSuccess, getWtax.data]);

  const getItems = useGetInventoryItemsQuery({});
  useEffect(() => {
    if (getItems.isSuccess && getItems.data) {
      setItems(getItems.data.data);
    }
  }, [getItems.isSuccess, getItems.data]);

  const [data, setData] = useState(initialData);

  const getBPs = useGetBPsQuery({ type: 2 });
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setVendor(getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);

  const getCust = useGetBPsQuery({ type: 1 });
  useEffect(() => {
    if (getCust.isSuccess && getCust.data) {
      setCustomer(getCust.data.data);
    }
  }, [getCust.isSuccess, getCust.data]);

  const getDocNum = useGetAutoDocNoQuery({
    name: "A/P Invoice",
    count: counter,
  });
  const getCancelDocNum = useGetAutoDocNoQuery(
    { name: "A/P Invoice - Cancelation" },
    { skip: type !== 3 },
  );
  const getARCMDocNum = useGetAutoDocNoQuery(
    { name: "A/P Credit Memo" },
    { skip: type !== 4 },
  );

  const getAgingClient = useGetAPAgingClientQuery(
    { counter: counter1 },
    { refetchOnMountOrArgChange: true },
  );
  const getAgingInvoices = useGetAPAgingClientInvQuery(
    { cid: activeClient, counter: counter1 },
    { skip: activeClient === 0, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (getDocNum.isSuccess && getDocNum.data) {
      setInvoiceNo(getDocNum.data.no);
      console.log("count: ", counter);
    }
  }, [getDocNum.isSuccess, getDocNum.data]);
  useEffect(() => {
    if (getCancelDocNum.isSuccess && getCancelDocNum.data) {
      setInvoiceNoC(getCancelDocNum.data.no);
    }
  }, [getCancelDocNum.isSuccess, getCancelDocNum.data]);
  useEffect(() => {
    if (getARCMDocNum.isSuccess && getARCMDocNum.data) {
      setInvoiceNoCM(getARCMDocNum.data.no);
    }
  }, [getARCMDocNum.isSuccess, getARCMDocNum.data]);

  const getAccountsAll = useGetAccountTypeQuery({ type: 0 });
  useEffect(() => {
    if (getAccountsAll.isSuccess && getAccountsAll.data) {
      setAccountsAll(getAccountsAll.data.data);
    }
  }, [getAccountsAll.isSuccess, getAccountsAll.data]);

  const getAccounts = useGetAccountTypeHeadAPQuery({});
  // const getAccounts = useGetAccountTypeQuery({ type: 0 });
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      setAccounts(getAccounts.data.data);
      console.log(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  const getAutoAccount = useGetAutoAccountQuery({ type: "Inventory Account" });
  useEffect(() => {
    if (getAutoAccount.isSuccess && getAutoAccount.data) {
      setInvAcc(getAutoAccount.data.data.account);
    }
  }, [getAutoAccount.isSuccess, getAutoAccount.data]);

  // const [counter, setCounter] = useState(0);
  const getInvPrev = useGetInvoicePreviewAPQuery(
    { id: viewInvoice, count: counter },
    {
      skip: viewInvoice === 0,
    },
  );
  useEffect(() => {
    if (getInvPrev.isSuccess && getInvPrev.data) {
      clearAll(0);
      const rows = getInvPrev.data.data.rows;

      // Ensure at least 10 rows
      const minimumRows = 10;
      const filledRows = [...rows]; // Start with the rows from the API

      // If there are fewer than 10 rows, fill the remaining spots with empty rows
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1, // Ensure unique id
          description: "",
          price: "0",
          account: "",
          customer: "",
          vatable: "0",
          wtax: "0",
          discount: "",
          amount: "",
        });
      }

      const wtax = getInvPrev.data.data.wtax1;

      const minimumWTax = 5;
      const filledTax = [...wtax];

      while (filledTax.length < minimumWTax) {
        filledTax.push({
          id: filledTax.length + 1,
          code: "0",
          name: "",
          tax_amt: 0,
          wtax_amt: 0,
        });
      }

      setDocType(getInvPrev.data.data.type);
      // setData(getInvPrev.data.data);

      const data = getInvPrev?.data?.data;
      if (type === 3) {
        setData({
          ...data,
          post_date: new Date().toLocaleDateString("en-CA"),
        });
      } else {
        setData(data);
      }

      setTimeout(() => {
        setRows(filledRows);
        setRows1(filledRows);
        setRowsI(filledRows);
        setOldRows(filledRows);
      }, 100);
      // setRows(filledRows);
      setWtax(filledTax);
    }
  }, [getInvPrev.isSuccess, getInvPrev.data]);

  const getInvoices = useGetAPInvoicesQuery({
    page: page,
    type: filter1.type,
    date: filter1.date,
    from: filter1.from,
    to: filter1.to,
    status: filter1.status,
    search: search1,
    mod: 1,
  });
  useEffect(() => {
    if (getInvoices.isSuccess && getInvoices.data) {
      setInvoices(getInvoices.data.results);
      setTotalPages(Math.ceil(getInvoices?.data?.count / 10));
      setCount(getInvoices.data.count);
    }
  }, [getInvoices.isSuccess, getInvoices.data]);

  const getDashboard = useGetAPDashboardQuery({});
  useEffect(() => {
    if (getDashboard.isSuccess && getDashboard.data) {
      setDashboard({
        expense: getDashboard?.data?.expense,
        coverdue: getDashboard?.data?.coverdue,
        overdue: getDashboard?.data?.overdue,
        copen: getDashboard?.data?.copen,
        open: getDashboard?.data?.open,
        paid: getDashboard?.data?.paid,
      });
    }
  }, [getDashboard.isSuccess, getDashboard.data]);

  const [addInvoice] = useAddAPInvoiceMutation();
  const [cancelInvoice] = useCancelAPInvoiceMutation();
  const [addAPCM] = useAddAPCMMutation();
  const submitInvoice = async () => {
    console.log("Data: ", data);
    if (data.ccode !== "" && data.cname !== "") {
      console.log("Im here");
      try {
        console.log("Im here 1");
        const activeRows = type === 1 ? rows : rows1;
        // const activeRows = rows;

        if (type !== 3) {
          if (hasIncompleteRows(activeRows)) {
            toast.error(
              "Please select an account & customer for entered amounts.",
            );
            setAddLoading(false);
            console.log("Im here 2");
            return;
          }

          if (hasInvalidDiscount(activeRows)) {
            toast.error("Discount cannot be greater than the allowed amount.");
            setAddLoading(false);
            console.log("Im here 3");
            return;
          }
        }

        const formData = new FormData();
        formData.append("docType", String(docType));
        formData.append("datas", JSON.stringify(data));
        formData.append("tbda", String(totalBefDiscountAmt));
        formData.append("discount", String(discountAmt));
        formData.append("vatAmt", String(vatAmt));
        formData.append("wtaxAmt", String(wTaxAmt));
        // formData.append("total", String(totalBefDiscountAmt + vatAmt));
        formData.append(
          "total",
          String(totalBefDiscountAmt - discountAmt + vatAmt),
        );

        // formData.append("rows", JSON.stringify(rows));
        formData.append("wtax", JSON.stringify(wtax));
        formData.append("currId", String(currId));

        if (docType === 2) {
          formData.append("rows", JSON.stringify(rows));
        } else {
          formData.append("rows", JSON.stringify(rowsI));
        }

        let checkstat: any;
        if (type === 1) {
          if (data.ccode !== "" && data.cname !== "") {
            if (totalBefDiscountAmt + vatAmt > 0) {
              checkstat = await addInvoice(formData).unwrap();
            } else {
              toast.error("Document total should be greater than zero.");
              setAddLoading(false);
              return;
            }
          } else {
            toast.error("Please fill out required fields.");
            setAddLoading(false);
            return;
          }
        } else if (type === 3) {
          checkstat = await cancelInvoice(formData).unwrap();
        } else if (type === 4) {
          if (
            totalBefDiscountAmt + vatAmt !== 0 &&
            data.ccode !== "" &&
            data.cname !== ""
          ) {
            checkstat = await addAPCM(formData).unwrap();
          } else {
            toast.error("Document total cannot be equal to zero.");
            setAddLoading(false);
            return;
          }
        } else {
        }

        if (checkstat.success) {
          setOpenAdd(false);
          // setOpenCancel(false);
          clearAll(0);
          toast.success(checkstat.message);
          setAddLoading(false);
        } else {
          toast.error(checkstat.message);
          setAddLoading(false);
          return;
        }
      } catch (error: any) {
        const message =
          error?.data?.message || error?.data?.detail || "Something went wrong";

        setAddLoading(false);
        toast.error(message);
      }
    } else {
      toast.error("Please fill out required fields.");
      setAddLoading(false);
      return;
    }
  };

  const clearAll = (e: number) => {
    resetWtax();
    if (e === 0) {
      if (type === 4) {
        setData({ ...data, remarks: "" });
      } else {
        setData(initialData);
      }
    }
    setRows((prevRows) =>
      prevRows.map((row, i) => ({
        ...row,
        id: i + 1,
        description: "",
        account: "",
        customer: "",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      })),
    );

    setRowsI((prevRows) =>
      prevRows.map((row, i) => ({
        ...row,
        id: i + 1,
        description: "",
        account: "",
        customer: "",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      })),
    );
    setRows1([
      {
        id: 1,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 2,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 3,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 4,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 5,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 6,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 7,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 8,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 9,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
      {
        id: 10,
        description: "",
        account: "",
        customer: "",
        vatable: "1",
        wtax: "1",
        discount: "",
        amount: "",
        product: "",
        cogs: "",
        income: "",
        price: "",
        qty: "",
      },
    ]);
  };

  useEffect(() => {
    if (type !== 2) {
      clearAll(0);
    }
  }, [type]);

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="A/P Invoice" />
          {!hasAccess(access, "21", "view") ? (
            <Empty />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 px-10">
                <div className="grid bg-green-100 p-4 rounded-md gap-2">
                  <span className="text-xs md:text-sm  font-medium">
                    Total Expense
                  </span>
                  <span className="text-lg lg:text-xl xl:text-3xl font-medium flex gap-2">
                    PHP <AnimatedNumber value={dashboard.expense} />
                  </span>
                </div>

                <div
                  className="grid bg-gray-100 p-4 rounded-md gap-2 cursor-pointer"
                  onClick={() => {
                    setOpenAgingClient(true);
                    setCounter1((prev) => prev + 1);
                  }}
                >
                  <span className="text-xs md:text-sm  font-medium">
                    {dashboard.coverdue} OVERDUE
                  </span>
                  <span className="text-lg lg:text-xl xl:text-3xl font-medium flex gap-2">
                    PHP <AnimatedNumber value={dashboard.overdue} />
                  </span>
                </div>

                <div className="grid bg-orange-100 p-4 rounded-md gap-2">
                  <span className="text-xs md:text-sm  font-medium">
                    {dashboard.copen} OPEN BILL
                  </span>
                  <span className="text-lg lg:text-xl xl:text-3xl font-medium flex gap-2">
                    PHP <AnimatedNumber value={dashboard.open} />
                  </span>
                </div>

                <div className="grid bg-blue-100 p-4 rounded-md gap-2">
                  <span className="text-xs md:text-sm  font-medium">PAID</span>
                  <span className="text-lg lg:text-xl xl:text-3xl font-medium flex gap-2">
                    PHP <AnimatedNumber value={dashboard.paid} />
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
                <div
                  className="flex justify-between
            "
                >
                  <div className="flex gap-2">
                    <SearchForm
                      search={search}
                      setSearch={setSearch}
                      placeholder="Name / Invoice"
                      className="max-w-80"
                    />

                    <Sheet>
                      <SheetTrigger className=" bg-[#F3F4F6] text-gray-600 hover:bg-[#f3f7ff] hover:text-gray-700 flex gap-2  items-center rounded-md px-4 cursor-pointer border">
                        <ListFilter size={18} />
                        <span className="font-medium">Filter</span>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle className="py-4">
                            <div className="flex justify-between items-center">
                              <div>Filter options</div>
                              <div className="flex gap-6">
                                <Button
                                  size="icon"
                                  variant="link"
                                  className="text-blue-700 cursor-pointer"
                                  onClick={() => {
                                    setFilter({
                                      type: 0,
                                      date: 0,
                                      from: "",
                                      to: "",
                                      status: 0,
                                    });
                                  }}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </SheetTitle>
                          <SheetDescription>
                            <div className="grid flex-1 auto-rows-min gap-6 px-4">
                              <div className="grid w-full items-center gap-2">
                                <Label className=" gap-0">Vendor</Label>

                                <Select
                                  onValueChange={(e) =>
                                    setFilter({ ...filter, type: Number(e) })
                                  }
                                  value={String(filter.type)}
                                >
                                  <SelectTrigger className="w-full ">
                                    <SelectValue placeholder="All" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">All</SelectItem>
                                    {vend.map((item: any, i: number) => (
                                      <SelectItem
                                        value={String(item.id)}
                                        key={i}
                                      >
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid w-full items-center gap-2">
                                <Label className=" gap-0">Date</Label>

                                <Select
                                  onValueChange={(e) => {
                                    const today = new Date();
                                    const year = today.getFullYear();
                                    const month = today.getMonth();

                                    if (e === "1") {
                                      setFilter({
                                        ...filter,
                                        date: parseInt(e),
                                        from: formatDate1(
                                          new Date(year, month - 12, 1),
                                        ),
                                        to: formatDate1(
                                          new Date(year, month, 0),
                                        ),
                                      });
                                    } else if (e === "2") {
                                      setFilter({
                                        ...filter,
                                        date: parseInt(e),
                                        from: formatDate1(
                                          new Date(year, month - 6, 1),
                                        ),
                                        to: formatDate1(
                                          new Date(year, month, 0),
                                        ),
                                      });
                                    } else if (e === "3") {
                                      setFilter({
                                        ...filter,
                                        date: parseInt(e),
                                        from: formatDate1(
                                          new Date(year, month - 2, 1),
                                        ),
                                        to: formatDate1(
                                          new Date(year, month, 0),
                                        ),
                                      });
                                    } else if (e === "4") {
                                      setFilter({
                                        ...filter,
                                        date: parseInt(e),
                                        from: formatDate1(
                                          new Date(year, month - 1, 1),
                                        ),
                                        to: formatDate1(
                                          new Date(year, month, 0),
                                        ),
                                      });
                                    } else if (e === "5") {
                                      setFilter({
                                        ...filter,
                                        date: parseInt(e),
                                        from: formatDate1(
                                          new Date(year, month, 1),
                                        ),
                                        to: formatDate1(
                                          new Date(year, month + 1, 0),
                                        ),
                                      });
                                    } else if (e === "6") {
                                      setFilter({
                                        ...filter,
                                        date: parseInt(e),
                                        from: formatDate1(
                                          new Date(today.getFullYear(), 0, 1),
                                        ),
                                        to: formatDate1(
                                          new Date(today.getFullYear(), 11, 31),
                                        ),
                                      });
                                    } else {
                                      setFilter({
                                        ...filter,
                                        date: parseInt(e),
                                      });
                                    }
                                  }}
                                  value={String(filter.date)}
                                >
                                  <SelectTrigger className="w-full ">
                                    <SelectValue placeholder="All" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">All</SelectItem>
                                    <SelectItem value="1">
                                      Last 12 Months
                                    </SelectItem>
                                    <SelectItem value="2">
                                      Last 6 Months
                                    </SelectItem>
                                    <SelectItem value="3">
                                      Last 2 Months
                                    </SelectItem>
                                    <SelectItem value="4">
                                      Last Month
                                    </SelectItem>
                                    <SelectItem value="5">
                                      Current Month
                                    </SelectItem>
                                    <SelectItem value="6">
                                      Specific Date
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {filter.date === 6 && (
                                <>
                                  <div className="grid w-full items-center gap-2">
                                    <Label className=" gap-0">From</Label>
                                    <Input
                                      type="date"
                                      placeholder="From"
                                      className={`w-full`}
                                      onChange={(e) =>
                                        setFilter({
                                          ...filter,
                                          from: e.target.value,
                                        })
                                      }
                                      value={filter.from}
                                    />
                                  </div>

                                  <div className="grid w-full items-center gap-2">
                                    <Label className=" gap-0">To</Label>
                                    <Input
                                      type="date"
                                      placeholder="To"
                                      className={`w-full`}
                                      onChange={(e) =>
                                        setFilter({
                                          ...filter,
                                          to: e.target.value,
                                        })
                                      }
                                      value={filter.to}
                                    />
                                  </div>
                                </>
                              )}

                              <div className="grid w-full items-center gap-2">
                                <Label className=" gap-0">Status</Label>

                                <Select
                                  onValueChange={(e) =>
                                    setFilter({ ...filter, status: Number(e) })
                                  }
                                  value={String(filter.status)}
                                >
                                  <SelectTrigger className="w-full ">
                                    <SelectValue placeholder="All" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">All</SelectItem>
                                    <SelectItem value="1">Open</SelectItem>
                                    <SelectItem value="2">
                                      Partially Paid
                                    </SelectItem>
                                    <SelectItem value="3">Closed</SelectItem>
                                    <SelectItem value="4">Canceled</SelectItem>
                                    <SelectItem value="5">
                                      For Verification
                                    </SelectItem>
                                    <SelectItem value="6">
                                      For Approval
                                    </SelectItem>
                                    <SelectItem value="7">Declined</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </SheetDescription>
                        </SheetHeader>

                        <SheetFooter>
                          <SheetClose asChild>
                            <Button
                              className="shadow-md bg-gray-500 text-gray-100 hover:bg-gray-600 hover:text-gray-200 rounded-lg p-2 cursor-pointer"
                              onClick={() => {
                                setPage(1);
                                setCurrentPage(1);
                                setFilter1({
                                  type: filter.type,
                                  date: filter.date,
                                  from: filter.from,
                                  to: filter.to,
                                  status: filter.status,
                                });
                              }}
                            >
                              Filter
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>

                    <CalendarExpense />
                  </div>

                  <div>
                    {hasAccess(access, "21", "create") && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setViewInvoice(0);
                          setCounter((prev) => prev + 1);
                          setType(1);
                          // setData({ ...data, invoice: String(invoiceNo) });
                          // reset();
                          // resetWtax();
                          // resetData();
                          clearAll(0);
                          setOpenAdd(true);
                          getDocNum.refetch();
                        }}
                      >
                        Add Invoice
                      </Button>
                    )}
                  </div>
                </div>

                <Table className="shadow-sm border">
                  <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                    <TableRow className="">
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                        Invoice No.
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        Invoice Date
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                        Due Date
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                        Status
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        Reference No.
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        Vendor
                      </TableHead>
                      <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                        Balance
                      </TableHead>
                      <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                        Total Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="font-inter text-foreground">
                    {invoices.map((item, idx) => (
                      <ContextMenu key={idx}>
                        <ContextMenuTrigger asChild>
                          <TableRow
                            key={idx}
                            className={`cursor-pointer ${
                              currId === item.id ? `bg-gray-100` : ``
                            }`}
                            onClick={() => setCurrId(item.id)}
                            onContextMenu={() => setCurrId(item.id)}
                          >
                            <TableCell className="py-2 text-center">
                              <span
                                onClick={() => {
                                  setType(2);
                                  setOpenAdd(true);
                                  setCounter((prev) => prev + 1);
                                  setTimeout(() => {
                                    setViewInvoice(item.id);
                                    setOpenAdd(true);
                                  }, 0);
                                }}
                                className="text-blue-800 underline cursor-pointer font-medium"
                              >
                                {item.invoice}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {item.date}
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {item.due_date}
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              <span className={getStatus(item.status)?.style}>
                                {getStatus(item.status)?.name}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              {item.po_num}
                            </TableCell>

                            <TableCell className="py-2 text-center">
                              {item.vendor}
                            </TableCell>

                            <TableCell className="py-2 text-right gap-3">
                              {formatMoney(item.balance)}
                            </TableCell>
                            <TableCell className="py-2 text-right flex justify-end gap-3">
                              {formatMoney(item.total)}{" "}
                              <PrintAPInvoice
                                id={item.id}
                                status={item.status}
                              />
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>

                        {/* Context Menu Items */}
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => setOpenEntry(true)}
                            disabled={item.status === 5 || item.status === 6}
                          >
                            Journal Entry
                          </ContextMenuItem>
                          {hasAccess(access, "21", "edit") && (
                            <ContextMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setOpenCancel(true);
                                setViewInvoice(0);
                                setCounter((prev) => prev + 1);
                              }}
                              disabled={item.status !== 1}
                            >
                              Cancel
                            </ContextMenuItem>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center space-x-2 justify-end">
                  <div className="text-sm text-muted-foreground">
                    Showing {count === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
                    - {Math.min(currentPage * pageSize, count)} of {count}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || count === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </div>{" "}
            </>
          )}
        </SidebarInset>
      </SidebarProvider>

      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={
            type === 1
              ? `Add A/P Invoice`
              : type === 2
                ? `View A/P Invoice`
                : type === 3
                  ? `Cancel A/P Invoice`
                  : `A/P Credit Memo`
          }
          width={`!w-[60vw]`}
          height={``}
          closeIcon={`N`}
          button=""
          escape="N"
        >
          <ContextMenu key={1001}>
            <ContextMenuTrigger asChild>
              <div className="grid grid-cols-1 gap-1 pt-4">
                <div className="grid grid-cols-2">
                  <div className="grid grid-cols-3">
                    <div className=" border-b ">
                      <span className="text-sm">Vendor Code</span>
                    </div>
                    <div className="grid col-span-2">
                      {/* <Input noPadding className="w-2/3" type="text" /> */}
                      <SelectWithSearch
                        options={vendor.map((item) => ({
                          label: String(item.id),
                          value: item.code,
                        }))}
                        placeholder="Vendor Code"
                        onChange={(c) => {
                          let cust = vendor.find(
                            (item) => Number(c) === item.id,
                          );
                          let newDate = "";
                          const invoiceDate = new Date();
                          if (cust?.terms && cust.terms !== 0) {
                            const result = new Date(invoiceDate);
                            result.setDate(result.getDate() + cust.terms);

                            newDate = result.toLocaleDateString("en-CA");
                          } else {
                            newDate = invoiceDate.toLocaleDateString("en-CA");
                          }
                          if (cust) {
                            if (cust?.tax_stat === 1) {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "1",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "1",
                                })),
                              );
                            } else {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "2",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "2",
                                })),
                              );
                            }
                            if (cust?.wtax === 0) {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "2",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "2",
                                })),
                              );
                              setWtax((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  code: "0",
                                  name: "",
                                  tax_amt: 0,
                                  wtax_amt: 0,
                                })),
                              );
                            } else {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "1",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "1",
                                })),
                              );
                              let newRate = wtaxOpt.find(
                                (item) => cust?.wtax === item.id,
                              );
                              const newRows = [...wtax];
                              newRows[0].code = String(newRate?.id || 0);
                              newRows[0].name = newRate?.type || "";
                              newRows[0].tax_amt = taxableAmt;
                              newRows[0].wtax_amt =
                                taxableAmt * (newRate?.rate || 0);
                              setWtax(newRows);
                            }
                            setData({
                              ...data,
                              cid: cust?.id,
                              ccode: cust?.code,
                              cname: cust?.name,
                              cperson: cust?.c_person,
                              c_terms: cust?.terms,
                              c_wtax: cust?.wtax,
                              c_tax_stat: cust?.tax_stat,
                              due_date: newDate,
                            });
                          }
                        }}
                        noPadding
                        className="w-2/3"
                        value={data.ccode}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5">
                    <div></div>
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Invoice No.</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="text"
                        onChange={(e) => {
                          setInvoiceNo(Number(e.target.value));
                          setInvoiceNoCM(Number(e.target.value));
                          setData({ ...data, invoice: e.target.value });
                        }}
                        value={
                          type === 1
                            ? invoiceNo
                            : type === 3
                              ? invoiceNoC
                              : type === 4
                                ? invoiceNoCM
                                : data.invoice
                        }
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="grid grid-cols-3 ">
                    <div className=" border-b ">
                      <span className="text-sm">Vendor Name</span>
                    </div>
                    <div className="grid col-span-2">
                      {/* <Input noPadding className="w-2/3" type="text" /> */}
                      <SelectWithSearch
                        options={vendor.map((item) => ({
                          label: String(item.id),
                          value: item.name,
                        }))}
                        placeholder="Vendor Name"
                        onChange={(c) => {
                          let cust = vendor.find(
                            (item) => Number(c) === item.id,
                          );
                          let newDate = "";
                          const invoiceDate = data.post_date;
                          if (cust?.terms && cust.terms !== 0) {
                            const result = new Date(invoiceDate);
                            result.setDate(result.getDate() + cust.terms);

                            newDate = result.toLocaleDateString("en-CA");
                          } else {
                            newDate = invoiceDate;
                          }
                          if (cust) {
                            if (cust?.tax_stat === 1) {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "1",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "1",
                                })),
                              );
                            } else {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "2",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  vatable: "2",
                                })),
                              );
                            }
                            if (cust?.wtax === 0) {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "2",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "2",
                                })),
                              );
                              setWtax((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  code: "0",
                                  name: "",
                                  tax_amt: 0,
                                  wtax_amt: 0,
                                })),
                              );
                            } else {
                              setRows((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "1",
                                })),
                              );
                              setRowsI((prevRows) =>
                                prevRows.map((row) => ({
                                  ...row,
                                  wtax: "1",
                                })),
                              );
                              let newRate = wtaxOpt.find(
                                (item) => cust?.wtax === item.id,
                              );
                              const newRows = [...wtax];
                              newRows[0].code = String(newRate?.id || 0);
                              newRows[0].name = newRate?.type || "";
                              newRows[0].tax_amt = taxableAmt;
                              newRows[0].wtax_amt =
                                taxableAmt * (newRate?.rate || 0);
                              setWtax(newRows);
                            }
                            setData({
                              ...data,
                              cid: cust?.id,
                              ccode: cust?.code,
                              cname: cust?.name,
                              cperson: cust?.c_person,
                              c_terms: cust?.terms,
                              c_wtax: cust?.wtax,
                              c_tax_stat: cust?.tax_stat,
                              due_date: newDate,
                            });
                          }
                        }}
                        noPadding
                        className="w-2/3"
                        value={data.cname}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5">
                    <div></div>
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Posting Date</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="date"
                        onChange={(e) => {
                          const invoiceDate = new Date(e.target.value);
                          let newDate = "";
                          if (data.cid !== 0) {
                            const result = new Date(invoiceDate);
                            // const cust = customer.find(
                            //   (item: any) =>
                            //     String(item.id) === String(data.cid),
                            // )?.terms;
                            let cust = vendor.find(
                              (item) => String(data.cid) === String(item.id),
                            )?.terms;
                            result.setDate(result.getDate() + (cust || 0));

                            newDate = result.toLocaleDateString("en-CA");
                          } else {
                            newDate = invoiceDate.toLocaleDateString("en-CA");
                          }
                          setData({
                            ...data,
                            post_date: e.target.value,
                            due_date: newDate,
                          });
                        }}
                        value={data.post_date}
                        readOnly={type === 2}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="grid grid-cols-3">
                    <div className=" border-b ">
                      <span className="text-sm">Contact Person</span>
                    </div>
                    <div className="grid col-span-2">
                      <Input
                        noPadding
                        className="w-2/3"
                        type="text"
                        value={data.cperson}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5">
                    <div></div>
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Due Date</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="date"
                        onChange={(e) =>
                          setData({ ...data, due_date: e.target.value })
                        }
                        value={data.due_date}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="grid grid-cols-3">
                    <div className=" border-b ">
                      <span className="text-sm">Reference No.</span>
                    </div>
                    <div className="grid col-span-2">
                      <Input
                        noPadding
                        className="w-2/3"
                        type="text"
                        onChange={(e) =>
                          setData({ ...data, po: e.target.value })
                        }
                        value={data.po}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5">
                    <div></div>
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Document Date</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="date"
                        disabled
                        value={new Date().toLocaleDateString("en-CA")}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 pb-4">
                  <div className="grid grid-cols-3">
                    <div className=" border-b ">
                      <span className="text-sm">Document Type</span>
                    </div>
                    <div className="grid col-span-2">
                      <Select
                        value={String(docType)}
                        onValueChange={(e) => {
                          clearAll(1);
                          setDocType(Number(e));
                          // setRows(initialRows);
                          // setRowsI(initialRows);
                          // setRows1(initialRows);
                        }}
                        disabled={type !== 1}
                      >
                        <SelectTrigger className="w-2/3 !p-0 !m-0 !h-auto !min-h-0 !leading-none !py-0 !px-1 rounded-none border focus-visible:ring-[1px] ">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Item</SelectItem>
                          <SelectItem value="2">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-5">
                    {/* <div></div>
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Receipt Date</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="date"
                        disabled
                        value={
                          type === 1
                            ? new Date().toLocaleDateString("en-CA")
                            : data1.doc_date
                        }
                        readOnly={type !== 1}
                      />
                    </div> */}
                  </div>
                </div>

                {/* <div className="my-4 shadow pt-1"> */}
                <div className="max-h-56 overflow-y-auto py-0 shadow">
                  {docType === 2 ? (
                    <>
                      <table className="w-full">
                        <thead className="bg-blue-300 sticky top-0 z-10">
                          <tr>
                            <th className="p-1 border">Description</th>
                            <th className="p-1 border">Account</th>
                            <th className="p-1 border">Customer</th>
                            <th className="p-1 border">Vatable</th>
                            <th className="p-1 border">WTax</th>
                            <th className="p-1 border">Discount</th>
                            <th className="p-1 border">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="">
                          {rows.map((item, index) => (
                            <tr key={index}>
                              <td className="p-1 border">
                                <input
                                  className="w-full outline-none"
                                  value={item.description}
                                  onChange={(e) => {
                                    const newRows = [...rows];
                                    newRows[index].description = e.target.value;
                                    setRows(newRows);
                                  }}
                                  readOnly={type === 2 || type === 3}
                                />
                              </td>
                              <td className="p-0 border">
                                {/* <input
                              className="w-full outline-none"
                              value={item.account}
                              onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].account = e.target.value;
                                setRows(newRows);
                              }}
                            /> */}
                                <SelectWithSearch1
                                  options={accounts}
                                  placeholder=""
                                  onChange={(e) => {
                                    const newRows = [...rows];
                                    newRows[index].account = e;
                                    setRows(newRows);
                                  }}
                                  className="w-36 border-none"
                                  noPadding1
                                  value={
                                    accountsAll.find(
                                      (item2) =>
                                        String(item.account) ===
                                        String(item2.id),
                                    )?.name
                                  }
                                  readOnly={type === 2 || type === 3}
                                  id={String(item.account)}
                                />
                              </td>
                              <td className="p-0 border">
                                {/* <input
                              className="w-full outline-none"
                              value={item.customer}
                              onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].customer = e.target.value;
                                setRows(newRows);
                              }}
                            /> */}
                                <SelectWithSearch
                                  options={customer.map((item1) => ({
                                    label: String(item1.id),
                                    value: item1.name,
                                  }))}
                                  placeholder=""
                                  onChange={(e) => {
                                    const newRows = [...rows];
                                    newRows[index].customer = e;
                                    setRows(newRows);
                                  }}
                                  className="w-36 border-none"
                                  noPadding1
                                  value={
                                    customer.find(
                                      (item2) =>
                                        item.customer === String(item2.id),
                                    )?.name
                                  }
                                  readOnly={type === 2 || type === 3}
                                />
                              </td>
                              <td className="p-1 border">
                                <select
                                  className="outline-none text-sm appearance-none w-full text-center"
                                  onChange={(e) => {
                                    const newRows = [...rows];
                                    newRows[index].vatable = e.target.value;
                                    setRows(newRows);
                                  }}
                                  value={item.vatable}
                                  disabled={type === 2 || type === 3}
                                >
                                  {type === 2 && <option value={0}></option>}
                                  <option value={1}>Yes</option>
                                  <option value={2}>No</option>
                                </select>
                              </td>
                              <td className="p-1 border">
                                <select
                                  className="outline-none text-sm appearance-none w-full text-center"
                                  onChange={(e) => {
                                    const newRows = [...rows];
                                    newRows[index].wtax = e.target.value;
                                    setRows(newRows);
                                  }}
                                  value={item.wtax}
                                  disabled={type === 2 || type === 3}
                                >
                                  {type === 2 && <option value={0}></option>}
                                  <option value={1}>Yes</option>
                                  <option value={2}>No</option>
                                </select>
                              </td>
                              <td className="p-1 border">
                                <input
                                  className="w-full outline-none text-right"
                                  // value={round2(
                                  //   Number(item.amount.replace(/,/g, "")) /
                                  //     1.12,
                                  // )}
                                  value={
                                    type === 1 || type === 4
                                      ? item.discount
                                      : Number(item.discount) === 0
                                        ? ``
                                        : formatMoney(Number(item.discount))
                                  }
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "",
                                    ); // remove commas for validation

                                    // allow only 2 decimals
                                    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

                                    let amt =
                                      item.vatable === "1"
                                        ? Number(
                                            item.amount.replace(/,/g, ""),
                                          ) / 1.12
                                        : Number(item.amount.replace(/,/g, ""));

                                    const num = parseFloat(value);

                                    // block values greater than max
                                    if (!isNaN(num) && num > amt) return;

                                    // Allow only numbers and up to 2 decimals
                                    // if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                                    const newRows = [...rows];
                                    newRows[index].discount = value;
                                    setRows(newRows);
                                    // }
                                  }}
                                  onBlur={() => {
                                    const newRows = [...rows];
                                    const num = parseFloat(item.discount);

                                    if (!isNaN(num)) {
                                      // Format with commas and 2 decimals
                                      newRows[index].discount =
                                        num.toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        });
                                    } else {
                                      newRows[index].discount = "";
                                    }

                                    setRows(newRows);
                                  }}
                                  onFocus={(e) => {
                                    // remove formatting while editing
                                    const newRows = [...rows];
                                    newRows[index].discount =
                                      item.discount.replace(/,/g, "");
                                    setRows(newRows);
                                  }}
                                  readOnly={type === 2 || type === 3}
                                  disabled={item.amount === ""}
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  className="w-full outline-none text-right"
                                  value={
                                    type === 1 || type === 4
                                      ? item.amount
                                      : Number(item.amount) === 0
                                        ? ``
                                        : formatMoney(Number(item.amount))
                                  }
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /,/g,
                                      "",
                                    ); // remove commas for validation

                                    // Allow only numbers and up to 2 decimals
                                    if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                                      const newRows = [...rows];
                                      newRows[index].amount = value;
                                      setRows(newRows);
                                    }
                                  }}
                                  onBlur={() => {
                                    const newRows = [...rows];
                                    const num = parseFloat(item.amount);

                                    if (!isNaN(num)) {
                                      // Format with commas and 2 decimals
                                      newRows[index].amount =
                                        num.toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        });
                                    } else {
                                      newRows[index].amount = "";
                                    }

                                    setRows(newRows);
                                  }}
                                  onFocus={(e) => {
                                    // remove formatting while editing
                                    const newRows = [...rows];
                                    newRows[index].amount =
                                      e.target.value.replace(/,/g, "");
                                    setRows(newRows);
                                  }}
                                  readOnly={type === 2 || type === 3}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {type === 1 && (
                        <div className="py-2 flex justify-end w-full">
                          <Button
                            size={"sm"}
                            variant={"primary"}
                            onClick={addRow}
                          >
                            Add Row
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <table className="w-full">
                        <thead className="bg-blue-300 sticky top-0 z-10">
                          <tr>
                            <th className="p-1 border">Product</th>
                            <th className="p-1 border">Account</th>
                            <th className="p-1 border">Customer</th>
                            <th className="p-1 border">Vatable</th>
                            <th className="p-1 border">WTax</th>
                            <th className="p-1 border">Price</th>
                            <th className="p-1 border">Disc.</th>
                            <th className="p-1 border">Qty.</th>
                            <th className="p-1 border">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="">
                          {type === 1 || type === 4
                            ? rowsI.map((item, index) => (
                                <tr key={index}>
                                  <td className="p-1 border">
                                    <SelectWithSearch
                                      options={items.map((item1) => ({
                                        label: String(item1.id),
                                        value: item1.name,
                                      }))}
                                      placeholder=""
                                      onChange={(e) => {
                                        const selectItem = items.find(
                                          (item3) =>
                                            String(item3.id) === String(e),
                                        );
                                        const newRows = [...rowsI];
                                        newRows[index].product = e;
                                        if (selectItem) {
                                          // newRows[index].price =
                                          //   selectItem.p_sales;
                                          newRows[index].income =
                                            String(invAcc);
                                          newRows[index].qty = "";
                                          newRows[index].amount = "";
                                        }

                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                      }}
                                      className="w-36 border-none"
                                      noPadding1
                                      value={
                                        items.find(
                                          (item2) =>
                                            String(item.product) ===
                                            String(item2.id),
                                        )?.name
                                      }
                                    />
                                  </td>
                                  <td className="p-0 border">
                                    <SelectWithSearch1
                                      options={accounts}
                                      placeholder=""
                                      onChange={(e) => {
                                        const newRows = [...rowsI];
                                        newRows[index].income = e;
                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                      }}
                                      className="w-36 border-none"
                                      noPadding1
                                      value={
                                        accountsAll.find(
                                          (item2) =>
                                            item.income === String(item2.id),
                                        )?.name
                                      }
                                      id={String(item.income)}
                                    />
                                  </td>
                                  <td className="p-0 border">
                                    <SelectWithSearch
                                      options={customer.map((item1) => ({
                                        label: String(item1.id),
                                        value: item1.name,
                                      }))}
                                      placeholder=""
                                      onChange={(e) => {
                                        const newRows = [...rowsI];
                                        newRows[index].customer = e;
                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                      }}
                                      className="w-36 border-none"
                                      noPadding1
                                      value={
                                        customer.find(
                                          (item2) =>
                                            item.customer === String(item2.id),
                                        )?.name
                                      }
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <select
                                      className="outline-none text-sm appearance-none w-full text-center"
                                      onChange={(e) => {
                                        const newRows = [...rowsI];
                                        newRows[index].vatable = e.target.value;
                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                      }}
                                      value={item.vatable}
                                    >
                                      <option value={1}>Yes</option>
                                      <option value={2}>No</option>
                                    </select>
                                  </td>
                                  <td className="p-1 border">
                                    <select
                                      className="outline-none text-sm appearance-none w-full text-center"
                                      onChange={(e) => {
                                        const newRows = [...rowsI];
                                        newRows[index].wtax = e.target.value;
                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                      }}
                                      value={item.wtax}
                                    >
                                      <option value={1}>Yes</option>
                                      <option value={2}>No</option>
                                    </select>
                                  </td>
                                  <td className="p-1 border w-20">
                                    <input
                                      className="max-w-[100px] outline-none text-right"
                                      value={
                                        type === 1 || type === 4
                                          ? item.price
                                          : Number(item.price) === 0
                                            ? ``
                                            : formatMoney(Number(item.price))
                                      }
                                      onChange={(e) => {
                                        let value = e.target.value.replace(
                                          /,/g,
                                          "",
                                        ); // remove commas for validation

                                        // Allow only numbers and up to 2 decimals
                                        if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                                          const newRows = [...rowsI];
                                          newRows[index].price = value;
                                          newRows[index].discount = "";
                                          newRows[index].qty = "";
                                          newRows[index].amount = "";
                                          setRowsI(newRows);
                                          // setRows1(newRows);
                                        }
                                      }}
                                      onBlur={() => {
                                        const newRows = [...rowsI];
                                        const num = parseFloat(item.price);

                                        if (!isNaN(num)) {
                                          // Format with commas and 2 decimals
                                          newRows[index].price =
                                            num.toLocaleString("en-US", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            });
                                        } else {
                                          newRows[index].price = "";
                                        }

                                        setRowsI(newRows);
                                      }}
                                      onFocus={(e) => {
                                        // remove formatting while editing
                                        const newRows = [...rowsI];
                                        newRows[index].price =
                                          item.price.replace(/,/g, "");
                                        setRowsI(newRows);
                                      }}
                                      // readOnly
                                    />
                                  </td>

                                  <td className="p-1 border">
                                    <input
                                      className="outline-none text-right max-w-[100px]"
                                      value={
                                        type === 1 || type === 4
                                          ? item.discount
                                          : Number(item.discount) === 0
                                            ? ``
                                            : formatMoney(Number(item.discount))
                                      }
                                      onChange={(e) => {
                                        let value = e.target.value.replace(
                                          /,/g,
                                          "",
                                        ); // remove commas for validation
                                        if (!/^\d*\.?\d{0,2}$/.test(value))
                                          return;

                                        let amt =
                                          item.vatable === "1"
                                            ? Number(
                                                item.amount.replace(/,/g, ""),
                                              ) / 1.12
                                            : Number(
                                                item.amount.replace(/,/g, ""),
                                              );

                                        const num = parseFloat(value);

                                        // block values greater than max
                                        if (!isNaN(num) && num > amt) return;

                                        // Allow only numbers and up to 2 decimals
                                        // if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                                        const newRows = [...rowsI];
                                        newRows[index].discount = value;
                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                        // }
                                      }}
                                      onBlur={() => {
                                        const newRows = [...rowsI];
                                        const num = parseFloat(item.discount);

                                        if (!isNaN(num)) {
                                          // Format with commas and 2 decimals
                                          newRows[index].discount =
                                            num.toLocaleString("en-US", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            });
                                        } else {
                                          newRows[index].discount = "";
                                        }

                                        setRowsI(newRows);
                                      }}
                                      onFocus={(e) => {
                                        // remove formatting while editing
                                        const newRows = [...rowsI];
                                        newRows[index].discount =
                                          item.discount.replace(/,/g, "");
                                        setRowsI(newRows);
                                      }}
                                      disabled={rowsI[index].amount === ""}
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      className="max-w-[50px] outline-none text-right"
                                      value={
                                        type === 1 || type === 4
                                          ? item.qty
                                          : Number(item.qty) === 0
                                            ? ``
                                            : formatMoney(Number(item.qty))
                                      }
                                      onChange={(e) => {
                                        let value = e.target.value.replace(
                                          /,/g,
                                          "",
                                        );
                                        if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                                          const newRows = [...rowsI];
                                          newRows[index] = {
                                            ...newRows[index],
                                            qty: value,
                                          };
                                          newRows[index].amount = String(
                                            parseFloat(value) *
                                              parseFloat(
                                                newRows[index].price.replace(
                                                  /,/g,
                                                  "",
                                                ),
                                              ),
                                          );

                                          setRowsI(newRows);
                                        }
                                      }}
                                      // onBlur={() => {
                                      //   const newRows = [...rows];
                                      //   const num = parseFloat(item.qty);

                                      //   if (!isNaN(num)) {
                                      //     // Format with commas and 2 decimals
                                      //     newRows[index].qty =
                                      //       num.toLocaleString("en-US", {
                                      //         minimumFractionDigits: 2,
                                      //         maximumFractionDigits: 2,
                                      //       });
                                      //   } else {
                                      //     newRows[index].qty = "";
                                      //   }

                                      //   setRows(newRows);
                                      //   setRows1(newRows);
                                      // }}
                                      // onFocus={(e) => {
                                      //   // remove formatting while editing
                                      //   const newRows = [...rows];
                                      //   newRows[index].qty = item.qty.replace(
                                      //     /,/g,
                                      //     "",
                                      //   );
                                      //   setRows(newRows);
                                      //   setRows1(newRows);
                                      // }}
                                      disabled={rowsI[index].price === ""}
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      className="outline-none text-right max-w-[100px]"
                                      value={
                                        (type === 1 || type === 4) &&
                                        Number(item.amount) !== 0
                                          ? formatMoney(Number(item.amount))
                                          : Number(item.amount) === 0
                                            ? ``
                                            : formatMoney(Number(item.amount))
                                      }
                                      readOnly
                                    />
                                  </td>
                                </tr>
                              ))
                            : rows1.map((item, index) => (
                                <tr key={index}>
                                  <td className="p-1 border">
                                    <SelectWithSearch
                                      options={items.map((item1) => ({
                                        label: String(item1.id),
                                        value: item1.name,
                                      }))}
                                      placeholder=""
                                      className="w-36 border-none"
                                      noPadding1
                                      value={
                                        items.find(
                                          (item2) =>
                                            String(item.product) ===
                                            String(item2.id),
                                        )?.name
                                      }
                                      readOnly
                                    />
                                  </td>
                                  <td className="p-0 border">
                                    {/* <SelectWithSearch
                                      options={accounts.map((item1) => ({
                                        label: String(item1.id),
                                        value: item1.name,
                                      }))}
                                      placeholder=""
                                      onChange={(e) => {
                                        const newRows = [...rowsI];
                                        newRows[index].income = e;
                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                      }}
                                      className="w-36 border-none"
                                      noPadding1
                                      value={
                                        accounts.find(
                                          (item2) =>
                                            item.income === String(item2.id),
                                        )?.name
                                      }
                                      readOnly
                                    /> */}
                                    <SelectWithSearch1
                                      options={accounts}
                                      placeholder=""
                                      onChange={(e) => {
                                        const newRows = [...rows];
                                        newRows[index].account = e;
                                        setRows(newRows);
                                      }}
                                      className="w-36 border-none"
                                      noPadding1
                                      value={
                                        accountsAll.find(
                                          (item2) =>
                                            String(item.account) ===
                                            String(item2.id),
                                        )?.name
                                      }
                                      readOnly
                                      id={String(item.account)}
                                    />
                                  </td>
                                  <td className="p-0 border">
                                    <SelectWithSearch
                                      options={customer.map((item1) => ({
                                        label: String(item1.id),
                                        value: item1.name,
                                      }))}
                                      placeholder=""
                                      onChange={(e) => {
                                        const newRows = [...rowsI];
                                        newRows[index].customer = e;
                                        setRowsI(newRows);
                                        // setRows1(newRows);
                                      }}
                                      className="w-36 border-none"
                                      noPadding1
                                      value={
                                        customer.find(
                                          (item2) =>
                                            item.customer === String(item2.id),
                                        )?.name
                                      }
                                      readOnly
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <select
                                      className="outline-none text-sm appearance-none w-full text-center"
                                      value={item.vatable}
                                      disabled
                                    >
                                      <option value={0}></option>
                                      <option value={1}>Yes</option>
                                      <option value={2}>No</option>
                                    </select>
                                  </td>
                                  <td className="p-1 border">
                                    <select
                                      className="outline-none text-sm appearance-none w-full text-center"
                                      value={item.wtax}
                                      disabled
                                    >
                                      <option value={0}></option>
                                      <option value={1}>Yes</option>
                                      <option value={2}>No</option>
                                    </select>
                                  </td>
                                  <td className="p-1 border w-20">
                                    <input
                                      className="max-w-[100px] outline-none text-right"
                                      value={
                                        item.amount === ""
                                          ? ""
                                          : formatMoney(item.price)
                                      }
                                      readOnly
                                    />
                                  </td>

                                  <td className="p-1 border">
                                    <input
                                      className="max-w-[100px] outline-none text-right"
                                      value={
                                        type === 1 || type === 4
                                          ? item.discount
                                          : Number(item.discount) === 0
                                            ? ``
                                            : formatMoney(Number(item.discount))
                                      }
                                      readOnly
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      className="max-w-[50px] outline-none text-right"
                                      value={item.qty}
                                      readOnly
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      className="max-w-[100px] outline-none text-right"
                                      value={
                                        (type === 1 || type === 4) &&
                                        Number(item.amount) !== 0
                                          ? formatMoney(Number(item.amount))
                                          : Number(item.amount) === 0
                                            ? ``
                                            : formatMoney(Number(item.amount))
                                      }
                                      readOnly
                                    />
                                  </td>
                                </tr>
                              ))}

                          {type === 1 && (
                            <tr>
                              <td colSpan={9} className="">
                                <div className="flex justify-end py-2">
                                  <Button
                                    size={"sm"}
                                    variant={"primary"}
                                    onClick={addRowI}
                                  >
                                    Add Row
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {/* {type === 1 && (
                        <div className="py-2 flex justify-end w-full">
                          <Button
                            size={"sm"}
                            variant={"primary"}
                            onClick={addRow}
                          >
                            Add Row asd
                          </Button>
                        </div>
                      )} */}
                    </>
                  )}
                </div>

                {/* </div> */}

                <div className="grid grid-cols-2 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm ">Remarks</span>
                    <Textarea
                      className="w-full h-24 resize-none rounded-none"
                      onChange={(e) =>
                        setData({ ...data, remarks: e.target.value })
                      }
                      value={
                        type === 3
                          ? `${
                              data.remarks === "" ? "" : data.remarks + " "
                            }Cancellation of Invoice No. ${data.invoice}.`
                          : data.remarks
                      }
                      readOnly={type === 2 || type === 3}
                    />
                  </div>
                  <div className="grid gap-1">
                    <div className="grid grid-cols-5">
                      <div></div>
                      <div className=" border-b col-span-2">
                        <span className="text-sm">Total Before Discount</span>
                      </div>
                      <div className="flex col-span-2 justify-items-end gap-2">
                        <Input
                          noPadding
                          className="w-full text-right"
                          type="text"
                          readOnly
                          value={
                            type === 1 || type === 4
                              ? formatMoney(totalBefDiscountAmt)
                              : formatMoney(Number(data.pricebefvat))
                          }
                        />{" "}
                        {type === 2 && <HandCoins className="invisible" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-5">
                      <div></div>
                      <div className=" border-b col-span-2">
                        <span className="text-sm">Discount</span>
                      </div>
                      <div className="flex col-span-2 justify-items-end gap-2">
                        <Input
                          noPadding
                          className="w-full text-right"
                          type="text"
                          readOnly
                          value={
                            type === 1 || type === 4
                              ? formatMoney(discountAmt)
                              : formatMoney(Number(data.discount))
                          }
                        />{" "}
                        {type === 2 && <HandCoins className="invisible" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-5">
                      <div></div>
                      <div className=" border-b col-span-2">
                        <span className="text-sm">VAT</span>
                      </div>
                      <div className="flex col-span-2 justify-items-end gap-2">
                        <Input
                          noPadding
                          className="w-full text-right"
                          type="text"
                          readOnly
                          value={
                            type === 1 || type === 4
                              ? formatMoney(vatAmt)
                              : formatMoney(Number(data.vat))
                          }
                        />{" "}
                        {type === 2 && <HandCoins className="invisible" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-5">
                      <div></div>
                      <div className=" border-b col-span-2">
                        <span className="text-sm flex items-center justify-between">
                          WTax{" "}
                          <Wtax
                            wtax={wtax}
                            setWtax={setWtax}
                            taxableAmt={taxableAmt}
                            wtaxOpt={wtaxOpt}
                            type={type}
                            // setTotalWTax={setTotalWTax}
                          />
                        </span>
                      </div>
                      <div className="flex col-span-2 justify-items-end gap-2">
                        <Input
                          noPadding
                          className="w-full text-right"
                          type="text"
                          readOnly
                          value={
                            type === 1 || type === 4
                              ? formatMoney(wTaxAmt)
                              : formatMoney(Number(data.wtax))
                          }
                        />{" "}
                        {type === 2 && <HandCoins className="invisible" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-5">
                      <div></div>
                      <div className=" border-b col-span-2">
                        <span className="text-sm">Total Amount</span>
                      </div>
                      <div className="flex col-span-2 justify-items-end gap-2">
                        <Input
                          noPadding
                          className="w-full text-right"
                          type="text"
                          readOnly
                          value={
                            type === 1 || type === 4
                              ? formatMoney(
                                  totalBefDiscountAmt + vatAmt - discountAmt,
                                )
                              : formatMoney(Number(data.total))
                          }
                        />{" "}
                        {type === 2 && <HandCoins fill="yellow" />}
                      </div>
                    </div>

                    {type === 2 && (
                      <>
                        <div className="grid grid-cols-5">
                          <div></div>
                          <div className=" border-b col-span-2">
                            <span className="text-sm">Applied Amount</span>
                          </div>
                          <div className="flex col-span-2 justify-items-end gap-2">
                            <Input
                              noPadding
                              className="w-full text-right"
                              type="text"
                              readOnly
                              value={formatMoney(data.appliedAmount ?? 0)}
                            />{" "}
                            {type === 2 && <HandCoins className="invisible" />}
                          </div>
                        </div>

                        <div className="grid grid-cols-5">
                          <div></div>
                          <div className=" border-b col-span-2">
                            <span className="text-sm">Balance Due</span>
                          </div>
                          <div className="flex col-span-2 justify-items-end gap-2">
                            <Input
                              noPadding
                              className="w-full text-right"
                              type="text"
                              readOnly
                              value={formatMoney(
                                data.total - (data.appliedAmount ?? 0),
                              )}
                            />{" "}
                            {type === 2 && <HandCoins className="invisible" />}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
            {/* Context Menu Items */}
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => setOpenEntry(true)}
                disabled={
                  type === 1 ||
                  getInvPrev?.data?.data?.status === 5 ||
                  getInvPrev?.data?.data?.status === 6
                }
              >
                Journal Entry
              </ContextMenuItem>

              <ContextMenuItem
                className="text-red-600"
                onClick={() => {
                  setOpenCancel(true);
                  setViewInvoice(0);
                  setCounter((prev) => prev + 1);
                }}
                disabled={data.status !== 1}
              >
                Cancel
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <hr className="mb-5" />

          <div className="flex justify-between">
            <div>
              {hasAccess(access, "22", "create") && (
                <div>
                  {data.status > 0 &&
                    data.status <= 2 &&
                    type === 2 &&
                    docType !== 1 && (
                      <Button
                        size="sm"
                        variant="second"
                        onClick={() => {
                          setOpenAddC(true);
                          // setOpenAdd(true);
                          // setType(4);
                          // setViewInvoice(currId);
                          // setData({ ...data, remarks: "" });
                          // // setRows(initialRows);
                          // setRows((prev) =>
                          //   prev.map((item) => ({
                          //     ...item,
                          //     description: "",
                          //     discount: "",
                          //     amount: "",
                          //   })),
                          // );
                          // setWtax((prev) =>
                          //   prev.map((item) => ({
                          //     ...item,
                          //     tax_amt: 0,
                          //     wtax_amt: 0,
                          //   })),
                          // );
                        }}
                      >
                        Add Credit Memo
                      </Button>
                    )}
                </div>
              )}
            </div>

            {openAddC && (
              <CreditMemoModalAP
                openAdd={openAddC}
                setOpenAdd={setOpenAddC}
                data={data}
                setData={setData}
                data1={oldRows}
                docType={docType}
                currId={currId}
              />
            )}

            <div className="flex gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => {
                  setOpenAdd(false);
                  setRows(initialRows);
                  // setData(initialData);
                  // reset();
                  // resetWtax();
                  // resetData();
                  setOpenCancel(false);
                  setViewInvoice(0);
                }}
              >
                Close
              </Button>

              {/* <Button 
                size="sm"
                variant="primary"
                onClick={() => setOpenAdd(true)}
              >
                {`${type === 1 ? `Add` : `Update`}`}
              </Button> */}
              {(type === 1 || type === 4 || type === 3) && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setAddLoading(true);
                    submitInvoice();
                  }}
                  disabled={addLoading}
                >
                  {addLoading ? (
                    <>
                      <Spinner />
                      &nbsp;
                    </>
                  ) : (
                    `Add`
                  )}
                </Button>
              )}
            </div>
          </div>
        </CustomDialog>
      )}

      {openEntry && (
        <CustomDialog
          close={setOpenEntry}
          title={``}
          width={`!w-[60vw]`}
          height={``}
          closeIcon={`N`}
          button=""
        >
          <ViewEntry id={currId} origin={4} />

          <hr className="pb-5" />
          <div className="flex justify-end gap-4">
            <Button
              size="sm"
              variant="second"
              onClick={() => setOpenEntry(false)}
            >
              Close
            </Button>
          </div>
        </CustomDialog>
      )}

      {openCancel && (
        <CustomDialog
          close={setOpenCancel}
          title=""
          width="!w-[30vw]"
          height=""
          closeIcon="N"
          button=""
        >
          <div className="flex flex-col gap-4">
            <div className="text-lg text-center">
              Are you sure you want to cancel this invoice{" "}
              {invoices.find((item) => currId === item.id)?.invoice}?
            </div>
            <div className="w-full flex">
              <div className="w-1/2 text-center">
                <Button
                  className="w-5/6"
                  variant="destructive"
                  onClick={(e) => {
                    setOpenAdd(true);
                    setType(3);
                    setViewInvoice(currId);
                    setOpenCancel(false);
                  }}
                >
                  Yes
                </Button>
              </div>

              <div className="w-1/2 text-center">
                <Button
                  className="w-5/6"
                  variant="primary"
                  onClick={() => {
                    setOpenCancel(false);
                    setData(initialData);
                  }}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </CustomDialog>
      )}

      {openAgingClient && (
        <CustomDialog
          close={setOpenAgingClient}
          title=""
          width="!w-[70vw]"
          height="!h-[80vh]"
          closeIcon="Y"
          button=""
          escape="N"
        >
          <div className="flex flex-col gap-4 ">
            <div>
              <span className="font-medium text-xl">AP Aging</span>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-200">
                    <TableHead className="w-[100px]">Client</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">1-30 (days)</TableHead>
                    <TableHead className="text-right">31-60 (days)</TableHead>
                    <TableHead className="text-right">61-90 (days)</TableHead>
                    <TableHead className="text-right">91-120 (days)</TableHead>
                    <TableHead className="text-right">121-150 (days)</TableHead>
                    <TableHead className="text-right">150+ (days)</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getAgingClient?.data?.data.map((a: any, b: number) => (
                    <TableRow key={b}>
                      <TableCell
                        className="font-medium cursor-pointer underline"
                        onClick={() => {
                          setActiveClient(a?.cid);
                          setActiveClientN(a?.cname);
                          setOpenAgingInvoices(true);
                        }}
                      >
                        {a?.cname}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.a0 === 0 ? `-` : formatMoney(a?.a0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.a1 === 0 ? `-` : formatMoney(a?.a1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.a2 === 0 ? `-` : formatMoney(a?.a2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.a3 === 0 ? `-` : formatMoney(a?.a3)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.a4 === 0 ? `-` : formatMoney(a?.a4)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.a5 === 0 ? `-` : formatMoney(a?.a5)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.a6 === 0 ? `-` : formatMoney(a?.a6)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a?.totalAmount === 0
                          ? `-`
                          : formatMoney(
                              a?.a0 +
                                a?.a1 +
                                a?.a2 +
                                a?.a3 +
                                a?.a4 +
                                a?.a5 +
                                a?.a6,
                            )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CustomDialog>
      )}

      {openAgingInvoices && (
        <CustomDialog
          close={setOpenAgingInvoices}
          title=""
          width="!w-[50vw]"
          height=""
          closeIcon="Y"
          button=""
          escape="N"
        >
          <div className="flex flex-col gap-4 ">
            <div>
              <span className="font-medium text-xl">{activeClientN}</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-200">
                    <TableHead className="">Invoice No</TableHead>
                    <TableHead className="text-center">Posting Date</TableHead>
                    <TableHead className="text-center">Receipt Date</TableHead>
                    <TableHead className="text-center">Aging (Days)</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getAgingInvoices?.data?.data.map((a: any, b: number) => (
                    <TableRow key={b}>
                      <TableCell>{a?.invoice_num}</TableCell>
                      <TableCell className="text-center">
                        {a?.posting_date}
                      </TableCell>
                      <TableCell className="text-center">
                        {a?.receipt_date}
                      </TableCell>
                      <TableCell className="text-center">{a?.days}</TableCell>
                      <TableCell className="text-right">
                        {a?.balance === 0 ? `-` : formatMoney(a?.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default APInvoice;
