import CustomDialog from "@/components/reusables/CustomDialog";
import { ArrowBigRight, HandCoins } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatMoney } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Incoming } from "../pages/banking/IncomingPayment";
import { useGetAccountCashQuery } from "@/store/api/AdministrationApi";
import { SelectWithSearch } from "../ui/SelectWithSearch";

type idName = {
  id: number;
  code: string;
  name: string;
};

interface PaymentMeansProps {
  iP: Incoming;
  setIP: React.Dispatch<React.SetStateAction<Incoming>>;
  type: number;
  mod?: string;
  aType?: number;
  //   setTotalWTax: React.Dispatch<React.SetStateAction<number>>;
}

function PaymentMeans({ iP, setIP, type, mod, aType }: PaymentMeansProps) {
  const [open, setOpen] = useState(false);

  const [accounts, setAccounts] = useState<idName[]>([]);

  // console.log("IP", iP);

  const getAccounts = useGetAccountCashQuery({});
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      setAccounts(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);
  return (
    <>
      <HandCoins
        fill="yellow"
        onClick={() => {
          setOpen(true);
        }}
        className="cursor-pointer"
      />

      {open && (
        <CustomDialog
          close={setOpen}
          title={``}
          width={` !max-w-[40vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 gap-1 py-6">
            <Tabs
              defaultValue={iP.p_type}
              className="w-[400px]"
              onValueChange={(e) => {
                setIP({
                  ...iP,
                  p_type: e,
                  paid: "",
                  bank_id: "",
                  bank_code: "",
                  bank_name: "",
                  check_no: "",
                  reference: "",
                  transfer_date: "",
                });
              }}
            >
              <TabsList>
                <TabsTrigger className="px-4" value="1" disabled={type === 2}>
                  Check
                </TabsTrigger>
                <TabsTrigger className="px-4" value="2" disabled={type === 2}>
                  Bank Transfer
                </TabsTrigger>
                <TabsTrigger className="px-4" value="3" disabled={type === 2}>
                  Cash
                </TabsTrigger>
              </TabsList>
              <TabsContent value="1">
                <div className="py-5 flex flex-col gap-2">
                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Bank Code</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      {/* <Input noPadding className="w-full" type="text" /> */}
                      <SelectWithSearch
                        options={accounts.map((item) => ({
                          label: String(item.id),
                          value: item.code,
                        }))}
                        placeholder="Choose Account"
                        onChange={(c) => {
                          let cust = accounts.find(
                            (item) => Number(c) === item.id,
                          );
                          if (cust) {
                            setIP({
                              ...iP,
                              bank_id: String(cust?.id),
                              bank_code: cust?.code,
                              bank_name: cust?.name,
                            });
                          }
                        }}
                        noPadding
                        className="w-full"
                        value={iP.bank_code}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Bank Name</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      {/* <Input noPadding className="w-full" type="text" /> */}
                      <SelectWithSearch
                        options={accounts.map((item) => ({
                          label: String(item.id),
                          value: item.name,
                        }))}
                        placeholder="Choose Account"
                        onChange={(c) => {
                          let cust = accounts.find(
                            (item) => Number(c) === item.id,
                          );
                          if (cust) {
                            setIP({
                              ...iP,
                              bank_id: String(cust?.id),
                              bank_code: cust?.code,
                              bank_name: cust?.name,
                            });
                          }
                        }}
                        noPadding
                        className="w-full"
                        value={iP.bank_name}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Check No</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="text"
                        value={iP.check_no}
                        onChange={(e) =>
                          setIP({ ...iP, check_no: e.target.value })
                        }
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Amount</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full border text-right"
                        max={400}
                        value={
                          iP.paid === "0" || iP.paid === "0.00"
                            ? ""
                            : type === 1 && mod === "inc" && aType === 1
                              ? formatMoney(iP.paid)
                              : type === 1 && mod === "out" && aType === 2
                                ? formatMoney(iP.paid)
                                : type === 2
                                  ? formatMoney(iP.paid)
                                  : iP.paid
                        }
                        // disabled={!item.checkbox}
                        onChange={(e) => {
                          let value = e.target.value.replace(/,/g, "");

                          if (/^\d*\.?\d{0,2}$/.test(value)) {
                            setIP({ ...iP, paid: value });
                          }
                        }}
                        onBlur={() => {
                          const num = parseFloat(iP.paid);

                          if (!isNaN(num)) {
                            iP.paid = num.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                          } else {
                            iP.paid = "";
                          }

                          setIP({ ...iP, paid: iP.paid });
                        }}
                        onFocus={() => {
                          iP.paid = iP.paid.replace(/,/g, "");
                          setIP({ ...iP, paid: iP.paid });
                        }}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Transfer Date</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="date"
                        value={iP.transfer_date}
                        onChange={(e) =>
                          setIP({ ...iP, transfer_date: e.target.value })
                        }
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="2">
                <div className="py-5 flex flex-col gap-2">
                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Bank Code</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      {/* <Input noPadding className="w-full" type="text" /> */}
                      <SelectWithSearch
                        options={accounts.map((item) => ({
                          label: String(item.id),
                          value: item.code,
                        }))}
                        placeholder="Choose Account"
                        onChange={(c) => {
                          let cust = accounts.find(
                            (item) => Number(c) === item.id,
                          );
                          if (cust) {
                            setIP({
                              ...iP,
                              bank_id: String(cust?.id),
                              bank_code: cust?.code,
                              bank_name: cust?.name,
                            });
                          }
                        }}
                        noPadding
                        className="w-full"
                        value={iP.bank_code}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Bank Name</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      {/* <Input noPadding className="w-full" type="text" /> */}
                      <SelectWithSearch
                        options={accounts.map((item) => ({
                          label: String(item.id),
                          value: item.name,
                        }))}
                        placeholder="Choose Account"
                        onChange={(c) => {
                          let cust = accounts.find(
                            (item) => Number(c) === item.id,
                          );
                          if (cust) {
                            setIP({
                              ...iP,
                              bank_id: String(cust?.id),
                              bank_code: cust?.code,
                              bank_name: cust?.name,
                            });
                          }
                        }}
                        noPadding
                        className="w-full"
                        value={iP.bank_name}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Reference</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="text"
                        value={iP.reference}
                        onChange={(e) =>
                          setIP({
                            ...iP,
                            reference: e.target.value,
                          })
                        }
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Amount</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full border text-right"
                        value={
                          iP.paid === "0" || iP.paid === "0.00"
                            ? ""
                            : type === 1 && mod === "inc" && aType === 1
                              ? formatMoney(iP.paid)
                              : type === 1 && mod === "out" && aType === 2
                                ? formatMoney(iP.paid)
                                : type === 2
                                  ? formatMoney(iP.paid)
                                  : iP.paid
                        }
                        // disabled={!item.checkbox}
                        onChange={(e) => {
                          let value = e.target.value.replace(/,/g, "");

                          if (/^\d*\.?\d{0,2}$/.test(value)) {
                            setIP({ ...iP, paid: value });
                          }
                        }}
                        onBlur={() => {
                          const num = parseFloat(iP.paid);

                          if (!isNaN(num)) {
                            iP.paid = num.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                          } else {
                            iP.paid = "";
                          }

                          setIP({ ...iP, paid: iP.paid });
                        }}
                        onFocus={() => {
                          iP.paid = iP.paid.replace(/,/g, "");
                          setIP({ ...iP, paid: iP.paid });
                        }}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Transfer Date</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="date"
                        value={iP.transfer_date}
                        onChange={(e) =>
                          setIP({ ...iP, transfer_date: e.target.value })
                        }
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="3">
                <div className="py-5 flex flex-col gap-2">
                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Account Code</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      {/* <Input noPadding className="w-full" type="text" /> */}
                      <SelectWithSearch
                        options={accounts.map((item) => ({
                          label: String(item.id),
                          value: item.code,
                        }))}
                        placeholder="Choose Account"
                        onChange={(c) => {
                          let cust = accounts.find(
                            (item) => Number(c) === item.id,
                          );
                          if (cust) {
                            setIP({
                              ...iP,
                              bank_id: String(cust?.id),
                              bank_code: cust?.code,
                              bank_name: cust?.name,
                            });
                          }
                        }}
                        noPadding
                        className="w-full"
                        value={iP.bank_code}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Account Name</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      {/* <Input noPadding className="w-full" type="text" /> */}
                      <SelectWithSearch
                        options={accounts.map((item) => ({
                          label: String(item.id),
                          value: item.name,
                        }))}
                        placeholder="Choose Account"
                        onChange={(c) => {
                          let cust = accounts.find(
                            (item) => Number(c) === item.id,
                          );
                          if (cust) {
                            setIP({
                              ...iP,
                              bank_id: String(cust?.id),
                              bank_code: cust?.code,
                              bank_name: cust?.name,
                            });
                          }
                        }}
                        noPadding
                        className="w-full"
                        value={iP.bank_name}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Amount</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full border text-right"
                        value={
                          iP.paid === "0" || iP.paid === "0.00"
                            ? ""
                            : type === 1 && mod === "inc" && aType === 1
                              ? formatMoney(iP.paid)
                              : type === 1 && mod === "out" && aType === 2
                                ? formatMoney(iP.paid)
                                : type === 2
                                  ? formatMoney(iP.paid)
                                  : iP.paid
                        }
                        // disabled={!item.checkbox}
                        onChange={(e) => {
                          let value = e.target.value.replace(/,/g, "");

                          if (/^\d*\.?\d{0,2}$/.test(value)) {
                            setIP({ ...iP, paid: value });
                          }
                        }}
                        onBlur={() => {
                          const num = parseFloat(iP.paid);

                          if (!isNaN(num)) {
                            iP.paid = num.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                          } else {
                            iP.paid = "";
                          }

                          setIP({ ...iP, paid: iP.paid });
                        }}
                        onFocus={() => {
                          iP.paid = iP.paid.replace(/,/g, "");
                          setIP({ ...iP, paid: iP.paid });
                        }}
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4">
                    <div className=" border-b col-span-2">
                      <span className="text-sm">Transfer Date</span>
                    </div>
                    <div className="grid col-span-2 justify-items-end">
                      <Input
                        noPadding
                        className="w-full"
                        type="date"
                        value={iP.transfer_date}
                        onChange={(e) =>
                          setIP({ ...iP, transfer_date: e.target.value })
                        }
                        readOnly={type !== 1}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <div></div>

              {type === 1 && (
                <div className="flex gap-4">
                  <Button
                    size="sm"
                    variant="second"
                    onClick={() => setOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default PaymentMeans;
