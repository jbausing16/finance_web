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
import {
  formatDateM,
  formatMoney,
  generateMonths,
  hasAccess,
} from "@/lib/utils";
import { AccountList } from "@/components/reusables/RawDatas";
import {
  useGetAccountsByTypeMonthlyQuery,
  useGetAccountsByTypeQuery,
  useGetGenLedgerQuery,
  useGetJournalReportQuery,
} from "@/store/api/ReportsApi";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Grip, GripVertical, Table } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Loading } from "@/components/reusables/Loading";
import Empty from "@/components/reusables/Empty";
import { exportJournalReport } from "@/components/reusables/exportJournalReport";

type AccountNode = {
  id: number;
  name: string;
  account: string;
  parent: number;
  level: number;
  type: number; // 1 = group, 2 = posting
  acc_type: number; // 1 assets, 2 liabilities, 3 equity
  balance: number;
  monthly_balances?: number[];
  children: AccountNode[];
  subtotal: number;
};

type Years = {
  id: number;
  value: number;
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

function JournalReport() {
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(1));

  const [type, setType] = useState(1);

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

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const dateNow1 = new Date();
  const [fromDate, setFromDate] = useState(
    formatDate1(new Date(year, month, 1)),
  );
  const [toDate, setToDate] = useState(formatDate1(today));

  const clearFilters = () => {
    setFromDate(formatDate1(new Date(year, month, 1)));
    setToDate(formatDate1(today));
    setYearsVal(String(1));
  };

  const getJournalReport = useGetJournalReportQuery({
    fromD: fromDate,
    toD: toDate,
  });

  const journalData = [...(getJournalReport?.data?.data || [])].sort(
    (a, b) => Number(b.no) - Number(a.no) || Number(a.id) - Number(b.id),
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
          <Header title="Journal Report" />
          {!hasAccess(access, "17", "view") ? (
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
                        if (e === "1") {
                          setFromDate(formatDate1(new Date(year, month, 1)));
                          setToDate(formatDate1(today));
                        } else if (e === "2") {
                          setFromDate(formatDate1(new Date(year, month, 1)));
                          setToDate(formatDate1(new Date(year, month + 1, 0)));
                        } else if (e === "3") {
                          setFromDate(
                            formatDate1(new Date(year, month - 1, 1)),
                          );
                          setToDate(formatDate1(new Date(year, month, 0)));
                        } else {
                          setFromDate(
                            formatDate1(new Date(dateNow1.getFullYear(), 0, 1)),
                          );
                          setToDate(
                            formatDate1(
                              new Date(dateNow1.getFullYear(), 11, 31),
                            ),
                          );
                        }
                        setYearsVal(e);
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="---" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(1)}>Month to Date</SelectItem>
                        <SelectItem value={String(2)}>This Month</SelectItem>
                        <SelectItem value={String(3)}>
                          Previous Month
                        </SelectItem>
                        <SelectItem value={String(4)}>Custom</SelectItem>
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
                  <Button
                    variant="second"
                    // size={"sm"}
                    onClick={async () => {
                      await exportJournalReport(
                        journalData,
                        "One Outsource Direct Corporation",
                      );
                    }}
                  >
                    Export
                  </Button>
                </div>
              </div>

              <div className="flex flex-col p-4 h-[75vh] my-4 overflow-auto">
                <table>
                  <thead>
                    <tr className="font-bold">
                      <td className="text-center">Txn No.</td>
                      <td className="text-center">Type</td>
                      <td className="text-center">Date</td>
                      <td className="text-center">&nbsp;Ref No.&nbsp;</td>
                      <td className="text-center">Name</td>
                      <td className="text-center">Memo</td>
                      <td className="text-center">Account</td>
                      <td className="text-right pr-2">Debit</td>
                      <td className="text-right pr-2">Credit</td>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let currentNo: string | null = null;
                      let debitTotal = 0;
                      let creditTotal = 0;

                      return journalData.map((item: any, index: number) => {
                        const debit = Number(item.debit);
                        const credit = Number(item.credit);
                        const isNewNo = currentNo !== item.no;
                        const isLast = index === journalData.length - 1;

                        const subtotalRow =
                          currentNo !== null && isNewNo ? (
                            <tr key={`subtotal-${index}`} className="font-bold">
                              <td
                                colSpan={7}
                                className="text-right pr-2 pb-5"
                              ></td>
                              <td className="text-right pb-5">
                                <div className="border-t border-black mx-2">
                                  {formatMoney(debitTotal)}
                                </div>
                              </td>
                              <td className="text-right pb-5">
                                <div className="border-t border-black mx-2">
                                  {formatMoney(creditTotal)}
                                </div>
                              </td>
                            </tr>
                          ) : null;

                        if (isNewNo) {
                          currentNo = item.no;
                          debitTotal = 0;
                          creditTotal = 0;
                        }

                        debitTotal += debit;
                        creditTotal += credit;

                        return (
                          <React.Fragment key={item.id}>
                            {subtotalRow}

                            <tr>
                              <td className="font-medium text-center">
                                {isNewNo ? item.no : ``}
                              </td>
                              <td>{isNewNo ? item.type : ``}</td>
                              <td>{isNewNo ? item.post_date : ``}</td>
                              <td className="text-center">
                                {isNewNo ? item.origin : ``}
                              </td>
                              <td>{item.bp}</td>
                              <td className="text-center">{item.remarks}</td>
                              <td>{item.account}</td>
                              <td className="text-right pr-2 font-medium">
                                {debit === 0 ? `-` : formatMoney(debit)}
                              </td>
                              <td className="text-right pr-2 font-medium">
                                {credit === 0 ? `-` : formatMoney(credit)}
                              </td>
                            </tr>

                            {isLast && (
                              <tr className="font-bold ">
                                <td
                                  colSpan={7}
                                  className="text-right pr-2 pb-5"
                                ></td>
                                <td className="text-right pb-5 ">
                                  <div className="border-t border-black mx-2">
                                    {formatMoney(debitTotal)}
                                  </div>
                                </td>
                                <td className="text-right pb-5">
                                  <div className="border-t border-black mx-2">
                                    {formatMoney(creditTotal)}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
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

export default JournalReport;
