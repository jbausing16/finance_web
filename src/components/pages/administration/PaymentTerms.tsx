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
  useAddARTermsMutation,
  useAddPeriodMutation,
  useDelPeriodMutation,
  useGetARTermsPaymentQuery,
  useGetPeriodQuery,
  useUpARTermsMutation,
  useUpPeriodMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import { hasAccess } from "@/lib/utils";
import Empty from "@/components/reusables/Empty";

type period = {
  id: number;
  bank: string;
  name: string;
  no: string;
  code: string;
};

function PaymentTerms() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openYesNo, setOpenYesNo] = useState(false);
  const [type, setType] = useState(1);
  const [datas, setDatas] = useState<period[]>([]);

  const [data, setData] = useState({
    bank: "",
    name: "",
    no: "",
    code: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(3);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");

  const [editTerm, setEditTerm] = useState({
    id: 0,
    bank: "",
    name: "",
    no: "",
    code: "",
  });

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch1(search);
      setPage(1);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const getDatas = useGetARTermsPaymentQuery({ search: search1, page: page });

  useEffect(() => {
    if (getDatas.isSuccess && getDatas.data) {
      setDatas(getDatas.data.results);
      setTotalPages(Math.ceil(getDatas?.data?.count / 10));
      setCount(getDatas.data.count);
    }
  }, [getDatas.isSuccess, getDatas.data]);

  const [addPeriod] = useAddARTermsMutation();
  const [upPeriod] = useUpARTermsMutation();
  const submitAutoEntries = async () => {
    if (type === 1) {
      if (
        data.bank !== "" &&
        data.name !== "" &&
        data.no !== "" &&
        data.code !== ""
      ) {
        try {
          const formData = new FormData();
          formData.append("datas", JSON.stringify(data));

          const checkstat = await addPeriod(formData).unwrap();

          if (checkstat.success) {
            setOpenAdd(false);
            toast.success("Successfully Added.");
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
        formData.append("datas", JSON.stringify(editTerm));

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

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="A/R Payment Terms" />
          {!hasAccess(access, "14", "view") ? (
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
                  placeholder="Search Bank Name"
                  className="max-w-80"
                />

                {hasAccess(access, "14", "create") && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setType(1);
                      setOpenAdd(true);
                    }}
                  >
                    Add Payment Terms
                  </Button>
                )}
              </div>

              <div className="h-[415px] overflow-auto ">
                <Table className="shadow-sm border ">
                  <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                    <TableRow className="">
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                        Bank Name
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        Account Name
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                        Account No.
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                        Swift Code
                      </TableHead>
                      <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="font-inter text-foreground">
                    {datas.map((item, idx) => (
                      <TableRow key={idx} className="">
                        <TableCell className="py-2 text-center">
                          <div
                            className="flex justify-center items-center h-full cursor-pointer"
                            onClick={() => {
                              setType(3);
                              setOpenAdd(true);
                              let newPeriod = datas.find(
                                (item1) => String(item1.id) === String(item.id),
                              );
                              if (newPeriod) {
                                setEditTerm(newPeriod);
                              }
                            }}
                          >
                            {item.bank}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {item.name}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {item.no}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {item.code}
                        </TableCell>
                        <TableCell className="py-2 text-center align-middle">
                          <div
                            className="flex justify-center items-center h-full cursor-pointer"
                            onClick={() => {
                              if (hasAccess(access, "14", "edit")) {
                                setType(2);
                                setOpenAdd(true);
                                let newPeriod = datas.find(
                                  (item1) =>
                                    String(item1.id) === String(item.id),
                                );
                                if (newPeriod) {
                                  setEditTerm(newPeriod);
                                }
                              }
                            }}
                          >
                            <SquarePen
                              size={18}
                              className={`text-blue-700 ${!hasAccess(access, "14", "edit") ? `cursor-not-allowed` : ``}`}
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
          title={`${
            type === 1 ? `Add` : type === 2 ? `Edit` : `View`
          } A/R Payment Terms`}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 py-5 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Bank</Label>
              <Input
                type="text"
                placeholder="Bank"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setData({ ...data, bank: e.target.value });
                  } else {
                    setEditTerm({ ...editTerm, bank: e.target.value });
                  }
                }}
                value={type === 1 ? data.bank : editTerm.bank}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Account Name</Label>
              <Input
                type="text"
                placeholder="Account Name"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setData({ ...data, name: e.target.value });
                  } else {
                    setEditTerm({ ...editTerm, name: e.target.value });
                  }
                }}
                value={type === 1 ? data.name : editTerm.name}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Account No</Label>
              <Input
                type="text"
                placeholder="Account Code"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setData({ ...data, no: e.target.value });
                  } else {
                    setEditTerm({ ...editTerm, no: e.target.value });
                  }
                }}
                value={type === 1 ? data.no : editTerm.no}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Swift Code</Label>
              <Input
                type="text"
                placeholder="Swift Code"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setData({ ...data, code: e.target.value });
                  } else {
                    setEditTerm({ ...editTerm, code: e.target.value });
                  }
                }}
                value={type === 1 ? data.code : editTerm.code}
                readOnly={type === 3}
              />
            </div>
          </div>

          <hr className="mb-5" />

          <div className="flex justify-between">
            <div className="flex justify-end gap-4 w-full">
              <Button
                size="sm"
                variant="second"
                onClick={() => setOpenAdd(false)}
              >
                Cancel
              </Button>

              {type !== 3 && (
                <Button size="sm" variant="primary" onClick={submitAutoEntries}>
                  {`${type === 1 ? `Add` : `Update`}`}
                </Button>
              )}
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default PaymentTerms;
