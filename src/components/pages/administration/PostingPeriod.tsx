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
import { ChevronLeft, ChevronRight, SquarePen } from "lucide-react";
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
  useAddPeriodMutation,
  useDelPeriodMutation,
  useGetPeriodQuery,
  useUpPeriodMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import { hasAccess } from "@/lib/utils";
import Empty from "@/components/reusables/Empty";

type period = {
  id: number;
  year: string;
  name: string;
  from_date: string;
  to_date: string;
  status: number;
  client: number;
};

function generatePeriods(f_year: string, from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);
  const result = [];

  let id = 1;
  let periodStart = new Date(start);

  while (periodStart <= end) {
    // Next month's same day
    let nextMonth = new Date(periodStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Period end = day before nextMonth
    let periodEnd = new Date(nextMonth);
    periodEnd.setDate(periodEnd.getDate() - 1);

    // Make sure we do not go beyond final "to" date
    if (periodEnd > end) periodEnd = new Date(end);

    result.push({
      id: id++,
      p_period: `${periodStart.getFullYear()}-${periodStart.getMonth() + 1}`,
      f_year: f_year,
      status: 1,
      from: periodStart.toLocaleDateString("en-CA"),
      to: periodEnd.toLocaleDateString("en-CA"),
    });

    // Move start to next period
    periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() + 1);
  }

  return result;
}

function PostingPeriod() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openYesNo, setOpenYesNo] = useState(false);
  const [type, setType] = useState(1);
  const [period, setPeriod] = useState<period[]>([]);

  const [data, setData] = useState({
    f_year: "",
    from: "",
    to: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(3);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");

  const [editPosting, setEditPosting] = useState({
    id: 0,
    year: "",
    name: "",
    from_date: "",
    to_date: "",
    status: 0,
    client: 0,
  });

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  // useEffect(() => {
  //   if (data.f_year !== "" && data.from !== "" && data.to) {
  //     console.log(generatePeriods(data.f_year, data.from, data.to));
  //   }
  // }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch1(search);
      setPage(1);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const getPeriod = useGetPeriodQuery({ search: search1, page: page });

  useEffect(() => {
    if (getPeriod.isSuccess && getPeriod.data) {
      setPeriod(getPeriod.data.results);
      setTotalPages(Math.ceil(getPeriod?.data?.count / 10));
      setCount(getPeriod.data.count);
    }
  }, [getPeriod.isSuccess, getPeriod.data]);

  const [addPeriod] = useAddPeriodMutation();
  const [upPeriod] = useUpPeriodMutation();
  const submitAutoEntries = async () => {
    if (type === 1) {
      if (data.f_year !== "" && data.from !== "" && data.to !== "") {
        try {
          let newData = generatePeriods(data.f_year, data.from, data.to);
          const formData = new FormData();
          formData.append("datas", JSON.stringify(newData));

          const checkstat = await addPeriod(formData).unwrap();

          if (checkstat.success) {
            setOpenAdd(false);
            toast.success("Successfully Updated.");
          } else {
            toast.error(checkstat.message);
          }
        } catch (error) {}
      } else {
        toast.error("Please fill out required fields.");
      }
    } else {
      try {
        const formData = new FormData();
        formData.append("datas", JSON.stringify(editPosting));

        const checkstat = await upPeriod(formData).unwrap();

        if (checkstat.success) {
          setOpenAdd(false);
          toast.success("Successfully Updated.");
        } else {
          toast.error(checkstat.message);
        }
      } catch (error) {}
    }
  };

  const [delPeriod] = useDelPeriodMutation();

  const deletePeriod = async (id: number) => {
    try {
      const checkstat = await delPeriod(id).unwrap();

      if (checkstat.success) {
        setOpenYesNo(false);
        setOpenAdd(false);
        toast.success("Successfully Deleted.");
      } else {
        toast.error(checkstat.message);
      }
    } catch (error) {}
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
          <Header title="Posting Period" />
          {!hasAccess(access, "11", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
              <div
                className="flex justify-between
            "
              >
                <SearchForm
                  search={search}
                  setSearch={setSearch}
                  placeholder="Search Period"
                  className="max-w-80"
                />

                {hasAccess(access, "11", "create") && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setType(1);
                      setOpenAdd(true);
                    }}
                  >
                    Add Period
                  </Button>
                )}
              </div>

              <div className="h-[415px] overflow-auto ">
                <Table className="shadow-sm border ">
                  <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                    <TableRow className="">
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                        Posting Period
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        Fiscal Year
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                        Period Status
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                        From
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        To
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="font-inter text-foreground">
                    {period.map((item, idx) => (
                      <TableRow key={idx} className="">
                        <TableCell className="py-2 text-center">
                          {item.name}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {item.year}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {item.status === 1 ? `Open` : `Closed`}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {item.from_date}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {item.to_date}
                        </TableCell>
                        <TableCell className="py-2 text-center align-middle">
                          <div
                            className="flex justify-center items-center h-full cursor-pointer"
                            onClick={() => {
                              if (hasAccess(access, "11", "edit")) {
                                setType(2);
                                setOpenAdd(true);
                                let newPeriod = period.find(
                                  (item1) =>
                                    String(item1.id) === String(item.id),
                                );
                                if (newPeriod) {
                                  setEditPosting(newPeriod);
                                }
                              }
                            }}
                          >
                            <SquarePen
                              size={18}
                              className={`text-blue-700 ${!hasAccess(access, "11", "edit") ? `cursor-not-allowed` : ``}`}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
          title={`${type === 1 ? `Add` : `Edit`} Posting Period`}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 py-5 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Fiscal Year</Label>
              <Input
                type="text"
                placeholder="Fiscal Year"
                className={`w-full bg-gray-50`}
                onChange={(e) => setData({ ...data, f_year: e.target.value })}
                value={type === 1 ? data.f_year : editPosting.year}
                readOnly={type === 2}
              />
            </div>

            {type === 2 && (
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Posting Period</Label>
                <Input
                  type="text"
                  placeholder="Posting Period"
                  className={`w-full bg-gray-50`}
                  // onChange={(e) => setData({ ...data, from: e.target.value })}
                  value={editPosting.name}
                  readOnly={type === 2}
                />
              </div>
            )}

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">From</Label>
              <Input
                type="date"
                placeholder="From"
                className={`w-full bg-gray-50`}
                onChange={(e) => setData({ ...data, from: e.target.value })}
                value={type === 1 ? data.from : editPosting.from_date}
                readOnly={type === 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">To</Label>
              <Input
                type="date"
                placeholder="To"
                className={`w-full bg-gray-50`}
                onChange={(e) => setData({ ...data, to: e.target.value })}
                value={type === 1 ? data.to : editPosting.to_date}
                readOnly={type === 2}
              />
            </div>

            {type === 2 && (
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Status</Label>
                <Select
                  onValueChange={(e) => {
                    setEditPosting({ ...editPosting, status: Number(e) });
                  }}
                  value={String(editPosting.status)}
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

          <hr className="mb-5" />

          <div className="flex justify-between">
            <div>
              {/* <Button
                size="sm"
                variant="destructive"
                onClick={() => setOpenYesNo(true)}
              >
                Delete
              </Button> */}
            </div>
            <div className="flex justify-end gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => setOpenAdd(false)}
              >
                Cancel
              </Button>

              <Button size="sm" variant="primary" onClick={submitAutoEntries}>
                {`${type === 1 ? `Add` : `Update`}`}
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}

      {openYesNo && (
        <CustomDialog
          close={setOpenYesNo}
          title={``}
          width={`!w-[25vw]`}
          height={``}
          closeIcon={`N`}
          button=""
        >
          <div className="grid grid-cols-1 py-2 gap-4 ">
            <span className="text-lg font-bold text-center">
              Are you sure you want to delete this?
            </span>
            <div className="flex justify-between gap-4 ">
              <div className="flex w-1/2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePeriod(editPosting.id)}
                  className="w-full cursor-pointer"
                >
                  Yes
                </Button>
              </div>
              <div className="flex w-1/2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setOpenYesNo(false)}
                  className="w-full cursor-pointer"
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

export default PostingPeriod;
