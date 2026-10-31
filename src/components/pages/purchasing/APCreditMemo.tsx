import React, { useEffect, useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../ui/sidebar";
import { AppSidebar } from "../../reusables/sidebar/app-sidebar";
import { Separator } from "../../ui/separator";
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
  Eye,
  EyeOff,
  ListFilter,
  LogOut,
  SquarePen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatDate1, formatMoney, hasAccess } from "@/lib/utils";
import Wtax from "./../sales/Wtax";
import {
  initialData,
  initialRows,
  initialWtax,
  type idName,
  type wtaxRate,
  type customer,
  getStatus,
} from "../sales/ARInvoice";
import {
  useGetAccountTypeQuery,
  useGetBPsQuery,
  useGetCMAPInvoicesQuery,
  useGetCMAPPreviewQuery,
  useGetVendorsQuery,
  useGetWtaxRateQuery,
} from "@/store/api/AdministrationApi";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import ViewEntry from "@/components/reusables/ViewEntry";
import { SelectWithSearch } from "@/components/ui/SelectWithSearch";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";

type wtax = {
  id: number;
  code: string;
  name: string;
  tax_amt: number;
  wtax_amt: number;
};

type invoices = {
  id: number;
  ap: string;
  no: string;
  date: string;
  status: number;
  vendor: string;
  total: number;
};

type choices = {
  id: number;
  code: string;
  type: number;
  level: number;
  name: string;
  child: any[];
};

function APCreditMemo() {
  const [invoices, setInvoices] = useState<invoices[]>([]);

  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [type, setType] = useState(1);

  const [totalWTax, setTotalWTax] = useState(0);
  const [wtaxOpt, setWtaxOpt] = useState<wtaxRate[]>([]);

  const [filtDate, setFiltDate] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [viewInvoice, setViewInvoice] = useState(0);
  const [currId, setCurrId] = useState(0);
  const [openEntry, setOpenEntry] = useState(false);

  const [customer, setCustomer] = useState<customer[]>([]);
  const [data, setData] = useState(initialData);
  const [rows, setRows] = useState(initialRows);
  const [accounts, setAccounts] = useState<idName[]>([]);
  const [accountsAll, setAccountsAll] = useState<choices[]>([]);
  const [wtax, setWtax] = useState<wtax[]>(initialWtax);
  // console.log(customer);

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

  const getBPs = useGetBPsQuery({ type: 1 });
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setCustomer(getBPs.data.data);
      // console.log("Cust: ", getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getInvoices = useGetCMAPInvoicesQuery({
    page: page,
    type: filter1.type,
    date: filter1.date,
    from: filter1.from,
    to: filter1.to,
    status: filter1.status,
    search: search1,
  });
  useEffect(() => {
    if (getInvoices.isSuccess && getInvoices.data) {
      setInvoices(getInvoices.data.results);
      setTotalPages(Math.ceil(getInvoices?.data?.count / 10));
      setCount(getInvoices.data.count);
    }
  }, [getInvoices.isSuccess, getInvoices.data]);

  const getWtax = useGetWtaxRateQuery({});
  useEffect(() => {
    if (getWtax.isSuccess && getWtax.data) {
      setWtaxOpt(getWtax.data.data);
    }
  }, [getWtax.isSuccess, getWtax.data]);

  const getAccounts = useGetAccountTypeQuery({ type: 6 });
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      setAccounts(getAccounts.data.data);
      // console.log("Acc: ", getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  const getAccountsAll = useGetAccountTypeQuery({ type: 0 });
  useEffect(() => {
    if (getAccountsAll.isSuccess && getAccountsAll.data) {
      setAccountsAll(getAccountsAll.data.data);
    }
  }, [getAccountsAll.isSuccess, getAccountsAll.data]);

  const taxableAmt = rows.reduce(
    (sum, row) =>
      sum +
      (row.wtax === "1"
        ? (parseFloat(row.amount?.toString().replace(/,/g, "")) || 0) -
          (parseFloat(row.discount?.toString().replace(/,/g, "")) || 0)
        : 0),
    0,
  );

  const getInvPrev = useGetCMAPPreviewQuery(viewInvoice, {
    skip: viewInvoice === 0,
  });
  useEffect(() => {
    if (getInvPrev.isSuccess && getInvPrev.data) {
      const rows = getInvPrev.data.data.rows;

      // Ensure at least 10 rows
      const minimumRows = 10;
      const filledRows = [...rows]; // Start with the rows from the API

      // If there are fewer than 10 rows, fill the remaining spots with empty rows
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          description: "",
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

      setData(getInvPrev.data.data);
      setRows(filledRows);
      setWtax(filledTax);
    }
  }, [getInvPrev.isSuccess, getInvPrev.data]);

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="A/P Credit Memo" />
          {!hasAccess(access, "22", "view") ? (
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
                                    <SelectItem value={String(item.id)} key={i}>
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
                </div>

                <div></div>
              </div>

              <Table className="shadow-sm border">
                <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                  <TableRow className="">
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                      Transaction No.
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Invoice Origin
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Vendor
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Status
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Date
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="font-inter text-foreground">
                  {invoices.map((item, idx) => (
                    <ContextMenu key={idx}>
                      <ContextMenuTrigger asChild>
                        <TableRow
                          className={`cursor-pointer ${
                            currId === item.id ? `bg-gray-100` : ``
                          }`}
                          onClick={() => setCurrId(item.id)}
                          onContextMenu={() => setCurrId(item.id)}
                        >
                          <TableCell
                            className="py-2 text-center "
                            onClick={() => {
                              setType(2);
                              setOpenAdd(false);
                              // setViewInvoice(item.id);
                              setTimeout(() => {
                                // allow state to update
                                setViewInvoice(item.id);
                                setOpenAdd(true);
                              }, 0);
                            }}
                          >
                            <span className="text-blue-800 underline cursor-pointer font-medium">
                              {item.no}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.ap}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.vendor}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className={getStatus(item.status)?.style}>
                              {getStatus(item.status)?.name}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.date}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {formatMoney(item.total)}
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>

                      {/* Context Menu Items */}
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => setOpenEntry(true)}>
                          Journal Entry
                        </ContextMenuItem>
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
                      <SelectWithSearch
                        options={customer.map((item) => ({
                          label: String(item.id),
                          value: item.code,
                        }))}
                        placeholder="Customer Code"
                        noPadding
                        className="w-2/3"
                        value={data.ccode}
                        readOnly
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
                        className="w-full "
                        type="text"
                        value={data.invoice}
                        readOnly
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
                      <SelectWithSearch
                        options={customer.map((item) => ({
                          label: String(item.id),
                          value: item.name,
                        }))}
                        placeholder="Customer Name"
                        noPadding
                        className="w-2/3"
                        value={data.cname}
                        readOnly
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
                        readOnly
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
                        readOnly
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
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 pb-4">
                  <div className="grid grid-cols-3">
                    <div className=" border-b ">
                      <span className="text-sm">PO No.</span>
                    </div>
                    <div className="grid col-span-2">
                      <Input
                        noPadding
                        className="w-2/3"
                        type="text"
                        value={data.po}
                        readOnly
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
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* <div className="my-4 shadow pt-1"> */}
                <div className="max-h-56 overflow-y-auto py-0 shadow">
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
                              readOnly
                            />
                          </td>
                          <td className="p-0 border">
                            <SelectWithSearch
                              options={accounts.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              className="w-36 border-none"
                              noPadding1
                              value={
                                accountsAll.find(
                                  (item2) =>
                                    String(item.account) === String(item2.id),
                                )?.name
                              }
                              readOnly={type === 2 || type === 3}
                            />
                          </td>
                          <td className="p-0 border">
                            <SelectWithSearch
                              options={customer.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              className="w-36 border-none"
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
                          <td className="p-1 border">
                            <select
                              className="outline-none text-sm appearance-none w-full text-center"
                              value={item.vatable}
                              disabled={type === 2 || type === 3}
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
                              disabled={type === 2 || type === 3}
                            >
                              <option value={0}></option>
                              <option value={1}>Yes</option>
                              <option value={2}>No</option>
                            </select>
                          </td>
                          <td className="p-1 border">
                            <input
                              className="w-full outline-none text-right"
                              value={
                                type === 1 || type === 4
                                  ? item.discount
                                  : Number(item.discount) === 0
                                    ? ``
                                    : formatMoney(Number(item.discount))
                              }
                              readOnly={type === 2 || type === 3}
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
                              readOnly={type === 2 || type === 3}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* </div> */}

                <div className="grid grid-cols-2 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm ">Remarks</span>
                    <Textarea
                      className="w-full h-24 resize-none rounded-none"
                      value={
                        type === 3
                          ? `${
                              data.remarks === "" ? "" : data.remarks + ". "
                            }Cancellation of invoice ${data.invoice}.`
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
                          value={formatMoney(Number(data.pricebefvat))}
                        />
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
                          value={formatMoney(Number(data.discount))}
                        />
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
                          value={formatMoney(Number(data.vat))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-5">
                      <div></div>
                      <div className=" border-b col-span-2">
                        <span className="text-sm flex items-center justify-between">
                          WTax
                          <Wtax
                            wtax={wtax}
                            setWtax={setWtax}
                            taxableAmt={taxableAmt}
                            wtaxOpt={wtaxOpt}
                            type={type}
                          />
                        </span>
                      </div>
                      <div className="flex col-span-2 justify-items-end gap-2">
                        <Input
                          noPadding
                          className="w-full text-right"
                          type="text"
                          readOnly
                          // value={formatMoney(Number(data.wtax))}
                          value={wtax.reduce(
                            (sum: number, row: any) => sum + row?.wtax_amt,
                            0,
                          )}
                        />
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
                          value={formatMoney(Number(data.total))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
            {/* Context Menu Items */}
            <ContextMenuContent>
              <ContextMenuItem onClick={() => setOpenEntry(true)}>
                Journal Entry
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

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
          <ViewEntry id={currId} origin={5} />

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
    </>
  );
}

export default APCreditMemo;
