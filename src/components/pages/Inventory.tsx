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
import { ChevronLeft, ChevronRight, PencilLine, SquarePen } from "lucide-react";
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
  useAddBPMutation,
  useAddInventoryMutation,
  useGetAccountTypeQuery,
  useGetARTermsQuery,
  useGetBPQuery,
  useGetBPsQuery,
  useGetInventoryQuery,
  useGetWtaxQuery,
  useGetWtaxRateQuery,
  useUpBPMutation,
  useUpInventoryMutation,
} from "@/store/api/AdministrationApi";
import Barangay from "../reusables/Barangay";
import { toast } from "sonner";
import { SelectWithSearch } from "../ui/SelectWithSearch";
import type { idName } from "./sales/ARInvoice";
import { formatMoney, hasAccess } from "@/lib/utils";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "../reusables/Loading";
import Empty from "../reusables/Empty";

type bpAddress = {
  regionId: number;
  provinceId: number;
  cityId: number;
  barangayId: number;
  barangayName: string;
};

type bpartner = {
  id: number;
  code: string;
  name: string;
  vendor: string;
  stock: number;
  p_cost: number;
  p_sales: number;
  p_cogs: string;
  p_income: string;
  uom: string;
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
  code: "",
  name: "",
  vendor: "0",
  stock: 0,
  p_cost: 0,
  p_sales: 0,
  p_cogs: "0",
  p_income: "0",
  uom: "",
  status: 1,
};
function Inventory() {
  const [openAdd, setOpenAdd] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [type, setType] = useState(1);

  const [addItem, setAddItem] = useState<bpartner>(initialState);
  const [bp, setBP] = useState<bpartner[]>([]);

  const [currView, setCurrView] = useState(1);

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

  const resetAddItem = () => {
    setAddItem(initialState);
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

  const getInv = useGetInventoryQuery({ page: page, search: search1 });
  useEffect(() => {
    if (getInv.isSuccess && getInv.data) {
      setBP(getInv.data.results);
      setTotalPages(Math.ceil(getInv?.data?.count / 10));
      setCount(getInv.data.count);
    }
  }, [getInv.isSuccess, getInv.data]);

  const [addInventory] = useAddInventoryMutation();
  const [upInventory] = useUpInventoryMutation();
  const submitInventory = async () => {
    if (addItem.code !== "" && addItem.name !== "") {
      try {
        const formData = new FormData();
        formData.append("datas", JSON.stringify(addItem));

        let checkstat: any;
        if (type === 1) {
          checkstat = await addInventory(formData).unwrap();
        } else {
          checkstat = await upInventory(formData).unwrap();
        }

        if (checkstat.success) {
          setOpenAdd(false);
          toast.success(checkstat.message);
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

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Inventory" />
          {!hasAccess(access, "28", "view") ? (
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
                    placeholder="Search"
                    className="max-w-80"
                  />

                  {/* <Select
                  onValueChange={(e) => setFilter(parseInt(e))}
                  value={String(filter)}
                >
                  <SelectTrigger className="w-32 ">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All</SelectItem>
                    <SelectItem value="1">Customer</SelectItem>
                    <SelectItem value="2">Vendor</SelectItem>
                  </SelectContent>
                </Select> */}
                </div>

                <div>
                  {hasAccess(access, "28", "create") && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        resetAddItem();
                        setType(1);
                        setCurrView(1);
                        setOpenAdd(true);
                      }}
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>

              <Table className="shadow-sm border">
                <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                  <TableRow className="">
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Code
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                      Name
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Vendor
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Stock
                    </TableHead>
                    <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                      Sales
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
                  {bp.map((item, idx) => (
                    <TableRow key={idx} className="">
                      <TableCell className="py-2 text-center">
                        <span
                          className="flex items-center justify-center gap-1 font-medium cursor-pointer underline"
                          onClick={() => {
                            setType(3);
                            setOpenAdd(true);
                            setAddItem(item);
                          }}
                        >
                          {item.code}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {
                          vendor.find(
                            (item1) => String(item1.id) === String(item.vendor),
                          )?.name
                        }
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.stock}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        {formatMoney(item.p_sales)}
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
                            if (hasAccess(access, "28", "edit")) {
                              setType(2);
                              setOpenAdd(true);
                              setAddItem(item);
                            }
                          }}
                        >
                          <SquarePen
                            size={18}
                            className={`text-blue-700 ${!hasAccess(access, "28", "edit") ? `cursor-not-allowed` : ``}`}
                          />
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
          )}
        </SidebarInset>
      </SidebarProvider>

      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={`${
            type === 1 ? `Add` : type === 2 ? `Edit` : `View`
          } Inventory`}
          width={`!w-[55vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 md:grid-cols-3 py-5 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Product Code <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Product Code"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddItem({ ...addItem, code: e.target.value })
                }
                value={addItem.code}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Product Name <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Product Name"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddItem({ ...addItem, name: e.target.value })
                }
                value={addItem.name}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Vendor</Label>
              <SelectWithSearch
                options={vendor.map((item) => ({
                  label: String(item.id),
                  value: item.name,
                }))}
                placeholder="Vendor"
                onChange={(c) => {
                  let cust = vendor.find((item) => Number(c) === item.id);
                  if (cust) {
                    setAddItem({
                      ...addItem,
                      vendor: String(cust?.id),
                    });
                  }
                }}
                value={
                  vendor.find(
                    (item) => String(addItem.vendor) === String(item.id),
                  )?.name
                }
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Cost <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Product Cost"
                className="w-full bg-gray-50"
                value={
                  type === 3 ? formatMoney(addItem.p_cost) : addItem.p_cost
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");

                  // allow numbers + one dot + 2 decimals
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setAddItem({ ...addItem, p_cost: Number(value) });
                  }
                }}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">
                Sales Price <span className="text-red-500 pl-1">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Product Cost"
                className="w-full bg-gray-50"
                value={
                  type === 3 ? formatMoney(addItem.p_sales) : addItem.p_sales
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");

                  // allow numbers + one dot + 2 decimals
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setAddItem({ ...addItem, p_sales: Number(value) });
                  }
                }}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Unit of Measure</Label>
              <Input
                type="text"
                placeholder="UOM"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setAddItem({ ...addItem, uom: e.target.value })
                }
                value={addItem.uom}
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Cogs Acct</Label>
              <SelectWithSearch
                options={cogsAcc.map((item) => ({
                  label: String(item.id),
                  value: item.name,
                }))}
                placeholder="Cogs Account"
                onChange={(c) => {
                  let cust = cogsAcc.find((item) => Number(c) === item.id);
                  if (cust) {
                    setAddItem({
                      ...addItem,
                      p_cogs: String(cust?.id),
                    });
                  }
                }}
                value={
                  cogsAcc.find(
                    (item) => String(addItem.p_cogs) === String(item.id),
                  )?.name
                }
                readOnly={type === 3}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Income Acct</Label>
              <SelectWithSearch
                options={incAcc.map((item) => ({
                  label: String(item.id),
                  value: item.name,
                }))}
                placeholder="Income Account"
                onChange={(c) => {
                  let cust = incAcc.find((item) => Number(c) === item.id);
                  if (cust) {
                    setAddItem({
                      ...addItem,
                      p_income: String(cust?.id),
                    });
                  }
                }}
                value={
                  incAcc.find(
                    (item) => String(addItem.p_income) === String(item.id),
                  )?.name
                }
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

export default Inventory;
