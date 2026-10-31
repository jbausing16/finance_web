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
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  useGetARTermsQuery,
  useGetBPQuery,
  useGetWtaxQuery,
  useGetWtaxRateQuery,
  useUpBPMutation,
} from "@/store/api/AdministrationApi";
import Barangay from "../reusables/Barangay";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "../reusables/Loading";
import { hasAccess } from "@/lib/utils";
import Empty from "../reusables/Empty";
import { exportBusinessPartner } from "../reusables/exportBusinessPartner";

type bpAddress = {
  regionId: number;
  provinceId: number;
  cityId: number;
  barangayId: number;
  barangayName: string;
};

type bpartner = {
  id: number;
  type: number;
  code: string;
  name: string;
  tin: string;
  terms: number;
  wtax: number;
  tax: number;
  tandc: number;
  street: string;
  barangay: number;
  zipcode: number;
  c_person: string;
  c_no: string;
  c_email: string;
  con_type: number;
  con_start: string;
  con_end: string;
  con_person: string;
  con_con: string;
  con_email: string;
  status: number;
  bp_address: bpAddress;
};

type IdName = {
  id: number;
  account: string;
  type?: string;
};

type arTerms = {
  id: number;
  bank_name: string;
};

const initialState = {
  id: 1,
  type: 1,
  code: "",
  name: "",
  tin: "",
  terms: 0,
  wtax: 0,
  tax: 1,
  tandc: 0,
  street: "",
  barangay: 0,
  zipcode: 0,
  c_person: "",
  c_no: "",
  c_email: "",
  con_type: 1,
  con_start: "",
  con_end: "",
  con_person: "",
  con_con: "",
  con_email: "",
  status: 1,
  bp_address: {
    regionId: 0,
    provinceId: 0,
    cityId: 0,
    barangayId: 0,
    barangayName: "",
  },
};
function BusinessPartner() {
  const [openAdd, setOpenAdd] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [type, setType] = useState(1);

  const [wtax, setWtax] = useState<IdName[]>([]);
  const [arTerms, setARTerms] = useState<arTerms[]>([]);

  const [addBP, setAddBP] = useState<bpartner>(initialState);
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

  const resetAddBP = () => {
    setAddBP(initialState);
  };

  const [address, setAddress] = useState({
    regionId: 0,
    provinceId: 0,
    cityId: 0,
    barangayId: 0,
    barangayName: "",
  });

  const resetAddress = () => {
    setAddress({
      regionId: 0,
      provinceId: 0,
      cityId: 0,
      barangayId: 0,
      barangayName: "",
    });
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getWtax = useGetWtaxRateQuery({ type: 1 });
  useEffect(() => {
    if (getWtax.isSuccess && getWtax.data) {
      setWtax(getWtax.data.data);
    }
  }, [getWtax.isSuccess, getWtax.data]);

  const getARTerms = useGetARTermsQuery({});
  useEffect(() => {
    if (getARTerms.isSuccess && getARTerms.data) {
      setARTerms(getARTerms.data.data);
    }
  }, [getARTerms.isSuccess, getARTerms.data]);

  const getBP = useGetBPQuery({ search: search1, filter: filter1 });
  useEffect(() => {
    if (getBP.isSuccess && getBP.data) {
      setBP(getBP.data.results);
      setTotalPages(Math.ceil(getBP?.data?.count / 10));
      setCount(getBP.data.count);
    }
  }, [getBP.isSuccess, getBP.data]);

  const [addBPartner] = useAddBPMutation();
  const [upBPartner] = useUpBPMutation();
  const submitBP = async () => {
    if (addBP.code !== "" && addBP.name !== "") {
      try {
        const formData = new FormData();
        formData.append("datas", JSON.stringify(addBP));

        let checkstat: any;
        if (type === 1) {
          checkstat = await addBPartner(formData).unwrap();
        } else {
          checkstat = await upBPartner(formData).unwrap();
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
          <Header title="Business Partner" />
          {!hasAccess(access, "27", "view") ? (
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

                  <Select
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
                  </Select>

                  <Button
                    variant="second"
                    // size={"sm"}
                    onClick={async () => {
                      await exportBusinessPartner(
                        bp,
                        "One Outsource Direct Corporation",
                      );
                    }}
                  >
                    Export
                  </Button>
                </div>

                <div>
                  {hasAccess(access, "27", "create") && (
                    <Button
                      // size="sm"
                      variant="primary"
                      onClick={() => {
                        resetAddBP();
                        resetAddress();
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
                    <TableHead className="font-archivo text-left text-muted-foreground font-semibold py-3">
                      Name
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                      Type
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Contact Person
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      Contact No.
                    </TableHead>
                    {/* <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Email
                  </TableHead> */}
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                      TIN
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Terms
                    </TableHead>
                    <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="font-inter text-foreground">
                  {bp.map((item, idx) => (
                    <TableRow key={idx} className="">
                      <TableCell className="py-2 text-center">
                        <span
                          className="flex items-center gap-1 font-medium cursor-pointer"
                          onClick={() => {
                            setType(2);
                            setCurrView(1);
                            setOpenAdd(true);
                            setAddBP(item);
                            setAddress(item.bp_address);
                          }}
                        >
                          {" "}
                          {/* <ArrowBigRight
                          size={15}
                          fill="yellow"
                          color="black"
                          strokeWidth={1}
                        /> */}
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.type === 1 ? `Customer` : `Vendor`}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.c_person}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.c_no}
                      </TableCell>
                      {/* <TableCell className="py-2 text-center">
                      {item.email}
                    </TableCell> */}
                      <TableCell className="py-2 text-center">
                        {item.tin}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {item.terms === 0 ? `` : item.terms}
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
          title={`${type === 1 ? `Add` : `Edit`} Business Partner`}
          width={`!w-[55vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="flex justify-between items-center py-2">
            <div className="flex gap-2 items-center">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-sm">
                {currView >= 1 ? `1` : `✓`}
              </span>{" "}
              Profile Details
            </div>

            <div className="flex-1 h-[1px] bg-gray-300 mx-2" />

            <div className="flex gap-2 items-center">
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-white text-sm ${
                  currView >= 2 ? `bg-blue-600` : `bg-gray-600`
                }`}
              >
                2
              </span>{" "}
              Contact and Address
            </div>

            <div className="flex-1 h-[1px] bg-gray-300 mx-2" />

            <div className="flex gap-2 items-center">
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-white text-sm ${
                  currView >= 3 ? `bg-blue-600` : `bg-gray-600`
                }`}
              >
                3
              </span>{" "}
              Contract Details
            </div>
          </div>

          <hr className="my-2" />

          {currView === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 py-5 gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Type</Label>
                  <Select
                    onValueChange={(e) => {
                      setAddBP({ ...addBP, type: Number(e) });
                    }}
                    value={String(addBP?.type)}
                  >
                    <SelectTrigger className="w-full bg-gray-50">
                      <SelectValue placeholder="Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Customer</SelectItem>
                      <SelectItem value="2">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">
                    Customer Code <span className="text-red-500 pl-1">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Customer Code"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, code: e.target.value })
                    }
                    value={addBP.code}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">
                    Customer Name <span className="text-red-500 pl-1">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Customer Name"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, name: e.target.value })
                    }
                    value={addBP.name}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">TIN</Label>
                  <Input
                    type="text"
                    placeholder="TIN"
                    className={`w-full bg-gray-50`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[\d-]*$/.test(value)) {
                        setAddBP({ ...addBP, tin: value });
                      }
                    }}
                    value={addBP.tin}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Terms of Payment</Label>
                  <Input
                    type="text"
                    placeholder="Days"
                    className={`w-full bg-gray-50`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setAddBP({ ...addBP, terms: Number(value) });
                      }
                    }}
                    value={addBP.terms === 0 ? "" : addBP.terms}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Wtax</Label>
                  <Select
                    onValueChange={(e) => {
                      if (e === "NA") {
                        setAddBP({ ...addBP, wtax: Number(0) });
                      } else {
                        setAddBP({ ...addBP, wtax: Number(e) });
                      }
                    }}
                    value={String(addBP.wtax)}
                  >
                    <SelectTrigger className="w-full bg-gray-50">
                      {/* {wtax.find((item1) => item1.id === addBP.wtax)?.account ??
                        "NA"} */}
                      <SelectValue placeholder="Wtax" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">NA</SelectItem>
                      {wtax.map((item: any) => (
                        <SelectItem value={String(item.id)}>
                          {item.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Tax Status</Label>
                  <Select
                    onValueChange={(e) => {
                      setAddBP({ ...addBP, tax: Number(e) });
                    }}
                    value={String(addBP.tax)}
                  >
                    <SelectTrigger className="w-full bg-gray-50">
                      <SelectValue placeholder="Liable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Liable</SelectItem>
                      <SelectItem value="2">Exempt</SelectItem>
                      {/* <SelectItem value="3">Zero-rated</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid col-span-2 w-full items-center gap-2">
                  <Label className=" gap-0">Payment Terms and Conditions</Label>
                  <Select
                    onValueChange={(e) => {
                      if (e === "NA") {
                        setAddBP({ ...addBP, tandc: Number(0) });
                      } else {
                        setAddBP({ ...addBP, tandc: Number(e) });
                      }
                    }}
                    value={String(addBP.tandc)}
                  >
                    <SelectTrigger className="w-full bg-gray-50">
                      {/* {arTerms.find((item1) => item1.id === addBP.tandc)
                        ?.bank_name ?? "NA"} */}
                      <SelectValue placeholder="Terms and Conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">NA</SelectItem>
                      {arTerms.map((item: any) => (
                        <SelectItem value={String(item.id)}>
                          {item.bank_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {currView === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 py-5 gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Street</Label>
                  <Input
                    type="text"
                    placeholder="Street"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, street: e.target.value })
                    }
                    value={addBP.street}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Barangay</Label>
                  {/* <Input
                    type="text"
                    placeholder="Barangay"
                    className={`w-full bg-gray-50`}
                    // onChange={(e) => setUser({ ...user, u_name: e.target.value })}
                  /> */}
                  <Barangay
                    value={addBP.bp_address}
                    onChange={(val) =>
                      setAddBP({
                        ...addBP,
                        barangay: val.barangayId,
                        bp_address: val,
                      })
                    }
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Zip Code</Label>
                  <Input
                    type="text"
                    placeholder="Zip Code"
                    className={`w-full bg-gray-50`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        setAddBP({ ...addBP, zipcode: Number(value) });
                      }
                    }}
                    value={addBP.zipcode === 0 ? "" : addBP.zipcode}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Contact Person</Label>
                  <Input
                    type="text"
                    placeholder="Contact Person"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, c_person: e.target.value })
                    }
                    value={addBP.c_person}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Contact No.</Label>
                  <Input
                    type="text"
                    placeholder="Contact No"
                    className={`w-full bg-gray-50`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 11) {
                        setAddBP({ ...addBP, c_no: value });
                      }
                    }}
                    value={addBP.c_no}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Email</Label>
                  <Input
                    type="text"
                    placeholder="Email"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, c_email: e.target.value })
                    }
                    value={addBP.c_email}
                  />
                </div>
              </div>
            </>
          )}

          {currView === 3 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 py-5 gap-4">
                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Type</Label>
                  <Select
                    onValueChange={(e) => {
                      setAddBP({ ...addBP, con_type: Number(e) });
                    }}
                    value={String(addBP.con_type)}
                  >
                    <SelectTrigger className="w-full bg-gray-50">
                      <SelectValue placeholder="Simple Contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Simple Contract</SelectItem>
                      <SelectItem value="2">Fixed Priced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Start Date</Label>
                  <Input
                    type="date"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, con_start: e.target.value })
                    }
                    value={addBP.con_start}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">End Date</Label>
                  <Input
                    type="date"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, con_end: e.target.value })
                    }
                    value={addBP.con_end}
                  />
                </div>

                <span className="grid col-span-3 font-bold">
                  Point of Contact
                </span>
                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Contact Person</Label>
                  <Input
                    type="text"
                    placeholder="Contact Person"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, con_person: e.target.value })
                    }
                    value={addBP.con_person}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Contact No.</Label>
                  <Input
                    type="text"
                    placeholder="Contact No"
                    className={`w-full bg-gray-50`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 11) {
                        setAddBP({ ...addBP, con_con: value });
                      }
                    }}
                    value={addBP.con_con}
                  />
                </div>

                <div className="grid w-full items-center gap-2">
                  <Label className=" gap-0">Email</Label>
                  <Input
                    type="text"
                    placeholder="Email"
                    className={`w-full bg-gray-50`}
                    onChange={(e) =>
                      setAddBP({ ...addBP, con_email: e.target.value })
                    }
                    value={addBP.con_email}
                  />
                </div>
              </div>
            </>
          )}

          {/* <div className="grid grid-cols-1 py-5 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Fiscal Year</Label>
              <Input
                type="text"
                placeholder="Fiscal Year"
                className={`w-full bg-gray-50`}
                // onChange={(e) => setUser({ ...user, u_name: e.target.value })}
              />
            </div>

            {type === 2 && (
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Posting Period</Label>
                <Input
                  type="text"
                  placeholder="Posting Period"
                  className={`w-full bg-gray-50`}
                  // onChange={(e) => setUser({ ...user, u_name: e.target.value })}
                />
              </div>
            )}

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">From</Label>
              <Input
                type="date"
                placeholder="From"
                className={`w-full bg-gray-50`}
                // onChange={(e) => setUser({ ...user, u_name: e.target.value })}
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">To</Label>
              <Input
                type="date"
                placeholder="To"
                className={`w-full bg-gray-50`}
                // onChange={(e) => setUser({ ...user, u_name: e.target.value })}
              />
            </div>

            {type === 2 && (
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Status</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Open" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div> */}

          <hr className="mb-5" />

          <div className="flex justify-end gap-4">
            <Button
              size="sm"
              variant="second"
              onClick={() => {
                if (currView === 1) {
                  setOpenAdd(false);
                } else if (currView <= 3) {
                  setCurrView(currView - 1);
                }
              }}
            >
              {currView === 1 ? `Cancel` : `Back`}
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (currView < 3) {
                  setCurrView(currView + 1);
                } else if (!hasAccess(access, "27", "edit")) {
                  setOpenAdd(false);
                } else {
                  submitBP();
                }
              }}
            >
              {currView < 3
                ? `Next`
                : !hasAccess(access, "27", "edit")
                  ? `Close`
                  : `Save`}
            </Button>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default BusinessPartner;
