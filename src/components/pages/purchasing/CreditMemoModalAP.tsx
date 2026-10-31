import CustomDialog from "@/components/reusables/CustomDialog";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { initialData, type wtaxRate } from "../sales/ARInvoice";
import { Textarea } from "@/components/ui/textarea";
import { HandCoins } from "lucide-react";
import { formatMoney, hasAccess, round2 } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  useAddAPCMMutation,
  useAddARCMMutation,
  useGetAccountTypeQuery,
  useGetAutoDocNoQuery,
  useGetBPsQuery,
  useGetWtaxRateQuery,
} from "@/store/api/AdministrationApi";
import { toast } from "sonner";
import Wtax from "../sales/Wtax";

type rows = {
  id: number;
  description: string;
  account: string;
  customer: string;
  vatable: string;
  wtax: string;
  discount: string;
  amount: string;
  product: string;
  cogs: string;
  income: string;
  price: string;
  qty: string;
};

type choices = {
  id: number;
  code: string;
  type: number;
  level: number;
  name: string;
  child: any[];
};

type wtax = {
  id: number;
  code: string;
  name: string;
  tax_amt: number;
  wtax_amt: number;
};

export type customer = {
  id: number;
  code: string;
  name: string;
  terms: number;
  wtax: number;
  tax_stat: number;
  c_person: string;
};

interface CreditMemoModalAPModalProps {
  openAdd: boolean;
  setOpenAdd: React.Dispatch<React.SetStateAction<boolean>>;
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  data1: rows[];
  docType: number;
  currId: number;
}

function CreditMemoModalAP({
  openAdd,
  setOpenAdd,
  data,
  setData,
  data1,
  docType,
  currId,
}: CreditMemoModalAPModalProps) {
  console.log("Data", data);
  console.log("Data1", data1);
  const [addLoading, setAddLoading] = useState(false);
  const [invoiceNoCM, setInvoiceNoCM] = useState(0);

  const [accountsAll, setAccountsAll] = useState<choices[]>([]);
  const [customer, setCustomer] = useState<customer[]>([]);

  const [rows, setRows] = useState<rows[]>([]);
  const [wtax, setWtax] = useState<wtax[]>([]);

  const [wtaxOpt, setWtaxOpt] = useState<wtaxRate[]>([]);

  const access = useSelector((state: RootState) => state.auth.access);

  const getARCMDocNum = useGetAutoDocNoQuery(
    { name: "A/R Credit Memo" },
    { skip: !openAdd },
  );

  useEffect(() => {
    if (data) {
      // setRows(data?.rows);

      const minimumRows = 10;
      let filledRows = [...data?.rows]; // Start with the rows from the API

      // If there are fewer than 10 rows, fill the remaining spots with empty rows
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1,
          description: "",
          account: "",
          customer: "",
          vatable: "",
          wtax: "",
          discount: "",
          amount: "",
          product: "",
          cogs: "",
          income: "",
          price: "",
          qty: "",
        });
      }

      filledRows = filledRows.map((previous: any) => ({
        ...previous,
        discount: "",
        amount: "",
      }));

      const minimumRowsT = 5;
      let filledRowsT = [...data?.wtax1]; // Start with the rows from the API

      // If there are fewer than 10 rows, fill the remaining spots with empty rows
      while (filledRowsT.length < minimumRowsT) {
        filledRowsT.push({
          id: filledRowsT.length + 1,
          code: "",
          name: "",
          tax_amt: 0,
          wtax_amt: 0,
        });
      }

      filledRowsT = filledRowsT.map((previous: any) => ({
        ...previous,
        tax_amt: 0,
        wtax_amt: 0,
      }));

      setRows(filledRows);
      setWtax(filledRowsT);

      console.log("Wtax: ", filledRowsT);
    }
    console.log("Wtax: ", data);
  }, [data]);

  const getWtax = useGetWtaxRateQuery({});
  useEffect(() => {
    if (getWtax.isSuccess && getWtax.data) {
      setWtaxOpt(getWtax.data.data);
    }
  }, [getWtax.isSuccess, getWtax.data]);

  useEffect(() => {
    if (getARCMDocNum.isSuccess && getARCMDocNum.data) {
      setInvoiceNoCM(getARCMDocNum.data.no);
    }
  }, [getARCMDocNum.isSuccess, getARCMDocNum.data]);

  const getAccountsAll = useGetAccountTypeQuery({ type: 0 });
  useEffect(() => {
    if (getAccountsAll.isSuccess && getAccountsAll.data) {
      setAccountsAll(getAccountsAll.data.data);
    }
  }, [getAccountsAll.isSuccess, getAccountsAll.data]);

  const getBPs = useGetBPsQuery({ type: 1 });
  useEffect(() => {
    if (getBPs.isSuccess && getBPs.data) {
      setCustomer(getBPs.data.data);
    }
  }, [getBPs.isSuccess, getBPs.data]);

  //   if (openAdd) {
  //     setData({ ...data, post_date: new Date().toLocaleDateString("en-CA") });
  //   }

  const totalBefDiscountAmt = rows.reduce((sum, row) => {
    const amount = parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;

    const value =
      String(row.vatable) === "1" ? round2(Number(amount / 1.12)) : amount;

    return sum + round2(value);
  }, 0);

  const discountAmt = rows.reduce((sum, row) => {
    const discount =
      parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

    return sum + round2(discount);
  }, 0);

  const vatAmt = rows.reduce((sum, row) => {
    const amount = parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
    const discount =
      parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

    const vat =
      String(row.vatable) === "1"
        ? Number(amount) - (round2(Number(amount / 1.12)) - discount)
        : 0;

    return sum + round2(vat);
  }, 0);

  const taxableAmt = rows.reduce((sum, row) => {
    const amount = parseFloat(row.amount?.toString().replace(/,/g, "")) || 0;
    const discount =
      parseFloat(row.discount?.toString().replace(/,/g, "")) || 0;

    const taxable =
      String(row.wtax) === "1"
        ? String(row.vatable) === "1"
          ? amount / 1.12 - discount
          : amount - discount
        : 0;

    return sum + round2(taxable);
  }, 0);

  const wTaxAmt = wtax.reduce((sum, row) => sum + (row.wtax_amt || 0), 0);

  useEffect(() => {
    if (data.c_wtax !== 0) {
      let newRate = wtaxOpt.find((item) => data.c_wtax === item.id);
      setWtax((prev) => {
        const newWtax = [...prev];
        newWtax[0] = {
          ...newWtax[0],
          tax_amt: taxableAmt,
          wtax_amt: taxableAmt * (newRate?.rate || 0),
        };
        return newWtax;
      });
    }
  }, [taxableAmt]);

  //   const [addARCM] = useAddARCMMutation();
  const [addAPCM] = useAddAPCMMutation();
  const submitInvoice = async () => {
    try {
      const formData = new FormData();
      formData.append("docType", String(docType));
      formData.append("tbda", String(totalBefDiscountAmt));
      formData.append("discount", String(discountAmt));
      formData.append("vatAmt", String(vatAmt));
      formData.append("wtaxAmt", String(wTaxAmt));

      formData.append(
        "total",
        String(totalBefDiscountAmt - discountAmt + vatAmt),
      );

      formData.append("currId", String(currId));

      let checkstat: any;

      formData.append("datas", JSON.stringify(data));
      formData.append("rows", JSON.stringify(rows));
      formData.append("wtax", JSON.stringify(wtax));

      checkstat = await addAPCM(formData).unwrap();

      if (checkstat.success) {
        setOpenAdd(false);
        setAddLoading(false);
        toast.success(checkstat.message);
      } else {
        toast.error(checkstat.message);
        setAddLoading(false);
        return;
      }
    } catch (error: any) {
      const message =
        error?.data?.message || error?.data?.detail || "Something went wrong";
      setAddLoading(false);
      toast.error(message);
    }
  };

  return (
    <div>
      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={`A/P Credit Memo`}
          width={`!w-[65vw]`}
          height={``}
          closeIcon={`N`}
          button=""
          escape="N"
        >
          <div className="grid grid-cols-1 gap-1 pt-4 ">
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3">
                <div className=" border-b ">
                  <span className="text-sm">Vendor Code</span>
                </div>
                <div className="grid col-span-2">
                  <Input
                    noPadding
                    className="w-2/3"
                    type="text"
                    value={data?.ccode}
                    readOnly
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
                    value={invoiceNoCM}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-3 ">
                <div className=" border-b ">
                  <span className="text-sm">Vendor Name</span>
                </div>
                <div className="grid col-span-2">
                  <Input
                    noPadding
                    className="w-2/3"
                    type="text"
                    value={data?.cname}
                    readOnly
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
                    value={data?.post_date}
                    onChange={(e) => {
                      setData({ ...data, post_date: e.target.value });
                    }}
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
                    value={data.cperson}
                    readOnly
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
                    value={data.due_date}
                    readOnly
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
                    value={data.po}
                    readOnly
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
                    value={new Date().toLocaleDateString("en-CA")}
                    readOnly
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
                  <Input
                    noPadding
                    className="w-2/3"
                    disabled
                    value={"Service"}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* <div className="my-4 shadow pt-1"> */}
            <div className="max-h-44 overflow-y-auto py-0 shadow">
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
                    {rows.map((item, index) => (
                      <tr key={index}>
                        <td
                          className={`p-1 border ${item.account === "" ? `bg-gray-100` : ``} `}
                        >
                          <input
                            className="w-full outline-none"
                            value={item.description}
                            readOnly={item.account === ""}
                          />
                        </td>
                        <td
                          className={`p-1 border ${item.account === "" ? `bg-gray-100` : ``} `}
                        >
                          <input
                            className="w-full outline-none"
                            value={
                              accountsAll.find(
                                (item1: any) =>
                                  String(item1.id) === String(item.account),
                              )?.name
                            }
                            readOnly={item.account === ""}
                          />
                        </td>
                        <td
                          className={`p-1 border ${item.account === "" ? `bg-gray-100` : ``} `}
                        >
                          <input
                            className="w-full outline-none"
                            value={
                              customer.find(
                                (item1: any) =>
                                  String(item1.id) === String(item.customer),
                              )?.name
                            }
                            readOnly={item.account === ""}
                          />
                        </td>
                        <td
                          className={`p-1 border ${item.account === "" ? `bg-gray-100` : ``} `}
                        >
                          <select
                            className="outline-none text-sm appearance-none w-full text-center"
                            value={item.vatable}
                            disabled={item.account === ""}
                            onChange={(e) => {
                              const newRows = [...rows];
                              newRows[index].vatable = e.target.value;
                              setRows(newRows);
                            }}
                          >
                            <option value={1}>Yes</option>
                            <option value={2}>No</option>
                          </select>
                        </td>
                        <td
                          className={`p-1 border ${item.account === "" ? `bg-gray-100` : ``} `}
                        >
                          <select
                            className="outline-none text-sm appearance-none w-full text-center"
                            value={item.wtax}
                            disabled={item.account === ""}
                            onChange={(e) => {
                              const newRows = [...rows];
                              newRows[index].wtax = e.target.value;
                              setRows(newRows);
                            }}
                          >
                            <option value={1}>Yes</option>
                            <option value={2}>No</option>
                          </select>
                        </td>
                        <td
                          className={`p-1 border ${item.account === "" ? `bg-gray-100` : ``} `}
                        >
                          <input
                            className="w-full outline-none text-right"
                            value={item.discount}
                            onChange={(e) => {
                              let value = e.target.value.replace(/,/g, ""); // remove commas for validation

                              if (!/^\d*\.?\d{0,2}$/.test(value)) return;

                              let amt =
                                item.vatable === "1"
                                  ? Number(item.amount.replace(/,/g, "")) / 1.12
                                  : Number(item.amount.replace(/,/g, ""));

                              const num = parseFloat(value);

                              // block values greater than max
                              if (!isNaN(num) && num > amt) return;

                              // Allow only numbers and up to 2 decimals
                              // if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                              const newRows = [...rows];
                              newRows[index].discount = value;
                              setRows(newRows);
                              // }
                            }}
                            onBlur={() => {
                              const newRows = [...rows];
                              const num = parseFloat(item.discount);

                              if (!isNaN(num)) {
                                // Format with commas and 2 decimals
                                newRows[index].discount = num.toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                );
                              } else {
                                newRows[index].discount = "";
                              }

                              setRows(newRows);
                            }}
                            onFocus={(e) => {
                              // remove formatting while editing
                              const newRows = [...rows];
                              newRows[index].discount = item.discount.replace(
                                /,/g,
                                "",
                              );
                              setRows(newRows);
                            }}
                            disabled={item.account === ""}
                          />
                        </td>
                        <td
                          className={`p-1 border ${item.account === "" ? `bg-gray-100` : ``} `}
                        >
                          <input
                            className="w-full outline-none text-right"
                            value={item.amount}
                            onChange={(e) => {
                              let value = e.target.value.replace(/,/g, "");

                              if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                                const newRows = [...rows];
                                newRows[index] = {
                                  ...newRows[index],
                                  amount: value,
                                };

                                setRows(newRows);
                              }
                            }}
                            onBlur={() => {
                              const newRows = [...rows];
                              const num = parseFloat(item.amount);

                              if (!isNaN(num)) {
                                // Format with commas and 2 decimals
                                newRows[index].amount = num.toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                );
                              } else {
                                newRows[index].amount = "";
                              }

                              setRows(newRows);
                            }}
                            onFocus={(e) => {
                              // remove formatting while editing
                              const newRows = [...rows];
                              newRows[index].amount = e.target.value.replace(
                                /,/g,
                                "",
                              );
                              setRows(newRows);
                            }}
                            disabled={item.account === ""}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            </div>
            {/* </div> */}
            <div className="grid grid-cols-2 py-4">
              <div className="flex flex-col">
                <span className="text-sm ">Remarks</span>
                <Textarea
                  className="w-full h-24 resize-none rounded-none"
                  value={data.remarks}
                  readOnly
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
                      value={formatMoney(totalBefDiscountAmt)}
                    />{" "}
                    <HandCoins className="invisible" />
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
                      value={formatMoney(discountAmt)}
                    />{" "}
                    <HandCoins className="invisible" />
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
                      value={formatMoney(vatAmt)}
                    />{" "}
                    <HandCoins className="invisible" />
                  </div>
                </div>

                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm flex items-center justify-between">
                      WTax{" "}
                      <Wtax
                        wtax={wtax}
                        setWtax={setWtax}
                        taxableAmt={taxableAmt}
                        wtaxOpt={wtaxOpt}
                        type={1}
                      />
                    </span>
                  </div>
                  <div className="flex col-span-2 justify-items-end gap-2">
                    <Input
                      noPadding
                      className="w-full text-right"
                      type="text"
                      readOnly
                      value={formatMoney(wTaxAmt)}
                    />{" "}
                    <HandCoins className="invisible" />
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
                      value={formatMoney(
                        totalBefDiscountAmt + vatAmt - discountAmt,
                      )}
                    />{" "}
                    <HandCoins fill="yellow" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="mb-5" />

          <div className="flex justify-end">
            <div className="flex gap-4">
              <Button
                size="sm"
                variant="second"
                onClick={() => {
                  setOpenAdd(false);
                  //    setRows(initialRows);
                  //     setData(initialData);
                  //     reset();
                  //     resetWtax();
                  //     resetData();
                  //    setOpenCancel(false);
                  //    setViewInvoice(0);
                }}
              >
                Close
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setAddLoading(true);
                  submitInvoice();
                }}
                disabled={addLoading}
              >
                {addLoading ? (
                  <>
                    <Spinner />
                    &nbsp;
                  </>
                ) : (
                  `Add`
                )}
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}
    </div>
  );
}

export default CreditMemoModalAP;
