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
  initialData,
  initialRows,
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
  useGetAccountTypeQuery,
  useGetBPsQuery,
  useGetCMPreviewQuery,
  useGetIncTransPreviewQuery,
  useGetInvoicePreviewAPQuery,
  useGetInvoicePreviewQuery,
  useGetWtaxRateQuery,
  useUpApp6Mutation,
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

function IncomingPaymentTable({
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
  const [rows, setRows] = useState<RowInvoices[]>([]);
  const [tad, setTad] = useState(0);

  const [customer, setCustomer] = useState<customer[]>([]);
  const [vendor, setVendor] = useState<customer[]>([]);
  const [accounts, setAccounts] = useState<idName[]>([]);
  const [wtaxOpt, setWtaxOpt] = useState<wtaxRate[]>([]);

  const [docType, setDocType] = useState(1);
  const [data1, setData1] = useState(initialData);
  const [rows1, setRows1] = useState(initialRows);
  const [wtax1, setWtax1] = useState<wtax[]>(initialWtax);

  const [counter, setCounter] = useState(0);

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

  const getTransPrev = useGetIncTransPreviewQuery(
    { id: viewTransact, count: counter },
    {
      skip: viewTransact === 0,
    },
  );
  useEffect(() => {
    if (getTransPrev.isSuccess && getTransPrev.data) {
      const rows = getTransPrev.data.data.invoices;

      // Ensure at least 10 rows
      const minimumRows = 10;
      const filledRows = [...rows]; // Start with the rows from the API

      // // If there are fewer than 10 rows, fill the remaining spots with empty rows
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          checkbox: false,
          doc_num: "",
          type: "",
          date: "",
          overdue: "",
          total: "",
          wtax: "",
          balance: "",
          payment: "",
        });
      }

      // const wtax = getTransPrev.data.data.wtax1;

      // const minimumWTax = 5;
      // const filledTax = [...wtax];

      // while (filledTax.length < minimumWTax) {
      //   filledTax.push({
      //     id: filledTax.length + 1,
      //     code: "0",
      //     name: "",
      //     tax_amt: 0,
      //     wtax_amt: 0,
      //   });
      // }

      setIP(getTransPrev.data.data);
      setInvoiceNo(getTransPrev.data.data.invoice);
      setRows(filledRows);
      // setWtax(filledTax);
    }
  }, [getTransPrev.isSuccess, getTransPrev.data]);

  const getBPs = useGetBPsQuery({ type: 1 });
  const getAccounts = useGetAccountTypeQuery({ type: 4 });
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

  const [upApproval] = useUpApp6Mutation();
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
        {getTransPrev.isLoading && <Loading />}
        <Table className="shadow-sm border">
          <TableHeader className="bg-gray-200 dark:bg-gray-800 rounded-b-sm select-none">
            <TableRow className="">
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                Transaction No.
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Date
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Type
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Customer
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                Invoices
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
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
                    setCounter((prev) => prev + 1);
                    setOpenAdd(true);
                    setViewTransact(item.id);
                  }}
                >
                  <span className="text-blue-800 underline cursor-pointer font-medium">
                    {item.doc_no}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.posting_date}
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.type_display}
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.bp_name}
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.invoices?.join(", ")}
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.status === 1 ? (
                    <span className="p-1 px-2 rounded-2xl bg-blue-200 text-blue-900">
                      Closed
                    </span>
                  ) : item.status === 2 ? (
                    <span className="p-1 px-2 rounded-2xl bg-gray-200 text-gray-900">
                      Canceled
                    </span>
                  ) : item.status === 3 ? (
                    <span className="p-1 px-2 rounded-2xl bg-yellow-200 text-yellow-900">
                      For Verification
                    </span>
                  ) : item.status === 4 ? (
                    <span className="p-1 px-2 rounded-2xl bg-purple-200 text-purple-900">
                      For Approval
                    </span>
                  ) : (
                    <span className="p-1 px-2 rounded-2xl bg-red-200 text-red-900">
                      Declined
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-2 text-right">
                  {formatMoney(Number(item.total_amt))}
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

      {openAdd && !getTransPrev.isLoading && (
        <CustomDialog
          close={setOpenAdd}
          title={``}
          width={`!w-[60vw]`}
          height={``}
          closeIcon={`N`}
          button=""
          escape="N"
        >
          <div className="grid grid-cols-1 gap-1 pt-4">
            <div className="pb-2">
              <RadioGroup
                defaultValue={String(aType)}
                className="flex p-2 gap-8 border w-fit rounded-md"
                disabled
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="1" />
                  <Label htmlFor="1">Customer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="2" />
                  <Label htmlFor="2">Vendor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="3" />
                  <Label htmlFor="3">Account</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2">
              {aType === 1 ? (
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Customer Code</span>
                  </div>
                  <div className="grid col-span-2">
                    <SelectWithSearch
                      options={customer.map((item) => ({
                        label: String(item.id),
                        value: item.code,
                      }))}
                      placeholder="Customer Code"
                      noPadding
                      className="w-2/3"
                      value={iP.bpcode}
                      readOnly
                    />
                  </div>
                </div>
              ) : aType === 2 ? (
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Vendor Code</span>
                  </div>
                  <div className="grid col-span-2">
                    {/* <Input noPadding className="w-2/3" type="text" /> */}
                    <SelectWithSearch
                      options={vendor.map((item) => ({
                        label: String(item.id),
                        value: item.code,
                      }))}
                      placeholder="Vendor Code"
                      noPadding
                      className="w-2/3"
                      value={iP.bpcode}
                      readOnly
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3"></div>
              )}
              <div className="grid grid-cols-5">
                <div></div>
                <div className=" border-b col-span-2">
                  <span className="text-sm">No.</span>
                </div>
                <div className="grid col-span-2 justify-items-end">
                  <Input
                    noPadding
                    className="w-full"
                    type="text"
                    value={iP.invoice}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              {aType === 1 ? (
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Customer Name</span>
                  </div>
                  <div className="grid col-span-2">
                    <SelectWithSearch
                      options={customer.map((item) => ({
                        label: String(item.id),
                        value: item.name,
                      }))}
                      placeholder="Customer Name"
                      noPadding
                      className="w-2/3"
                      value={iP.bpname}
                      readOnly
                    />
                  </div>
                </div>
              ) : aType === 2 ? (
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Vendor Name</span>
                  </div>
                  <div className="grid col-span-2">
                    {/* <Input noPadding className="w-2/3" type="text" /> */}
                    <SelectWithSearch
                      options={vendor.map((item) => ({
                        label: String(item.id),
                        value: item.name,
                      }))}
                      placeholder="Vendor Name"
                      noPadding
                      className="w-2/3"
                      value={iP.bpname}
                      readOnly
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3"></div>
              )}
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
                    value={iP.post_date}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3">
                {aType !== 3 ? (
                  <>
                    <div className=" border-b ">
                      <span className="text-sm">OR No.</span>
                    </div>
                    <div className="grid col-span-2">
                      <Input
                        noPadding
                        className="w-2/3"
                        type="text"
                        value={iP.or}
                        readOnly
                      />
                    </div>
                  </>
                ) : (
                  ``
                )}
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
                    value={iP.due_date}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 pb-4">
              <div className="grid grid-cols-3"></div>
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
                    disabled
                    value={iP.doc_date}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* <div className="my-4 shadow pt-1"> */}
            <div className="h-56 overflow-y-auto py-0 shadow">
              {aType === 1 ? (
                <table className="w-full">
                  <thead className="bg-blue-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-1 border text-sm px-2">
                        <Checkbox id="All" disabled />
                      </th>
                      <th className="p-1 border text-sm">Document No</th>
                      <th className="p-1 border text-sm">Type</th>
                      <th className="p-1 border text-sm">Date</th>
                      <th className="p-1 border text-sm">Overdue Days</th>
                      <th className="p-1 border text-sm">Total</th>
                      <th className="p-1 border text-sm">Wtax</th>
                      <th className="p-1 border text-sm">Balance Due</th>
                      <th className="p-1 border text-sm">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {rows.map((item, index) => (
                      <tr
                        key={index}
                        className={item.checkbox ? `bg-gray-100` : ``}
                      >
                        <td className="p-1 text-sm border text-center">
                          <Checkbox
                            id={String(item.id)}
                            checked={item.checkbox}
                            disabled
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none"
                            value={item.doc_num}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-center"
                            value={item.type}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-center"
                            value={formatDateM(new Date(item.date))}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className={`w-full outline-none text-center ${
                              item.overdue > 30 ? `text-red-700` : ``
                            }`}
                            value={item.overdue}
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.total) === ""
                                ? ""
                                : formatMoney(item.total)
                            }
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.wtax) === ""
                                ? ""
                                : formatMoney(item.wtax)
                            }
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.balance) === ""
                                ? ""
                                : formatMoney(item.balance)
                            }
                          />
                        </td>

                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.payment) === "0" ||
                              String(item.payment) === "0.00"
                                ? ""
                                : String(item.payment) === ""
                                  ? ""
                                  : formatMoney(item.payment)
                            }
                            disabled
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : aType === 2 ? (
                <table className="w-full">
                  <thead className="bg-blue-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-1 border text-sm px-2">
                        <Checkbox id="All" />
                      </th>
                      <th className="p-1 border text-sm">Document No</th>
                      <th className="p-1 border text-sm">Type</th>
                      <th className="p-1 border text-sm">Date</th>
                      <th className="p-1 border text-sm">Overdue Days</th>
                      <th className="p-1 border text-sm">Total</th>
                      <th className="p-1 border text-sm">Wtax</th>
                      <th className="p-1 border text-sm">Balance Due</th>
                      <th className="p-1 border text-sm">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className=""></tbody>
                </table>
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-blue-300 sticky top-0 z-10">
                      <tr>
                        <th className="p-1 border text-sm">Account Code</th>
                        <th className="p-1 border text-sm">Account Name</th>
                        <th className="p-1 border text-sm">Amount</th>
                        <th className="p-1 border text-sm">Customer</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {aRows.map((item, index) => (
                        <tr key={index}>
                          <td className="p-0 text-sm border">
                            {/* <input
                              className="w-full outline-none text-center"
                              value={item.code}
                            /> */}
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
                                  (item2) =>
                                    String(item.code) === String(item2.id),
                                )?.code
                              }
                              readOnly
                            />
                          </td>
                          <td className="p-0 text-sm border">
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
                                  (item2) =>
                                    String(item.code) === String(item2.id),
                                )?.name
                              }
                              readOnly
                            />
                          </td>

                          <td className="p-1 text-sm border">
                            <input
                              className="w-full outline-none text-right"
                              value={
                                item.amount === "0" || item.amount === "0.00"
                                  ? ""
                                  : item.amount
                              }
                            />
                          </td>
                          <td className="p-0 text-sm border">
                            {/* <input
                              className="w-full outline-none text-center"
                              value={item.customer}
                            /> */}
                            <SelectWithSearch
                              options={customer.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              onChange={(e) => {
                                const newRows = [...aRows];
                                newRows[index].customer = e;
                                setARows(newRows);
                              }}
                              className="border-none"
                              noPadding1
                              value={
                                customer.find(
                                  (item2) => item.customer === String(item2.id),
                                )?.name
                              }
                              readOnly
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            {/* </div> */}

            <div className="grid grid-cols-2 py-4">
              <div className="flex flex-col">
                <span className="text-sm ">Remarks</span>
                <Textarea
                  className="w-full h-24 resize-none"
                  onChange={(e) => setIP({ ...iP, remarks: e.target.value })}
                  value={iP.remarks}
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-1">
                {/* <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Payment on Account</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(poa)}
                    />
                    <HandCoins className="invisible" />
                  </div>
                </div> */}

                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2 ">
                    <span className="text-sm">Total Amount Paid</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(iP.paid)}
                    />
                    <PaymentMeans iP={iP} setIP={setIP} type={2} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="mb-5" />

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
              {hasAccess(access, "29", "create") && (
                <>
                  <div>
                    <YesNo
                      title={
                        <Button size="sm" variant="primary" className="px-8">
                          {String(iP.status) === "3" ? `Verify` : `Approve`}
                        </Button>
                      }
                      funct={() => submitApproval(iP.status === 3 ? 1 : 2)}
                      message={`Are you sure you want to ${String(iP.status) === "3" ? `Verify` : `Approve`} this transaction?`}
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
        </CustomDialog>
      )}
    </>
  );
}

export default IncomingPaymentTable;
