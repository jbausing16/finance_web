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
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
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
import Header from "@/components/reusables/Header";
import {
  useGetApprovalsQuery,
  useGetDocNoQuery,
  useGetUsersClientQuery,
  useUpApprovalMutation,
  useUpDocNoMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";
import { hasAccess } from "@/lib/utils";

type docNo = {
  id: number;
  name: string;
  no: string;
};

function DocumentNumber() {
  const [openAdd, setOpenAdd] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [type, setType] = useState(1);

  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");

  const [editDocNum, setEditDocNum] = useState<docNo>({
    id: 0,
    name: "",
    no: "",
  });

  const [docNum, setDocNum] = useState<docNo[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch1(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const getDocNum = useGetDocNoQuery({ search: search1 });

  useEffect(() => {
    if (getDocNum.isSuccess && getDocNum.data) {
      setDocNum(getDocNum.data.data);
    }
  }, [getDocNum.isSuccess, getDocNum.data]);

  const [upDocNum] = useUpDocNoMutation();
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
          <Header title="Document Number" />
          {!hasAccess(access, "12", "view") ? (
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
                      placeholder="Search Module"
                      className="max-w-80"
                    />
                  </div>

                  <Table className="shadow-sm border">
                    <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                      <TableRow className="">
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 ">
                          <span className="cursor-pointer flex items-center">
                            Module
                          </span>
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3">
                          No.
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="font-inter text-foreground">
                      {docNum.map((item, idx) => (
                        <TableRow key={idx} className="">
                          <TableCell className="py-2 text-left">
                            {item.name}
                          </TableCell>
                          <TableCell className="py-2 text-left">
                            {item.no}
                          </TableCell>

                          <TableCell className="py-2 text-center align-middle">
                            <div
                              className="flex justify-center items-center h-full cursor-pointer"
                              onClick={() => {
                                if (hasAccess(access, "12", "edit")) {
                                  setType(2);
                                  setOpenAdd(true);
                                  setEditDocNum(item);
                                }
                              }}
                            >
                              <SquarePen
                                size={18}
                                className={`text-blue-700 ${!hasAccess(access, "12", "edit") ? `cursor-not-allowed` : ``}`}
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
          title={`${type === 1 ? `Add` : `Edit`} DocNum`}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 py-5 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Module</Label>
              <Input
                type="text"
                placeholder="Username"
                className={`w-full bg-gray-50`}
                value={editDocNum.name}
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
                    setEditDocNum({ ...editDocNum, no: value });
                  }
                }}
                value={editDocNum.no}
              />
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

export default DocumentNumber;
