import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { AppSidebar } from "../../reusables/sidebar/app-sidebar";
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
import { formatMoney, hasAccess } from "@/lib/utils";
import { useGetGenLedgerQuery } from "@/store/api/ReportsApi";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { exportGLExcel } from "@/components/reusables/exportGLExcel";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Empty from "@/components/reusables/Empty";
import { Loading } from "@/components/reusables/Loading";
import {
  useGetAccountAllQuery,
  useGetAccountTypeHeadQuery,
} from "@/store/api/AdministrationApi";
import { SelectWithSearch2 } from "@/components/ui/SelectWithSearch2";
import { useSearchParams } from "react-router-dom";

type Years = {
  id: number;
  value: number;
};

type choices = {
  id: number;
  code: string;
  type: number;
  level: number;
  name: string;
  child: any[];
};

const formatDate1 = (dateString: Date) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function formatDate(date: any) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

function GeneralLedger() {
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  const [searchParams] = useSearchParams();

  const fromD = searchParams.get("fromD");
  const toD = searchParams.get("toD");
  const acc = searchParams.get("acc");

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(currentYear));

  const [selectedAcc, setSelectedAcc] = useState(acc ?? "0");
  const [accountsAll, setAccountsAll] = useState<choices[]>([]);

  const [accounts, setAccounts] = useState<choices[]>([]);
  const getAccounts = useGetAccountTypeHeadQuery({ type: 0 });
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      setAccounts(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  const getAccountsAll = useGetAccountAllQuery({ type: 0 });
  useEffect(() => {
    if (getAccountsAll.isSuccess && getAccountsAll.data) {
      // console.log("All: ", getAccountsAll.data.data);
      setAccountsAll(getAccountsAll.data.data);
    }
  }, [getAccountsAll.isSuccess, getAccountsAll.data]);

  const dateNow = formatDate(new Date());
  useEffect(() => {
    if (dateNow) {
      let arr = [];
      let arra = currentYear;
      for (let i = 0; i <= 5; i++) {
        arr.push({
          id: i,
          value: arra - i,
        });
        setYears(arr);
      }
    }
    console.log("Years", years);
  }, [dateNow]);

  const dateNow1 = new Date();
  const [fromDate, setFromDate] = useState(
    fromD ?? formatDate1(new Date(dateNow1.getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(
    toD ?? formatDate1(new Date(dateNow1.getFullYear(), 11, 31)),
  );

  const clearFilters = () => {
    setFromDate(formatDate1(new Date(dateNow1.getFullYear(), 0, 1)));
    setToDate(formatDate1(new Date(dateNow1.getFullYear(), 11, 31)));
    setYearsVal(String(currentYear));
  };

  const getGenLedger = useGetGenLedgerQuery(
    {
      fromD: fromDate,
      toD: toDate,
      acc: selectedAcc,
    },
    { refetchOnMountOrArgChange: true },
  );

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="General Ledger" />

          {!hasAccess(access, "5", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">Report Period</Label>

                    <Select
                      //   onValueChange={(e) => setFiltDate(parseInt(e))}
                      name="yearsVal"
                      value={yearsVal}
                      onValueChange={(e) => {
                        if (e === "") {
                          setFromDate("");
                          setToDate("");
                        } else {
                          setFromDate(formatDate1(new Date(Number(e), 0, 1)));
                          setToDate(formatDate1(new Date(Number(e), 11, 31)));
                          setYearsVal(e);
                        }
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="---" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((item) => (
                          <SelectItem key={item.id} value={String(item.value)}>
                            {item.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">From</Label>
                    <Input
                      type="date"
                      placeholder="From"
                      className={`w-full`}
                      name="fromDate"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">To</Label>
                    <Input
                      type="date"
                      placeholder="To"
                      className={`w-full`}
                      name="toDate"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">Account</Label>
                    <SelectWithSearch2
                      options={accounts}
                      placeholder="All Accounts"
                      onChange={(e) => {
                        setSelectedAcc(e);
                      }}
                      className="w-[200px]"
                      // noPadding1
                      value={
                        accountsAll.find(
                          (item2) => selectedAcc === String(item2.id),
                        )?.name
                      }
                      id={selectedAcc}
                    />
                  </div>

                  <div>
                    <label className="form-control w-full">
                      <div className="label"> &nbsp;</div>
                      <Button variant="second" onClick={clearFilters}>
                        Clear
                      </Button>
                    </label>
                  </div>
                </div>
                <div>
                  <div className="pr-10">
                    <div className="label"> &nbsp;</div>
                    <Button
                      variant="second"
                      onClick={async () => {
                        await exportGLExcel(
                          getGenLedger?.data?.data || [],
                          "One Outsource Direct Corporation",
                          fromDate,
                          toDate,
                        );
                      }}
                    >
                      Export
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col p-4 h-[75vh] my-4 overflow-auto">
                <table>
                  <thead>
                    <tr className="font-bold">
                      <td className="text-left">Type</td>
                      <td className="text-center">Date</td>
                      <td className="text-center">Ref No.</td>
                      <td className="text-center">Name</td>
                      <td className="text-center">Memo</td>
                      <td className="text-center">Split</td>
                      <td className="text-right">Debit</td>
                      <td className="text-right">Credit</td>
                      <td className="text-right">Balance</td>
                    </tr>
                  </thead>
                  <tbody>
                    {getGenLedger?.data?.data?.map(
                      (item: any, index: number) => {
                        let r_balance = parseFloat(item?.start);
                        return (
                          <>
                            <tr key={index}>
                              <td colSpan={8} className="font-medium">
                                {item?.name}
                              </td>
                              <td className="text-right pr-2 font-medium">
                                {item?.start === "0.00"
                                  ? `-`
                                  : formatMoney(item?.start)}
                              </td>
                            </tr>
                            {item.trans?.map((item1: any, index1: number) => {
                              r_balance =
                                r_balance + (item1?.debit - item1?.credit);
                              return (
                                <tr key={index1}>
                                  <td className="pl-6">{item1?.type}</td>
                                  <td className="text-center">{item1?.date}</td>
                                  <td className="text-center">{item1?.num}</td>
                                  <td className="text-left">{item1?.name}</td>
                                  <td className="text-center">{item1?.memo}</td>
                                  <td className="text-center">
                                    {item1?.split}
                                  </td>
                                  <td className="text-right pr-2">
                                    {item1?.debit === 0
                                      ? `-`
                                      : formatMoney(item1?.debit)}
                                  </td>
                                  <td className="text-right pr-2">
                                    {item1?.credit === 0
                                      ? `-`
                                      : formatMoney(item1?.credit)}
                                  </td>
                                  <td className="text-right pr-2">
                                    {r_balance === 0
                                      ? `-`
                                      : formatMoney(r_balance)}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr>
                              <td colSpan={6} className="font-medium pb-5">
                                {item?.name} Total
                              </td>
                              <td className="text-right font-medium pb-5 ">
                                <div className="border-t border-black mx-2">
                                  {formatMoney(
                                    item?.trans?.reduce(
                                      (sum: any, c: any) => sum + c.debit,
                                      0,
                                    ),
                                  )}
                                </div>
                              </td>
                              <td className="text-right font-medium pb-5 ">
                                <div className="border-t border-black mx-2">
                                  {formatMoney(
                                    item?.trans?.reduce(
                                      (sum: any, c: any) => sum + c.credit,
                                      0,
                                    ),
                                  )}
                                </div>
                              </td>
                              <td className="text-right font-medium pb-5 ">
                                <div className="border-t border-black mx-2">
                                  {formatMoney(
                                    parseFloat(item?.start) +
                                      (item?.trans?.reduce(
                                        (sum: any, c: any) => sum + c.debit,
                                        0,
                                      ) -
                                        item?.trans?.reduce(
                                          (sum: any, c: any) => sum + c.credit,
                                          0,
                                        )),
                                  )}
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default GeneralLedger;
