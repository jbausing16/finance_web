import { useEffect, useRef, useState } from "react";
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
import { ChevronLeft, ChevronRight, ListFilter } from "lucide-react";
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
import { formatDateM, formatMoney, get_origin, hasAccess } from "@/lib/utils";
import {
  useAddJEMutation,
  useGetAccountAllQuery,
  useGetAccountTypeHeadQuery,
  useGetAccountTypeQuery,
  useGetAutoDocNoQuery,
  useGetBPsQuery,
  useGetCOAQuery,
  useGetCustomersQuery,
  useGetJETempTransPreviewQuery,
  useGetJETransPreviewQuery,
  useGetJETransQuery,
} from "@/store/api/AdministrationApi";
import { SelectWithSearch } from "@/components/ui/SelectWithSearch";
import { toast } from "sonner";
import { exportJETemplate } from "@/components/reusables/exportJETemplate";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import YesNo from "@/components/reusables/YesNo";
import { SelectWithSearch1 } from "@/components/ui/SelectWithSearch1";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";

export type wtax = {
  id: number;
  code: string;
  name: string;
  tax_amt: number;
  wtax_amt: number;
};

type idName = {
  id: number;
  code: string;
  name: string;
};

type choices = {
  id: number;
  code: string;
  type: number;
  level: number;
  name: string;
  child: any[];
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

type JE = {
  id: number;
  no: string;
  origin: string;
  date: string;
  remarks: string;
  amount: string;
  ref: number;
};

const initialData = {
  id: 0,
  no: "",
  origin: "Journal Entry",
  origin_no: "",
  remarks: "",
  post_date: new Date().toLocaleDateString("en-CA"),
  due_date: new Date().toLocaleDateString("en-CA"),
  doc_date: new Date().toLocaleDateString("en-CA"),
  trans_no: "",
  total: 0,
  status: 0,
};

const initialRows = [
  {
    id: 1,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 2,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 3,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 4,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 5,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 6,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 7,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 8,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 9,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 10,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
];

export const formatDate1 = (dateString: Date) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function JournalEntry() {
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState(1);
  const [aType, setAType] = useState(2);
  const [currId, setCurrId] = useState(0);

  const [selectAll, setSelectAll] = useState(false);
  const [poa, setPoa] = useState(0);
  const [tad, setTad] = useState(0);

  const [filtDate, setFiltDate] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(3);
  const [count, setCount] = useState(0);

  const [openUpload, setOpenUpload] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const [search1, setSearch1] = useState("");
  const [filter, setFilter] = useState({
    type: 0,
    date: 0,
    from: "",
    to: "",
  });

  const [filter1, setFilter1] = useState({
    type: 0,
    date: 0,
    from: "",
    to: "",
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch1(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getCustomers = useGetCustomersQuery({});
  const getCOA = useGetCOAQuery({});

  const [rows, setRows] = useState(initialRows);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
    ]);
  };

  const clearRow = () => {
    setRows([
      {
        id: 1,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 2,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 3,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 4,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 5,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 6,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 7,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 8,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 9,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
      {
        id: 10,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      },
    ]);
  };
  const clearData = () => {
    setData({
      id: 0,
      no: "",
      origin: "Journal Entry",
      origin_no: "",
      remarks: "",
      post_date: new Date().toLocaleDateString("en-CA"),
      due_date: new Date().toLocaleDateString("en-CA"),
      doc_date: new Date().toLocaleDateString("en-CA"),
      trans_no: "",
      total: 0,
      status: 0,
    });
  };

  const totalDebit = rows.reduce(
    (sum, row) =>
      sum + (parseFloat(row.debit?.toString().replace(/,/g, "")) || 0),
    0,
  );

  const totalCredit = rows.reduce(
    (sum, row) =>
      sum + (parseFloat(row.credit?.toString().replace(/,/g, "")) || 0),
    0,
  );

  const [data, setData] = useState(initialData);
  const [accounts, setAccounts] = useState<choices[]>([]);
  const [accountsAll, setAccountsAll] = useState<choices[]>([]);
  const [customer, setCustomer] = useState<customer[]>([]);
  const [JE, setJE] = useState<JE[]>([]);
  const [jeType, setJEType] = useState(0);

  // const getAccounts = useGetAccountAllQuery({});
  // useEffect(() => {
  //   if (getAccounts.isSuccess && getAccounts.data) {
  //     setAccounts(getAccounts.data.data);
  //   }
  // }, [getAccounts.isSuccess, getAccounts.data]);

  const getAccounts = useGetAccountTypeHeadQuery({ type: 0 });
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      // console.log("Head: ", getAccounts.data.data);
      setAccounts(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  const getAccountsAll = useGetAccountAllQuery({ type: 0 });
  useEffect(() => {
    if (getAccountsAll.isSuccess && getAccountsAll.data) {
      // console.log("All: ", getAccountsAll.data.data);
      setAccountsAll(getAccountsAll.data.data);
    }
  }, [getAccountsAll.isSuccess, getAccountsAll.data]);

  const getBPs = useGetBPsQuery({ type: 1 });
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setCustomer(getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);

  const getJEs = useGetJETransQuery({
    page: page,
    type: filter1.type,
    date: filter1.date,
    from: filter1.from,
    to: filter1.to,
    search: search1,
  });
  useEffect(() => {
    if (getJEs.isSuccess && getJEs.data) {
      setJE(getJEs.data.results);
      setTotalPages(Math.ceil(getJEs?.data?.count / 10));
      setCount(getJEs.data.count);
    }
  }, [getJEs.isSuccess, getJEs.data]);

  const getPreview = useGetJETransPreviewQuery(currId, { skip: currId === 0 });
  useEffect(() => {
    if (getPreview.isSuccess && getPreview.data && jeType === 1) {
      setData(getPreview?.data?.data);

      const rows = getPreview.data.data.rows;
      const minimumRows = 10;
      const filledRows = [...rows];
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          code: "",
          name: "",
          debit: "",
          credit: "",
          customer: "",
          remarks: "",
        });
      }

      setRows(filledRows);
    }
  }, [getPreview.isSuccess, getPreview.data]);

  const getPreviewTemp = useGetJETempTransPreviewQuery(currId, {
    skip: currId === 0,
  });
  useEffect(() => {
    if (getPreviewTemp.isSuccess && getPreviewTemp.data && jeType === 2) {
      setData(getPreviewTemp?.data?.data);

      const rows = getPreviewTemp.data.data.rows;
      const minimumRows = 10;
      const filledRows = [...rows];
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          code: "",
          name: "",
          debit: "",
          credit: "",
          customer: "",
          remarks: "",
        });
      }

      setRows(filledRows);
    }
  }, [getPreviewTemp.isSuccess, getPreviewTemp.data]);

  // useEffect(() => {
  //   console.log(filter);
  // }, [filter]);

  const [counter, setCounter] = useState(0);
  const getDocNum = useGetAutoDocNoQuery({
    name: "Journal Entry",
    count: counter,
  });

  const [addJE] = useAddJEMutation();
  // const [cancelInvoice] = useCancelARInvoiceMutation();
  // const [addARCM] = useAddARCMMutation();
  const submitJE = async () => {
    setAddLoading(true);
    // if (iP.bpid !== 0) {
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(data));
      formData.append("rows", JSON.stringify(rows));
      formData.append("total", String(totalDebit));

      let checkstat: any;
      if (type === 1) {
        checkstat = await addJE(formData).unwrap();

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
        setAddLoading(false);
        setOpenAdd(false);
        // setOpenCancel(false);
        toast.success(checkstat.message);
      } else {
        setAddLoading(false);
        toast.error(checkstat.message);
      }
    } catch (error) {
      setAddLoading(false);
    }
    // } else {
    //   toast.error("Please fill out required fields.");
    // }
  };

  const [uploadTemplate, setUploadTemplate] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const normalizeHeader = (header: string) =>
  //   header.toLowerCase().trim().replace(/\s+/g, "_");
  const normalizeHeader = (header: string) =>
    header.replace(/\*/g, "").toLowerCase().trim().replace(/\s+/g, "_");

  const getCellValue = (value: any) => {
    if (!value) return "";

    if (typeof value === "object") {
      if (value.richText) {
        return value.richText.map((t: any) => t.text).join("");
      }

      if (value.text) {
        return value.text;
      }

      if (value.result) {
        return value.result;
      }
    }

    return value;
  };

  // =============================
  // FILE HANDLERS
  // =============================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // -------- CSV --------
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setUploadTemplate(result.data as any[]);
          console.log("CSV JSON:", result.data);
        },
      });
      return;
    }

    // -------- EXCEL (.xlsx / .xls) --------
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());

      const worksheet = workbook.worksheets[0];
      const rows: any[] = [];
      let headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        const values = row.values as any[];

        if (rowNumber === 1) {
          headers = values
            .slice(1)
            .map((h) => normalizeHeader(String(getCellValue(h))));
          return;
        }

        const rowObject: any = {};
        headers.forEach((header, index) => {
          rowObject[header] = getCellValue(values[index + 1]) ?? "";
        });

        console.log("Headers: ", headers);

        const hasDebit = rowObject.debit !== "" && rowObject.debit != null;
        const hasCredit = rowObject.credit !== "" && rowObject.credit != null;

        if (hasDebit || hasCredit) {
          rows.push(rowObject);
        }
      });

      setUploadTemplate(rows);
      console.log("Excel JSON:", rows);
    }
  };

  const submitData = () => {
    const arr: any[] = [];

    // console.log("Template: ", uploadTemplate);
    uploadTemplate.map((item, i) =>
      arr.push({
        id: i + 1,
        code: String(item.id),
        name: getAccountsAll?.data?.data.find(
          (item1: any) => item?.id === item1.id,
        ).name,
        debit:
          String(formatMoney(item.debit)) === "0.00"
            ? ""
            : String(formatMoney(item.debit)),
        credit:
          String(formatMoney(item.credit)) === "0.00"
            ? ""
            : String(formatMoney(item.credit)),
        customer: String(item.customer_id),
        remarks: item.remarks,
      }),
    );

    const rows = arr;
    const minimumRows = 10;
    const filledRows = [...rows];
    while (filledRows.length < minimumRows) {
      filledRows.push({
        id: filledRows.length + 1,
        code: "",
        name: "",
        debit: "",
        credit: "",
        customer: "",
        remarks: "",
      });
    }

    setRows(filledRows);

    setOpenUpload(false);
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
          <Header title="Journal Entry" />
          {!hasAccess(access, "16", "view") ? (
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
                                onClick={() =>
                                  setFilter({
                                    type: 0,
                                    date: 0,
                                    from: "",
                                    to: "",
                                  })
                                }
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
                                  setFilter({ ...filter, type: Number(e) })
                                }
                                value={String(filter.type)}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">All</SelectItem>
                                  <SelectItem value="1">
                                    Journal Entry
                                  </SelectItem>
                                  <SelectItem value="2">A/R Invoice</SelectItem>
                                  <SelectItem value="3">
                                    A/R Credit Memo
                                  </SelectItem>
                                  <SelectItem value="4">A/P Invoice</SelectItem>
                                  <SelectItem value="5">
                                    A/P Credit Memo
                                  </SelectItem>
                                  <SelectItem value="6">
                                    Incoming Payment
                                  </SelectItem>
                                  <SelectItem value="7">
                                    Outgoing Payment
                                  </SelectItem>
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
                                      from: "",
                                      to: "",
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

                            {/* <div className="grid w-full items-center gap-2">
                            <Label className=" gap-0">Status</Label>

                            <Select>
                              <SelectTrigger className="w-full ">
                                <SelectValue placeholder="All" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">All</SelectItem>
                                <SelectItem value="1">Completed</SelectItem>
                                <SelectItem value="2">In-progress</SelectItem>
                                <SelectItem value="3">Canceled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}
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
                  {hasAccess(access, "16", "create") && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        clearRow();
                        clearData();
                        setOpenAdd(true);
                        setType(1);
                      }}
                    >
                      Add Journal Entry
                    </Button>
                  )}
                </div>
              </div>

              <Table className="shadow-sm border">
                <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                  <TableRow className="">
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                      No.
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Origin
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Date
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Remarks
                    </TableHead>
                    <TableHead className="font-archivo text-right pr-4 text-muted-foreground font-semibold py-3 ">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="font-inter text-foreground">
                  {JE?.map((item, idx) => (
                    <TableRow key={idx} className="">
                      <TableCell className="py-2 text-center">
                        <span
                          onClick={() => {
                            setCurrId(item.id);
                            setType(2);
                            setOpenAdd(true);
                            setJEType(item.ref);
                          }}
                          className="text-blue-800 underline cursor-pointer font-medium"
                        >
                          {item.no}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`py-2 text-center ${
                          item.ref === 1 ? `` : `text-blue-800`
                        }`}
                      >
                        {get_origin(Number(item.origin))}
                      </TableCell>
                      <TableCell
                        className={`py-2 text-center ${
                          item.ref === 1 ? `` : `text-blue-800`
                        }`}
                      >
                        {item.date}
                      </TableCell>
                      <TableCell
                        className={`py-2 text-center ${
                          item.ref === 1 ? `` : `text-blue-800`
                        }`}
                      >
                        {item.remarks}
                      </TableCell>
                      <TableCell
                        className={`py-2 text-right pr-4 ${
                          item.ref === 1 ? `` : `text-blue-800`
                        }`}
                      >
                        {formatMoney(item.amount)}
                      </TableCell>
                    </TableRow>
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
          title={
            jeType === 2 && (data.status === 4 || data.status === 5) ? (
              <span
                className={
                  jeType === 2 && data.status === 4
                    ? `p-1 px-3 rounded-2xl bg-yellow-200 text-yellow-900 text-md`
                    : jeType === 2 && data.status === 5
                      ? `p-1 px-3 rounded-2xl bg-purple-200 text-purple-900 text-md`
                      : ``
                }
              >
                {jeType === 2 && data.status === 4
                  ? `For Verification`
                  : jeType === 2 && data.status === 5
                    ? `For Approval`
                    : ``}
              </span>
            ) : (
              ``
            )
          }
          width={`!w-[60vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 gap-1 py-6 z-50">
            {/* <span>{id}</span> */}
            <div className="grid grid-cols-1 gap-1 pt-2">
              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">No</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={type === 1 ? getDocNum?.data?.no : data.no}
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
                      value={data.post_date}
                      onChange={(e) =>
                        setData({ ...data, post_date: e.target.value })
                      }
                      readOnly={type === 2}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3 ">
                  <div className=" border-b ">
                    <span className="text-sm">Origin</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={data.origin}
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
                      value={data.due_date}
                      onChange={(e) =>
                        setData({ ...data, due_date: e.target.value })
                      }
                      readOnly={type === 2}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Origin No</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={type === 1 ? getDocNum?.data?.no : data.origin_no}
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
                      value={data.doc_date}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2  items-start">
                <div className="grid grid-cols-3">
                  <div className=" border-b">
                    <span className="text-sm">Remarks</span>
                  </div>
                  <div className="grid col-span-2">
                    <Textarea
                      className="resize-none w-2/3 rounded-none p-1"
                      value={data.remarks}
                      onChange={(e) =>
                        setData({ ...data, remarks: e.target.value })
                      }
                      readOnly={type === 2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Transaction No</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="text"
                      value={type === 1 ? getDocNum?.data?.no : data.trans_no}
                    />
                  </div>
                </div>
              </div>
            </div>

            {type === 1 && (
              <div className="py-2 flex justify-between w-full">
                <Button
                  size={"sm"}
                  variant={"second"}
                  onClick={() => {
                    setUploadTemplate([]);
                    setOpenUpload(true);
                  }}
                >
                  Import Template
                </Button>
                <Button size={"sm"} variant={"primary"} onClick={addRow}>
                  Add Row
                </Button>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto py-0 shadow">
              <table className="w-full">
                <thead className="bg-blue-300 sticky top-0 z-10">
                  <tr>
                    <th className="p-1 border w-[15%]">G/L Account</th>
                    <th className="p-1 border w-[25%]">G/L Name</th>
                    <th className="p-1 border w-[15%]">Debit</th>
                    <th className="p-1 border w-[15%]">Credit</th>
                    <th className="p-1 border w-[15%]">Customer</th>
                    <th className="p-1 border w-[15%]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="">
                  {rows.map((item, index) => (
                    <tr key={index}>
                      <td className=" border">
                        {/* <input
                          className="w-full outline-none"
                          value={item.code}
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[index].code = e.target.value;
                            setRows(newRows);
                          }}
                        /> */}
                        <SelectWithSearch
                          options={accountsAll.map((item1) => ({
                            label: String(item1.id),
                            value: item1.code,
                          }))}
                          placeholder=""
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[index].code = e;
                            setRows(newRows);
                          }}
                          className="border-none"
                          noPadding1
                          value={
                            accountsAll.find(
                              (item2) => String(item.code) === String(item2.id),
                            )?.code
                          }
                          readOnly={type === 2 || type === 3}
                        />
                      </td>
                      <td className=" border ">
                        {/* <input
                          className="w-full outline-none"
                          value={item.name}
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[index].name = e.target.value;
                            setRows(newRows);
                          }}
                        /> */}
                        {/* <SelectWithSearch
                          options={accounts.map((item1) => ({
                            label: String(item1.id),
                            value: item1.name,
                          }))}
                          placeholder=""
                          onChange={(e) => {
                            let row = accounts.find(
                              (item2) => String(e) === String(item2.id),
                            );
                            const newRows = [...rows];

                            newRows[index].code = String(row?.id);
                            newRows[index].name = String(row?.name);
                            setRows(newRows);
                          }}
                          className="border-none"
                          noPadding1
                          value={
                            accounts.find(
                              (item2) => String(item.code) === String(item2.id),
                            )?.name
                          }
                          readOnly={type === 2 || type === 3}
                        /> */}
                        <SelectWithSearch1
                          options={accounts}
                          placeholder=""
                          onChange={(e) => {
                            let row = accountsAll.find(
                              (item2) => String(e) === String(item2.id),
                            );
                            const newRows = [...rows];

                            newRows[index].code = String(row?.id);
                            newRows[index].name = String(row?.name);
                            setRows(newRows);
                          }}
                          className="w-full border-none"
                          noPadding1
                          value={
                            accountsAll.find(
                              (item2) => item.code === String(item2.id),
                            )?.name
                          }
                          id={String(item.code)}
                        />
                      </td>
                      <td className=" border pr-2">
                        <input
                          className="w-full outline-none text-right"
                          value={
                            Number(item.debit) === 0
                              ? ""
                              : type === 1
                                ? item.debit
                                : formatMoney(item.debit)
                          }
                          disabled={item.credit !== ""}
                          onChange={(e) => {
                            let value = e.target.value.replace(/,/g, ""); // remove commas for validation

                            // Allow only numbers and up to 2 decimals
                            if (/^\d*\.?\d{0,2}$/.test(value)) {
                              const newRows = [...rows];
                              newRows[index].debit = value;
                              setRows(newRows);
                            }
                          }}
                          onBlur={() => {
                            const newRows = [...rows];
                            const num = parseFloat(item.debit);

                            if (!isNaN(num)) {
                              // Format with commas and 2 decimals
                              newRows[index].debit = num.toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              );
                            } else {
                              newRows[index].debit = "";
                            }

                            setRows(newRows);
                          }}
                          onFocus={(e) => {
                            // remove formatting while editing
                            const newRows = [...rows];
                            newRows[index].debit = item.debit.replace(/,/g, "");
                            setRows(newRows);
                          }}
                          readOnly={type === 2}
                        />
                      </td>
                      <td className=" border pr-2">
                        <input
                          className="w-full outline-none text-right"
                          disabled={item.debit !== ""}
                          value={
                            Number(item.credit) === 0
                              ? ""
                              : type === 1
                                ? item.credit
                                : formatMoney(item.credit)
                          }
                          onChange={(e) => {
                            let value = e.target.value.replace(/,/g, ""); // remove commas for validation

                            // Allow only numbers and up to 2 decimals
                            if (/^\d*\.?\d{0,2}$/.test(value)) {
                              const newRows = [...rows];
                              newRows[index].credit = value;
                              setRows(newRows);
                            }
                          }}
                          onBlur={() => {
                            const newRows = [...rows];
                            const num = parseFloat(item.credit);

                            if (!isNaN(num)) {
                              // Format with commas and 2 decimals
                              newRows[index].credit = num.toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              );
                            } else {
                              newRows[index].credit = "";
                            }

                            setRows(newRows);
                          }}
                          onFocus={(e) => {
                            // remove formatting while editing
                            const newRows = [...rows];
                            newRows[index].credit = item.credit.replace(
                              /,/g,
                              "",
                            );
                            setRows(newRows);
                          }}
                          readOnly={type === 2}
                        />
                      </td>
                      <td className=" border">
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
                          className="border-none"
                          noPadding1
                          value={
                            customer.find(
                              (item2) =>
                                String(item.customer) === String(item2.id),
                            )?.name
                          }
                          readOnly={type === 2 || type === 3}
                        />
                      </td>
                      <td className=" border">
                        <input
                          className="w-full outline-none"
                          value={item.remarks}
                          onChange={(e) => {
                            const newRows = [...rows];
                            newRows[index].remarks = e.target.value;
                            setRows(newRows);
                          }}
                          readOnly={type === 2}
                        />
                      </td>
                    </tr>
                  ))}
                  {/* <tr>
                         <td colSpan={6} className="">
                           <div className="py-2 flex justify-end w-full">
                             <Button
                               size={"sm"}
                               variant={"primary"}
                               // onClick={addRow}
                             >
                               Add Row
                             </Button>
                           </div>
                         </td>
                       </tr> */}

                  <tr className="sticky bottom-0 z-10 bg-white">
                    <td colSpan={2} className="p-1 border"></td>
                    <td className="p-1 border text-right pr-2">
                      {formatMoney(totalDebit)}
                    </td>
                    <td className="p-1 border text-right pr-2">
                      {formatMoney(totalCredit)}
                    </td>
                    <td colSpan={2} className="p-1 border"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="py-2 flex justify-end w-full">
              {type === 2 ? (
                <Button
                  size={"sm"}
                  variant={"second"}
                  onClick={() => setOpenAdd(false)}
                >
                  Close
                </Button>
              ) : (
                // <Button
                //   size={"sm"}
                //   variant={"primary"}
                //   onClick={submitJE}
                //   disabled={
                //     !(
                //       totalDebit === totalCredit &&
                //       String(totalDebit) !== "0.00" &&
                //       String(totalDebit) !== "0"
                //     )
                //   }
                // >
                //   Add Journal Entry
                // </Button>

                <YesNo
                  title={
                    <Button
                      size="sm"
                      variant="primary"
                      className="px-8"
                      onClick={() => {
                        if (totalDebit !== totalCredit) {
                          toast.error("Debit and Credit must be equal.");
                        }
                      }}
                      disabled={
                        !(
                          totalDebit === totalCredit &&
                          String(totalDebit) !== "0.00" &&
                          String(totalDebit) !== "0"
                        ) && addLoading
                      }
                    >
                      Add Journal Entry
                    </Button>
                  }
                  funct={submitJE}
                  message={`Are you sure you want to Add this Journal Entry?`}
                  dis={
                    !(
                      totalDebit === totalCredit &&
                      String(totalDebit) !== "0.00" &&
                      String(totalDebit) !== "0"
                    )
                  }
                />
              )}
            </div>
          </div>
        </CustomDialog>
      )}

      {openUpload && (
        <CustomDialog
          close={setOpenUpload}
          title={``}
          width={`!w-[55vw]`}
          height={`h-[90vh]`}
          closeIcon={`Y`}
          button=""
        >
          <div className="flex flex-col py-2 gap-4">
            <div className="flex justify-between pt-2">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.xlsx,.xls"
                  hidden
                  onChange={handleFileSelect}
                />
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import Excel
                </Button>
              </div>

              <div className="flex items-center">
                {uploadTemplate && uploadTemplate.length === 0 && (
                  <Button
                    variant="link"
                    className="text-blue-600 underline"
                    onClick={async () => {
                      await exportJETemplate(
                        getCustomers?.data?.data,
                        getCOA?.data?.data,
                      );
                    }}
                  >
                    Download Template
                  </Button>
                )}
                {uploadTemplate.length > 0 && (
                  <Button variant={"second"} onClick={submitData}>
                    Upload
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full ">
                <tr>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    G/L Account
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    G/L Name
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Debit
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Credit
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Customer
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Remarks
                  </td>
                </tr>

                {uploadTemplate.map((item: any, index) => (
                  <tr key={index}>
                    <td className="p-1 border border-black">
                      {
                        getAccountsAll?.data?.data.find(
                          (item1: any) => String(item?.id) === String(item1.id),
                        )?.code
                      }
                    </td>
                    <td className="p-1 border border-black">
                      {
                        getAccountsAll?.data?.data.find(
                          (item1: any) => item?.id === item1.id,
                        )?.name
                      }
                    </td>
                    <td className="p-1 border border-black text-right ">
                      {item?.debit === "" ? `` : formatMoney(item?.debit)}
                    </td>
                    <td className="p-1 border border-black text-right ">
                      {item?.credit === "" ? `` : formatMoney(item?.credit)}
                    </td>
                    <td className="p-1 border border-black">
                      {
                        getCustomers?.data?.data.find(
                          (item1: any) => item?.customer_id === item1.id,
                        )?.name
                      }
                    </td>
                    <td className="p-1 border border-black">{item?.remarks}</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default JournalEntry;
