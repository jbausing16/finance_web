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
import { ChevronLeft, ChevronRight, ListFilter, SquarePen } from "lucide-react";
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
import {
  useAddRecurMutation,
  useGetCustomersQuery,
  useGetRecTransQuery,
  useGetRecurringQuery,
  useUpRecurMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import ChooseAR from "@/components/reusables/ChooseAR";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import { hasAccess } from "@/lib/utils";
import Empty from "@/components/reusables/Empty";
import { formatDate1 } from "../financials/JournalEntry";

export type wtax = {
  id: number;
  code: string;
  name: string;
  tax_amt: number;
  wtax_amt: number;
};

type RecTrans = {
  id: number;
  date: string;
  date_exe: string;
  status: number;
};

type RecurringRow = {
  id: number;
  date: string;
};

type TemplateState = {
  id: number;
  name: string;
  template: number;
  rp: string;
  rd: string;
  sdate: string;
  valid: string;
  status: number;
  rows: RecurringRow[];
};

type Recurring = {
  id: number;
  ar: number | undefined;
  ap: number | undefined;
  name: string;
  period: number;
  date: number;
  sdate: string;
  next: string;
  valid: string;
  status: number;
};

function generateRecurringRows(
  rp: string,
  rd: string,
  sdate: string,
  valid: string,
): RecurringRow[] {
  const rows: RecurringRow[] = [];
  if (!sdate || !valid) return rows;

  const start = new Date(sdate);
  const end = new Date(valid);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const rdNum = parseInt(rd);

  const incrementMap: Record<string, number> = {
    "1": 1, // monthly
    "2": 3, // quarterly
    "3": 6, // semi annual
    "4": 12, // yearly
  };

  const inc = incrementMap[rp] || 1;

  function getRecurringDate(year: number, month: number): Date {
    if (rdNum === 29) {
      return new Date(year, month + 1, 0); // last day of month
    }

    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(rdNum, lastDay));
  }

  let current = getRecurringDate(start.getFullYear(), start.getMonth());

  // skip if before start date
  if (current < start) {
    current = getRecurringDate(start.getFullYear(), start.getMonth() + inc);
  }

  let id = 1;

  while (current <= end) {
    rows.push({
      id,
      date: formatDateLocal(current),
    });

    current = getRecurringDate(current.getFullYear(), current.getMonth() + inc);

    id++;
  }

  return rows;
}

function safeDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

function formatDateLocal(d: Date) {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const initial = {
  id: 1,
  name: "",
  template: 0,
  rp: "1",
  rd: "1",
  sdate: "",
  valid: "",
  status: 1,
  rows: [],
};

function RecurringTransaction() {
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openRecur, setOpenRecur] = useState(false);
  const [type, setType] = useState(1);
  const [currId, setCurrId] = useState(0);

  const [filtDate, setFiltDate] = useState(0);

  const [template, setTemplate] = useState<TemplateState>(initial);

  const [recurring, setRecurring] = useState<Recurring[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [recTrans, setRecTrans] = useState<RecTrans[]>([]);
  const [currentPage1, setCurrentPage1] = useState(1);
  const [page1, setPage1] = useState(1);
  const [pageSize1, setPageSize1] = useState(10);
  const [totalPages1, setTotalPages1] = useState(0);
  const [count1, setCount1] = useState(0);

  const [loading, setLoading] = useState(false);

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

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const handlePreviousPage1 = () => {
    setPage1(page1 - 1);
    setCurrentPage1(page1 - 1);
  };
  const handleNextPage1 = () => {
    setPage1(page1 + 1);
    setCurrentPage1(page1 + 1);
  };

  const handleChange = (field: keyof TemplateState, value: string | number) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (template.sdate && template.valid && template.rp && template.rd) {
      const rows = generateRecurringRows(
        template.rp,
        template.rd,
        template.sdate,
        template.valid,
      );

      setTemplate((prev) => ({
        ...prev,
        rows,
      }));

      console.log("Dates: ", rows);
    }
  }, [template.rp, template.rd, template.sdate, template.valid]);

  const getRecurring = useGetRecurringQuery({
    page: page,
    type: 1,
    type1: filter1.type,
    date: filter1.date,
    from: filter1.from,
    to: filter1.to,
    status: filter1.status,
    search: search,
  });
  useEffect(() => {
    if (getRecurring.isSuccess && getRecurring.data) {
      setRecurring(getRecurring.data.results);
      setTotalPages(Math.ceil(getRecurring?.data?.count / 10));
      setCount(getRecurring.data.count);
    }
  }, [getRecurring.isSuccess, getRecurring.data]);

  const [cust, setCust] = useState([]);
  const getCustomers = useGetCustomersQuery({});

  useEffect(() => {
    if (getCustomers.isSuccess && getCustomers.data) {
      setCust(getCustomers?.data?.data);
    }
  }, [getCustomers.isSuccess, getCustomers.data]);

  const getRecTrans = useGetRecTransQuery(
    { page: page1, id: currId },
    { skip: currId === 0 },
  );
  useEffect(() => {
    if (getRecTrans.isSuccess && getRecTrans.data) {
      setRecTrans(getRecTrans.data.results);
      setTotalPages1(Math.ceil(getRecTrans?.data?.count / 10));
      setCount1(getRecTrans.data.count);
    }
  }, [getRecTrans.isSuccess, getRecTrans.data]);

  const [addRecur] = useAddRecurMutation();
  const [upRecur] = useUpRecurMutation();
  const submitRecurring = async () => {
    if (
      template.name !== "" &&
      // template.template !== 0 &&
      template.rows.length !== 0
    ) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("datas", JSON.stringify(template));
        formData.append("type", String(1));
        console.log("Template: ", template);

        let checkstat: any;

        if (template.template === 0) {
          toast.error("Please choose document field.");
          setLoading(false);
        } else {
          if (type === 1) {
            checkstat = await addRecur(formData).unwrap();
          } else {
            checkstat = await upRecur(formData).unwrap();
          }

          if (checkstat.success) {
            setOpenAdd(false);
            setLoading(false);
            // setOpenCancel(false);
            toast.success(checkstat.message);
          } else {
            setLoading(false);
            toast.error(checkstat.message);
          }
        }
      } catch (error) {
        setLoading(false);
      }
    } else {
      toast.error("Please fill out required fields.");
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
          <Header title="Recurring Transactions" />
          {!hasAccess(access, "20", "view") ? (
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
                                    <SelectItem value={String(item.id)} key={i}>
                                      {item.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* <div className="grid w-full items-center gap-2">
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
                            )} */}

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
                                  <SelectItem value="2">Closed</SelectItem>
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

                <div>
                  {hasAccess(access, "20", "create") && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setType(1);
                        setOpenAdd(true);
                        setTemplate(initial);
                      }}
                    >
                      Add Transaction
                    </Button>
                  )}
                </div>
              </div>

              <Table className="shadow-sm border">
                <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                  <TableRow className="">
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                      Template
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Document Number
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Recurrence Period
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Recurrence Date
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Start Date
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Next Execution
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Valid Until
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Status
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="font-inter text-foreground">
                  {recurring.map((item, idx) => (
                    <TableRow key={idx} className="">
                      <TableCell className="py-2 text-center">
                        <span
                          onClick={() => {
                            // setType(2);
                            setCurrId(item.id);
                            setOpenRecur(true);
                          }}
                          className="text-blue-800 underline cursor-pointer font-medium"
                        >
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.ar}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.period}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.date === 1
                          ? `Every first day of the month`
                          : item.date === 29
                            ? `Every end of the month`
                            : `on ${item.date}`}
                      </TableCell>

                      <TableCell className="py-2 text-center">
                        {item.sdate}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.next}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.valid}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.status === 1 ? `Open` : `Closed`}
                      </TableCell>
                      <TableCell className="py-2 text-center align-middle">
                        <div
                          className="flex justify-center items-center h-full cursor-pointer"
                          onClick={() => {
                            if (hasAccess(access, "20", "edit")) {
                              setType(2);
                              setOpenAdd(true);
                              setTemplate({
                                ...template,
                                id: item.id,
                                name: item.name,
                                template: item.ar ?? 0,
                                rp:
                                  String(item.period) === "Monthly"
                                    ? "1"
                                    : String(item.period) === "Quarterly"
                                      ? "2"
                                      : String(item.period) === "Semi-Anually"
                                        ? "3"
                                        : "4",
                                rd: String(item.date ?? 0),
                                sdate: item.sdate,
                                valid: item.valid,
                                status: item.status,
                              });
                            }
                          }}
                        >
                          <SquarePen
                            size={18}
                            className={`text-blue-700 ${!hasAccess(access, "20", "edit") ? `cursor-not-allowed` : ``}`}
                          />
                        </div>
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
            type === 1
              ? `Add Recurring Transaction`
              : `Edit Recurring Transaction`
          }
          width={`!w-[40vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Template</Label>
              <Input
                type="text"
                placeholder="Template Name"
                className={`w-full bg-gray-50`}
                onChange={(e) => handleChange("name", e.target.value)}
                value={template.name}
                readOnly={type === 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Document</Label>
              {type === 2 ? (
                <Input
                  type="text"
                  placeholder="Choose Document"
                  className={`w-full bg-gray-50`}
                  value={template.template}
                  readOnly
                />
              ) : (
                <ChooseAR
                  value={template.template}
                  onChange={(val) =>
                    setTemplate({
                      ...template,
                      template: val,
                    })
                  }
                />
              )}
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Recurrence Period</Label>
              <Select
                onValueChange={(e) => handleChange("rp", e)}
                value={template.rp}
                disabled={type === 2}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monthly</SelectItem>
                  <SelectItem value="2">Quarterly</SelectItem>
                  <SelectItem value="3">Semi-Anually</SelectItem>
                  <SelectItem value="4">Anually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Recurrence Date</Label>
              <Select
                onValueChange={(e) => handleChange("rd", e)}
                value={template.rd}
                disabled={type === 2}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    Every first day of the month
                  </SelectItem>
                  {[...Array(27)].map((_, index) => {
                    const day = index + 2;
                    return (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    );
                  })}
                  <SelectItem value="29">Every end of the month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Start Date</Label>
              <Input
                type="date"
                className={`w-full bg-gray-50`}
                onChange={(e) => handleChange("sdate", e.target.value)}
                value={template.sdate}
                readOnly={type === 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Valid Until</Label>
              <Input
                type="date"
                className={`w-full bg-gray-50`}
                onChange={(e) => handleChange("valid", e.target.value)}
                value={template.valid}
                readOnly={type === 2}
              />
            </div>

            {type === 2 && (
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Status</Label>
                <Select
                  onValueChange={(e) => handleChange("status", e)}
                  value={String(template.status)}
                  disabled={template.status === 2}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Open" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Open</SelectItem>
                    <SelectItem value="2">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <hr className="my-5" />

          <div className="flex justify-between">
            <div></div>

            <div className="flex gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => {
                  setOpenAdd(false);
                  setTemplate(initial);
                }}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={submitRecurring}
                disabled={loading}
              >
                {!loading
                  ? `${type === 1 ? `Add` : `Update`}`
                  : `${type === 1 ? `Adding...` : `Updating...`}`}
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}

      {openRecur && (
        <CustomDialog
          close={setOpenRecur}
          title={recurring.find((item) => currId === item.id)?.name || ""}
          width={`!w-[40vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 gap-4 pt-4">
            <Table className="shadow-sm border">
              <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                <TableRow className="">
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                    Date
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Date Executed
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="font-inter text-foreground">
                {recTrans.map((item, idx) => (
                  <TableRow key={idx} className="">
                    <TableCell className="py-2 text-center">
                      <span className="text-blue-800 underline cursor-pointer font-medium">
                        {item.date}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.date_exe}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.status === 1 ? `Open` : `Closed`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center space-x-2 justify-end">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage1 - 1) * pageSize1 + 1} -{" "}
                {Math.min(currentPage1 * pageSize1, count1)} of {count1}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage1}
                disabled={currentPage1 === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage1}
                disabled={currentPage1 === totalPages1}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>

          <hr className="my-5" />

          <div className="flex justify-between">
            <div></div>

            <div className="flex gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => {
                  setOpenRecur(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default RecurringTransaction;
