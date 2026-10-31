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
import { ChevronLeft, ChevronRight, Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/reusables/sidebar/search-form";
import CustomDialog from "@/components/reusables/CustomDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Header from "@/components/reusables/Header";
import {
  useAddRoleMutation,
  useGetClientsQuery,
  useGetModulesQuery,
  useGetRolesClientQuery,
  useUpRoles1Mutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { CheckboxCust } from "../ui/checkboxCust";
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

type role = {
  id: number;
  name: string;
  status: number;
  client: number;
};

type submodules = {
  id: number;
  name: string;
  view: boolean;
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

type modules = {
  name: string;
  list: submodules[];
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
function Access() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddR, setOpenAddR] = useState(false);
  const [type, setType] = useState(1);

  const [addClient, setAddClient] = useState<client>(initialState);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(3);
  const [count, setCount] = useState(0);

  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");

  const [filter, setFilter] = useState(0);
  const [filter1, setFilter1] = useState(0);
  const [counter, setCounter] = useState(0);

  const [roles, setRoles] = useState<role[]>([]);
  const [clients, setClients] = useState<role[]>([]);
  const [activeCli, setActiveCli] = useState("0");

  const [activeRole, setActiveRole] = useState("");
  const [activeRoleID, setActiveRoleID] = useState(0);

  const [mods, setMods] = useState<modules[]>([]);
  const [changedPerms, setChangedPerms] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [addRole, setAddRole] = useState({
    id: 0,
    client: 0,
    name: "",
    status: 1,
  });

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getRoles = useGetRolesClientQuery({ client: activeCli, page });
  //   console.log("Roles: ", getRoles?.data);

  useEffect(() => {
    if (getRoles.isSuccess && getRoles.data) {
      setRoles(getRoles?.data?.results);
      setTotalPages(Math.ceil(getRoles?.data?.count / 10));
      setCount(getRoles.data.count);
    }
  }, [getRoles.isSuccess, getRoles.data]);

  const getModules = useGetModulesQuery(
    {
      role: activeRoleID,
      counter: counter,
    },
    { skip: activeRoleID === 0 },
  );
  //   console.log("Modules: ", getModules?.data);
  useEffect(() => {
    if (getModules.isSuccess && getModules.data) {
      setMods(getModules?.data?.data);
    }
  }, [getModules.isSuccess, getModules.data]);

  const getClients = useGetClientsQuery({});
  useEffect(() => {
    if (getClients.isSuccess && getClients.data) {
      setClients(getClients.data.data);
    }
  }, [getClients.isSuccess, getClients.data]);

  const [upRoles1] = useUpRoles1Mutation();
  const submitAccess = async () => {
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(changedPerms));
      let checkstat: any;

      checkstat = await upRoles1(formData).unwrap();
      if (checkstat.success) {
        setOpenAdd(false);
        toast.success(checkstat.message);
        setAddClient(initialState);
      } else {
        toast.error(checkstat.message);
      }
    } catch (error) {}
  };

  const [addRole1] = useAddRoleMutation();
  const submitRole = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(addRole));
      let checkstat: any;

      if (addRole.id === 0) {
        if (addRole.client === 0 || addRole.name === "") {
          toast.error("Please complete required fields");
          return;
        }
      }

      checkstat = await addRole1(formData).unwrap();
      if (checkstat.success) {
        setLoading(false);
        setOpenAddR(false);
        toast.success(checkstat.message);
        setAddRole({
          id: 0,
          client: 0,
          name: "",
          status: 1,
        });
      } else {
        toast.error(checkstat.message);
        setLoading(false);
      }
    } catch (error) {}
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

  const handleCheckboxChange = (
    moduleIndex: number,
    subIndex: number,
    field: "view" | "create" | "edit" | "delete" | "access",
    value: boolean,
  ) => {
    const submodule = mods[moduleIndex].list[subIndex];

    let updated = { ...submodule, [field]: value };

    //  if create/edit/delete = true → force view + access
    if (["create", "edit", "delete"].includes(field) && value) {
      updated.view = true;
      updated.access = true;
    }

    //  if view = false → remove all dependent permissions
    if (field === "view" && !value) {
      updated = {
        ...updated,
        access: false,
        view: false,
        create: false,
        edit: false,
        delete: false,
      };
    }

    //  if all (create/edit/delete/view) are false → access false
    if (!updated.view && !updated.create && !updated.edit && !updated.delete) {
      updated.access = false;
    }

    setMods((prev) =>
      prev.map((mod, i) =>
        i === moduleIndex
          ? {
              ...mod,
              list: mod.list.map((sub, j) => (j === subIndex ? updated : sub)),
            }
          : mod,
      ),
    );

    setChangedPerms((prev) => {
      const existing = prev.find((p) => p.id === submodule.id);

      if (existing) {
        return prev.map((p) =>
          p.id === submodule.id ? { ...p, ...updated } : p,
        );
      }

      return [
        ...prev,
        {
          id: submodule.id,
          access: updated.access,
          view: updated.view,
          create: updated.create,
          edit: updated.edit,
          delete: updated.delete,
        },
      ];
    });
  };

  const isColumnChecked = (
    moduleIndex: number,
    field: "view" | "create" | "edit" | "delete",
  ) => {
    return mods[moduleIndex].list.every((sub) => sub[field]);
  };

  const handleColumnToggle = (
    moduleIndex: number,
    field: "view" | "create" | "edit" | "delete",
    value: boolean,
  ) => {
    const module = mods[moduleIndex];

    const updatedList = module.list.map((sub) => {
      let updated = { ...sub, [field]: value };

      if (value) {
        if (["create", "edit", "delete"].includes(field)) {
          updated.view = true;
          updated.access = true;
        }

        if (field === "view") {
          if (!value) {
            if (sub.create || sub.edit || sub.delete) {
              return sub;
            }

            updated.access = false;
          } else {
            updated.access = true;
          }
        }
      } else {
        if (field === "view") {
          updated = {
            ...updated,
            access: false,
            view: false,
            create: false,
            edit: false,
            delete: false,
          };
        }
      }

      return updated;
    });

    setMods((prev) =>
      prev.map((mod, i) =>
        i === moduleIndex ? { ...mod, list: updatedList } : mod,
      ),
    );

    setChangedPerms((prev) => {
      const updated = [...prev];

      updatedList.forEach((sub) => {
        const index = updated.findIndex((p) => p.id === sub.id);

        if (index !== -1) {
          updated[index] = { ...updated[index], ...sub };
        } else {
          updated.push({
            id: sub.id,
            access: sub.access,
            view: sub.view,
            create: sub.create,
            edit: sub.edit,
            delete: sub.delete,
          });
        }
      });

      return updated;
    });
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Access" />
          <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
            <div
              className="flex justify-between
            "
            >
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex gap-2">
                  <div className="grid w-64 items-center gap-2">
                    <Label className=" gap-0">Client</Label>
                    <Select
                      onValueChange={(e) => {
                        setActiveCli(e);
                      }}
                      value={activeCli}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose Client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All</SelectItem>
                        {clients.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid items-center gap-2">
                    <Label className=" gap-0">Search</Label>
                    <SearchForm
                      search={search}
                      setSearch={setSearch}
                      placeholder="Search Role"
                      className="w-44"
                    />
                  </div>
                </div>

                <div className="grid items-center gap-2">
                  <Label className=" gap-0">&nbsp;</Label>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setType(1);
                      setAddRole({
                        id: 0,
                        client: 0,
                        name: "",
                        status: 1,
                      });
                      setOpenAddR(true);
                    }}
                  >
                    Add Role
                  </Button>
                </div>
              </div>
            </div>

            <Table className="shadow-sm border">
              <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                <TableRow className="">
                  <TableHead className="font-archivo text-left text-muted-foreground font-semibold py-3">
                    Client Name
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Role
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Status
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                    Update
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="font-inter text-foreground">
                {roles.map((item, idx) => (
                  <TableRow key={idx} className="">
                    <TableCell className="py-2 text-center">
                      <span className="flex items-center gap-1 font-medium cursor-pointer">
                        {
                          clients.find((item1: any) => item.client === item1.id)
                            ?.name
                        }
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <span
                        className="hover:underline"
                        onClick={() => {
                          setType(2);
                          setOpenAddR(true);
                          setAddRole({
                            ...addRole,
                            id: item.id,
                            client: item.client,
                            name: item.name,
                            status: item.status,
                          });
                        }}
                      >
                        {item.name}
                      </span>
                    </TableCell>

                    <TableCell className="py-2 text-center">
                      {item.status === 1 ? (
                        <span className="bg-green-300 p-1 px-2 text-green-800 rounded-lg ">
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-300 p-1 px-2 text-red-800 rounded-lg ">
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-2 text-center">
                      <span
                        className="flex items-center justify-center gap-1 font-medium cursor-pointer"
                        onClick={() => {
                          setCounter((prev) => prev + 1);
                          setChangedPerms([]);
                          setType(2);
                          setOpenAdd(true);
                          setActiveRole(item.name);
                          setActiveRoleID(item.id);
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
          title={`${activeRole}`}
          width={`!w-[45vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="overflow-y-auto">
            <Accordion
              type="multiple"
              // collapsible
              // defaultValue="shipping"
              className="max-w-2xl  !h-[70vh]"
            >
              {mods.map((item: modules, i: number) => (
                <>
                  <AccordionItem value={String(i)} className="">
                    <AccordionTrigger key={i} className=" p-2 pb-0">
                      {item.name}
                    </AccordionTrigger>
                    <AccordionContent className="p-2 pt-0">
                      <table className="w-full">
                        <tr>
                          <td width={"40%"} className="pl-4 pb-2"></td>

                          <td
                            align="center"
                            className="pb-1 cursor-pointer"
                            onClick={() => {
                              const current = isColumnChecked(i, "view");
                              handleColumnToggle(i, "view", !current);
                            }}
                          >
                            <div className="text-xs">View</div>
                          </td>

                          <td
                            align="center"
                            className="pb-1 cursor-pointer"
                            onClick={() => {
                              const current = isColumnChecked(i, "create");
                              handleColumnToggle(i, "create", !current);
                            }}
                          >
                            <div className="text-xs">Add</div>
                          </td>

                          <td
                            align="center"
                            className="pb-1 cursor-pointer"
                            onClick={() => {
                              const current = isColumnChecked(i, "edit");
                              handleColumnToggle(i, "edit", !current);
                            }}
                          >
                            <div className="text-xs">Edit</div>
                          </td>

                          <td
                            align="center"
                            className="pb-1 cursor-pointer"
                            onClick={() => {
                              const current = isColumnChecked(i, "delete");
                              handleColumnToggle(i, "delete", !current);
                            }}
                          >
                            <div className="text-xs">Delete</div>
                          </td>
                        </tr>
                        {item.list.map((item1, j) => (
                          <tr>
                            <td width={"40%"} className="pl-4 pb-1">
                              {item1.name}
                            </td>
                            <td width={"15%"} align="center" className="pb-1">
                              <CheckboxCust
                                checked={item1.view}
                                onCheckedChange={(val) =>
                                  handleCheckboxChange(i, j, "view", !!val)
                                }
                              />
                            </td>
                            <td width={"15%"} align="center" className="pb-1">
                              <CheckboxCust
                                checked={item1.create}
                                onCheckedChange={(val) =>
                                  handleCheckboxChange(i, j, "create", !!val)
                                }
                              />
                            </td>
                            <td width={"15%"} align="center" className="pb-1">
                              <CheckboxCust
                                checked={item1.edit}
                                onCheckedChange={(val) =>
                                  handleCheckboxChange(i, j, "edit", !!val)
                                }
                              />
                            </td>
                            <td width={"15%"} align="center" className="pb-1">
                              <CheckboxCust
                                checked={item1.delete}
                                onCheckedChange={(val) =>
                                  handleCheckboxChange(i, j, "delete", !!val)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </table>
                    </AccordionContent>
                  </AccordionItem>
                </>
              ))}
            </Accordion>
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

            <Button
              size="sm"
              variant="primary"
              onClick={submitAccess}
              disabled={changedPerms.length === 0 || loading}
            >
              {type === 1 ? `Save` : `Update`}{" "}
              {loading && <Loader2 className="animate-spin" />}
            </Button>
          </div>
        </CustomDialog>
      )}

      {openAddR && (
        <CustomDialog
          close={setOpenAddR}
          title={`${type === 1 ? `Add` : `Update`} Role`}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div>
            <div className="flex flex-col gap-2">
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">
                  Client <span className="text-red-500 pl-1">*</span>
                </Label>
                <Select
                  onValueChange={(e) => {
                    setAddRole({ ...addRole, client: Number(e) });
                  }}
                  value={String(addRole.client)}
                  disabled={type === 2}
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
                <Label className=" gap-0">
                  Role Name <span className="text-red-500 pl-1">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Role Name"
                  className={`w-full bg-gray-50`}
                  onChange={(e) => {
                    setAddRole({ ...addRole, name: e.target.value });
                  }}
                  value={addRole.name}
                />
              </div>
              {type === 2 && (
                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Status</Label>
                  <Select
                    onValueChange={(e) => {
                      setAddRole({ ...addRole, status: Number(e) });
                    }}
                    value={String(addRole.status)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"1"}>Active</SelectItem>
                      <SelectItem value={"2"}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <hr className="my-5" />

            <div className="flex justify-end gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => setOpenAddR(false)}
              >
                {type === 3 ? `Close` : `Cancel`}
              </Button>

              <Button size="sm" variant="primary" onClick={submitRole}>
                {type === 1 ? `Save` : `Update`}
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default Access;
