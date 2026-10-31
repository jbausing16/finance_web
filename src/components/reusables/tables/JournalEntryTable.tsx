import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateM, formatMoney, hasAccess } from "@/lib/utils";
import PrintARInvoice from "../PrintARInvoice";
import {
  getStatus,
  initialWtax,
  type wtax,
  type wtaxRate,
} from "@/components/pages/sales/ARInvoice";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import CustomDialog from "../CustomDialog";
import { SelectWithSearch } from "@/components/ui/SelectWithSearch";
import {
  useGetAccountAllQuery,
  useGetAccountTypeQuery,
  useGetBPsQuery,
  useGetCMPreviewQuery,
  useGetIncTransPreviewQuery,
  useGetInvoicePreviewAPQuery,
  useGetInvoicePreviewQuery,
  useGetJETempTransPreviewQuery,
  useGetJETransPreviewQuery,
  useGetOutTransPreviewQuery,
  useGetWtaxRateQuery,
  useUpApp1Mutation,
} from "@/store/api/AdministrationApi";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Wtax from "@/components/pages/sales/Wtax";
import PrintAPInvoice from "../PrintAPInvoice";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Incoming } from "@/components/pages/banking/IncomingPayment";
import { Checkbox } from "@/components/ui/checkbox";
import PaymentMeans from "../PaymentMeans";
import { toast } from "sonner";
import YesNo from "../YesNo";
import { Loading } from "../Loading";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

type idName = {
  id: number;
  code: string;
  name: string;
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

type RowInvoices = {
  id: number;
  checkbox: boolean;
  doc_num: string;
  type: string;
  date: string;
  overdue: number;
  total: number;
  wtax: number;
  balance: number;
  payment: string;
};

interface ARCMTableProps {
  data: any[];
  count: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
}

const initial = {
  bpid: 0,
  bpcode: "",
  bpname: "",
  or: "",
  invoice: "",
  post_date: new Date().toLocaleDateString("en-CA"),
  due_date: new Date().toLocaleDateString("en-CA"),
  doc_date: new Date().toLocaleDateString("en-CA"),
  remarks: "",
  poa: "",
  total_due: "",
  paid: "0",
  p_type: "1",
  bank_id: "",
  bank_code: "",
  bank_name: "",
  check_no: "",
  reference: "",
  transfer_date: "",
  invoices: [],
};

const initialData = {
  id: 0,
  no: "",
  origin: "Journal Entry",
  origin_no: "",
  remarks: "",
  post_date: new Date().toLocaleDateString("en-CA"),
  due_date: new Date().toLocaleDateString("en-CA"),
  doc_date: new Date().toLocaleDateString("en-CA"),
  trans_no: "",
  status: 0,
  total: 0,
};

const initialRows = [
  {
    id: 1,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 2,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 3,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 4,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 5,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 6,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 7,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 8,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 9,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
  {
    id: 10,
    code: "",
    name: "",
    debit: "",
    credit: "",
    customer: "",
    remarks: "",
  },
];

function JournalEntryTable({
  data,
  count,
  currentPage,
  pageSize,
  handlePreviousPage,
  handleNextPage,
  totalPages,
}: ARCMTableProps) {
  const [currId, setCurrId] = useState(0);
  const [openAdd, setOpenAdd] = useState(false);
  const [aType, setAType] = useState(1);
  const [viewInvoice, setViewInvoice] = useState(0);
  const [viewTransact, setViewTransact] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState(0);
  const [rows, setRows] = useState(initialRows);
  const [tad, setTad] = useState(0);

  const [customer, setCustomer] = useState<customer[]>([]);
  const [vendor, setVendor] = useState<customer[]>([]);
  const [accounts, setAccounts] = useState<idName[]>([]);
  const [wtaxOpt, setWtaxOpt] = useState<wtaxRate[]>([]);

  const [docType, setDocType] = useState(1);
  const [data1, setData1] = useState(initialData);
  const [rows1, setRows1] = useState(initialRows);
  const [wtax1, setWtax1] = useState<wtax[]>(initialWtax);

  const [aRows, setARows] = useState([
    {
      id: 1,
      code: "",
      name: "",
      amount: "",
      customer: "",
    },
    {
      id: 2,
      code: "",
      name: "",
      amount: "",
      customer: "",
    },
    {
      id: 3,
      code: "",
      name: "",
      amount: "",
      customer: "",
    },
  ]);

  const [iP, setIP] = useState<Incoming>(initial);

  const getPreview = useGetJETempTransPreviewQuery(viewTransact, {
    skip: viewTransact === 0,
  });
  useEffect(() => {
    if (getPreview.isSuccess && getPreview.data) {
      setData1(getPreview?.data?.data);

      const rows = getPreview.data.data.rows;
      const minimumRows = 10;
      const filledRows = [...rows];
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          code: "",
          name: "",
          debit: "",
          credit: "",
          customer: "",
          remarks: "",
        });
      }

      setRows(filledRows);
    }
  }, [getPreview.isSuccess, getPreview.data]);

  const getBPs = useGetBPsQuery({ type: 1 });
  const getAccounts = useGetAccountAllQuery({});
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setCustomer(getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);

  const getBP1s = useGetBPsQuery({ type: 2 });
  useEffect(() => {
    if (getBP1s.isSuccess && getBP1s.data) {
      setVendor(getBP1s.data.data);
    }
  }, [getBP1s.isSuccess, getBP1s.data]);
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      setAccounts(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  const getWtax = useGetWtaxRateQuery({});
  useEffect(() => {
    if (getWtax.isSuccess && getWtax.data) {
      setWtaxOpt(getWtax.data.data);
    }
  }, [getWtax.isSuccess, getWtax.data]);

  const [upApproval] = useUpApp1Mutation();
  const submitApproval = async (status: number) => {
    try {
      const formData = new FormData();
      formData.append("id", String(viewTransact));
      formData.append("status", String(status));

      let checkstat: any;
      checkstat = await upApproval(formData).unwrap();

      if (checkstat.success) {
        setOpenAdd(false);
        toast.success(checkstat.message);
      } else {
        toast.error(checkstat.message);
      }
    } catch (error) {}
  };

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <div>
        {getPreview.isLoading && <Loading />}
        <Table className="shadow-sm border">
          <TableHeader className="bg-gray-200 dark:bg-gray-800 rounded-b-sm select-none">
            <TableRow className="">
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                No.
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Origin
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                Date
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Remarks
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Status
              </TableHead>
              <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="font-inter text-foreground">
            {data?.map((item, idx) => (
              <TableRow
                className={`cursor-pointer ${
                  currId === item.id ? `bg-gray-100` : ``
                }`}
                onClick={() => setCurrId(item.id)}
                key={idx}
              >
                <TableCell
                  className="py-2 text-center "
                  onClick={() => {
                    setOpenAdd(true);
                    setViewTransact(item.id);
                  }}
                >
                  <span className="text-blue-800 underline cursor-pointer font-medium">
                    {item.no}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.origin}
                </TableCell>
                <TableCell className="py-2 text-center">{item.date}</TableCell>
                <TableCell className="py-2 text-center">
                  {item.remarks}
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.status === 2 ? (
                    <span className="p-1 px-2 rounded-2xl bg-blue-200 text-blue-900">
                      Closed
                    </span>
                  ) : item.status === 3 ? (
                    <span className="p-1 px-2 rounded-2xl bg-gray-200 text-gray-900">
                      Canceled
                    </span>
                  ) : item.status === 4 ? (
                    <span className="p-1 px-2 rounded-2xl bg-yellow-200 text-yellow-900">
                      For Verification
                    </span>
                  ) : item.status === 5 ? (
                    <span className="p-1 px-2 rounded-2xl bg-purple-200 text-purple-900">
                      For Approval
                    </span>
                  ) : item.status === 6 ? (
                    <span className="p-1 px-2 rounded-2xl bg-red-200 text-red-900">
                      Declined
                    </span>
                  ) : (
                    <span className="p-1 px-2 rounded-2xl bg-red-200 text-red-900">
                      Open
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-2 text-right">
                  {formatMoney(Number(item.amount))}
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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {openAdd && !getPreview.isLoading && (
        <CustomDialog
          close={setOpenAdd}
          title={``}
          width={`!w-[60vw]`}
          height={``}
          closeIcon={`N`}
          button=""
          escape="N"
        >
          <div className="grid grid-cols-1 gap-1 py-6 z-50">
            {/* <span>{id}</span> */}
            <div className="grid grid-cols-1 gap-1 pt-2">
              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">No.</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={data1.no}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Posting Date</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="date"
                      value={data1.post_date}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3 ">
                  <div className=" border-b ">
                    <span className="text-sm">Origin</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={data1.origin}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Due Date</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="date"
                      value={data1.due_date}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Origin No.</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={data1.origin_no}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Document Date</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="date"
                      value={data1.doc_date}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2  items-start">
                <div className="grid grid-cols-3">
                  <div className=" border-b">
                    <span className="text-sm">Remarks</span>
                  </div>
                  <div className="grid col-span-2">
                    <Textarea
                      className="resize-none w-2/3 rounded-none p-1"
                      value={data1.remarks}
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Transaction No.</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="text"
                      value={data1.trans_no}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-0 shadow">
              <table className="w-full">
                <thead className="bg-blue-300 sticky top-0 z-10">
                  <tr>
                    <th className="p-1 border w-[15%]">G/L Account</th>
                    <th className="p-1 border w-[25%]">G/L Name</th>
                    <th className="p-1 border w-[15%]">Debit</th>
                    <th className="p-1 border w-[15%]">Credit</th>
                    <th className="p-1 border w-[15%]">Customer</th>
                    <th className="p-1 border w-[15%]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="">
                  {rows.map((item, index) => (
                    <tr key={index}>
                      <td className=" border">
                        <SelectWithSearch
                          options={accounts.map((item1) => ({
                            label: String(item1.id),
                            value: item1.code,
                          }))}
                          placeholder=""
                          className="border-none"
                          noPadding1
                          value={
                            accounts.find(
                              (item2) => String(item.code) === String(item2.id),
                            )?.code
                          }
                          readOnly
                        />
                      </td>
                      <td className=" border">
                        <SelectWithSearch
                          options={accounts.map((item1) => ({
                            label: String(item1.id),
                            value: item1.name,
                          }))}
                          placeholder=""
                          className="border-none"
                          noPadding1
                          value={
                            accounts.find(
                              (item2) => String(item.code) === String(item2.id),
                            )?.name
                          }
                          readOnly
                        />
                      </td>
                      <td className=" border pr-2">
                        <input
                          className="w-full outline-none text-right"
                          value={
                            item.debit === ""
                              ? ""
                              : String(item.debit) === "0"
                                ? ""
                                : formatMoney(item.debit)
                          }
                          disabled
                          readOnly
                        />
                      </td>
                      <td className=" border pr-2">
                        <input
                          className="w-full outline-none text-right"
                          disabled={item.debit !== ""}
                          value={
                            item.credit === ""
                              ? ""
                              : String(item.credit) === "0"
                                ? ""
                                : formatMoney(item.credit)
                          }
                          readOnly
                        />
                      </td>
                      <td className=" border">
                        <SelectWithSearch
                          options={customer.map((item1) => ({
                            label: String(item1.id),
                            value: item1.name,
                          }))}
                          placeholder=""
                          className="border-none"
                          noPadding1
                          value={
                            customer.find(
                              (item2) =>
                                String(item.customer) === String(item2.id),
                            )?.name
                          }
                          readOnly
                        />
                      </td>
                      <td className=" border">
                        <input
                          className="w-full outline-none"
                          value={item.remarks}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}

                  <tr className="sticky bottom-0 z-10 bg-white">
                    <td colSpan={2} className="p-1 border"></td>
                    <td className="p-1 border text-right pr-2">
                      {formatMoney(
                        rows.reduce((a, b) => a + Number(b.debit || 0), 0),
                      )}
                    </td>
                    <td className="p-1 border text-right pr-2">
                      {formatMoney(
                        rows.reduce((a, b) => a + Number(b.credit || 0), 0),
                      )}
                    </td>
                    <td colSpan={2} className="p-1 border"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="my-5" />

            <div className="flex justify-between">
              <div>
                <Button
                  size="sm"
                  variant="second"
                  onClick={() => {
                    setOpenAdd(false);
                    //   setRows(initialRows);
                    // setData(initialData);
                    // reset();
                    // resetWtax();
                    // resetData();
                    //   setOpenCancel(false);
                    setViewInvoice(0);
                  }}
                  className="px-8"
                >
                  Close
                </Button>
              </div>

              <div className="flex gap-4">
                {/* <Button
                  size="sm"
                  variant="primary"
                  onClick={() => submitApproval(data1.status === 4 ? 1 : 2)}
                  className="px-8"
                >
                  {data1.status === 4 ? `Verify` : `Approve`}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="px-8"
                  onClick={() => submitApproval(3)}
                >
                  Decline
                </Button> */}

                {hasAccess(access, "29", "create") && (
                  <>
                    <div>
                      <YesNo
                        title={
                          <Button size="sm" variant="primary" className="px-8">
                            {data1.status === 4 ? `Verify` : `Approve`}
                          </Button>
                        }
                        funct={() => submitApproval(data1.status === 4 ? 1 : 2)}
                        message={`Are you sure you want to ${data1.status === 4 ? `Verify` : `Approve`} this transaction?`}
                      />
                    </div>

                    <div>
                      <YesNo
                        title={
                          <Button
                            size="sm"
                            variant="destructive"
                            className="px-8"
                          >
                            Decline
                          </Button>
                        }
                        funct={() => submitApproval(3)}
                        message={`Are you sure you want to Decline this transaction?`}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default JournalEntryTable;
