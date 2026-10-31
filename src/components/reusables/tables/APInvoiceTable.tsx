import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, hasAccess } from "@/lib/utils";
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
  useGetInventoryItemsQuery,
  useGetInvoicePreviewAPQuery,
  useGetInvoicePreviewQuery,
  useGetWtaxRateQuery,
  useUpApp4Mutation,
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
import { toast } from "sonner";
import YesNo from "../YesNo";
import { Loading } from "../Loading";
import { SelectWithSearch1 } from "@/components/ui/SelectWithSearch1";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

type idName = {
  id: number;
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

type choices = {
  id: number;
  code: string;
  type: number;
  level: number;
  name: string;
  child: any[];
};

type items = {
  id: number;
  code: string;
  name: string;
  vendor: number;
  p_cost: string;
  p_sales: string;
  stock: number;
  p_cogs: string;
  p_income: string;
  uom: string;
  status: number;
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

function APInvoiceTable({
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
  const [viewInvoice, setViewInvoice] = useState(0);

  const [customer, setCustomer] = useState<customer[]>([]);
  const [accounts, setAccounts] = useState<idName[]>([]);
  const [accountsAll, setAccountsAll] = useState<choices[]>([]);
  const [wtaxOpt, setWtaxOpt] = useState<wtaxRate[]>([]);

  const [docType, setDocType] = useState(1);
  const [data1, setData1] = useState(initialData);
  const [rows1, setRows1] = useState(initialRows);
  const [wtax1, setWtax1] = useState<wtax[]>(initialWtax);

  const [canceled, setCanceled] = useState(false);

  const [items, setItems] = useState<items[]>([]);

  const [counter, setCounter] = useState(0);

  const getInvPrev = useGetInvoicePreviewAPQuery(
    { id: viewInvoice, count: counter },
    {
      skip: viewInvoice === 0,
    },
  );
  useEffect(() => {
    if (getInvPrev.isSuccess && getInvPrev.data) {
      const rows = getInvPrev.data.data.rows;

      const minimumRows = 10;
      const filledRows = [...rows];

      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          description: "",
          account: "",
          customer: "",
          vatable: "0",
          wtax: "0",
          discount: "",
          amount: "",
        });
      }

      const wtax = getInvPrev.data.data.wtax1;

      const minimumWTax = 5;
      const filledTax = [...wtax];

      while (filledTax.length < minimumWTax) {
        filledTax.push({
          id: filledTax.length + 1,
          code: "0",
          name: "",
          tax_amt: 0,
          wtax_amt: 0,
        });
      }

      setData1(getInvPrev.data.data);
      setRows1(filledRows);
      setWtax1(filledTax);
      setDocType(getInvPrev.data.data.type);
      setCanceled(getInvPrev.data.data.cancelation);
    }
  }, [getInvPrev.isSuccess, getInvPrev.data]);

  const getAccountsAll = useGetAccountTypeQuery({ type: 0 });
  useEffect(() => {
    if (getAccountsAll.isSuccess && getAccountsAll.data) {
      setAccountsAll(getAccountsAll.data.data);
    }
  }, [getAccountsAll.isSuccess, getAccountsAll.data]);

  const getBPs = useGetBPsQuery({ type: 1 });
  const getAccounts = useGetAccountTypeQuery({ type: 4 });
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setCustomer(getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);
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

  const getItems = useGetInventoryItemsQuery({});
  useEffect(() => {
    if (getItems.isSuccess && getItems.data) {
      setItems(getItems.data.data);
    }
  }, [getItems.isSuccess, getItems.data]);

  const [upApproval] = useUpApp4Mutation();
  const submitApproval = async (status: number) => {
    try {
      const formData = new FormData();
      formData.append("id", String(viewInvoice));
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
        {getInvPrev.isLoading && <Loading />}
        <Table className="shadow-sm border">
          <TableHeader className="bg-gray-200 dark:bg-gray-800 rounded-b-sm select-none">
            <TableRow className="">
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                Invoice No.
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Invoice Date
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                Due Date
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                Status
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Reference No.
              </TableHead>
              <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                Vendor
              </TableHead>
              <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                Total Amount
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
                <TableCell className="py-2 text-center">
                  <span
                    onClick={() => {
                      setOpenAdd(true);
                      setCounter((prev) => prev + 1);
                      setTimeout(() => {
                        setViewInvoice(item.id);
                        setOpenAdd(true);
                      }, 0);
                    }}
                    className="text-blue-800 underline cursor-pointer font-medium"
                  >
                    {item.invoice}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-center">{item.date}</TableCell>
                <TableCell className="py-2 text-center">
                  {item.due_date}
                </TableCell>
                <TableCell className="py-2 text-center">
                  <span className={getStatus(item.status)?.style}>
                    {getStatus(item.status)?.name}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-center">
                  {item.po_num}
                </TableCell>

                <TableCell className="py-2 text-center">
                  {item.vendor}
                </TableCell>

                <TableCell className="py-2 text-right flex justify-end gap-3">
                  {formatMoney(item.total)}{" "}
                  <PrintAPInvoice id={item.id} status={item.status} />
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

      {openAdd && !getInvPrev.isLoading && (
        <CustomDialog
          close={setOpenAdd}
          title={`View A/P Invoice ${canceled ? `- Cancellation` : ``}`}
          width={`!w-[65vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
          escape="N"
        >
          <div className="grid grid-cols-1 gap-1 pt-4 ">
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3">
                <div className=" border-b ">
                  <span className="text-sm">Customer Code</span>
                </div>
                <div className="grid col-span-2">
                  <Input
                    noPadding
                    className="w-2/3"
                    type="text"
                    value={data1.ccode}
                  />
                </div>
              </div>
              <div className="grid grid-cols-5">
                <div></div>
                <div className=" border-b col-span-2">
                  <span className="text-sm">Invoice No.</span>
                </div>
                <div className="grid col-span-2 justify-items-end">
                  <Input
                    noPadding
                    className="w-full "
                    type="text"
                    value={data1.invoice}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3 ">
                <div className=" border-b ">
                  <span className="text-sm">Customer Name</span>
                </div>
                <div className="grid col-span-2">
                  <Input
                    noPadding
                    className="w-2/3"
                    type="text"
                    value={data1.cname}
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
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3">
                <div className=" border-b ">
                  <span className="text-sm">Contact Person</span>
                </div>
                <div className="grid col-span-2">
                  <Input
                    noPadding
                    className="w-2/3"
                    type="text"
                    value={data1.cperson}
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
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3">
                <div className=" border-b ">
                  <span className="text-sm">PO No.</span>
                </div>
                <div className="grid col-span-2">
                  <Input
                    noPadding
                    className="w-2/3"
                    type="text"
                    value={data1.po}
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
                    disabled
                    value={data1.doc_date}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 pb-4">
              <div className="grid grid-cols-3">
                <div className=" border-b ">
                  <span className="text-sm">Document Type</span>
                </div>
                <div className="grid col-span-2">
                  <Select
                    // value={String(docType)}
                    value={String(data1.type)}
                    // onValueChange={(e) => setDocType(Number(e))}
                    disabled
                  >
                    <SelectTrigger className="w-2/3 !p-0 !m-0 !h-auto !min-h-0 !leading-none !py-0 !px-1 rounded-none border focus-visible:ring-[1px] ">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Item</SelectItem>
                      <SelectItem value="2">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* <div className="grid grid-cols-5">
                <div></div>
                <div className=" border-b col-span-2">
                  <span className="text-sm">Receipt Date</span>
                </div>
                <div className="grid col-span-2 justify-items-end">
                  <Input
                    noPadding
                    className="w-full"
                    type="date"
                    disabled
                    value={data1.receipt_date ?? ""}
                  />
                </div>
              </div> */}
            </div>

            {/* <div className="my-4 shadow pt-1"> */}
            <div className="max-h-44 overflow-y-auto py-0 shadow">
              {data1.type === 2 ? (
                <>
                  <table className="w-full">
                    <thead className="bg-blue-300 sticky top-0 z-10">
                      <tr>
                        <th className="p-1 border">Description</th>
                        <th className="p-1 border">Account</th>
                        <th className="p-1 border">Customer</th>
                        <th className="p-1 border">Vatable</th>
                        <th className="p-1 border">WTax</th>
                        <th className="p-1 border">Discount</th>
                        <th className="p-1 border">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {rows1.map((item, index) => (
                        <tr key={index}>
                          <td className="p-1 border">
                            <input
                              className="w-full outline-none"
                              value={item.description}
                              readOnly
                            />
                          </td>
                          <td className="p-0 border">
                            <SelectWithSearch
                              options={accounts.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              className="w-36 border-none"
                              noPadding1
                              value={
                                accountsAll.find(
                                  (item2) =>
                                    String(item.account) === String(item2.id),
                                )?.name
                              }
                              readOnly
                            />
                          </td>
                          <td className="p-0 border">
                            <SelectWithSearch
                              options={customer.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              className="w-36 border-none"
                              noPadding1
                              value={
                                customer.find(
                                  (item2) => item.customer === String(item2.id),
                                )?.name
                              }
                              readOnly
                            />
                          </td>
                          <td className="p-1 border">
                            <select
                              className="outline-none text-sm appearance-none w-full text-center"
                              value={item.vatable}
                              disabled
                            >
                              <option value={0}></option>
                              <option value={1}>Yes</option>
                              <option value={2}>No</option>
                            </select>
                          </td>
                          <td className="p-1 border">
                            <select
                              className="outline-none text-sm appearance-none w-full text-center"
                              value={item.wtax}
                              disabled
                            >
                              <option value={0}></option>
                              <option value={1}>Yes</option>
                              <option value={2}>No</option>
                            </select>
                          </td>
                          <td className="p-1 border">
                            <input
                              className="w-full outline-none text-right"
                              value={
                                item.discount === ""
                                  ? ""
                                  : item.discount
                                    ? formatMoney(Number(item.discount))
                                    : ""
                              }
                              readOnly
                            />
                          </td>
                          <td className="p-1 border">
                            <input
                              className="w-full outline-none text-right"
                              value={
                                item.amount === ""
                                  ? ""
                                  : formatMoney(Number(item.amount))
                              }
                              readOnly
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-blue-300 sticky top-0 z-10">
                      <tr>
                        <th className="p-1 border">Product</th>
                        <th className="p-1 border">Account</th>
                        <th className="p-1 border">Customer</th>
                        <th className="p-1 border">Vatable</th>
                        <th className="p-1 border">WTax</th>
                        <th className="p-1 border">Price</th>
                        <th className="p-1 border">Disc.</th>
                        <th className="p-1 border">Qty.</th>
                        <th className="p-1 border">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {rows1.map((item, index) => (
                        <tr key={index}>
                          <td className="p-1 border">
                            <SelectWithSearch
                              options={items.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              className="w-36 border-none"
                              noPadding1
                              value={
                                items.find(
                                  (item2) =>
                                    String(item.product) === String(item2.id),
                                )?.name
                              }
                              readOnly
                            />
                          </td>
                          <td className="p-0 border">
                            <SelectWithSearch1
                              options={accounts}
                              placeholder=""
                              className="w-36 border-none"
                              noPadding1
                              value={
                                accountsAll.find(
                                  (item2) =>
                                    String(item.account) === String(item2.id),
                                )?.name
                              }
                              readOnly
                              id={String(item.account)}
                            />
                          </td>
                          <td className="p-0 border">
                            <SelectWithSearch
                              options={customer.map((item1) => ({
                                label: String(item1.id),
                                value: item1.name,
                              }))}
                              placeholder=""
                              className="w-36 border-none"
                              noPadding1
                              value={
                                customer.find(
                                  (item2) => item.customer === String(item2.id),
                                )?.name
                              }
                              readOnly
                            />
                          </td>
                          <td className="p-1 border">
                            <select
                              className="outline-none text-sm appearance-none w-full text-center"
                              value={item.vatable}
                              disabled
                            >
                              <option value={0}></option>
                              <option value={1}>Yes</option>
                              <option value={2}>No</option>
                            </select>
                          </td>
                          <td className="p-1 border">
                            <select
                              className="outline-none text-sm appearance-none w-full text-center"
                              value={item.wtax}
                              disabled
                            >
                              <option value={0}></option>
                              <option value={1}>Yes</option>
                              <option value={2}>No</option>
                            </select>
                          </td>
                          <td className="p-1 border w-20">
                            <input
                              className="max-w-[100px] outline-none text-right"
                              value={
                                item.amount === ""
                                  ? ""
                                  : formatMoney(item.price)
                              }
                              readOnly
                            />
                          </td>

                          <td className="p-1 border">
                            <input
                              className="max-w-[100px] outline-none text-right"
                              value={
                                Number(item.discount) === 0
                                  ? ``
                                  : formatMoney(Number(item.discount))
                              }
                              readOnly
                            />
                          </td>
                          <td className="p-1 border">
                            <input
                              className="max-w-[50px] outline-none text-right"
                              value={item.qty}
                              readOnly
                            />
                          </td>
                          <td className="p-1 border">
                            <input
                              className="max-w-[100px] outline-none text-right"
                              value={
                                Number(item.amount) === 0
                                  ? ``
                                  : formatMoney(Number(item.amount))
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
                  className="w-full h-24 resize-none rounded-none"
                  value={data1.remarks}
                />
              </div>
              <div className="grid gap-1">
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Total Before Discount</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(Number(data1.pricebefvat))}
                      // value={totalBefDiscountAmt}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Discount</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(Number(data1.discount))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">VAT</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(Number(data1.vat))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm flex items-center justify-between">
                      WTax{" "}
                      <Wtax
                        wtax={wtax1}
                        setWtax={setWtax1}
                        taxableAmt={0}
                        wtaxOpt={wtaxOpt}
                        type={1}
                        // setTotalWTax={setTotalWTax}
                      />
                    </span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(Number(data1.wtax))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Total Amount</span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(Number(data1.total))}
                    />
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
              {/* <Button
                size="sm"
                variant="primary"
                onClick={() => submitApproval(data1.status === 5 ? 1 : 2)}
                className="px-8"
              >
                {data1.status === 5 ? `Verify` : `Approve`}
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
                          {data1.status === 5 ? `Verify` : `Approve`}
                        </Button>
                      }
                      funct={() => submitApproval(data1.status === 5 ? 1 : 2)}
                      message={`Are you sure you want to ${data1.status === 5 ? `Verify` : `Approve`} this transaction?`}
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

export default APInvoiceTable;
