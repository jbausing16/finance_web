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
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/reusables/sidebar/search-form";
import CustomDialog from "@/components/reusables/CustomDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Header from "@/components/reusables/Header";
import {
  useGetBanksQuery,
  useUpBankMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import { hasAccess } from "@/lib/utils";
import Empty from "@/components/reusables/Empty";

type banks = {
  id: number;
  account: string;
  check_no: string;
  status: number;
};

function BankSetUp() {
  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState(1);

  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");

  const [editDocNum, setEditDocNum] = useState<banks>({
    id: 0,
    account: "",
    check_no: "",
    status: 1,
  });

  const [banks, setBanks] = useState<banks[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch1(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const getDocNum = useGetBanksQuery({ search: search1 });

  useEffect(() => {
    if (getDocNum.isSuccess && getDocNum.data) {
      setBanks(getDocNum.data.data);
    }
  }, [getDocNum.isSuccess, getDocNum.data]);

  const [upDocNum] = useUpBankMutation();
  const submitDocNum = async () => {
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(editDocNum));

      const checkstat = await upDocNum(formData).unwrap();

      if (checkstat.success) {
        setOpenAdd(false);
        toast.success("Successfully Updated.");
      } else {
        toast.error(checkstat.message);
      }

      console.log(checkstat);
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
          <Header title="Bank Setup" />
          {!hasAccess(access, "13", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
              {getDocNum.isLoading ? (
                <>
                  <Skeleton className="h-10 w-[230px]" />
                  <Skeleton className="h-[550px] w-full " />
                </>
              ) : (
                <>
                  <div
                    className="flex justify-between
            "
                  >
                    <SearchForm
                      search={search}
                      setSearch={setSearch}
                      placeholder="Search Bank"
                      className="max-w-80"
                    />
                  </div>

                  <Table className="shadow-sm border">
                    <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                      <TableRow className="">
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 ">
                          <span className="cursor-pointer flex items-center">
                            Bank
                          </span>
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3">
                          Check No.
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Status
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="font-inter text-foreground">
                      {banks.map((item, idx) => (
                        <TableRow key={idx} className="">
                          <TableCell className="py-2 text-left">
                            {item.account}
                          </TableCell>
                          <TableCell className="py-2 text-left">
                            {item.check_no}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.status === 1 ? "Active" : "Inactive"}
                          </TableCell>

                          <TableCell className="py-2 text-center align-middle">
                            <div
                              className="flex justify-center items-center h-full cursor-pointer"
                              onClick={() => {
                                if (hasAccess(access, "13", "edit")) {
                                  setType(2);
                                  setOpenAdd(true);
                                  setEditDocNum(item);
                                }
                              }}
                            >
                              <SquarePen
                                size={18}
                                className={`text-blue-700 ${!hasAccess(access, "13", "edit") ? `cursor-not-allowed` : ``}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={`${type === 1 ? `Add` : `Edit`} Bank Setup`}
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
                placeholder="Username"
                className={`w-full bg-gray-50`}
                value={editDocNum.account}
                readOnly
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">No</Label>
              <Input
                type="text"
                placeholder="1000000001"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[\d]*$/.test(value)) {
                    setEditDocNum({ ...editDocNum, check_no: value });
                  }
                }}
                value={editDocNum.check_no}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Status</Label>
              <Select
                onValueChange={(e) => {
                  setEditDocNum({ ...editDocNum, status: Number(e) });
                }}
                value={String(editDocNum.status)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Open" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="2">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <hr className="mb-5" />

          <div className="flex justify-end gap-4">
            <Button
              size="sm"
              variant="second"
              onClick={() => setOpenAdd(false)}
            >
              Cancel
            </Button>

            <Button size="sm" variant="primary" onClick={submitDocNum}>
              {`${type === 1 ? `Add` : `Update`}`}
            </Button>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default BankSetUp;
