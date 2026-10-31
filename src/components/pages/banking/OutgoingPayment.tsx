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
import {
  ArrowBigRight,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/reusables/sidebar/search-form";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatDate1, formatDateM, formatMoney, hasAccess } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PaymentMeans from "@/components/reusables/PaymentMeans";
import {
  useAddIncomingMutation,
  useAddOutgoingMutation,
  useCancelOutMutation,
  useCheckPendingQuery,
  useGetAccountAllQuery,
  useGetAutoDocNoQuery,
  useGetBanksQuery,
  useGetBPsQuery,
  useGetCheckNoQuery,
  useGetCustomersQuery,
  useGetIncomingTransQuery,
  useGetIncominInvoicesQuery,
  useGetIncTransPreviewQuery,
  useGetOutgoingInvoicesQuery,
  useGetOutgoingTransQuery,
  useGetOutTransPreviewQuery,
  useGetVendorsQuery,
} from "@/store/api/AdministrationApi";
import { SelectWithSearch } from "@/components/ui/SelectWithSearch";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import ViewEntry from "@/components/reusables/ViewEntry";

type idName = {
  id: number;
  code: string;
  name: string;
};

type transactions = {
  id: number;
  doc_no: string;
  posting_date: string;
  bp_name: string;
  invoices: [];
  status: number;
  type: string;
  type_display: string;
  total_amt: string;
};

type RowInvoices = {
  id: number;
  checkbox: boolean;
  doc_num: string;
  type: string;
  date: string;
  overdue: number;
  total: number;
  wtax: number;
  balance: number;
  payment: string;
};

export type wtax = {
  id: number;
  code: string;
  name: string;
  tax_amt: number;
  wtax_amt: number;
};

type customer = {
  id: number;
  code: string;
  name: string;
  terms: number;
  wtax: number;
  tax_stat: number;
  c_person: string;
};

type PaidInvoices = {
  id: number;
  total: number;
  wtax: number;
  balance: number;
  payment: string;
};

export type Incoming = {
  bpid: number;
  bpcode: string;
  bpname: string;
  or: string;
  invoice: string;
  post_date: string;
  due_date: string;
  doc_date: string;
  remarks: string;
  poa: string;
  total_due: string;
  paid: string;
  p_type: string;
  bank_id: string;
  bank_code: string;
  bank_name: string;
  check_no: string;
  reference: string;
  transfer_date: string;
  invoices: PaidInvoices[];
  status?: number;
};

const initial = {
  bpid: 0,
  bpcode: "",
  bpname: "",
  or: "",
  invoice: "",
  post_date: new Date().toLocaleDateString("en-CA"),
  due_date: new Date().toLocaleDateString("en-CA"),
  doc_date: new Date().toLocaleDateString("en-CA"),
  remarks: "",
  poa: "",
  total_due: "",
  paid: "0",
  p_type: "1",
  bank_id: "",
  bank_code: "",
  bank_name: "",
  check_no: "",
  reference: "",
  transfer_date: "",
  invoices: [],
};

function OutgoingPayment() {
  const invoices = [
    {
      id: 1,
      no: "001",
      date: "2025-11-06",
      due: "2025-12-06",
      status: 1,
      po: "2025-12-31",
      customer: "Shell",
      balance: 100000,
      total: 100000,
    },
    {
      id: 2,
      no: "002",
      date: "2025-11-06",
      due: "2025-12-06",
      status: 1,
      po: "2025-12-31",
      customer: "Shell",
      balance: 5000,
      total: 5000,
    },
    {
      id: 3,
      no: "003",
      date: "2025-11-06",
      due: "2025-12-06",
      status: 2,
      po: "2025-12-31",
      customer: "Shell",
      balance: 0,
      total: 89345,
    },
  ];

  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState(1);
  const [aType, setAType] = useState(2);

  const [selectAll, setSelectAll] = useState(false);
  const [poa, setPoa] = useState(0);
  const [tad, setTad] = useState(0);

  const [filtDate, setFiltDate] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [customer, setCustomer] = useState<customer[]>([]);
  const [vendor, setVendor] = useState<customer[]>([]);
  const [accounts, setAccounts] = useState<idName[]>([]);
  const [invoiceNo, setInvoiceNo] = useState(0);
  const [iP, setIP] = useState<Incoming>(initial);

  const [checkNo, setCheckNo] = useState(0);

  const [transactions, setTransactions] = useState<transactions[]>([]);
  const [viewTransact, setViewTransact] = useState(0);
  const [count, setCount] = useState(0);
  const [counter, setCounter] = useState(0);

  const [addLoading, setAddLoading] = useState(false);

  const [checkPending, setCheckPending] = useState(false);
  const [checkPendingId, setCheckPendingId] = useState(0);
  const [checkPendingCounter, setCheckPendingCounter] = useState(1);

  const [openEntry, setOpenEntry] = useState(false);
  const [currId, setCurrId] = useState(0);

  const [openCancel, setOpenCancel] = useState(false);
  const [jetype, setJeType] = useState(1);

  const [search1, setSearch1] = useState("");
  const [filter, setFilter] = useState({
    type: 0,
    bp: 0,
    bank: 0,
    date: 0,
    from: "",
    to: "",
    status: 0,
  });

  const [filter1, setFilter1] = useState({
    type: 0,
    bp: 0,
    bank: 0,
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

  const [cust, setCust] = useState([]);
  const getCust = useGetCustomersQuery({});
  useEffect(() => {
    if (getCust.isSuccess && getCust.data) {
      setCust(getCust?.data?.data);
    }
  }, [getCust.isSuccess, getCust.data]);

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getBanks = useGetBanksQuery({ search: "" });

  const [rows, setRows] = useState<RowInvoices[]>([]);

  const [aRows, setARows] = useState([
    {
      id: 1,
      code: "",
      name: "",
      amount: "",
      customer: "",
    },
    {
      id: 2,
      code: "",
      name: "",
      amount: "",
      customer: "",
    },
    {
      id: 3,
      code: "",
      name: "",
      amount: "",
      customer: "",
    },
  ]);

  const addARow = () => {
    setARows([
      ...aRows,
      {
        id: aRows.length + 1,
        code: "",
        name: "",
        amount: "",
        customer: "",
      },
    ]);
  };

  useEffect(() => {
    let temptad = rows.reduce(
      (sum, row) =>
        sum +
        (row.checkbox === true
          ? parseFloat(row.payment?.toString().replace(/,/g, "")) || 0
          : 0),
      0,
    );
  }, [rows]);

  useEffect(() => {
    if (iP.invoices.length > 0) {
      let due = iP.invoices.reduce(
        (sum, row) =>
          sum + parseFloat(row.payment?.toString().replace(/,/g, "")) || 0,
        0,
      );
      setIP({ ...iP, paid: String(due.toFixed(2)) });
      setTad(due);
    }

    if (parseFloat(iP.paid) > 0) {
      setTad(parseFloat(iP.paid.replace(/,/g, "")));
    }
  }, [iP.invoices, iP.paid]);

  const getDocNum = useGetAutoDocNoQuery({
    name: "Outgoing Payment",
  });
  useEffect(() => {
    if (getDocNum.isSuccess && getDocNum.data) {
      setInvoiceNo(getDocNum.data.no);
      setIP({ ...iP, invoice: String(getDocNum.data.no) });
    }
  }, [getDocNum.isSuccess, getDocNum.data]);

  const getCheckNo = useGetCheckNoQuery(iP.bank_id, {
    skip: iP.bank_id === "0",
  });
  useEffect(() => {
    if (getCheckNo.isSuccess && getCheckNo.data) {
      setIP({ ...iP, check_no: getCheckNo.data.no });
    }
  }, [getCheckNo.isSuccess, getCheckNo.data]);

  const [bPIDCount, setBPIDCount] = useState(0);

  const getInvoices = useGetOutgoingInvoicesQuery(
    { id: iP.bpid, count: bPIDCount },
    {
      skip: iP.bpid === 0 || type === 2,
    },
  );
  useEffect(() => {
    if (getInvoices.isSuccess && getInvoices.data) {
      setRows(getInvoices.data.data);
    }
  }, [getInvoices.isSuccess, getInvoices.data]);

  const getBPs = useGetBPsQuery({ type: 1 });
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setCustomer(getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);

  const getBP1s = useGetBPsQuery({ type: 2 });
  useEffect(() => {
    if (getBP1s.isSuccess && getBP1s.data) {
      setVendor(getBP1s.data.data);
    }
  }, [getBP1s.isSuccess, getBP1s.data]);

  const getAccounts = useGetAccountAllQuery({});
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      setAccounts(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  const getTrans = useGetOutgoingTransQuery({
    page: page,
    bp: filter1.bp,
    bank: filter1.bank,
    type: filter1.type,
    date: filter1.date,
    from: filter1.from,
    to: filter1.to,
    status: filter1.status,
    search: search1,
  });
  useEffect(() => {
    if (getTrans.isSuccess && getTrans.data) {
      setTransactions(getTrans.data.results);
      setTotalPages(Math.ceil(getTrans?.data?.count / 10));
      setCount(getTrans.data.count);
    }
  }, [getTrans.isSuccess, getTrans.data]);

  const getTransPrev = useGetOutTransPreviewQuery(
    { id: viewTransact, count: counter },
    {
      skip: viewTransact === 0,
    },
  );
  useEffect(() => {
    if (getTransPrev.isSuccess && getTransPrev.data) {
      const rows = getTransPrev.data.data.invoices;

      // Ensure at least 10 rows
      const minimumRows = 10;
      const filledRows = [...rows]; // Start with the rows from the API

      // // If there are fewer than 10 rows, fill the remaining spots with empty rows
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          checkbox: false,
          doc_num: "",
          type: "",
          date: "",
          overdue: "",
          total: "",
          wtax: "",
          balance: "",
          payment: "",
        });
      }

      // const wtax = getTransPrev.data.data.wtax1;

      // const minimumWTax = 5;
      // const filledTax = [...wtax];

      // while (filledTax.length < minimumWTax) {
      //   filledTax.push({
      //     id: filledTax.length + 1,
      //     code: "0",
      //     name: "",
      //     tax_amt: 0,
      //     wtax_amt: 0,
      //   });
      // }

      setIP(getTransPrev.data.data);
      setInvoiceNo(getTransPrev.data.data.invoice);
      setRows(filledRows);
      // setWtax(filledTax);
    }
  }, [getTransPrev.isSuccess, getTransPrev.data]);

  const [addOutgoing] = useAddOutgoingMutation();
  // const [cancelInvoice] = useCancelARInvoiceMutation();
  // const [addARCM] = useAddARCMMutation();
  const submitIncoming = async () => {
    // if (iP.bpid !== 0) {
    if (iP.bank_id === "") {
      toast.error("Please select Payment Means.");
      setAddLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(iP));
      formData.append("type", String(aType));

      formData.append("rows", JSON.stringify(aRows));

      let checkstat: any;
      if (type === 1) {
        if (aType === 1) {
          if (
            parseFloat(iP.paid) > 0 &&
            iP.invoices.length > 0 &&
            iP.bpid !== 0
          ) {
            checkstat = await addOutgoing(formData).unwrap();
          } else {
            setAddLoading(false);
            toast.error("Payment should be greater than zero.");
          }
        } else if (aType === 2) {
          if (parseFloat(iP.paid) > 0 && iP.bpid !== 0) {
            checkstat = await addOutgoing(formData).unwrap();
          } else {
            setAddLoading(false);
            toast.error("Payment should be greater than zero.");
          }
        } else if (aType === 3) {
          const total = aRows.reduce((sum, row) => {
            const value = parseFloat(String(row.amount).replace(/,/g, ""));

            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          if (parseFloat(iP.paid) > 0 && total === parseFloat(iP.paid)) {
            checkstat = await addOutgoing(formData).unwrap();
          } else {
            setAddLoading(false);
            toast.error("Payment should be equal to the total due.");
          }
        }
        // if (parseFloat(iP.paid) > 0 && iP.invoices.length > 0) {
        //   checkstat = await addIncoming(formData).unwrap();
        // } else {
        //   toast.error("Payment should be greater than zero.");
        // }
      } else if (type === 3) {
        // checkstat = await cancelInvoice(formData).unwrap();
      } else if (type === 4) {
        // if (totalBefDiscountAmt + vatAmt !== 0) {
        //   checkstat = await addARCM(formData).unwrap();
        // } else {
        //   toast.error("Document total cannot be equal to zero.");
        // }
      } else {
      }

      if (checkstat.success) {
        setCheckPendingId(0);
        setAddLoading(false);
        setOpenAdd(false);
        // setOpenCancel(false);
        toast.success(checkstat.message);
      } else {
        toast.error(checkstat.message);
      }
    } catch (error) {
      setAddLoading(false);
    }
    // } else {
    //   toast.error("Please fill out required fields.");
    // }
  };

  const checkPendingQue = useCheckPendingQuery(
    {
      id: checkPendingId,
      type: 2,
      client: iP.bpid,
      counter: checkPendingCounter,
    },
    { skip: checkPendingId === 0 },
  );

  useEffect(() => {
    if (checkPendingQue.isSuccess && checkPendingQue.data) {
      if (Number(checkPendingQue?.data?.exist) === 1) {
        const invs: number[] = checkPendingQue.data.invs ?? [];
        // alert("Existing!");
        if (selectAll) {
          toast.error(
            "There are invoice(s) awaiting verification or approval. Please verify or decline the pending payment before creating a new one.",
          );
          const invSet = new Set(invs);
          // console.log(checkPendingQue?.data?.invs);
          const updatedRows = rows.map((row) =>
            invSet.has(row.id)
              ? {
                  ...row,
                  checkbox: false,
                  payment: "0",
                }
              : row,
          );

          setRows(updatedRows);
          setIP((prevState) => ({
            ...prevState,
            invoices: prevState.invoices.filter(
              (invoice) => !invSet.has(invoice.id),
            ),
          }));
        } else {
          if (Number(checkPendingQue?.data?.type) === 1) {
            toast.error(
              "This Invoice has an existing Outgoing Payment under Verification. Please verify or decline the pending payment before creating a new one.",
            );
          } else {
            toast.error(
              "This Invoice has an existing Outgoing Payment under Approval. Please approve or decline the pending payment before creating a new one.",
            );
          }

          const updatedRows = rows.map((row) =>
            row.id === checkPendingId
              ? {
                  ...row,
                  checkbox: false,
                  payment: "0",
                }
              : row,
          );
          setRows(updatedRows);
          setIP((prevState) => ({
            ...prevState,
            invoices: prevState.invoices.filter(
              (invoice) => invoice.id !== checkPendingId,
            ),
          }));
        }
      }
    }
  }, [checkPendingQue.isSuccess, checkPendingQue.data]);

  const [cancelOut] = useCancelOutMutation();
  const submitCancel = async () => {
    setAddLoading(true);
    try {
      let checkstat: any;

      checkstat = await cancelOut(currId).unwrap();

      if (checkstat.success) {
        setOpenCancel(false);
        setAddLoading(false);
        toast.success(checkstat.message);
      } else {
        setAddLoading(false);
        toast.error(checkstat.message);
      }
    } catch (error) {
      setAddLoading(false);
    }
  };

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Outgoing Payment" />
          {!hasAccess(access, "25", "view") ? (
            <Empty />
          ) : (
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
                                    bp: 0,
                                    bank: 0,
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
                              <Label className=" gap-0">Type</Label>

                              <Select
                                onValueChange={(e) =>
                                  setFilter({ ...filter, bp: Number(e) })
                                }
                                value={String(filter.bp)}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">All</SelectItem>
                                  <SelectItem value="1">Customer</SelectItem>
                                  <SelectItem value="2">Vendor</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {filter.bp === 1 && (
                              <div className="grid w-full items-center gap-2">
                                <Label className=" gap-0">Customer</Label>

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
                                    {cust.map((item: any, i: number) => (
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
                            )}

                            {filter.bp === 2 && (
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
                            )}

                            <div className="grid w-full items-center gap-2">
                              <Label className=" gap-0">Bank</Label>

                              <Select
                                onValueChange={(e) =>
                                  setFilter({ ...filter, bank: Number(e) })
                                }
                                value={String(filter.bank)}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">All</SelectItem>
                                  {getBanks?.data?.data.map(
                                    (item: any, i: number) => (
                                      <SelectItem
                                        value={String(item.id)}
                                        key={i}
                                      >
                                        {item.account}
                                      </SelectItem>
                                    ),
                                  )}
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
                                      to: formatDate1(new Date(year, month, 0)),
                                    });
                                  } else if (e === "2") {
                                    setFilter({
                                      ...filter,
                                      date: parseInt(e),
                                      from: formatDate1(
                                        new Date(year, month - 6, 1),
                                      ),
                                      to: formatDate1(new Date(year, month, 0)),
                                    });
                                  } else if (e === "3") {
                                    setFilter({
                                      ...filter,
                                      date: parseInt(e),
                                      from: formatDate1(
                                        new Date(year, month - 2, 1),
                                      ),
                                      to: formatDate1(new Date(year, month, 0)),
                                    });
                                  } else if (e === "4") {
                                    setFilter({
                                      ...filter,
                                      date: parseInt(e),
                                      from: formatDate1(
                                        new Date(year, month - 1, 1),
                                      ),
                                      to: formatDate1(new Date(year, month, 0)),
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
                                  <SelectItem value="4">Last Month</SelectItem>
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
                                  <SelectItem value="1">Closed</SelectItem>
                                  <SelectItem value="2">Canceled</SelectItem>
                                  <SelectItem value="3">
                                    For Verification
                                  </SelectItem>
                                  <SelectItem value="4">
                                    For Approval
                                  </SelectItem>
                                  <SelectItem value="5">Declined</SelectItem>
                                  <SelectItem value="6">Open</SelectItem>
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
                                bank: filter.bank,
                                bp: filter.bp,
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
                </div>

                <div>
                  {hasAccess(access, "25", "create") && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setViewTransact(0);
                        setCounter((prev) => prev + 1);
                        setViewTransact(0);
                        setType(1);
                        setAType(2);
                        setOpenAdd(true);
                        setIP(initial);
                        setRows([]);
                        setTad(0);
                        setCounter((prev) => prev + 1);
                        getDocNum.refetch();
                      }}
                    >
                      Add Outgoing Payment
                    </Button>
                  )}
                </div>
              </div>

              <Table className="shadow-sm border">
                <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                  <TableRow className="">
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                      Transaction No.
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Date
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Type
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Vendor
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Invoices
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Status
                    </TableHead>
                    <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="font-inter text-foreground">
                  {transactions.map((item, idx) => (
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
                                setViewTransact(item.id);
                                setCounter((prev) => prev + 1);
                              }}
                              className="text-blue-800 underline cursor-pointer font-medium"
                            >
                              {item.doc_no}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.posting_date}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.type_display}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.bp_name}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.invoices?.join(", ")}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.status === 1 ? (
                              <span className="p-1 px-2 rounded-2xl bg-green-200 text-green-900">
                                Closed
                              </span>
                            ) : item.status === 2 ? (
                              <span className="p-1 px-2 rounded-2xl bg-red-200 text-red-900">
                                Canceled
                              </span>
                            ) : item.status === 3 ? (
                              <span className="p-1 px-2 rounded-2xl bg-yellow-200 text-yellow-900">
                                For Verification
                              </span>
                            ) : item.status === 4 ? (
                              <span className="p-1 px-2 rounded-2xl bg-purple-200 text-purple-900">
                                For Approval
                              </span>
                            ) : item.status === 5 ? (
                              <span className="p-1 px-2 rounded-2xl bg-red-300 text-red-900">
                                Declined
                              </span>
                            ) : (
                              <span className="p-1 px-2 rounded-2xl bg-blue-200 text-blue-900">
                                Open
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            {formatMoney(Number(item.total_amt))}
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>

                      {/* Context Menu Items */}
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={() => {
                            setJeType(1);
                            setOpenEntry(true);
                          }}
                        >
                          Journal Entry
                        </ContextMenuItem>
                        {hasAccess(access, "24", "edit") && (
                          <ContextMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setOpenCancel(true);
                              // setViewInvoice(0);
                              // setCounter((prev) => prev + 1);
                            }}
                            disabled={item.status !== 6}
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
                  Showing {count === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, count)} of {count}
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
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={``}
          width={`!w-[60vw]`}
          height={``}
          closeIcon={`N`}
          button=""
          escape="N"
        >
          <div className="grid grid-cols-1 gap-1 pt-4">
            {(type === 1 || type === 2) && (
              <div className="pb-2">
                <RadioGroup
                  defaultValue={String(aType)}
                  className="flex p-2 gap-8 border w-fit rounded-md"
                  onValueChange={(e) => {
                    setAType(parseInt(e));
                    setIP(initial);
                  }}
                  disabled={type === 2}
                >
                  <div
                    className="flex items-center space-x-2"
                    onClick={() => {
                      type === 2 ? `` : setAType(1);
                    }}
                  >
                    <RadioGroupItem value="1" id="1" />
                    <Label htmlFor="1">Customer</Label>
                  </div>
                  <div
                    className="flex items-center space-x-2"
                    onClick={() => {
                      type === 2 ? `` : setAType(2);
                    }}
                  >
                    <RadioGroupItem value="2" id="2" />
                    <Label htmlFor="2">Vendor</Label>
                  </div>
                  {/* <div
                    className="flex items-center space-x-2"
                    onClick={() => {
                      type === 2 ? `` : setAType(3);
                    }}
                  >
                    <RadioGroupItem value="3" id="3" />
                    <Label htmlFor="3">Account</Label>
                  </div> */}
                </RadioGroup>
              </div>
            )}
            <div className="grid grid-cols-2">
              {aType === 1 ? (
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Customer Code</span>
                  </div>
                  <div className="grid col-span-2">
                    {/* <Input noPadding className="w-2/3" type="text" /> */}
                    <SelectWithSearch
                      options={customer.map((item) => ({
                        label: String(item.id),
                        value: item.code,
                      }))}
                      placeholder="Customer Code"
                      onChange={(c) => {
                        setSelectAll(false);
                        setCheckPendingId(0);
                        setBPIDCount(bPIDCount + 1);
                        let cust = customer.find(
                          (item) => Number(c) === item.id,
                        );
                        if (cust) {
                          setIP({
                            ...iP,
                            bpid: cust?.id,
                            bpcode: cust?.code,
                            bpname: cust?.name,
                          });
                        }
                      }}
                      noPadding
                      className="w-2/3"
                      value={iP.bpcode}
                      readOnly={type !== 1}
                    />
                  </div>
                </div>
              ) : aType === 2 ? (
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
                        setSelectAll(false);
                        setCheckPendingId(0);
                        setBPIDCount(bPIDCount + 1);
                        let cust = vendor.find((item) => Number(c) === item.id);
                        if (cust) {
                          setIP({
                            ...iP,
                            bpid: cust?.id,
                            bpcode: cust?.code,
                            bpname: cust?.name,
                          });
                        }
                      }}
                      noPadding
                      className="w-2/3"
                      value={iP.bpcode}
                      readOnly={type !== 1}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3"></div>
              )}
              <div className="grid grid-cols-5">
                <div></div>
                <div className=" border-b col-span-2">
                  <span className="text-sm">No.</span>
                </div>
                <div className="grid col-span-2 justify-items-end">
                  <Input
                    noPadding
                    className="w-full"
                    type="text"
                    // value={invoiceNo}
                    value={type === 1 ? getDocNum.data.no : invoiceNo}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              {aType === 1 ? (
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Customer Name</span>
                  </div>
                  <div className="grid col-span-2">
                    <SelectWithSearch
                      options={customer.map((item) => ({
                        label: String(item.id),
                        value: item.name,
                      }))}
                      placeholder="Customer Name"
                      onChange={(c) => {
                        setSelectAll(false);
                        setCheckPendingId(0);
                        setBPIDCount(bPIDCount + 1);
                        let cust = customer.find(
                          (item) => Number(c) === item.id,
                        );
                        if (cust) {
                          setIP({
                            ...iP,
                            bpid: cust?.id,
                            bpcode: cust?.code,
                            bpname: cust?.name,
                          });
                        }
                      }}
                      noPadding
                      className="w-2/3"
                      value={iP.bpname}
                      readOnly={type !== 1}
                    />
                  </div>
                </div>
              ) : aType === 2 ? (
                <div className="grid grid-cols-3">
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
                        setSelectAll(false);
                        setCheckPendingId(0);
                        setBPIDCount(bPIDCount + 1);
                        let cust = vendor.find((item) => Number(c) === item.id);
                        if (cust) {
                          setIP({
                            ...iP,
                            bpid: cust?.id,
                            bpcode: cust?.code,
                            bpname: cust?.name,
                          });
                        }
                      }}
                      noPadding
                      className="w-2/3"
                      value={iP.bpname}
                      readOnly={type !== 1}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3"></div>
              )}
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
                    onChange={(e) =>
                      setIP({ ...iP, post_date: e.target.value })
                    }
                    value={iP.post_date}
                    readOnly={type === 2}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3">
                {aType !== 3 ? (
                  <>
                    <div className=" border-b ">
                      <span className="text-sm">OR No.</span>
                    </div>
                    <div className="grid col-span-2">
                      <Input
                        noPadding
                        className="w-2/3"
                        type="text"
                        value={iP.or}
                        onChange={(e) => setIP({ ...iP, or: e.target.value })}
                        readOnly={type === 2}
                      />
                    </div>
                  </>
                ) : (
                  ``
                )}
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
                    onChange={(e) => setIP({ ...iP, due_date: e.target.value })}
                    value={iP.due_date}
                    readOnly={type === 2}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 pb-4">
              <div className="grid grid-cols-3">
                {type === 2 && (
                  <>
                    <div className=" border-b flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      {iP.status === 2 && (
                        <ArrowBigRight
                          size={20}
                          fill="yellow"
                          color="black"
                          strokeWidth={0.5}
                          onClick={() => {
                            setJeType(2);
                            setTimeout(() => {
                              setOpenEntry(true);
                            }, 500);
                          }}
                          className="cursor-pointer"
                        />
                      )}
                    </div>
                    <div className="grid col-span-2">
                      <Input
                        noPadding
                        className="w-2/3"
                        type="text"
                        value={
                          iP.status === 1
                            ? `Closed`
                            : iP.status === 2
                              ? `Canceled`
                              : iP.status === 3
                                ? `For Verification`
                                : iP.status === 4
                                  ? `For Approval`
                                  : iP.status === 5
                                    ? `Declined`
                                    : `Open`
                        }
                        readOnly={type === 2}
                      />
                    </div>
                  </>
                )}
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
                    onChange={(e) => setIP({ ...iP, doc_date: e.target.value })}
                    value={iP.doc_date}
                    readOnly={type === 2}
                  />
                </div>
              </div>
            </div>

            {/* <div className="my-4 shadow pt-1"> */}
            <div className="h-56 overflow-y-auto py-0 shadow">
              {aType === 2 ? (
                <table className="w-full">
                  <thead className="bg-blue-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-1 border text-sm px-2">
                        <Checkbox
                          id="All"
                          checked={selectAll}
                          onCheckedChange={(checked) => {
                            const isChecked = !!checked;
                            setSelectAll(isChecked);
                            if (isChecked) {
                              setCheckPendingId(-1);
                              setCheckPendingCounter((prev) => prev + 1);
                            } else {
                              setCheckPendingId(0);
                            }

                            setRows((prev) =>
                              prev.map((row) => ({
                                ...row,
                                checkbox: isChecked,
                                payment: "0",
                              })),
                            );

                            setIP((prev) => ({
                              ...prev,
                              invoices: isChecked ? [...rows] : [],
                            }));
                          }}
                          disabled={type === 2}
                        />
                      </th>
                      <th className="p-1 border text-sm">Document No.</th>
                      <th className="p-1 border text-sm">Type</th>
                      <th className="p-1 border text-sm">Date</th>
                      <th className="p-1 border text-sm">Overdue Days</th>
                      <th className="p-1 border text-sm">Total</th>
                      <th className="p-1 border text-sm">Wtax</th>
                      <th className="p-1 border text-sm">Balance Due</th>
                      <th className="p-1 border text-sm">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {rows.map((item, index) => (
                      <tr
                        key={index}
                        className={item.checkbox ? `bg-gray-100` : ``}
                      >
                        <td className="p-1 text-sm border text-center">
                          <Checkbox
                            id={String(item.id)}
                            checked={item.checkbox}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCheckPendingId(item.id);
                                setCheckPendingCounter((prev) => prev + 1);
                                setIP((prevState) => ({
                                  ...prevState,
                                  invoices: [...prevState.invoices, item],
                                }));
                              } else {
                                setIP((prevState) => ({
                                  ...prevState,
                                  invoices: prevState.invoices.filter(
                                    (invoice) => invoice.id !== item.id,
                                  ),
                                }));
                              }
                              const updatedRows = rows.map((row) =>
                                row.id === item.id
                                  ? {
                                      ...row,
                                      checkbox: !!checked,
                                      payment: "0",
                                    }
                                  : row,
                              );
                              setRows(updatedRows);
                              if (!checked) setSelectAll(false);
                              else if (updatedRows.every((r) => r.checkbox))
                                setSelectAll(true);
                            }}
                            disabled={type === 2}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none"
                            value={item.doc_num}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-center"
                            value={item.type}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-center"
                            value={formatDateM(new Date(item.date))}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className={`w-full outline-none text-center ${
                              item.overdue > 30 ? `text-red-700` : ``
                            }`}
                            value={item.overdue}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.total) !== ""
                                ? formatMoney(item.total)
                                : ""
                            }
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.wtax) !== ""
                                ? formatMoney(item.wtax)
                                : ""
                            }
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.wtax) !== ""
                                ? formatMoney(item.balance)
                                : ""
                            }
                          />
                        </td>

                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              type === 2
                                ? item.payment === ""
                                  ? ""
                                  : formatMoney(item.payment)
                                : item.payment === "0" ||
                                    item.payment === "0.00"
                                  ? ""
                                  : item.payment
                            }
                            disabled={!item.checkbox}
                            onChange={(e) => {
                              // let value = e.target.value.replace(/,/g, "");

                              // if (/^\d*\.?\d{0,2}$/.test(value)) {
                              //   // update rows
                              //   const newRows = [...rows];
                              //   newRows[index].payment = value;
                              //   setRows(newRows);

                              //   // update invoices if checked
                              //   if (item.checkbox) {
                              //     setIP((prev) => ({
                              //       ...prev,
                              //       invoices: prev.invoices.map((inv) =>
                              //         inv.id === item.id
                              //           ? { ...inv, payment: value }
                              //           : inv
                              //       ),
                              //     }));
                              //   }
                              // }

                              let raw = e.target.value.replace(/,/g, "");

                              // allow only 2 decimals
                              if (!/^\d*\.?\d{0,2}$/.test(raw)) return;

                              const num = parseFloat(raw);

                              // block values greater than max
                              if (!isNaN(num) && num > item.balance) return;

                              const newRows = [...rows];
                              newRows[index].payment = raw;
                              setRows(newRows);

                              if (item.checkbox) {
                                setIP((prev) => ({
                                  ...prev,
                                  invoices: prev.invoices.map((inv) =>
                                    inv.id === item.id
                                      ? { ...inv, payment: raw }
                                      : inv,
                                  ),
                                }));
                              }

                              // setIP((prev) => ({ ...prev, paid: raw }));
                            }}
                            onBlur={() => {
                              const num = parseFloat(item.payment);
                              let formatted = "";

                              if (!isNaN(num)) {
                                formatted = num.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                });
                              }

                              // update rows
                              const newRows = [...rows];
                              newRows[index].payment = formatted;
                              setRows(newRows);

                              // update invoices if checked
                              if (item.checkbox) {
                                setIP((prev) => ({
                                  ...prev,
                                  invoices: prev.invoices.map((inv) =>
                                    inv.id === item.id
                                      ? { ...inv, payment: formatted }
                                      : inv,
                                  ),
                                }));
                              }
                            }}
                            onFocus={() => {
                              const raw = item.payment.replace(/,/g, "");

                              // update rows
                              const newRows = [...rows];
                              newRows[index].payment = raw;
                              setRows(newRows);

                              // update invoices if checked
                              if (item.checkbox) {
                                setIP((prev) => ({
                                  ...prev,
                                  invoices: prev.invoices.map((inv) =>
                                    inv.id === item.id
                                      ? { ...inv, payment: raw }
                                      : inv,
                                  ),
                                }));
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : aType === 1 ? (
                <table className="w-full">
                  <thead className="bg-blue-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-1 border text-sm px-2">
                        <Checkbox
                          id="All"
                          checked={selectAll}
                          onCheckedChange={(checked) => {
                            const isChecked = !!checked;
                            setSelectAll(isChecked);
                            setRows((prev) =>
                              prev.map((row) => ({
                                ...row,
                                checkbox: isChecked,
                                payment: "0",
                              })),
                            );

                            setIP((prev) => ({
                              ...prev,
                              invoices: isChecked ? [...rows] : [],
                            }));
                          }}
                        />
                      </th>
                      <th className="p-1 border text-sm">Document No</th>
                      <th className="p-1 border text-sm">Type</th>
                      <th className="p-1 border text-sm">Date</th>
                      <th className="p-1 border text-sm">Overdue Days</th>
                      <th className="p-1 border text-sm">Total</th>
                      <th className="p-1 border text-sm">Wtax</th>
                      <th className="p-1 border text-sm">Balance Due</th>
                      <th className="p-1 border text-sm">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className=""></tbody>
                </table>
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-blue-300 sticky top-0 z-10">
                      <tr>
                        <th className="p-1 border text-sm">Account Code</th>
                        <th className="p-1 border text-sm">Account Name</th>
                        <th className="p-1 border text-sm">Amount</th>
                        <th className="p-1 border text-sm">Customer</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {aRows.map((item, index) => (
                        <tr key={index}>
                          <td className="p-0 text-sm border">
                            {/* <input
                              className="w-full outline-none text-center"
                              value={item.code}
                            /> */}
                            <SelectWithSearch
                              options={accounts.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              onChange={(e) => {
                                const newRows = [...aRows];
                                newRows[index].code = e;
                                setARows(newRows);
                              }}
                              className="border-none"
                              noPadding1
                              value={
                                accounts.find(
                                  (item2) =>
                                    String(item.code) === String(item2.id),
                                )?.code
                              }
                              readOnly={type === 2 || type === 3}
                            />
                          </td>
                          <td className="p-0 text-sm border">
                            <SelectWithSearch
                              options={accounts.map((item1) => ({
                                label: String(item1.id),
                                value: item1.code,
                              }))}
                              placeholder=""
                              onChange={(e) => {
                                let row = accounts.find(
                                  (item2) => String(e) === String(item2.id),
                                );
                                const newRows = [...aRows];

                                newRows[index].code = String(row?.id);
                                newRows[index].name = String(row?.name);
                                setARows(newRows);
                              }}
                              className="border-none"
                              noPadding1
                              value={
                                accounts.find(
                                  (item2) =>
                                    String(item.code) === String(item2.id),
                                )?.name
                              }
                              readOnly={type === 2 || type === 3}
                            />
                          </td>

                          <td className="p-1 text-sm border">
                            <input
                              className="w-full outline-none text-right"
                              value={
                                item.amount === "0" || item.amount === "0.00"
                                  ? ""
                                  : item.amount
                              }
                              onChange={(e) => {
                                let value = e.target.value.replace(/,/g, "");

                                if (/^\d*\.?\d{0,2}$/.test(value)) {
                                  const newRows = [...aRows];
                                  newRows[index].amount = value;
                                  setARows(newRows);
                                }
                              }}
                              onBlur={() => {
                                const newRows = [...aRows];
                                const num = parseFloat(item.amount);

                                if (!isNaN(num)) {
                                  newRows[index].amount = num.toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    },
                                  );
                                } else {
                                  newRows[index].amount = "";
                                }

                                setARows(newRows);
                              }}
                              onFocus={() => {
                                const newRows = [...aRows];
                                newRows[index].amount = item.amount.replace(
                                  /,/g,
                                  "",
                                );
                                setARows(newRows);
                              }}
                            />
                          </td>
                          <td className="p-0 text-sm border">
                            {/* <input
                              className="w-full outline-none text-center"
                              value={item.customer}
                            /> */}
                            <SelectWithSearch
                              options={customer.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              onChange={(e) => {
                                const newRows = [...aRows];
                                newRows[index].customer = e;
                                setARows(newRows);
                              }}
                              className="border-none"
                              noPadding1
                              value={
                                customer.find(
                                  (item2) => item.customer === String(item2.id),
                                )?.name
                              }
                              readOnly={type === 2 || type === 3}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="py-2 flex justify-end w-full">
                    <Button size={"sm"} variant={"primary"} onClick={addARow}>
                      Add Row
                    </Button>
                  </div>
                </>
              )}
            </div>
            {/* </div> */}

            <div className="grid grid-cols-2 py-4">
              <div className="flex flex-col">
                <span className="text-sm ">Remarks</span>
                <Textarea
                  className="w-full h-24 resize-none"
                  onChange={(e) => setIP({ ...iP, remarks: e.target.value })}
                  value={iP.remarks}
                  readOnly={type === 2}
                />
              </div>
              <div className="flex flex-col gap-1">
                {/* <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Payment on Account</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(poa)}
                    />
                    <HandCoins className="invisible" />
                  </div>
                </div> */}

                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2 ">
                    <span className="text-sm">Total Amount Paid</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(tad)}
                    />
                    <PaymentMeans
                      iP={iP}
                      setIP={setIP}
                      type={type}
                      mod="out"
                      aType={aType}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="mb-5" />

          <div className="flex justify-between">
            <div></div>

            <div className="flex gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => setOpenAdd(false)}
              >
                Close
              </Button>

              {type === 1 && (
                <Button
                  size="sm"
                  variant="second"
                  onClick={() => {
                    setAddLoading(true);
                    submitIncoming();
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
          <ViewEntry id={currId} origin={7} type={jetype} />

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
              Are you sure you want to cancel this Outgoing Payment{" "}
              {transactions.find((item) => currId === item.id)?.doc_no}?
            </div>
            <div className="w-full flex">
              <div className="w-1/2 text-center">
                <Button
                  className="w-5/6"
                  variant="destructive"
                  onClick={() => {
                    submitCancel();
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
                  }}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default OutgoingPayment;
