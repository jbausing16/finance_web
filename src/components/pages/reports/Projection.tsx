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
} from "@/store/api/ReportsApi";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleSmall, Grip, GripVertical, Table } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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

function Projection() {
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(currentYear));

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

  const chartData = [
    { month: "January", target: 186, actual: 80 },
    { month: "February", target: 305, actual: 200 },
    { month: "March", target: 237, actual: 120 },
    { month: "April", target: 73, actual: 190 },
    { month: "May", target: 209, actual: 130 },
    { month: "June", target: 214, actual: 140 },
    { month: "July", target: 186, actual: 80 },
    { month: "August", target: 305, actual: 200 },
    { month: "September", target: 237, actual: 120 },
    { month: "October", target: 73, actual: 190 },
    { month: "November", target: 209, actual: 130 },
    { month: "December", target: 214, actual: 140 },
  ];
  const chartConfig = {
    target: {
      label: "Target",
      color: "var(--chart-1)",
    },
    actual: {
      label: "Actual",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Projection" />
          {!hasAccess(access, "7", "view") ? (
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
                <div></div>
              </div>

              <div className="flex flex-col p-4  overflow-auto">
                <span className="text-xl font-medium text-center pb-4">
                  Sales Projection vs Actual Sales
                </span>

                <div>
                  <Card className="gap-0">
                    <CardHeader className="">
                      {/* <CardTitle>Line Chart - Dots</CardTitle>
                    <CardDescription>January - June 2024</CardDescription> */}
                    </CardHeader>
                    <CardContent className="">
                      <ChartContainer
                        config={chartConfig}
                        className="h-80 w-full"
                      >
                        <LineChart
                          accessibilityLayer
                          data={chartData}
                          margin={{
                            top: 20,
                            right: 12,
                            bottom: 20,
                            left: 0,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="month"
                            tickLine={true}
                            axisLine={true}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                          />
                          <YAxis
                            tickLine={true}
                            axisLine={true}
                            tickFormatter={(value) => formatMoney(value)}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Line
                            dataKey="target"
                            type="natural"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={{ fill: "var(--chart-1)" }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            dataKey="actual"
                            type="natural"
                            stroke="var(--chart-2)"
                            strokeWidth={2}
                            dot={{ fill: "var(--chart-2)" }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex justify-center items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <CircleSmall
                          size={14}
                          fill="var(--chart-2)"
                          color="var(--chart-2)"
                        />{" "}
                        <span>Target</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CircleSmall
                          size={14}
                          fill="var(--chart-1)"
                          color="var(--chart-1)"
                        />{" "}
                        <span>Actual</span>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              <div className="flex flex-col overflow-auto">
                <table>
                  <tr>
                    <td className=" p-1"></td>
                    {chartData.map((item, index) => (
                      <td
                        className="border-2 p-1 font-medium text-center"
                        key={index}
                      >
                        {item.month.slice(0, 3)} 2026
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="border-2 p-1 font-medium">
                      Sales Projection
                    </td>
                    {chartData.map((item, index) => (
                      <td className="border-2 p-1 text-right" key={index}>
                        {formatMoney(item.actual - item.target)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="border-2 p-1 font-medium">Target</td>
                    {chartData.map((item, index) => (
                      <td className="border-2 p-1 text-right" key={index}>
                        {formatMoney(item.target)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="border-2 p-1 font-medium">Actual</td>
                    {chartData.map((item, index) => (
                      <td className="border-2 p-1 text-right" key={index}>
                        {formatMoney(item.actual)}
                      </td>
                    ))}
                  </tr>
                </table>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default Projection;
