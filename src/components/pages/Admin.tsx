import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../reusables/sidebar/app-sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/reusables/sidebar/search-form";
import CustomDialog from "@/components/reusables/CustomDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Header from "@/components/reusables/Header";
import {
  useAddClientMutation,
  useAddInventoryMutation,
  useGetAccountTypeQuery,
  useGetBPsQuery,
  useGetClientsAllQuery,
  useGetInventoryQuery,
  useUpClientMutation,
  useUpInventoryMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import { SelectWithSearch } from "../ui/SelectWithSearch";
import { initialData, type idName } from "./sales/ARInvoice";
import { formatMoney } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";

type client = {
  id: number;
  name: string;
  alias: string;
  description: string;
  c_name: string;
  c_no: string;
  address: string;
  address1: string;
  tin: string;
  email: string;
  logo: string | File;
  license: string;
  status: number;
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

const initialState = {
  id: 1,
  name: "",
  alias: "",
  description: "",
  c_name: "",
  c_no: "",
  address: "",
  address1: "",
  tin: "",
  email: "",
  logo: "",
  license: "",
  status: 1,
};
function Admin() {
  const apiDomain = import.meta.env.VITE_API_BASE;
  const [openAdd, setOpenAdd] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [type, setType] = useState(1);

  const [addClient, setAddClient] = useState<client>(initialState);
  const [cli, setCli] = useState<client[]>([]);

  // const [currView, setCurrView] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(3);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");

  const [filter, setFilter] = useState(0);
  const [filter1, setFilter1] = useState(0);

  const [vendor, setVendor] = useState<customer[]>([]);
  const [cogsAcc, setCogsAcc] = useState<idName[]>([]);
  const [incAcc, setIncAcc] = useState<idName[]>([]);

  const resetAddClient = () => {
    setAddClient(initialState);
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getBPs = useGetBPsQuery({ type: 2 });
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setVendor(getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);

  const getIncAccounts = useGetAccountTypeQuery({ type: 4 });
  const getCogsAccounts = useGetAccountTypeQuery({ type: 5 });
  useEffect(() => {
    if (getIncAccounts.isSuccess && getIncAccounts.data) {
      setIncAcc(getIncAccounts.data.data);
    }
  }, [getIncAccounts.isSuccess, getIncAccounts.data]);
  useEffect(() => {
    if (getCogsAccounts.isSuccess && getCogsAccounts.data) {
      setCogsAcc(getCogsAccounts.data.data);
    }
  }, [getCogsAccounts.isSuccess, getCogsAccounts.data]);

  const getClients = useGetClientsAllQuery({ page: page });
  useEffect(() => {
    if (getClients.isSuccess && getClients.data) {
      setCli(getClients.data.results);
      setTotalPages(Math.ceil(getClients?.data?.count / 10));
      setCount(getClients.data.count);
    }
  }, [getClients.isSuccess, getClients.data]);

  const [addClientQue] = useAddClientMutation();
  const [upClientQue] = useUpClientMutation();
  const submitInventory = async () => {
    if (
      addClient.name !== "" &&
      addClient.alias !== "" &&
      addClient.address !== "" &&
      addClient.address1 !== "" &&
      addClient.tin !== "" &&
      addClient.license !== "" &&
      addClient.logo !== ""
    ) {
      try {
        const formData = new FormData();
        formData.append("datas", JSON.stringify(addClient));
        formData.append("logo", addClient?.logo);
        let checkstat: any;
        if (type === 1) {
          checkstat = await addClientQue(formData).unwrap();
        } else {
          checkstat = await upClientQue(formData).unwrap();
        }
        if (checkstat.success) {
          setOpenAdd(false);
          toast.success(checkstat.message);
          setAddClient(initialState);
        } else {
          toast.error(checkstat.message);
        }
      } catch (error) {}
    } else {
      toast.error("Please fill out required fields.");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch1(search);
      setFilter1(filter);
      setPage(1);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, filter]);
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Clients" />
          <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
            <div
              className="flex justify-between
            "
            >
              <div className="flex justify-between items-center gap-2 w-full">
                <SearchForm
                  search={search}
                  setSearch={setSearch}
                  placeholder="Search"
                  className="max-w-80"
                />

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setType(1);
                    setAddClient(initialState);
                    setOpenAdd(true);
                  }}
                >
                  Add Client
                </Button>
              </div>
            </div>

            <Table className="shadow-sm border">
              <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                <TableRow className="">
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Client Name
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Alias
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                    Description
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    TIN
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Email
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Logo
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                    License
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                    Status
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="font-inter text-foreground">
                {cli.map((item, idx) => (
                  <TableRow key={idx} className="">
                    <TableCell className="py-2 text-center">
                      <span
                        className="flex items-center gap-1 font-medium cursor-pointer"
                        onClick={() => {
                          setType(3);
                          setOpenAdd(true);
                          setAddClient(item);
                        }}
                      >
                        {item.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.alias}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.description}
                    </TableCell>

                    <TableCell className="py-2 text-center">
                      {item.tin}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.email}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <div className="flex justify-center">
                        {typeof item.logo === "string" ? (
                          <img
                            src={apiDomain + item.logo}
                            alt="logo"
                            className="h-6"
                          />
                        ) : (
                          <img
                            src={
                              item?.logo ? URL.createObjectURL(item?.logo) : ``
                            }
                            alt="logo"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.license}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.status === 1 ? (
                        <span className="p-1 px-2 rounded-2xl bg-green-400 text-green-900">
                          Active
                        </span>
                      ) : (
                        <span className="p-1 px-2 rounded-2xl bg-red-400 text-red-900">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <span
                        className="flex items-center justify-center gap-1 font-medium cursor-pointer"
                        onClick={() => {
                          setType(2);
                          setOpenAdd(true);
                          setAddClient(item);
                        }}
                      >
                        <PencilLine size={20} />
                      </span>
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
        </SidebarInset>
      </SidebarProvider>

      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={`${type === 1 ? `Add` : type === 2 ? `Edit` : `View`} Client`}
          width={`!w-[55vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 md:grid-cols-3 py-5 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Client Name <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Client Name"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, name: e.target.value })
                }
                value={addClient.name}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Alias <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Alias"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, alias: e.target.value })
                }
                value={addClient.alias}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Description</Label>
              <Input
                type="text"
                placeholder="Description"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, description: e.target.value })
                }
                value={addClient.description}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Contact Person</Label>
              <Input
                type="text"
                placeholder="Contact Person"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, c_name: e.target.value })
                }
                value={addClient.c_name}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Contact No</Label>
              <Input
                type="text"
                placeholder="Contact No"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, c_no: e.target.value })
                }
                value={addClient.c_no}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Address<span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Address"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, address: e.target.value })
                }
                value={addClient.address}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Address 1<span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Address 1"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, address1: e.target.value })
                }
                value={addClient.address1}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                TIN<span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="TIN"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, tin: e.target.value })
                }
                value={addClient.tin}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Email</Label>
              <Input
                type="text"
                placeholder="Email"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, email: e.target.value })
                }
                value={addClient.email}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Logo <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="file"
                accept="image/*"
                className="w-full bg-gray-50"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAddClient({ ...addClient, logo: file });
                  }
                }}
                disabled={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                License <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="0"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddClient({ ...addClient, license: e.target.value })
                }
                value={addClient.license}
                readOnly={type === 3}
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
              {type === 3 ? `Close` : `Cancel`}
            </Button>

            {type !== 3 && (
              <Button size="sm" variant="primary" onClick={submitInventory}>
                {type === 1 ? `Save` : `Update`}
              </Button>
            )}
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default Admin;
