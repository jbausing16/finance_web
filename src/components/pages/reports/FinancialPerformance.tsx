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
  formatMoney,
  generateMonths,
  generateMonths1,
  hasAccess,
} from "@/lib/utils";
import {
  useGetAccountsByTypeMonthlyQuery,
  useGetGenLedgerQuery,
} from "@/store/api/ReportsApi";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildTree, sumTreeMonthly } from "./ProfitLoss";
import { exportFPExcel } from "@/components/reusables/exportFPExcel";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
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

function FinancialPerformance() {
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

  const getGenLedger = useGetGenLedgerQuery(
    {
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );

  const getIncomeMonthly = useGetAccountsByTypeMonthlyQuery(
    {
      type: 4,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getCOGSMonthly = useGetAccountsByTypeMonthlyQuery(
    {
      type: 5,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getExpenseMonthly = useGetAccountsByTypeMonthlyQuery(
    {
      type: 6,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getOtherMonthly = useGetAccountsByTypeMonthlyQuery(
    {
      type: 7,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );

  const incomeMonthly = buildTree(getIncomeMonthly?.data?.data || []).map(
    (node) => {
      if (node.type === 2) node.monthly_balances = node.monthly_balances || [];
      return node;
    },
  );

  const cogsMonthly = buildTree(getCOGSMonthly?.data?.data || []).map(
    (node) => {
      if (node.type === 2) node.monthly_balances = node.monthly_balances || [];
      return node;
    },
  );

  const incomeTotalsMonthly = sumTreeMonthly(incomeMonthly, fromDate, toDate);

  const cogsTotalsMonthly = sumTreeMonthly(cogsMonthly, fromDate, toDate);

  const grossProfitMonthly = incomeTotalsMonthly.map(
    (val, i) => val + (cogsTotalsMonthly[i] || 0),
  );

  const expenseMonthly = buildTree(getExpenseMonthly?.data?.data || []).map(
    (node) => {
      if (node.type === 2) node.monthly_balances = node.monthly_balances || [];
      return node;
    },
  );

  const expenseTotalsMonthly = sumTreeMonthly(expenseMonthly, fromDate, toDate);

  const otherMonthly = buildTree(getOtherMonthly?.data?.data || []).map(
    (node) => {
      if (node.type === 2) node.monthly_balances = node.monthly_balances || [];
      return node;
    },
  );

  const otherTotalsMonthly = sumTreeMonthly(otherMonthly, fromDate, toDate);

  const getAssetsMonthly = useGetAccountsByTypeMonthlyQuery(
    {
      type: 1,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getLiabilitiesMonthly = useGetAccountsByTypeMonthlyQuery(
    {
      type: 2,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getEquityMonthly = useGetAccountsByTypeMonthlyQuery(
    {
      type: 3,
      fromD: fromDate,
      toD: toDate,
      type1: 1,
    },
    { refetchOnMountOrArgChange: true },
  );

  const assetsMonthly = buildTree(getAssetsMonthly?.data?.data || []).map(
    (node) => {
      if (node.type === 2) node.monthly_balances = node.monthly_balances || [];
      return node;
    },
  );

  const liabilitiesMonthly = buildTree(
    getLiabilitiesMonthly?.data?.data || [],
  ).map((node) => {
    if (node.type === 2) node.monthly_balances = node.monthly_balances || [];
    return node;
  });

  const equityMonthly = buildTree(getEquityMonthly?.data?.data || []).map(
    (node) => {
      if (node.type === 2) node.monthly_balances = node.monthly_balances || [];
      return node;
    },
  );

  console.log("EQ", equityMonthly);
  console.log("asjdg", getEquityMonthly?.data?.data);

  const assetsTotalsMonthly = sumTreeMonthly(assetsMonthly, fromDate, toDate);
  const liabilitiesTotalsMonthly = sumTreeMonthly(
    liabilitiesMonthly,
    fromDate,
    toDate,
  );
  const equityTotalsMonthly = sumTreeMonthly(equityMonthly, fromDate, toDate);

  const currState = useSelector((state: RootState) => state.auth.sideBar);
  const access = useSelector((state: RootState) => state.auth.access);

  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset
          className={`transition-all duration-300 ${currState === "expanded" ? "max-w-[calc(100vw-267px)]" : "max-w-[100vw]"}`}
        >
          <Header title="Financial Performance" />

          {!hasAccess(access, "6", "view") ? (
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
                        await exportFPExcel(
                          incomeTotalsMonthly,
                          cogsTotalsMonthly,
                          expenseTotalsMonthly,
                          otherTotalsMonthly,
                          assetsTotalsMonthly,
                          liabilitiesTotalsMonthly,
                          equityTotalsMonthly,
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
                  Financial Performance
                </span>

                <div></div>
              </div>

              <div className="relative">
                <div className="overflow-auto">
                  <table className="[table-layout:fixed] w-[100%]">
                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium"></td>
                      {generateMonths(fromDate, toDate).map((m, i) => (
                        <td
                          className=" p-1 font-medium text-right bg-black text-white !w-[120px]"
                          key={i}
                        >
                          {m}
                        </td>
                      ))}
                      <td className=" p-1 font-medium text-right bg-black text-white !w-[120px]">
                        YTD
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        REVENUE
                      </td>
                      {incomeTotalsMonthly.map((item, index) => (
                        <td
                          className=" p-1 text-right text-sm !w-[120px]"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(-item)}
                        </td>
                      ))}
                      <td className=" p-1 text-right text-sm !w-[120px]">
                        {formatMoney(
                          -incomeTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        COS
                      </td>
                      {cogsTotalsMonthly.map((item, index) => (
                        <td
                          className="border-b-2 border-black p-1 text-right text-sm !w-[120px]"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(item)}
                        </td>
                      ))}
                      <td className=" p-1 border-b-2 border-black text-right text-sm !w-[120px]">
                        {formatMoney(
                          cogsTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        Gross Profit
                      </td>
                      {grossProfitMonthly.map((item, index) => (
                        <td
                          className="p-1 text-right text-sm !w-[120px]"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(-item)}
                        </td>
                      ))}
                      <td className=" p-1 text-right text-sm !w-[120px]">
                        {formatMoney(
                          -grossProfitMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        GPM
                      </td>
                      {grossProfitMonthly.map((item, index) => (
                        <td
                          className="p-1 text-right text-sm !w-[120px] bg-black text-white"
                          key={index}
                        >
                          {item === 0
                            ? `-`
                            : `${((-item / -incomeTotalsMonthly[index]) * 100).toFixed(0)}%`}
                        </td>
                      ))}
                      <td className="p-1 text-right text-sm !w-[120px] bg-black text-white">
                        {(
                          (-grossProfitMonthly.reduce((s, m) => s + m, 0) /
                            -incomeTotalsMonthly.reduce((s, m) => s + m, 0)) *
                          100
                        ).toFixed(0)}
                        %
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        GAE
                      </td>
                      {expenseTotalsMonthly.map((item, index) => (
                        <td
                          className="p-1 text-right text-sm !w-[120px]"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(item)}
                        </td>
                      ))}
                      <td className=" p-1 text-right text-sm !w-[120px]">
                        {formatMoney(
                          expenseTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        EBIT
                      </td>
                      {grossProfitMonthly.map((item, index) => (
                        <td
                          className="p-1 text-right text-sm !w-[120px]"
                          key={index}
                        >
                          {item === 0
                            ? `-`
                            : formatMoney(-item - expenseTotalsMonthly[index])}
                        </td>
                      ))}
                      <td className=" p-1 text-right text-sm !w-[120px]">
                        {formatMoney(
                          -grossProfitMonthly.reduce((s, m) => s + m, 0) -
                            expenseTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        OTHER EXP
                      </td>
                      {otherTotalsMonthly.map((item, index) => (
                        <td
                          className="p-1 text-right text-sm !w-[120px] border-b-2 border-black"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(-item)}
                        </td>
                      ))}
                      <td className="p-1 text-right text-sm !w-[120px] border-b-2 border-black">
                        {formatMoney(
                          -otherTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr className="">
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium pb-5">
                        NET INCOME
                      </td>
                      {grossProfitMonthly.map((m, i) => {
                        const netValue =
                          m +
                          (expenseTotalsMonthly[i] || 0) +
                          (otherTotalsMonthly[i] || 0);

                        return (
                          <td
                            className="p-1 text-right text-sm !w-[120px] pb-5"
                            key={i}
                          >
                            {netValue === 0 ? "-" : formatMoney(-netValue)}
                          </td>
                        );
                      })}
                      <td className="p-1 text-right text-sm !w-[120px] pb-5">
                        {formatMoney(
                          -grossProfitMonthly.reduce((s, m) => s + m, 0) -
                            (expenseTotalsMonthly.reduce((s, m) => s + m, 0) +
                              otherTotalsMonthly.reduce((s, m) => s + m, 0)),
                        )}
                      </td>
                    </tr>
                  </table>
                </div>

                <br />

                <div className="overflow-auto">
                  <table className="[table-layout:fixed] w-[100%]">
                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium"></td>
                      {generateMonths(fromDate, toDate).map((m, i) => (
                        <td
                          className=" p-1 font-medium text-right bg-black text-white !w-[120px]"
                          key={i}
                        >
                          {m}
                        </td>
                      ))}
                      <td className=" p-1 font-medium text-right bg-black text-white !w-[120px]">
                        YTD
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        ASSET
                      </td>
                      {assetsTotalsMonthly.map((item, index) => (
                        <td
                          className=" p-1 text-right text-sm !w-[120px]"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(item)}
                        </td>
                      ))}
                      <td className=" p-1 text-right text-sm !w-[120px]">
                        {formatMoney(
                          assetsTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium">
                        LIABILITIES
                      </td>
                      {liabilitiesTotalsMonthly.map((item, index) => (
                        <td
                          className=" p-1 text-right text-sm !w-[120px]"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(item)}
                        </td>
                      ))}
                      <td className=" p-1 text-right text-sm !w-[120px]">
                        {formatMoney(
                          liabilitiesTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className=" p-1 sticky left-0 z-20 !w-[150px] bg-white font-medium pb-5">
                        EQUITY
                      </td>
                      {equityTotalsMonthly.map((item, index) => (
                        <td
                          className=" p-1 text-right text-sm !w-[120px] pb-5"
                          key={index}
                        >
                          {item === 0 ? `-` : formatMoney(item)}
                        </td>
                      ))}
                      <td className=" p-1 text-right text-sm !w-[120px] pb-5">
                        {formatMoney(
                          equityTotalsMonthly.reduce((s, m) => s + m, 0),
                        )}
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

export default FinancialPerformance;
