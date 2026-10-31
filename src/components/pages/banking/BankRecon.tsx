import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { AppSidebar } from "../../reusables/sidebar/app-sidebar";
import Header from "@/components/reusables/Header";
import {
  useAddBSMutation,
  useGetBanksQuery,
  useGetBankStatementQuery,
  useUpBankStatementMutation,
} from "@/store/api/AdministrationApi";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SquareArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import CustomDialog from "@/components/reusables/CustomDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney, hasAccess } from "@/lib/utils";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import IncomingList from "@/components/reusables/IncomingList";
import OutgoingList from "@/components/reusables/OutgoingList";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";
import { exportBankRecon1 } from "@/components/reusables/exportBankRecon1";
import { exportBankRecon2 } from "@/components/reusables/exportBankRecon2";

type Recon = {
  id: number;
  bsid: number;
  tno: number;
  invoice: string[];
  amount: string;
};

const formatExcelDate = (value: any): string => {
  // Already a JS Date
  if (value instanceof Date) {
    return value.toLocaleDateString("en-CA"); // YYYY-MM-DD
  }

  // ExcelJS sometimes wraps values
  if (value?.result instanceof Date) {
    return value.result.toLocaleDateString("en-CA");
  }

  // Excel serial number (e.g. 45123)
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
    return jsDate.toLocaleDateString("en-CA");
  }

  // Already string or empty
  return value?.toString() ?? "";
};

type Statements = {
  id: number;
  date: string;
  description: string;
  check_no: string;
  status: number;
  amount: number;
  date_recon?: string;
  invoices?: string;
};

function BankRecon() {
  const [view, setView] = useState<number>(1);
  const [currId, setCurrId] = useState<number>(0);
  const [bankStatementJson, setBankStatementJson] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);

  const [activeRow, setActiveRow] = useState<number>(0);

  const [statements, setStatements] = useState<Statements[]>([]);
  const [statements1, setStatements1] = useState<Statements[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [currentPage1, setCurrentPage1] = useState(1);
  const [page1, setPage1] = useState(1);
  const [pageSize1, setPageSize1] = useState(10);
  const [totalPages1, setTotalPages1] = useState(0);
  const [count1, setCount1] = useState(0);

  const [activeTab, setActiveTab] = useState(1);

  const [recon, setRecon] = useState<Recon>({
    id: 0,
    bsid: 0,
    tno: 0,
    invoice: [],
    amount: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const getBanks = useGetBanksQuery({ search: "" });

  // =============================
  // FILE HANDLERS
  // =============================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // -------- CSV --------
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setBankStatementJson(result.data as any[]);
          console.log("CSV JSON:", result.data);
        },
      });
      return;
    }

    // -------- EXCEL (.xlsx / .xls) --------
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());

      const worksheet = workbook.worksheets[0];
      const rows: any[] = [];
      let headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        const values = row.values as any[];

        // First row = headers
        if (rowNumber === 1) {
          headers = values.slice(1);
          return;
        }

        const rowObject: any = {};
        headers.forEach((header, index) => {
          const cellValue = values[index + 1];

          // Detect date columns by header name
          if (header?.toLowerCase().includes("date")) {
            rowObject[header] = formatExcelDate(cellValue);
          } else {
            rowObject[header] = cellValue ?? "";
          }
        });

        rows.push(rowObject);
      });

      setBankStatementJson(rows);
      console.log("Excel JSON:", rows);
    }
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const handlePreviousPage1 = () => {
    setPage1(page1 - 1);
    setCurrentPage1(page1 - 1);
  };
  const handleNextPage1 = () => {
    setPage1(page1 + 1);
    setCurrentPage1(page1 + 1);
  };

  const getBankStatement = useGetBankStatementQuery({
    page: page,
    bid: currId,
    stat: 1,
  });
  useEffect(() => {
    if (getBankStatement.isSuccess && getBankStatement.data) {
      setStatements(getBankStatement.data.results);
      setTotalPages(Math.ceil(getBankStatement?.data?.count / 10));
      setCount(getBankStatement.data.count);
    }
  }, [getBankStatement.isSuccess, getBankStatement.data]);

  const getBankStatement1 = useGetBankStatementQuery({
    page: page,
    bid: currId,
    stat: 2,
  });
  useEffect(() => {
    if (getBankStatement1.isSuccess && getBankStatement1.data) {
      setStatements1(getBankStatement1.data.results);
      setTotalPages1(Math.ceil(getBankStatement1?.data?.count / 10));
      setCount1(getBankStatement1.data.count);
    }
  }, [getBankStatement1.isSuccess, getBankStatement1.data]);

  const [addBS] = useAddBSMutation();
  const submitBS = async () => {
    try {
      const formData = new FormData();
      formData.append("bid", String(currId));
      formData.append("datas", JSON.stringify(bankStatementJson));

      let checkstat: any;

      checkstat = await addBS(formData).unwrap();

      if (checkstat.success) {
        setOpenAdd(false);
        toast.success(checkstat.message);
      } else {
        toast.error(checkstat.message);
      }
    } catch (error) {}
    // } else {
    //   toast.error("Please fill out required fields.");
    // }
  };

  const [upBS] = useUpBankStatementMutation();
  const submitUpBS = async () => {
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(recon));

      let checkstat: any;

      checkstat = await upBS(formData).unwrap();

      if (checkstat.success) {
        setOpenAdd(false);
        setRecon({ id: 0, bsid: 0, tno: 0, invoice: [], amount: "" });
        setActiveRow(0);
        toast.success(checkstat.message);
      } else {
        toast.error(checkstat.message);
      }
    } catch (error) {}
    // } else {
    //   toast.error("Please fill out required fields.");
    // }
  };

  useEffect(() => {
    console.log("Statements: ", statements);
  }, [statements]);

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header
            title={`Bank Recon ${
              currId !== 0
                ? `- ` +
                  getBanks?.data?.data?.find((item: any) => currId === item?.id)
                    ?.account
                : ``
            }`}
          />
          {!hasAccess(access, "26", "view") ? (
            <Empty />
          ) : (
            <AnimatePresence mode="wait">
              {view === 1 && (
                <motion.div
                  key="view1"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 px-8"
                >
                  {getBanks?.data?.data?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 h-28 rounded-xl cursor-pointer shadow-md  ${
                        item?.status === 1
                          ? `bg-blue-700 hover:bg-blue-800`
                          : `bg-gray-700 hover:bg-gray-800`
                      }`}
                      onClick={() => {
                        setCurrId(item?.id);
                        setView(2);
                      }}
                    >
                      <span className="font-bold text-xl text-white">
                        {item?.account}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {view === 2 && (
                <motion.div
                  key="view2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 p-4 px-8 gap-4"
                >
                  <div className="flex justify-between items-center">
                    <SquareArrowLeft
                      onClick={() => {
                        setView(1);
                        setCurrId(0);
                      }}
                      size={36}
                      className="text-blue-800 cursor-pointer"
                    />

                    <>
                      {/* <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.xlsx,.xls"
                    hidden
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Import Bank Statement
                  </Button> */}
                      {hasAccess(access, "26", "create") && (
                        <Button
                          variant="primary"
                          onClick={() => {
                            setOpenAdd(true);
                            setBankStatementJson([]);
                          }}
                        >
                          Add Bank Statement
                        </Button>
                      )}
                    </>
                  </div>

                  <div className="relative">
                    <div className="absolute right-0">
                      <Button
                        variant="second"
                        size={"sm"}
                        onClick={async () => {
                          activeTab === 1
                            ? await exportBankRecon1(
                                statements,
                                "One Outsource Direct Corporation",
                                getBanks?.data?.data?.find(
                                  (item: any) => currId === item?.id,
                                )?.account,
                              )
                            : await exportBankRecon2(
                                statements1,
                                "One Outsource Direct Corporation",
                                getBanks?.data?.data?.find(
                                  (item: any) => currId === item?.id,
                                )?.account,
                              );
                        }}
                      >
                        Export
                      </Button>
                    </div>
                    <Tabs value={String(activeTab)} className="">
                      <TabsList>
                        <TabsTrigger value="1" onClick={() => setActiveTab(1)}>
                          Bank Statements
                        </TabsTrigger>
                        <TabsTrigger value="2" onClick={() => setActiveTab(2)}>
                          Reconciled Transactions
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="1" className="p-1 w-full">
                        <Table className="shadow-sm border">
                          <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                            <TableRow className="">
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                                Date
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                                Description
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                                Check No.
                              </TableHead>
                              <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                                Amount
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                                Transaction No.
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                                Reconcile
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody className="font-inter text-foreground">
                            {statements.map((item, idx) => (
                              <TableRow key={idx} className="">
                                <TableCell className="py-1 text-center">
                                  <span
                                    onClick={() => {
                                      setActiveRow(item.id);
                                      // setOpenAdd(true);
                                      // setViewTransact(item.id);
                                    }}
                                    className="cursor-pointer font-medium"
                                  >
                                    {item.date}
                                  </span>
                                </TableCell>
                                <TableCell className="py-1 text-center">
                                  {item.description}
                                </TableCell>
                                <TableCell className="py-1 text-center">
                                  {item.check_no}
                                </TableCell>
                                <TableCell className="py-1 text-right">
                                  {formatMoney(Number(item.amount))}
                                </TableCell>
                                <TableCell
                                  className="text-center !py-0"
                                  onClick={() => setActiveRow(item.id)}
                                >
                                  {Number(item.amount) > 0 ? (
                                    <IncomingList
                                      recon={recon}
                                      setRecon={setRecon}
                                      id={item.id}
                                      bank={currId}
                                      activeRow={activeRow}
                                    />
                                  ) : (
                                    <OutgoingList
                                      recon={recon}
                                      setRecon={setRecon}
                                      id={item.id}
                                      bank={currId}
                                      activeRow={activeRow}
                                    />
                                  )}
                                </TableCell>

                                <TableCell className="py-1 text-center">
                                  {hasAccess(access, "26", "edit") && (
                                    <Button
                                      size={"sm"}
                                      className={` ${
                                        recon.bsid === item.id &&
                                        String(
                                          Math.abs(Number(recon.amount)),
                                        ) ===
                                          String(Math.abs(Number(item.amount)))
                                          ? `bg-blue-600 hover:bg-blue-600`
                                          : `bg-gray-300 hover:bg-gray-300`
                                      }`}
                                      onClick={submitUpBS}
                                      disabled={
                                        recon.bsid !== item.id ||
                                        String(
                                          Math.abs(Number(recon.amount)),
                                        ) !==
                                          String(Math.abs(Number(item.amount)))
                                      }
                                    >
                                      Reconcile
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="flex items-center space-x-2 justify-end">
                          <div className="text-sm text-muted-foreground">
                            Showing{" "}
                            {count === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
                            - {Math.min(currentPage * pageSize, count)} of{" "}
                            {count}
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
                      </TabsContent>
                      <TabsContent value="2" className="p-1">
                        <Table className="shadow-sm border">
                          <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                            <TableRow className="">
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                                Date
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                                Description
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                                Check No.
                              </TableHead>
                              <TableHead className="font-archivo text-right  text-muted-foreground font-semibold py-3">
                                Amount
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                                Transaction No.
                              </TableHead>
                              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                                Date Reconciled
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody className="font-inter text-foreground">
                            {statements1.map((item, idx) => (
                              <TableRow key={idx} className="">
                                <TableCell className="py-1 text-center">
                                  <span className="cursor-pointer font-medium">
                                    {item.date}
                                  </span>
                                </TableCell>
                                <TableCell className="py-1 text-center">
                                  {item.description}
                                </TableCell>
                                <TableCell className="py-1 text-center">
                                  {item.check_no}
                                </TableCell>
                                <TableCell className="py-1 text-right">
                                  {formatMoney(Number(item.amount))}
                                </TableCell>
                                <TableCell className="text-center ">
                                  {item.invoices}
                                </TableCell>

                                <TableCell className="py-1 text-center">
                                  {item.date_recon}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="flex items-center space-x-2 justify-end">
                          <div className="text-sm text-muted-foreground">
                            Showing {(currentPage1 - 1) * pageSize1 + 1} -{" "}
                            {Math.min(currentPage1 * pageSize1, count1)} of{" "}
                            {count1}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePreviousPage1}
                            disabled={currentPage1 === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous page</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextPage1}
                            disabled={currentPage1 === totalPages1}
                          >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next page</span>
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </SidebarInset>
      </SidebarProvider>

      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={``}
          width={`!w-[55vw]`}
          height={`h-[90vh]`}
          closeIcon={`Y`}
          button=""
        >
          <div className="flex flex-col py-2 gap-4">
            <div className="flex justify-between pt-2">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.xlsx,.xls"
                  hidden
                  onChange={handleFileSelect}
                />
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import Bank Statement
                </Button>
              </div>

              <div className="flex items-center">
                {bankStatementJson && bankStatementJson.length === 0 && (
                  // <Button variant={"link"} onClick={}>
                  <a
                    href="/Bank_Statement_Template.xlsx"
                    className="underline text-blue-600 text-sm"
                  >
                    Download Template
                  </a>
                  // </Button>
                )}
                {bankStatementJson.length > 0 && (
                  <Button variant={"second"} onClick={submitBS}>
                    Upload
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full ">
                <tr>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Date
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Branch
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Description
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Debit
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Credit
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Running Balance
                  </td>
                  <td className="p-1 font-medium border border-black bg-gray-300">
                    Check No.
                  </td>
                </tr>

                {bankStatementJson.map((item: any, index) => (
                  <tr key={index}>
                    <td className="p-1 border border-black">{item?.Date}</td>
                    <td className="p-1 border border-black">{item?.Branch}</td>
                    <td className="p-1 border border-black">
                      {item?.Description}
                    </td>
                    <td className="p-1 border border-black text-right ">
                      {item?.Debit === "" ? `` : formatMoney(item?.Debit)}
                    </td>
                    <td className="p-1 border border-black text-right ">
                      {item?.Credit === "" ? `` : formatMoney(item?.Credit)}
                    </td>
                    <td className="p-1 border border-black text-right ">
                      {item?.Running_Balance === ""
                        ? ``
                        : formatMoney(item?.Running_Balance)}
                    </td>
                    <td className="p-1 border border-black">
                      {item?.["Check_No."]}
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default BankRecon;
