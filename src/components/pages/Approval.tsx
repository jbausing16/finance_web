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
  useAddInventoryMutation,
  useGetAccountTypeQuery,
  useGetApproval1Query,
  useGetApproval2Query,
  useGetApproval3Query,
  useGetApproval4Query,
  useGetApproval5Query,
  useGetApproval6Query,
  useGetApproval7Query,
  useGetBPsQuery,
  useGetInventoryQuery,
  useUpInventoryMutation,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import { SelectWithSearch } from "../ui/SelectWithSearch";
import type { idName } from "./sales/ARInvoice";
import { formatMoney, hasAccess } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import ARInvoiceTable from "../reusables/tables/ARInvoiceTable";
import ARCMTable from "../reusables/tables/ARCMTable";
import APInvoiceTable from "../reusables/tables/APInvoiceTable";
import IncomingPaymentTable from "../reusables/tables/IncomingPaymentTable";
import OutgoingPaymentTable from "../reusables/tables/OutgoingPaymentTable";
import JournalEntryTable from "../reusables/tables/JournalEntryTable";
import APCMTable from "../reusables/tables/APCMTable";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "../reusables/Loading";
import Empty from "../reusables/Empty";

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
function Approval1() {
  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState(1);

  const [searchParams] = useSearchParams();
  const module = searchParams.get("module");

  const [activeId, setActiveId] = useState(2);

  const [addItem, setAddItem] = useState<bpartner>(initialState);

  const [currentPage1, setCurrentPage1] = useState(1);
  const [page1, setPage1] = useState(1);
  const [pageSize1, setPageSize1] = useState(10);
  const [totalPages1, setTotalPages1] = useState(1);
  const [count1, setCount1] = useState(0);

  const [currentPage2, setCurrentPage2] = useState(1);
  const [page2, setPage2] = useState(1);
  const [pageSize2, setPageSize2] = useState(10);
  const [totalPages2, setTotalPages2] = useState(1);
  const [count2, setCount2] = useState(0);

  const [currentPage3, setCurrentPage3] = useState(1);
  const [page3, setPage3] = useState(1);
  const [pageSize3, setPageSize3] = useState(10);
  const [totalPages3, setTotalPages3] = useState(1);
  const [count3, setCount3] = useState(0);

  const [currentPage4, setCurrentPage4] = useState(1);
  const [page4, setPage4] = useState(1);
  const [pageSize4, setPageSize4] = useState(10);
  const [totalPages4, setTotalPages4] = useState(1);
  const [count4, setCount4] = useState(0);

  const [currentPage5, setCurrentPage5] = useState(1);
  const [page5, setPage5] = useState(1);
  const [pageSize5, setPageSize5] = useState(10);
  const [totalPages5, setTotalPages5] = useState(1);
  const [count5, setCount5] = useState(0);

  const [currentPage6, setCurrentPage6] = useState(1);
  const [page6, setPage6] = useState(1);
  const [pageSize6, setPageSize6] = useState(10);
  const [totalPages6, setTotalPages6] = useState(1);
  const [count6, setCount6] = useState(0);

  const [currentPage7, setCurrentPage7] = useState(1);
  const [page7, setPage7] = useState(1);
  const [pageSize7, setPageSize7] = useState(10);
  const [totalPages7, setTotalPages7] = useState(1);
  const [count7, setCount7] = useState(0);

  const [search, setSearch] = useState("");
  const [search1, setSearch1] = useState("");

  const handlePreviousPage1 = () => {
    setPage1(page1 - 1);
    setCurrentPage1(page1 - 1);
  };
  const handleNextPage1 = () => {
    setPage1(page1 + 1);
    setCurrentPage1(page1 + 1);
  };

  const handlePreviousPage2 = () => {
    setPage2(page2 - 1);
    setCurrentPage2(page2 - 1);
  };
  const handleNextPage2 = () => {
    setPage2(page2 + 1);
    setCurrentPage2(page2 + 1);
  };

  const handlePreviousPage3 = () => {
    setPage3(page3 - 1);
    setCurrentPage3(page3 - 1);
  };
  const handleNextPage3 = () => {
    setPage3(page3 + 1);
    setCurrentPage3(page3 + 1);
  };

  const handlePreviousPage4 = () => {
    setPage4(page4 - 1);
    setCurrentPage4(page4 - 1);
  };
  const handleNextPage4 = () => {
    setPage4(page4 + 1);
    setCurrentPage4(page4 + 1);
  };

  const handlePreviousPage5 = () => {
    setPage5(page5 - 1);
    setCurrentPage5(page5 - 1);
  };
  const handleNextPage5 = () => {
    setPage5(page5 + 1);
    setCurrentPage5(page5 + 1);
  };

  const handlePreviousPage6 = () => {
    setPage6(page6 - 1);
    setCurrentPage6(page6 - 1);
  };
  const handleNextPage6 = () => {
    setPage6(page6 + 1);
    setCurrentPage6(page6 + 1);
  };

  const handlePreviousPage7 = () => {
    setPage7(page7 - 1);
    setCurrentPage7(page7 - 1);
  };
  const handleNextPage7 = () => {
    setPage7(page7 + 1);
    setCurrentPage7(page7 + 1);
  };

  const get1 = useGetApproval1Query(
    { page: page1, search: search1 },
    { refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (get1.isSuccess && get1.data) {
      setTotalPages1(Math.ceil(get1?.data?.count / 10));
      setCount1(get1.data.count);
    }
  }, [get1.isSuccess, get1.data]);

  const get2 = useGetApproval2Query(
    { page: page2, search: search1 },
    { refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (get2.isSuccess && get2.data) {
      setTotalPages2(Math.ceil(get2?.data?.count / 10));
      setCount2(get2.data.count);
    }
  }, [get2.isSuccess, get2.data]);

  const get3 = useGetApproval3Query(
    { page: page3, search: search1 },
    { refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (get3.isSuccess && get3.data) {
      setTotalPages3(Math.ceil(get3?.data?.count / 10));
      setCount3(get3.data.count);
    }
  }, [get3.isSuccess, get3.data]);

  const get4 = useGetApproval4Query(
    { page: page4, search: search1 },
    { refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (get4.isSuccess && get4.data) {
      setTotalPages4(Math.ceil(get4?.data?.count / 10));
      setCount4(get4.data.count);
    }
  }, [get4.isSuccess, get4.data]);

  const get5 = useGetApproval5Query(
    { page: page5, search: search1 },
    { refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (get5.isSuccess && get5.data) {
      setTotalPages5(Math.ceil(get5?.data?.count / 10));
      setCount5(get5.data.count);
    }
  }, [get5.isSuccess, get5.data]);

  const get6 = useGetApproval6Query(
    { page: page6, search: search1 },
    { refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (get6.isSuccess && get6.data) {
      setTotalPages6(Math.ceil(get6?.data?.count / 10));
      setCount6(get6.data.count);
    }
  }, [get6.isSuccess, get6.data]);

  const get7 = useGetApproval7Query(
    { page: page7, search: search1 },
    { refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (get7.isSuccess && get7.data) {
      setTotalPages7(Math.ceil(get7?.data?.count / 10));
      setCount7(get7.data.count);
    }
  }, [get7.isSuccess, get7.data]);

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
      setPage1(1);
      setCurrentPage1(1);
      setPage2(1);
      setCurrentPage2(1);
      setPage3(1);
      setCurrentPage3(1);
      setPage4(1);
      setCurrentPage4(1);
      setPage5(1);
      setCurrentPage5(1);
      setPage6(1);
      setCurrentPage6(1);
      setPage7(1);
      setCurrentPage7(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (module) {
      setActiveId(Number(module));
    }
  }, [module]);

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title={`Approval`} />
          {!hasAccess(access, "29", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
              <div
                className="flex justify-between
            "
              >
                <div className="flex justify-between gap-2 w-full">
                  <div>
                    <Tabs
                      // defaultValue="2"
                      value={String(activeId)}
                      className=""
                      onValueChange={(e) => setActiveId(Number(e))}
                    >
                      <TabsList className="gap-2">
                        <TabsTrigger value="2" className="px-4 relative">
                          A/R Invoice{" "}
                          {get2?.data?.count > 0 && (
                            <Badge
                              className="absolute h-5 min-w-5 -right-2 -top-2 rounded-full px-1 font-mono tabular-nums text-white"
                              variant="secondary"
                            >
                              {get2?.data?.count}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="3" className="px-4 relative">
                          A/R CM
                          {get3?.data?.count > 0 && (
                            <Badge
                              className="absolute h-5 min-w-5 -right-2 -top-2 rounded-full px-1 font-mono tabular-nums text-white"
                              variant="secondary"
                            >
                              {get3?.data?.count}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="4" className="px-4 relative">
                          A/P Invoice
                          {get4?.data?.count > 0 && (
                            <Badge
                              className="absolute h-5 min-w-5 -right-2 -top-2 rounded-full px-1 font-mono tabular-nums text-white"
                              variant="secondary"
                            >
                              {get4?.data?.count}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="5" className="px-4 relative">
                          A/P CM
                          {get5?.data?.count > 0 && (
                            <Badge
                              className="absolute h-5 min-w-5 -right-2 -top-2 rounded-full px-1 font-mono tabular-nums text-white"
                              variant="secondary"
                            >
                              {get5?.data?.count}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="6" className="px-4 relative">
                          Incoming Payment
                          {get6?.data?.count > 0 && (
                            <Badge
                              className="absolute h-5 min-w-5 -right-2 -top-2 rounded-full px-1 font-mono tabular-nums text-white"
                              variant="secondary"
                            >
                              {get6?.data?.count}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="7" className="px-4 relative">
                          Outgoing Payment
                          {get7?.data?.count > 0 && (
                            <Badge
                              className="absolute h-5 min-w-5 -right-2 -top-2 rounded-full px-1 font-mono tabular-nums text-white"
                              variant="secondary"
                            >
                              {get7?.data?.count}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="1" className="px-4 relative">
                          Journal Entry
                          {get1?.data?.count > 0 && (
                            <Badge
                              className="absolute h-5 min-w-5 -right-2 -top-2 rounded-full px-1 font-mono tabular-nums text-white"
                              variant="secondary"
                            >
                              {get1?.data?.count}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div>
                    <SearchForm
                      search={search}
                      setSearch={setSearch}
                      placeholder="Search"
                      className="max-w-80"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full">
                {activeId === 2 && (
                  <ARInvoiceTable
                    data={get2?.data?.results}
                    count={count2}
                    currentPage={currentPage2}
                    pageSize={pageSize2}
                    totalPages={totalPages2}
                    handlePreviousPage={handlePreviousPage2}
                    handleNextPage={handleNextPage2}
                  />
                )}
                {activeId === 3 && (
                  <ARCMTable
                    data={get3?.data?.results}
                    count={count3}
                    currentPage={currentPage3}
                    pageSize={pageSize3}
                    totalPages={totalPages3}
                    handlePreviousPage={handlePreviousPage3}
                    handleNextPage={handleNextPage3}
                  />
                )}
                {activeId === 4 && (
                  <APInvoiceTable
                    data={get4?.data?.results}
                    count={count4}
                    currentPage={currentPage4}
                    pageSize={pageSize4}
                    totalPages={totalPages4}
                    handlePreviousPage={handlePreviousPage4}
                    handleNextPage={handleNextPage4}
                  />
                )}
                {activeId === 5 && (
                  <APCMTable
                    data={get5?.data?.results}
                    count={count5}
                    currentPage={currentPage5}
                    pageSize={pageSize5}
                    totalPages={totalPages5}
                    handlePreviousPage={handlePreviousPage5}
                    handleNextPage={handleNextPage5}
                  />
                )}
                {activeId === 6 && (
                  <IncomingPaymentTable
                    data={get6?.data?.results}
                    count={count6}
                    currentPage={currentPage6}
                    pageSize={pageSize6}
                    totalPages={totalPages6}
                    handlePreviousPage={handlePreviousPage6}
                    handleNextPage={handleNextPage6}
                  />
                )}
                {activeId === 7 && (
                  <OutgoingPaymentTable
                    data={get7?.data?.results}
                    count={count7}
                    currentPage={currentPage7}
                    pageSize={pageSize7}
                    totalPages={totalPages7}
                    handlePreviousPage={handlePreviousPage7}
                    handleNextPage={handleNextPage7}
                  />
                )}
                {activeId === 1 && (
                  <JournalEntryTable
                    data={get1?.data?.results}
                    count={count1}
                    currentPage={currentPage1}
                    pageSize={pageSize1}
                    totalPages={totalPages1}
                    handlePreviousPage={handlePreviousPage1}
                    handleNextPage={handleNextPage1}
                  />
                )}
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default Approval1;
