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
import { useGetCashFlowQuery } from "@/store/api/ReportsApi";
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

function CashFlow() {
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(currentYear));

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

  const getCF = useGetCashFlowQuery({ fromD: fromDate, toD: toDate });
  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Cash Flow" />
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
                          getCF.data || [],
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
                  Statement of Cash Flows
                </span>

                <div className="px-20">
                  <table className="w-full">
                    <tr>
                      <td className="font-bold pl-16">OPERATING ACTIVITIES</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td className="font-medium pl-24">Net Income</td>
                      <td className="text-right px-20 font-medium">
                        {formatMoney(getCF?.data?.ni)}
                      </td>
                    </tr>
                    <tr>
                      <td className="pl-24">
                        Adjustments to reconcile Net Income
                      </td>
                      <td className="text-right px-20"></td>
                    </tr>
                    <tr>
                      <td className="pl-24">
                        to net cash provided by operations:
                      </td>
                      <td className="text-right px-20"></td>
                    </tr>

                    {getCF?.data?.ca?.map((a: any, b: number) => (
                      <tr key={b}>
                        <td className="pl-32">{a?.name}</td>
                        <td className="text-right px-20">
                          {formatMoney(a?.balance)}
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td className="font-bold pb-5 pl-16">
                        Net Cash provided by Operating Activities
                      </td>
                      <td className="font-bold pb-5 flex justify-end px-20">
                        <div className="w-32 text-right pl-4 border-t-2 border-black">
                          {formatMoney(
                            getCF?.data?.ni +
                              getCF?.data?.ca?.reduce(
                                (a: any, b: any) => a + b.balance,
                                0,
                              ),
                          )}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="font-bold pl-16">INVESTING ACTIVITIES</td>
                      <td></td>
                    </tr>

                    {getCF?.data?.fa?.map((a: any, b: number) => (
                      <tr key={b}>
                        <td className="pl-24">{a?.name}</td>
                        <td className="text-right px-20">
                          {formatMoney(a?.balance)}
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td className="font-bold pb-5 pl-16">
                        Net Cash provided by Investing Activities
                      </td>
                      <td className="font-bold pb-5 flex justify-end px-20">
                        <div className="w-32 text-right pl-4 border-t-2 border-black">
                          {formatMoney(
                            getCF?.data?.fa?.reduce(
                              (a: any, b: any) => a + b.balance,
                              0,
                            ),
                          )}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="font-bold pb-5 pl-8">
                        Net Cash increase for period
                      </td>
                      <td className="font-bold pb-5 flex justify-end px-20">
                        <div className="w-32 text-right pl-4 border-t-2 border-black">
                          {formatMoney(
                            getCF?.data?.ni +
                              getCF?.data?.ca?.reduce(
                                (a: any, b: any) => a + b.balance,
                                0,
                              ) +
                              getCF?.data?.fa?.reduce(
                                (a: any, b: any) => a + b.balance,
                                0,
                              ),
                          )}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="font-bold pb-5 pl-8">
                        Cash at beginning of period
                      </td>
                      <td className="font-bold pb-5 flex justify-end px-20">
                        <div className="w-32 text-right pl-4 ">
                          {formatMoney(getCF?.data?.begin_cash)}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="font-bold pb-5">Cash at end of period</td>
                      <td className="font-bold pb-5 flex justify-end px-20">
                        <div className="w-32 text-right pl-4 border-t-2 border-black">
                          {formatMoney(
                            getCF?.data?.ni +
                              getCF?.data?.ca?.reduce(
                                (a: any, b: any) => a + b.balance,
                                0,
                              ) +
                              getCF?.data?.fa?.reduce(
                                (a: any, b: any) => a + b.balance,
                                0,
                              ) +
                              getCF?.data?.begin_cash,
                          )}
                        </div>
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

export default CashFlow;
