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
  useAddUserMutation,
  useGetClientsQuery,
  useGetRolesQuery,
  useGetTypesQuery,
  useGetUsersQuery,
  useUpUserMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { data } from "react-router-dom";
import { Loading } from "@/components/reusables/Loading";
import { hasAccess } from "@/lib/utils";
import Empty from "@/components/reusables/Empty";

type user = {
  id: number;
  position: string;
  email: string;
  username: string;
  image: string;
  signature: string;
  client: string;
  role: string;
  type: string;
  status: number;
};

type role = {
  id: number;
  name: string;
};

type allUser = {
  client: number;
  email: string;
  fname: string;
  id: number;
  image: string;
  lname: string;
  phone: string;
  position: string;
  role: number;
  signature: string;
  status: number;
  type: number;
  username: string;
  password: string;
};

function Users() {
  const apiDomain = import.meta.env.VITE_API_BASE;
  const [users, setUsers] = useState<user[]>([]);

  const [addUser, setAddUser] = useState({
    username: "",
    password: "",
    email: "",
    fname: "",
    lname: "",
    phone: "",
    type: "3",
    role: "1",
    client: "1",
    position: "",
  });

  const [allusers, setAllUsers] = useState<allUser[]>([]);

  const [editUser, setEditUser] = useState({
    client: 1,
    email: "",
    fname: "",
    id: 0,
    image: "",
    lname: "",
    phone: "",
    position: "",
    role: 0,
    signature: "",
    status: 0,
    type: 0,
    username: "",
    password: "",
  });

  const [addProfile, setAddProfile] = useState<File | null>(null);
  const [addSignature, setAddSignature] = useState<File | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [type, setType] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const [roles, setRoles] = useState<role[]>([]);
  const [types, setTypes] = useState<role[]>([]);
  const [clients, setClients] = useState<role[]>([]);

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddProfile(file);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddSignature(file);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchUser(search);
      setPage(1);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const getRoles = useGetRolesQuery({ cid: addUser.client });
  const getTypes = useGetTypesQuery({});
  const getClients = useGetClientsQuery({});
  const getUsers = useGetUsersQuery({ search: searchUser, page: page });

  useEffect(() => {
    if (getRoles.isSuccess && getRoles.data) {
      setRoles(getRoles.data.data);
    }
  }, [getRoles.isSuccess, getRoles.data]);

  useEffect(() => {
    if (getTypes.isSuccess && getTypes.data) {
      setTypes(getTypes.data.data);
    }
  }, [getTypes.isSuccess, getTypes.data]);

  useEffect(() => {
    if (getClients.isSuccess && getClients.data) {
      setClients(getClients.data.data);
    }
  }, [getClients.isSuccess, getClients.data]);

  useEffect(() => {
    if (getUsers.isSuccess && getUsers.data) {
      setUsers(getUsers.data.results);
      setAllUsers(getUsers.data.results);
      setTotalPages(Math.ceil(getUsers?.data?.count / 10));
      setCount(getUsers.data.count);
    }
  }, [getUsers.isSuccess, getUsers.data]);

  const [addUserApi] = useAddUserMutation();
  const [upUserApi] = useUpUserMutation();
  const submitUser = async () => {
    if (type === 1) {
      if (
        addUser.username !== "" &&
        addUser.password !== "" &&
        addUser.email !== "" &&
        addUser.fname !== "" &&
        addUser.lname !== ""
      ) {
        try {
          const formData = new FormData();
          formData.append("datas", JSON.stringify(addUser));
          if (addProfile) {
            formData.append("profile", addProfile);
          }
          if (addSignature) {
            formData.append("sign", addSignature);
          }

          const checkstat = await addUserApi(formData).unwrap();

          if (checkstat.success) {
            setOpenAdd(false);
            toast.success("Successfully Added.");
          } else {
            toast.error(checkstat.message);
          }

          console.log(checkstat);
        } catch (error) {}
      } else {
        toast.error("Please complete required fields.");
      }
    } else {
      if (
        editUser.username !== "" &&
        editUser.email !== "" &&
        editUser.fname !== "" &&
        editUser.lname !== ""
      ) {
        try {
          const formData = new FormData();
          formData.append("datas", JSON.stringify(editUser));
          if (addProfile) {
            formData.append("profile", addProfile);
          }
          if (addSignature) {
            formData.append("sign", addSignature);
          }
          const checkstat = await upUserApi(formData).unwrap();
          if (checkstat.success) {
            setOpenAdd(false);
            toast.success("Successfully Updated.");
          } else {
            toast.error(checkstat.message);
          }
          console.log(checkstat);
        } catch (error) {}
      } else {
        toast.error("Please complete required fields.");
      }
    }
  };

  const rid = useSelector((state: RootState) => state.auth.role);
  const access = useSelector((state: RootState) => state.auth.access);
  // console.log("Access", access);
  if ((!access || access.length === 0) && rid !== 1) {
    return <Loading />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title={`Users `} />
          {!hasAccess(access, "8", "view") && rid !== 1 ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
              {getUsers.isLoading ? (
                <>
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-[230px]" />
                    <Skeleton className="h-10 w-[80px]" />
                  </div>
                  <Skeleton className="h-[400px] w-full " />
                </>
              ) : (
                <>
                  <div
                    className="flex justify-between items-center
            "
                  >
                    <SearchForm
                      search={search}
                      setSearch={setSearch}
                      placeholder="Search User"
                      className="max-w-80"
                    />

                    {(hasAccess(access, "8", "create") || rid === 1) && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setType(1);
                          setOpenAdd(true);
                          setAddUser({
                            username: "",
                            password: "",
                            email: "",
                            fname: "",
                            lname: "",
                            phone: "",
                            type: "3",
                            role: "1",
                            client: "1",
                            position: "",
                          });
                          setAddProfile(null);
                          setAddSignature(null);
                        }}
                      >
                        Add User
                      </Button>
                    )}
                  </div>

                  <Table className="shadow-sm border">
                    <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                      <TableRow className="">
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 ">
                          <span className="cursor-pointer flex items-center">
                            Role
                          </span>
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3">
                          Email
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold cursor-pointer py-3 text-center">
                          Username
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold text-center cursor-pointer py-3">
                          Profile Image
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Signature
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Client
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Position
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
                      {users.map((item, idx) => (
                        <TableRow key={idx} className="">
                          <TableCell className="py-2 text-left">
                            <span
                              onClick={() => {
                                setType(3);
                                setOpenAdd(true);

                                let newUser = allusers.find(
                                  (item1) =>
                                    String(item1.id) === String(item.id),
                                );
                                if (newUser) {
                                  setEditUser(newUser);
                                }
                              }}
                              className="underline font-medium cursor-pointer"
                            >
                              {
                                roles.find(
                                  (item1) =>
                                    String(item1.id) === String(item.role),
                                )?.name
                              }
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-left">
                            {item.email}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.username}
                          </TableCell>
                          <TableCell className="py-2 text-center align-middle">
                            <div className="flex justify-center items-center h-full cursor-pointer">
                              {item.image !== "" ? (
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={apiDomain + item.image}
                                    alt="@shadcn"
                                  />
                                  <AvatarFallback>{item.image}</AvatarFallback>
                                </Avatar>
                              ) : (
                                ""
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-center align-middle">
                            <div className="flex justify-center items-center h-full cursor-pointer">
                              {item.signature !== "" ? (
                                <img
                                  src={apiDomain + item.signature}
                                  className="h-5 w-12"
                                />
                              ) : (
                                ""
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {
                              clients.find(
                                (item1) =>
                                  String(item1.id) === String(item.client),
                              )?.name
                            }
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.position}
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
                                if (
                                  hasAccess(access, "8", "edit") ||
                                  rid === 1
                                ) {
                                  setType(2);
                                  setOpenAdd(true);
                                  setAddProfile(null);
                                  setAddSignature(null);
                                  let newUser = allusers.find(
                                    (item1) =>
                                      String(item1.id) === String(item.id),
                                  );
                                  if (newUser) {
                                    setEditUser(newUser);
                                  }
                                }
                              }}
                            >
                              <SquarePen
                                size={18}
                                className={`text-blue-700 ${!hasAccess(access, "8", "edit") && rid !== 1 ? `cursor-not-allowed` : ``}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center space-x-2 justify-end">
                    <div className="text-sm text-muted-foreground">
                      Showing{" "}
                      {count === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
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
                </>
              )}
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={`${type === 1 ? `Add` : type === 2 ? `Edit` : `View`} User`}
          width={`!w-[50vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 md:grid-cols-3 py-5 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Username<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Username"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, username: e.target.value });
                  } else {
                    setEditUser({ ...editUser, username: e.target.value });
                  }
                }}
                value={type === 1 ? addUser.username : editUser.username}
                readOnly={type > 1}
              />
            </div>

            <div className=" grid w-full items-center gap-2">
              <Label className="gap-0">
                Password
                <span className="text-blue-500 text-[9px] pl-1">
                  (Leave blank if not going to change)
                </span>
              </Label>
              <div className="relative">
                <Input
                  type={showPass === true ? `text` : `password`}
                  autoComplete="new-password"
                  placeholder="Enter Password"
                  className={`w-full bg-gray-50`}
                  onChange={(e) => {
                    if (type === 1) {
                      setAddUser({ ...addUser, password: e.target.value });
                    } else {
                      setEditUser({ ...editUser, password: e.target.value });
                    }
                  }}
                  value={type === 1 ? addUser.password : editUser.password}
                  readOnly={type > 2}
                />
                {showPass === false ? (
                  <EyeOff
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setShowPass(true)}
                  />
                ) : (
                  <Eye
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setShowPass(false)}
                  />
                )}
              </div>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="Email"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, email: e.target.value });
                  } else {
                    setEditUser({ ...editUser, email: e.target.value });
                  }
                }}
                value={type === 1 ? addUser.email : editUser.email}
                readOnly={type > 1}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                First Name<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="First Name"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, fname: e.target.value });
                  } else {
                    setEditUser({ ...editUser, fname: e.target.value });
                  }
                }}
                value={type === 1 ? addUser.fname : editUser.fname}
                readOnly={type > 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Last Name<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Last Name"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, lname: e.target.value });
                  } else {
                    setEditUser({ ...editUser, lname: e.target.value });
                  }
                }}
                value={type === 1 ? addUser.lname : editUser.lname}
                readOnly={type > 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Phone No</Label>
              <Input
                type="text"
                placeholder="Phone No"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 11) {
                    if (type === 1) {
                      setAddUser({ ...addUser, phone: value });
                    } else {
                      setEditUser({ ...editUser, phone: value });
                    }
                  }
                }}
                value={type === 1 ? addUser.phone : editUser.phone}
                readOnly={type > 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Profile Image</Label>
              <Input
                type="file"
                className={`w-full bg-gray-50`}
                onChange={handleProfileChange}
                disabled={type > 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Signature</Label>
              <Input
                type="file"
                className={`w-full bg-gray-50`}
                onChange={handleSignatureChange}
                disabled={type > 2}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">User Type</Label>
              <Select
                onValueChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, type: e });
                  } else {
                    setEditUser({ ...editUser, type: Number(e) });
                  }
                }}
                value={type === 1 ? addUser.type : String(editUser.type)}
                disabled={type > 2}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Standard" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Role</Label>
              <Select
                onValueChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, role: e });
                  } else {
                    setEditUser({ ...editUser, role: Number(e) });
                  }
                }}
                value={type === 1 ? addUser.role : String(editUser.role)}
                disabled={type > 2}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Book Keeper" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Client</Label>
              <Select
                onValueChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, client: e });
                  } else {
                    setEditUser({ ...editUser, client: Number(e) });
                  }
                }}
                value={type === 1 ? addUser.client : String(editUser.client)}
                disabled={type > 2}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Position</Label>
              <Input
                type="text"
                placeholder="Position"
                className={`w-full bg-gray-50`}
                onChange={(e) => {
                  if (type === 1) {
                    setAddUser({ ...addUser, position: e.target.value });
                  } else {
                    setEditUser({ ...editUser, position: e.target.value });
                  }
                }}
                value={type === 1 ? addUser.position : editUser.position}
                disabled={type > 2}
              />
            </div>

            {type > 1 && (
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Status</Label>
                <Select
                  onValueChange={(e) => {
                    setEditUser({ ...editUser, status: Number(e) });
                  }}
                  value={String(editUser.status)}
                  disabled={type > 2}
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
            )}
          </div>

          <hr className="mb-5" />

          <div className="flex justify-end gap-4">
            <Button
              size="sm"
              variant="second"
              onClick={() => setOpenAdd(false)}
            >
              {type === 3 ? `Close` : `Cancel`}
            </Button>

            {type !== 3 && (
              <Button size="sm" variant="primary" onClick={submitUser}>
                {`${type === 1 ? `Add` : `Update`} User`}
              </Button>
            )}
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default Users;
