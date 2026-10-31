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
  useGetUsersClientQuery,
  useUpApprovalMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import { hasAccess } from "@/lib/utils";
import Empty from "@/components/reusables/Empty";

type approval = {
  id: number;
  module: string;
  user: number;
  status: number;
};

type users = {
  id: number;
  fname: string;
  lname: string;
};

function Approval() {
  const [approval, setApproval] = useState<approval[]>([]);
  const [users, setUsers] = useState<users[]>([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState(1);

  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const [editApproval, setEditApproval] = useState({
    id: 0,
    module: "",
    user: 0,
    status: 1,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchUser(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // call the Api
  const getApproval = useGetApprovalsQuery({ search: searchUser });
  const getUsers = useGetUsersClientQuery({});

  useEffect(() => {
    if (getApproval.isSuccess && getApproval.data) {
      setApproval(getApproval.data.data);
    }
  }, [getApproval.isSuccess, getApproval.data]);

  useEffect(() => {
    if (getUsers.isSuccess && getUsers.data) {
      setUsers(getUsers.data.data);
    }
  }, [getUsers.isSuccess, getUsers.data]);

  // call the API and submit the form to update the changes.
  const [upApproval] = useUpApprovalMutation();
  const submitApproval = async () => {
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(editApproval));

      const checkstat = await upApproval(formData).unwrap();

      if (checkstat.success) {
        setOpenAdd(false);
        toast.success("Successfully Updated.");
      } else {
        toast.error(checkstat.message);
      }

      console.log(checkstat);
    } catch (error) {}
  };

  // Check the access
  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title=" Approval Process" />
          {!hasAccess(access, "9", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
              {getApproval.isLoading ? (
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
                  {/* Displaying all approval modules */}
                  <div className="max-h-[80vh] overflow-auto pb-10">
                    <Table className="shadow-sm border">
                      <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                        <TableRow className="">
                          <TableHead className="font-archivo text-muted-foreground font-semibold py-3 ">
                            <span className="cursor-pointer flex items-center">
                              Module
                            </span>
                          </TableHead>
                          <TableHead className="font-archivo text-muted-foreground font-semibold py-3">
                            User
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
                        {approval.map((item, idx) => (
                          <TableRow key={idx} className="">
                            <TableCell className="py-2 text-left">
                              {item.module}
                            </TableCell>
                            <TableCell className="py-2 text-left">
                              {
                                users.find(
                                  (item1) =>
                                    String(item1.id) === String(item.user),
                                )?.fname
                              }{" "}
                              {
                                users.find(
                                  (item1) =>
                                    String(item1.id) === String(item.user),
                                )?.lname
                              }
                            </TableCell>

                            <TableCell className="py-2 text-center align-middle">
                              <div className="flex justify-center items-center h-full cursor-pointer">
                                <Checkbox checked={item.status === 1} />
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-center align-middle">
                              <div
                                className="flex justify-center items-center h-full cursor-pointer"
                                onClick={() => {
                                  if (hasAccess(access, "9", "edit")) {
                                    setType(2);
                                    setOpenAdd(true);
                                    setEditApproval(item);
                                  }
                                }}
                              >
                                <SquarePen
                                  size={18}
                                  className={`text-blue-700 ${!hasAccess(access, "9", "edit") ? `cursor-not-allowed` : ``}`}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {/* Modal  for updating user in specific approval module */}
      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={`${type === 1 ? `Add` : `Edit`} Approval`}
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
                value={editApproval.module}
                readOnly
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">User Account</Label>
              <Select
                onValueChange={(e) => {
                  setEditApproval({ ...editApproval, user: Number(e) });
                }}
                value={String(editApproval.user)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((item) => (
                    <SelectItem value={String(item.id)}>
                      {item.fname} - {item.lname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Status</Label>
              <Select
                onValueChange={(e) => {
                  setEditApproval({ ...editApproval, status: Number(e) });
                }}
                value={String(editApproval.status)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose Status" />
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

            <Button size="sm" variant="primary" onClick={submitApproval}>
              {`${type === 1 ? `Add` : `Update`} Approval`}
            </Button>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default Approval;
