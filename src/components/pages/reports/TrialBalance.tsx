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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetCashFlowQuery, useGetTBQuery } from "@/store/api/ReportsApi";
import { formatMoney, hasAccess } from "@/lib/utils";
import { exportCFExcel } from "@/components/reusables/exportCFExcel";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import Empty from "@/components/reusables/Empty";
import { Loading } from "@/components/reusables/Loading";

type Years = {
  id: number;
  value: number;
};

type Data = {
  category: number;
  code: string;
  account: string;
  balance: number;
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

function TrialBalance() {
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(currentYear));

  const [data, setData] = useState<Data[]>([]);
  const [totalD, setTotalD] = useState(0);
  const [totalC, setTotalC] = useState(0);

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
    formatDate1(new Date(dateNow1.getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(
    formatDate1(new Date(dateNow1.getFullYear(), 11, 31)),
  );

  const clearFilters = () => {
    setFromDate(formatDate1(new Date(dateNow1.getFullYear(), 0, 1)));
    setToDate(formatDate1(new Date(dateNow1.getFullYear(), 11, 31)));
    setYearsVal(String(currentYear));
  };

  const getTB = useGetTBQuery({ from: fromDate, to: toDate });

  useEffect(() => {
    if (getTB.isSuccess && getTB.data) {
      setData(getTB.data.data);
      const rows = getTB.data.data;

      const totalDebit = rows.reduce((total: number, item: Data) => {
        if ([1, 5, 6].includes(item.category)) {
          return total + item.balance;
        }

        if (item.category === 7 && !item.account.includes("0701")) {
          return total + item.balance;
        }

        return total;
      }, 0);

      const totalCredit = rows.reduce((total: number, item: Data) => {
        if ([2, 3, 4].includes(item.category)) {
          return total + Math.abs(item.balance);
        }

        if (item.category === 7 && !item.account.includes("0702")) {
          return total + Math.abs(item.balance);
        }

        return total;
      }, 0);

      setTotalD(totalDebit);
      setTotalC(totalCredit);

      //   console.log("Data: ", getTB);
    }
  }, [getTB.isSuccess, getTB.data]);
  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Trial Balance" />
          {!hasAccess(access, "4", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">Report Period</Label>

                    <Select
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
                        await exportCFExcel(
                          getTB.data || [],
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

              <div className="flex flex-col p-4  overflow-auto">
                <span className="text-xl font-medium text-center pb-4">
                  Trial Balance
                </span>

                <div className="px-20">
                  <table className="w-full">
                    <tr className="bg-red-100">
                      <td className="font-bold pl-16 bg-green-100 w-[70%]">
                        Account
                      </td>
                      <td className="bg-orange-100 w-[15%]">Debit</td>
                      <td className="bg-orange-200 w-[15%]">Credit</td>
                    </tr>

                    {data.map((item: Data) => (
                      <tr>
                        <td className="font-medium">{item.account}</td>
                        <td className="text-right px-20 font-medium">
                          {[1, 5, 6].includes(item.category)
                            ? formatMoney(item.balance)
                            : item.category === 7
                              ? item.account.includes("0701")
                                ? "-"
                                : formatMoney(item.balance)
                              : "-"}
                        </td>
                        <td className="text-right px-20 font-medium">
                          {[2, 3, 4].includes(item.category)
                            ? formatMoney(item.balance * -1)
                            : item.category === 7
                              ? item.account.includes("0702")
                                ? "-"
                                : formatMoney(item.balance - 1)
                              : "-"}
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td className="pl-24">Total</td>
                      <td className="text-right px-20">
                        {formatMoney(totalD)}
                      </td>
                      <td className="text-right px-20">
                        {formatMoney(totalC)}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default TrialBalance;
