import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { AppSidebar } from "../../reusables/sidebar/app-sidebar";
import Header from "@/components/reusables/Header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grip, GripVertical } from "lucide-react";
import { AccountList } from "@/components/reusables/RawDatas";
import {
  useGetAccountsByTypeQuery,
  useGetAccountsByTypeMonthlyBSQuery,
} from "@/store/api/ReportsApi";
import {
  exportBalanceSheetMonthlyExcel,
  exportBalanceSheetNormalExcel,
} from "@/components/reusables/exportBalanceSheetExcel";
import { formatMoney, generateMonths, hasAccess } from "@/lib/utils";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Empty from "@/components/reusables/Empty";
import { Loading } from "@/components/reusables/Loading";
import { useNavigate } from "react-router-dom";

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

type Years = { id: number; value: number };

function buildTree(data: any[]): AccountNode[] {
  const map = new Map<number, AccountNode>();
  data?.forEach((item) => {
    map.set(item.id, { ...item, children: [], subtotal: 0 });
  });
  const roots: AccountNode[] = [];
  map.forEach((node) => {
    if (node.parent === 0) roots.push(node);
    else map.get(node.parent)?.children.push(node);
  });
  return roots;
}

function sumNode(node: AccountNode): number {
  if (!node.children || node.children.length === 0)
    return Number(node.balance ?? 0);
  return node.children.reduce((sum, c) => sum + sumNode(c), 0);
}

function sumMonthly(node: AccountNode, fromD: string, toD: string): number[] {
  if (node.type === 2 && node.monthly_balances) return node.monthly_balances;

  const totals = Array(generateMonths(fromD, toD).length).fill(0);
  node.children.forEach((c) => {
    const childTotals = sumMonthly(c, fromD, toD);
    childTotals.forEach((val, i) => (totals[i] += val));
  });
  return totals;
}

function isMonthlyZero(arr: number[] = []) {
  return arr.reduce((a, b) => a + b, 0) === 0;
}

function computeSubtotal(node: AccountNode): number {
  if (!node.children.length)
    return (node.subtotal = node.type === 2 ? node.balance : 0);
  node.subtotal = node.children.reduce((sum, c) => sum + computeSubtotal(c), 0);
  return node.subtotal;
}

function renderNode(
  node: AccountNode,
  viewType: number,
  fromD: string,
  toD: string,
) {
  const padding =
    [
      "pl-0",
      "pl-4",
      "pl-8",
      "pl-12",
      "pl-16",
      "pl-20",
      "pl-24",
      "pl-28",
      "pl-32",
      "pl-36",
    ][node.level] ?? "pl-0";

  if (viewType === 2) {
    const months = generateMonths(fromD, toD);
    const monthlyTotal =
      node.children.length > 0
        ? sumMonthly(node, fromD, toD)
        : (node.monthly_balances ?? []);

    if (
      (node.type === 2 && isMonthlyZero(node.monthly_balances)) ||
      (node.type === 1 && isMonthlyZero(monthlyTotal))
    )
      return null;

    const paddedBalances = [...(node.monthly_balances ?? [])];
    while (paddedBalances.length < months.length) paddedBalances.push(0);

    return (
      <div key={node.id} className={`mb-1`}>
        <div
          className={`flex min-w-max items-center  ${node.type === 2 ? "" : ""}`}
        >
          <div
            className={`text-sm ${padding} ${node.type === 1 ? "font-semibold !w-[100%]" : "border-b"} sticky left-0 z-20 bg-white !w-[270px]`}
          >
            {node.name}
          </div>
          {paddedBalances.map((m, i) => {
            const start = new Date(fromD);
            start.setMonth(start.getMonth() + i, 1);

            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

            const from = start.toLocaleDateString("en-CA").split("T")[0];
            const to = end.toLocaleDateString("en-CA").split("T")[0];
            return (
              <div
                key={i}
                className={`text-right text-sm ${node.type === 2 ? " border-b cursor-pointer hover:underline" : ""} !w-[120px]`}
                onClick={() =>
                  window.open(
                    `/reports/general-ledger?fromD=${from}&toD=${to}&acc=${node.id}`,
                    "_blank",
                  )
                }
              >
                {m === 0 ? (node.type === 2 ? "-" : "") : formatMoney(m)}
              </div>
            );
          })}
        </div>

        {/* CHILDREN */}
        {node.children.map((c) => renderNode(c, viewType, fromD, toD))}

        {/* TOTAL ROW */}
        {node.children.length > 0 && !isMonthlyZero(monthlyTotal) && (
          <div className={`min-w-max flex`}>
            <span
              className={`text-sm ${padding} sticky left-0 bg-white z-20 border-b !w-[270px] font-medium`}
            >
              Total {node.name}
            </span>
            {monthlyTotal.map((m, i) => (
              <span key={i} className="text-right text-sm  !w-[120px] border-b">
                {m === 0 ? "-" : formatMoney(m)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // NORMAL VIEW
  const total =
    node.type === 2 && node.monthly_balances
      ? node.monthly_balances.reduce((a, b) => a + b, 0)
      : sumNode(node);
  if (total === 0) return null;

  return (
    <div key={node.id} className="mb-1">
      <div
        className={`flex justify-between ${node.type === 2 ? "border-b" : "pt-0"}`}
      >
        <span className={`${padding} ${node.type === 1 ? "font-medium" : ""}`}>
          {node.name}
        </span>
        {node.type === 2 && (
          <span
            className="pr-10 cursor-pointer hover:underline"
            onClick={() =>
              window.open(
                `/reports/general-ledger?fromD=${fromD}&toD=${toD}&acc=${node.id}`,
                "_blank",
              )
            }
          >
            {formatMoney(node.balance)}
          </span>
        )}
      </div>
      {node.children.map((c) => renderNode(c, viewType, fromD, toD))}
      {node.children.length > 0 && (
        <div className="flex justify-between font-medium pt-1">
          <span className={padding}>Total {node.name}</span>
          <span className="pr-10">{formatMoney(sumNode(node))}</span>
        </div>
      )}
    </div>
  );
}

function BalanceSheet() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(currentYear));
  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(`${currentYear}-12-31`);
  const [type, setType] = useState(1); // 1 = normal, 2 = monthly

  useEffect(() => {
    const arr: Years[] = [];
    for (let i = 0; i <= 5; i++) arr.push({ id: i, value: currentYear - i });
    setYears(arr);
  }, [currentYear]);

  const clearFilters = () => {
    setFromDate(`${currentYear}-01-01`);
    setToDate(`${currentYear}-12-31`);
    setYearsVal(String(currentYear));
  };

  const getAssets = useGetAccountsByTypeQuery({
    type: 1,
    fromD: fromDate,
    toD: toDate,
  });
  const getLiabilities = useGetAccountsByTypeQuery({
    type: 2,
    fromD: fromDate,
    toD: toDate,
  });
  const getEquity = useGetAccountsByTypeQuery({
    type: 3,
    fromD: fromDate,
    toD: toDate,
  });

  const getAssetsMonthly = useGetAccountsByTypeMonthlyBSQuery({
    type: 1,
    fromD: fromDate,
    toD: toDate,
  });
  const getLiabilitiesMonthly = useGetAccountsByTypeMonthlyBSQuery({
    type: 2,
    fromD: fromDate,
    toD: toDate,
  });
  const getEquityMonthly = useGetAccountsByTypeMonthlyBSQuery({
    type: 3,
    fromD: fromDate,
    toD: toDate,
  });

  const currState = useSelector((state: RootState) => state.auth.sideBar);
  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <SidebarProvider className="">
      <AppSidebar className="" />
      <SidebarInset
        className={`transition-all duration-300 ${currState === "expanded" ? "max-w-[calc(100vw-256px)]" : "max-w-[100vw]"}`}
      >
        <Header title={`Balance Sheet`} />
        {!hasAccess(access, "2", "view") ? (
          <Empty />
        ) : (
          <div className="flex flex-1 flex-col gap-4 p-4">
            {/* Filters */}
            <div className="flex justify-between flex-wrap gap-4">
              <div className="flex gap-2 flex-wrap">
                {/* Year select */}
                <div className="grid w-40 items-center gap-2">
                  <Label>Report Period</Label>
                  <Select
                    value={yearsVal}
                    onValueChange={(e) => {
                      if (!e) {
                        setFromDate("");
                        setToDate("");
                        setYearsVal("");
                      } else {
                        setFromDate(`${Number(e)}-01-01`);
                        setToDate(`${Number(e)}-12-31`);
                        setYearsVal(e);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="---" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y.id} value={String(y.value)}>
                          {y.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* From / To */}
                <div className="grid w-36 items-center gap-2">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="grid w-36 items-center gap-2">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                {/* Clear */}
                <div className="flex items-end">
                  <Button variant="second" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>

              {/* Export & View Type */}
              <div className="flex gap-4 items-end">
                <Button
                  variant="second"
                  onClick={async () => {
                    if (type === 1) {
                      await exportBalanceSheetNormalExcel(
                        buildTree(getAssets.data?.data || []),
                        buildTree(getLiabilities.data?.data || []),
                        buildTree(getEquity.data?.data || []),
                        "One Outsource Direct Corporation",
                        fromDate,
                        toDate,
                      );
                    } else {
                      await exportBalanceSheetMonthlyExcel(
                        buildTree(getAssetsMonthly.data?.data || []),
                        buildTree(getLiabilitiesMonthly.data?.data || []),
                        buildTree(getEquityMonthly.data?.data || []),
                        "One Outsource Direct Corporation",
                        fromDate,
                        toDate,
                      );
                    }
                  }}
                >
                  Export
                </Button>

                <div className="flex border rounded-sm">
                  <div
                    className={`border-r px-2 py-1 cursor-pointer ${type === 1 ? "bg-blue-300" : ""}`}
                    onClick={() => setType(1)}
                  >
                    <GripVertical />
                  </div>
                  <div
                    className={`px-2 py-1 cursor-pointer ${type === 2 ? "bg-blue-300" : ""}`}
                    onClick={() => setType(2)}
                  >
                    <Grip />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col pb-4 pr-4 h-[75vh] overflow-auto">
              {type === 1
                ? (() => {
                    const assets = buildTree(getAssets?.data?.data);
                    const liabilities = buildTree(getLiabilities?.data?.data);
                    const equity = buildTree(getEquity?.data?.data);

                    assets.forEach(computeSubtotal);
                    liabilities.forEach(computeSubtotal);
                    equity.forEach(computeSubtotal);

                    const totalLiab = getLiabilities?.data?.data.reduce(
                      (s: any, n: any) => s + parseFloat(n.balance),
                      0,
                    );
                    const totalEquity = getEquity?.data?.data.reduce(
                      (s: any, n: any) => s + parseFloat(n.balance),
                      0,
                    );

                    return (
                      <>
                        {assets.map((n) =>
                          renderNode(n, type, fromDate, toDate),
                        )}
                        <br />
                        {totalLiab + totalEquity !== 0 && (
                          <span className="font-semibold pt-2">
                            Liabilities & Equity
                          </span>
                        )}
                        {liabilities.map((n) =>
                          renderNode(n, type, fromDate, toDate),
                        )}
                        {equity.map((n) =>
                          renderNode(n, type, fromDate, toDate),
                        )}
                        {totalLiab + totalEquity !== 0 && (
                          <div className="flex justify-between font-semibold pt-4">
                            <span>Total Liabilities & Equity</span>
                            <span className="pr-0 md:pr-10">
                              {formatMoney(totalLiab + totalEquity)}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()
                : (() => {
                    const assetsMonthly = buildTree(
                      getAssetsMonthly?.data?.data || [],
                    ).map((n) => ({
                      ...n,
                      monthly_balances: n.monthly_balances || [],
                    }));
                    const liabilitiesMonthly = buildTree(
                      getLiabilitiesMonthly?.data?.data || [],
                    ).map((n) => ({
                      ...n,
                      monthly_balances: n.monthly_balances || [],
                    }));
                    const equityMonthly = buildTree(
                      getEquityMonthly?.data?.data || [],
                    ).map((n) => ({
                      ...n,
                      monthly_balances: n.monthly_balances || [],
                    }));

                    const liabilitiesTotalsMonthly = sumTreeMonthly(
                      liabilitiesMonthly,
                      fromDate,
                      toDate,
                    );
                    const equityTotalsMonthly = sumTreeMonthly(
                      equityMonthly,
                      fromDate,
                      toDate,
                    );

                    return (
                      <>
                        <div className="min-w-max flex">
                          <div className="sticky left-0 z-20 border-b !w-[270px] bg-white font-semibold">
                            Account
                          </div>
                          {generateMonths(fromDate, toDate).map((m) => (
                            <div
                              key={m}
                              className="text-right border-b !w-[120px] font-semibold"
                            >
                              {m}
                            </div>
                          ))}
                        </div>
                        {assetsMonthly.map((n) =>
                          renderNode(n, type, fromDate, toDate),
                        )}
                        <br />
                        {liabilitiesMonthly.map((n) =>
                          renderNode(n, type, fromDate, toDate),
                        )}
                        {equityMonthly.map((n) =>
                          renderNode(n, type, fromDate, toDate),
                        )}
                        {(liabilitiesTotalsMonthly.reduce(
                          (s, m) => s + m,
                          0,
                        ) !== 0 ||
                          equityTotalsMonthly.reduce((s, m) => s + m, 0) !==
                            0) && (
                          <div className="min-w-max flex">
                            <div className="sticky left-0 z-20 border-b !w-[270px] bg-white font-medium">
                              Total Liabilities & Equity
                            </div>
                            {liabilitiesTotalsMonthly.map((m, i) => {
                              const net = m + (equityTotalsMonthly[i] || 0);
                              return (
                                <div
                                  key={i}
                                  className="text-right text-sm !w-[120px]"
                                >
                                  {net === 0 ? "-" : formatMoney(net)}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

// -------------------------
// SUM TREE MONTHLY (used above)
// -------------------------
function sumTreeMonthly(
  nodes: AccountNode[],
  fromD: string,
  toD: string,
): number[] {
  const totals = Array(generateMonths(fromD, toD).length).fill(0);
  nodes.forEach((n) => {
    const nodeTotals = sumMonthly(n, fromD, toD);
    nodeTotals.forEach((val, i) => (totals[i] += val));
  });
  return totals;
}

export default BalanceSheet;
