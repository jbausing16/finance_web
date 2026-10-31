import { useEffect, useState } from "react";
import CustomDialog from "./CustomDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatDateM, formatMoney } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useGetIncomingTransQuery,
  useGetOutgoingTrans1Query,
  useGetOutgoingTransQuery,
  useGetOutTransPreviewQuery,
} from "@/store/api/AdministrationApi";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { SelectWithSearch } from "../ui/SelectWithSearch";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import PaymentMeans from "./PaymentMeans";
import type { Incoming } from "../pages/banking/OutgoingPayment";

type idName = {
  id: number;
  code: string;
  name: string;
};

type transactions = {
  id: number;
  doc_no: string;
  posting_date: string;
  bp_name: string;
  invoices: [];
  status: number;
  type: string;
  type_display: string;
  total_amt: string;
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

type Recon = {
  id: number;
  bsid: number;
  tno: number;
  invoice: string[];
  amount: string;
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

interface OutgoingListProps {
  id: number;
  bank: number;
  activeRow: number;
  recon: Recon;
  setRecon: React.Dispatch<React.SetStateAction<Recon>>;
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

function OutgoingList({
  id,
  bank,
  setRecon,
  recon,
  activeRow,
}: OutgoingListProps) {
  const [open, setOpen] = useState(false);

  const [transactions, setTransactions] = useState<transactions[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);

  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState(1);
  const [aType, setAType] = useState(2);

  const [tad, setTad] = useState(0);

  const [customer, setCustomer] = useState<customer[]>([]);
  const [vendor, setVendor] = useState<customer[]>([]);
  const [accounts, setAccounts] = useState<idName[]>([]);
  const [invoiceNo, setInvoiceNo] = useState(0);
  const [iP, setIP] = useState<Incoming>(initial);

  const [rows, setRows] = useState<RowInvoices[]>([]);

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

  const [viewTransact, setViewTransact] = useState(0);
  const [counter, setCounter] = useState(0);

  const [selected, setSelected] = useState(0);

  const [oldRecon, setOldRecon] = useState<Recon>({
    id: 0,
    bsid: 0,
    tno: 0,
    invoice: [],
    amount: "",
  });

  const [selected1, setSelected1] = useState(0);
  const [selected3, setSelected3] = useState(0);

  const [oldRecon1, setOldRecon1] = useState<Recon>({
    id: 0,
    bsid: 0,
    tno: 0,
    invoice: [],
    amount: "",
  });

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getTrans = useGetOutgoingTrans1Query({ page: page, bank: bank });
  useEffect(() => {
    if (getTrans.isSuccess && getTrans.data) {
      setTransactions(getTrans.data.results);
      setTotalPages(Math.ceil(getTrans?.data?.count / 10));
      setCount(getTrans.data.count);
    }
  }, [getTrans.isSuccess, getTrans.data]);

  useEffect(() => {
    if (selected3 !== 0) {
      setSelected(0);
    }
  }, [selected, selected3]);

  // console.log("Recon: ", recon);

  const getTransPrev = useGetOutTransPreviewQuery(
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

      setIP(getTransPrev.data.data);
      setInvoiceNo(getTransPrev.data.data.invoice);
      setRows(filledRows);
    }
  }, [getTransPrev.isSuccess, getTransPrev.data]);

  useEffect(() => {
    if (iP.invoices.length > 0) {
      let due = iP.invoices.reduce(
        (sum, row) =>
          sum + parseFloat(row.payment?.toString().replace(/,/g, "")) || 0,
        0,
      );
      setIP({ ...iP, paid: String(due.toFixed(2)) });
      setTad(due);
    }

    if (parseFloat(iP.paid) > 0) {
      setTad(parseFloat(iP.paid.replace(/,/g, "")));
    }
  }, [iP.invoices, iP.paid]);

  return (
    <>
      <div className="" onClick={() => setOpen(true)}>
        {recon.id === 0 || activeRow !== id
          ? `Choose Invoice`
          : `${oldRecon1.tno}`}
      </div>

      {open && (
        <CustomDialog
          close={setOpen}
          title=""
          width="!w-[70vw]"
          height="!h-[80vh]"
          closeIcon="Y"
          button=""
          escape="N"
        >
          <span className="text-xl">Outgoing Payments</span>
          <div className="flex flex-col gap-4 pt-5">
            <Table className="shadow-sm border">
              <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
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
                {transactions.map((item, idx) => (
                  <TableRow
                    key={idx}
                    onClick={() => {
                      setSelected1(item.id);
                      setSelected3(item.id);
                      setOldRecon1({
                        id: item.id,
                        bsid: id,
                        tno: Number(item.doc_no),
                        invoice: item.invoices,
                        amount: item.total_amt,
                      });
                    }}
                    className={`${
                      selected === item.id || selected3 === item.id
                        ? `bg-blue-100 hover:bg-blue-100`
                        : ``
                    }`}
                  >
                    <TableCell className="py-2 text-center">
                      <span
                        onClick={() => {
                          setType(2);
                          setOpenAdd(true);
                          setViewTransact(item.id);
                        }}
                        className="text-blue-800 underline cursor-pointer font-medium"
                      >
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
                      {item.invoices}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.status === 6 ? (
                        <span className="p-1 px-2 rounded-2xl bg-blue-200 text-blue-900">
                          Open
                        </span>
                      ) : (
                        <span className="p-1 px-2 rounded-2xl bg-gray-300 text-gray-900">
                          Closed
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
                disabled={currentPage === totalPages || count === 0}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                variant={"primary"}
                onClick={() => {
                  setSelected(selected1);
                  // setOldRecon(oldRecon1);
                  setRecon(oldRecon1);
                  setOpen(false);
                }}
              >
                Choose
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}

      {openAdd && (
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
            {(type === 1 || type === 2) && (
              <div className="pb-2">
                <RadioGroup
                  defaultValue={String(aType)}
                  className="flex p-2 gap-8 border w-fit rounded-md"
                  disabled={type === 2}
                >
                  <div
                    className="flex items-center space-x-2"
                    onClick={() => {
                      type === 2 ? `` : setAType(1);
                    }}
                  >
                    <RadioGroupItem value="1" id="1" />
                    <Label htmlFor="1">Customer</Label>
                  </div>
                  <div
                    className="flex items-center space-x-2"
                    onClick={() => {
                      type === 2 ? `` : setAType(2);
                    }}
                  >
                    <RadioGroupItem value="2" id="2" />
                    <Label htmlFor="2">Vendor</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <div className="grid grid-cols-2">
              {aType === 1 ? (
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Customer Code</span>
                  </div>
                  <div className="grid col-span-2">
                    {/* <Input noPadding className="w-2/3" type="text" /> */}
                    <SelectWithSearch
                      options={customer.map((item) => ({
                        label: String(item.id),
                        value: item.code,
                      }))}
                      placeholder="Customer Code"
                      noPadding
                      className="w-2/3"
                      value={iP.bpcode}
                      readOnly={type !== 1}
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
                      readOnly={type !== 1}
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
                    // value={invoiceNo}
                    value={invoiceNo}
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
                      readOnly={type !== 1}
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
                      readOnly={type !== 1}
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
                    readOnly={type === 2}
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
                        readOnly={type === 2}
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
                    readOnly={type === 2}
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
                    readOnly={type === 2}
                  />
                </div>
              </div>
            </div>

            {/* <div className="my-4 shadow pt-1"> */}
            <div className="h-56 overflow-y-auto py-0 shadow">
              {aType === 2 ? (
                <table className="w-full">
                  <thead className="bg-blue-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-1 border text-sm px-2">
                        <Checkbox id="All" disabled={type === 2} />
                      </th>
                      <th className="p-1 border text-sm">Document No.</th>
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
                            disabled={type === 2}
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
                              String(item.total) !== ""
                                ? formatMoney(item.total)
                                : ""
                            }
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.wtax) !== ""
                                ? formatMoney(item.wtax)
                                : ""
                            }
                          />
                        </td>
                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              String(item.wtax) !== ""
                                ? formatMoney(item.balance)
                                : ""
                            }
                          />
                        </td>

                        <td className="p-1 text-sm border">
                          <input
                            className="w-full outline-none text-right"
                            value={
                              type === 2
                                ? item.payment === ""
                                  ? ""
                                  : formatMoney(item.payment)
                                : item.payment === "0" ||
                                    item.payment === "0.00"
                                  ? ""
                                  : item.payment
                            }
                            disabled={!item.checkbox}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : aType === 1 ? (
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
                                value: item1.name,
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
                              readOnly={type === 2 || type === 3}
                            />
                          </td>
                          <td className="p-0 text-sm border">
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
                                )?.name
                              }
                              readOnly={type === 2 || type === 3}
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
                              className="border-none"
                              noPadding1
                              value={
                                customer.find(
                                  (item2) => item.customer === String(item2.id),
                                )?.name
                              }
                              readOnly={type === 2 || type === 3}
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
                  value={iP.remarks}
                  readOnly={type === 2}
                />
              </div>
              <div className="flex flex-col gap-1">
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
                      value={formatMoney(tad)}
                    />
                    <PaymentMeans
                      iP={iP}
                      setIP={setIP}
                      type={type}
                      mod="out"
                      aType={aType}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="mb-5" />

          <div className="flex justify-between">
            <div></div>

            <div className="flex gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => setOpenAdd(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default OutgoingList;
