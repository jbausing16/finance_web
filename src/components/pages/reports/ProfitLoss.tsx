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
  hasAccess,
} from "@/lib/utils";
import { AccountList } from "@/components/reusables/RawDatas";
import {
  useGetAccountsByCustQuery,
  useGetAccountsByVendorQuery,
  useLazyGetAccountsByCustQuery,
  useLazyGetAccountsByVendorQuery,
  useGetAccountsByTypeMonthlyQuery,
  useGetAccountsByTypeQuery,
} from "@/store/api/ReportsApi";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Grip, GripVertical, Users } from "lucide-react";
import {
  exportPLCustomerExcel,
  exportPLMonthlyExcel,
  exportPLNormalExcel,
  exportPLVendorExcel,
} from "@/components/reusables/exportPLExcel";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Empty from "@/components/reusables/Empty";
import { Loading } from "@/components/reusables/Loading";

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

const VENDOR_PAGE_SIZE = 20;
const CUSTOMER_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function buildTree(data: any[]): AccountNode[] {
  const map = new Map<number, AccountNode>();

  data?.forEach((item) => {
    map.set(item.id, {
      ...item,
      children: [],
      subtotal: 0,
    });
  });

  const roots: AccountNode[] = [];

  map.forEach((node) => {
    if (node.parent === 0) roots.push(node);
    else map.get(node.parent)?.children.push(node);
  });

  return roots;
}

function computeSubtotal(node: AccountNode): number {
  if (node.children.length === 0) {
    node.subtotal = node.type === 2 ? node.balance : 0;
    return node.subtotal;
  }

  node.subtotal = node.children.reduce((sum, c) => sum + computeSubtotal(c), 0);

  return node.subtotal;
}

function sumNode(node: AccountNode): number {
  // leaf
  if (!node.children || node.children.length === 0) {
    return Number(node.balance ?? 0);
  }

  // parent → sum children
  return node.children.reduce((sum, child) => {
    return sum + sumNode(child);
  }, 0);
}

function sumMonthly(node: AccountNode, fromD: string, toD: string): number[] {
  // Posting account
  if (node.type === 2 && node.monthly_balances) {
    return node.monthly_balances;
  }

  // Parent → sum children per month
  const totals = Array(generateMonths(fromD, toD).length).fill(0);

  node.children.forEach((child) => {
    const childTotals = sumMonthly(child, fromD, toD);
    childTotals.forEach((val, i) => {
      totals[i] += val;
    });
  });

  return totals;
}

export function sumTreeMonthly(
  nodes: AccountNode[],
  fromD: string,
  toD: string,
): number[] {
  const totals = Array(generateMonths(fromD, toD).length).fill(0);

  nodes.forEach((node) => {
    const nodeTotals = sumMonthly(node, fromD, toD);
    nodeTotals.forEach((val, i) => {
      totals[i] += val;
    });
  });

  return totals;
}

function isMonthlyZero(arr: number[] = []) {
  return arr.reduce((a, b) => a + b, 0) === 0;
}

function renderNode(
  node: AccountNode,
  viewType: number,
  fromD: string,
  toD: string,
  n?: string,
) {
  // const padding =
  //   node.level === 2
  //     ? "pl-8"
  //     : node.level === 3
  //       ? "pl-12"
  //       : node.level === 4
  //         ? "pl-16"
  //         : node.level === 5
  //           ? "pl-20"
  //           : node.level === 6
  //             ? "pl-24"
  //             : "pl-4";
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

  // MONTHLY VIEW (type === 2 toggle)
  if (viewType === 2) {
    const monthlyTotal =
      node.children.length > 0
        ? sumMonthly(node, fromD, toD)
        : (node.monthly_balances ?? []);

    // HIDE posting rows with zero total
    if (node.type === 2 && isMonthlyZero(node.monthly_balances)) {
      return null;
    }

    // HIDE parent rows if all children total to zero
    if (node.type === 1 && isMonthlyZero(monthlyTotal)) {
      return null;
    }

    return (
      <div key={node.id} className="">
        {/* ACCOUNT ROW */}
        <div
          className={`flex min-w-max items-center  ${node.type === 2 ? "" : ""}`}
        >
          <div
            className={`text-sm ${padding} ${node.type === 1 ? "font-semibold !w-[100%]" : "border-b"} sticky left-0 z-20 bg-white !w-[270px]`}
          >
            {node.name}
          </div>

          {node.type === 2
            ? node.monthly_balances!.map((m, i) => {
                const start = new Date(fromD);
                start.setMonth(start.getMonth() + i, 1);

                const end = new Date(
                  start.getFullYear(),
                  start.getMonth() + 1,
                  0,
                );

                const from = start.toLocaleDateString("en-CA").split("T")[0];
                const to = end.toLocaleDateString("en-CA").split("T")[0];

                return (
                  <span
                    key={i}
                    className={`text-right !w-[120px] text-sm ${node.type === 1 ? "font-semibold " : "border-b cursor-pointer hover:underline"}`}
                    onClick={() =>
                      window.open(
                        `/reports/general-ledger?fromD=${from}&toD=${to}&acc=${node.id}`,
                        "_blank",
                      )
                    }
                  >
                    {m === 0
                      ? `-`
                      : n === "N"
                        ? formatMoney(m)
                        : formatMoney(-m)}{" "}
                  </span>
                );
              })
            : node.monthly_balances!.map((_, i) => (
                <span key={i} className="!w-[120px] text-sm text-right"></span>
              ))}
        </div>

        {/* CHILDREN */}
        {node.children.map((child) =>
          renderNode(child, viewType, fromD, toD, n),
        )}

        {/* TOTAL ROW */}
        {node.children.length > 0 && !isMonthlyZero(monthlyTotal) && (
          <div className={`min-w-max flex`}>
            <span
              className={`text-sm ${padding} sticky left-0 bg-white z-20 border-b !w-[270px] font-medium`}
            >
              Total {node.name}
            </span>

            {monthlyTotal.map((m, i) => (
              <span key={i} className="text-right text-sm !w-[120px] border-b">
                {m === 0 ? `-` : n === "N" ? formatMoney(m) : formatMoney(-m)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===============================
  // NORMAL (type === 1) VIEW
  // ===============================

  const total =
    node.type === 2 && node.monthly_balances
      ? node.monthly_balances.reduce((a, b) => a + b, 0)
      : sumNode(node);

  // Skip zero-balance
  if (total === 0) return null;
  return (
    <div key={node.id}>
      <div
        className={`flex justify-between ${
          node.type === 2 ? "border-b" : "pt-2"
        }`}
      >
        <span className={`${padding} ${node.type === 1 ? "font-medium" : ""}`}>
          {node.name}
        </span>

        {node.type === 2 && (
          <span
            className={`pr-10 cursor-pointer hover:underline`}
            onClick={() =>
              window.open(
                `/reports/general-ledger?fromD=${fromD}&toD=${toD}&acc=${node.id}`,
                "_blank",
              )
            }
          >
            {n === "N" ? formatMoney(node.balance) : formatMoney(-node.balance)}
          </span>
        )}
      </div>

      {node.children.map((child) => renderNode(child, viewType, fromD, toD, n))}

      {/* TOTAL ROW (ONLY IN TYPE 1 VIEW) */}
      {node.children.length > 0 && (
        <div className="flex justify-between font-medium pt-1">
          <span className={padding}>Total {node.name}</span>
          <span className="pr-10">
            {n === "N"
              ? formatMoney(sumNode(node))
              : formatMoney(-sumNode(node))}
          </span>
        </div>
      )}
    </div>
  );
}

function renderNodeByCustomer(
  node: any,
  viewType: number,
  fromD: string,
  toD: string,
  n?: string,
) {
  const padding =
    node.level === 2
      ? "pl-8"
      : node.level === 3
        ? "pl-12"
        : node.level === 4
          ? "pl-16"
          : node.level === 5
            ? "pl-20"
            : node.level === 6
              ? "pl-24"
              : "pl-4";

  // Skip node if all customer amounts are zero (including children)
  const getTotalRecursive = (node: any, cid: any): number => {
    const nodeAmount = node.cust?.find((c: any) => c.id === cid)?.amount ?? 0;
    const childrenAmount = (node.children || [])
      .map((child: any) => getTotalRecursive(child, cid))
      .reduce((a: any, b: any) => a + b, 0);
    return nodeAmount + childrenAmount;
  };

  const custTotal =
    node.cust?.reduce(
      (sum: any, c: any) => sum + getTotalRecursive(node, c.id),
      0,
    ) ?? 0;
  if (custTotal === 0) return null;

  // Render current node
  return (
    <div key={`c${node.id}`}>
      <div className="flex min-w-max items-center">
        <div
          className={`text-sm ${padding} ${node.type === 1 ? "font-semibold !w-[100%]" : "border-b"} sticky left-0 z-20 bg-white !w-[270px]`}
        >
          {node.name}
        </div>

        {/* Render customer amounts */}
        {node.cust?.map((c: any) => (
          <span
            key={c.id}
            className={`text-right !w-[120px] text-sm ${node.type === 2 ? `border-b` : ``} `}
          >
            {c.amount === 0
              ? node.type === 2
                ? `-`
                : ``
              : n === "N"
                ? formatMoney(c.amount)
                : formatMoney(-c.amount)}
          </span>
        ))}
      </div>

      {/* Render children recursively */}
      {node.children.map((child: any) =>
        renderNodeByCustomer(child, viewType, fromD, toD, n),
      )}

      {/* Total row per node (sum of all children recursively per customer) */}
      {node.children.length > 0 && (
        <div className="min-w-max flex">
          <span
            className={`text-sm ${padding} sticky left-0 bg-white z-20 border-b !w-[270px] font-medium`}
          >
            Total {node.name}
          </span>

          {node.cust?.map((c: any, idx: any) => {
            const total = getTotalRecursive(node, c.id);

            return (
              <span
                key={idx}
                className="text-right text-sm !w-[120px] border-b"
              >
                {total === 0
                  ? `-`
                  : n === "N"
                    ? formatMoney(total)
                    : formatMoney(-total)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

function ProfitLoss() {
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(currentYear));

  const [type, setType] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearchDebounced, setCustomerSearchDebounced] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorSearchDebounced, setVendorSearchDebounced] = useState("");
  const [vendorPage, setVendorPage] = useState(1);

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
    setCustomerSearch("");
    setCustomerSearchDebounced("");
    setCustomerPage(1);
    setVendorSearch("");
    setVendorSearchDebounced("");
    setVendorPage(1);
  };

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setCustomerSearchDebounced(customerSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handler);
  }, [customerSearch]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setVendorSearchDebounced(vendorSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handler);
  }, [vendorSearch]);

  useEffect(() => {
    setCustomerPage(1);
    setVendorPage(1);
  }, [customerSearch, vendorSearch, fromDate, toDate, type]);

  const getIncome = useGetAccountsByTypeQuery(
    {
      type: 4,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getCOGS = useGetAccountsByTypeQuery(
    {
      type: 5,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getExpense = useGetAccountsByTypeQuery(
    {
      type: 6,
      fromD: fromDate,
      toD: toDate,
    },
    { refetchOnMountOrArgChange: true },
  );
  const getOther = useGetAccountsByTypeQuery(
    {
      type: 7,
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

  const getIncomeCust = useGetAccountsByCustQuery(
    {
      type: 4,
      fromD: fromDate,
      toD: toDate,
      search: customerSearchDebounced,
      page: customerPage,
      pageSize: CUSTOMER_PAGE_SIZE,
    },
    { skip: type !== 3, refetchOnMountOrArgChange: true },
  );
  const getCOGSCust = useGetAccountsByCustQuery(
    {
      type: 5,
      fromD: fromDate,
      toD: toDate,
      search: customerSearchDebounced,
      page: customerPage,
      pageSize: CUSTOMER_PAGE_SIZE,
    },
    { skip: type !== 3, refetchOnMountOrArgChange: true },
  );
  const getExpenseCust = useGetAccountsByCustQuery(
    {
      type: 6,
      fromD: fromDate,
      toD: toDate,
      search: customerSearchDebounced,
      page: customerPage,
      pageSize: CUSTOMER_PAGE_SIZE,
    },
    { skip: type !== 3, refetchOnMountOrArgChange: true },
  );
  const getOtherCust = useGetAccountsByCustQuery(
    {
      type: 7,
      fromD: fromDate,
      toD: toDate,
      search: customerSearchDebounced,
      page: customerPage,
      pageSize: CUSTOMER_PAGE_SIZE,
    },
    { skip: type !== 3, refetchOnMountOrArgChange: true },
  );

  const [getCustomerAccountsForExport] = useLazyGetAccountsByCustQuery();
  const [getVendorAccountsForExport] = useLazyGetAccountsByVendorQuery();

  const customerCount =
    getIncomeCust?.data?.count ??
    getIncomeCust?.data?.data?.[0]?.cust?.length ??
    0;
  const customerPageFromApi = getIncomeCust?.data?.page ?? customerPage;
  const customerPageSizeFromApi =
    getIncomeCust?.data?.page_size ?? CUSTOMER_PAGE_SIZE;
  const customerTotalPages = getIncomeCust?.data?.total_pages ?? 1;
  const customerHasNext = Boolean(getIncomeCust?.data?.has_next);
  const customerHasPrevious = Boolean(getIncomeCust?.data?.has_previous);
  const customerStart =
    customerCount === 0
      ? 0
      : (customerPageFromApi - 1) * customerPageSizeFromApi + 1;
  const customerEnd =
    customerCount === 0
      ? 0
      : Math.min(customerPageFromApi * customerPageSizeFromApi, customerCount);

  const getIncomeVendor = useGetAccountsByVendorQuery(
    {
      type: 4,
      fromD: fromDate,
      toD: toDate,
      search: vendorSearchDebounced,
      page: vendorPage,
      pageSize: VENDOR_PAGE_SIZE,
    },
    { skip: type !== 4, refetchOnMountOrArgChange: true },
  );
  const getCOGSVendor = useGetAccountsByVendorQuery(
    {
      type: 5,
      fromD: fromDate,
      toD: toDate,
      search: vendorSearchDebounced,
      page: vendorPage,
      pageSize: VENDOR_PAGE_SIZE,
    },
    { skip: type !== 4, refetchOnMountOrArgChange: true },
  );
  const getExpenseVendor = useGetAccountsByVendorQuery(
    {
      type: 6,
      fromD: fromDate,
      toD: toDate,
      search: vendorSearchDebounced,
      page: vendorPage,
      pageSize: VENDOR_PAGE_SIZE,
    },
    { skip: type !== 4, refetchOnMountOrArgChange: true },
  );
  const getOtherVendor = useGetAccountsByVendorQuery(
    {
      type: 7,
      fromD: fromDate,
      toD: toDate,
      search: vendorSearchDebounced,
      page: vendorPage,
      pageSize: VENDOR_PAGE_SIZE,
    },
    { skip: type !== 4, refetchOnMountOrArgChange: true },
  );

  const vendorCount =
    getIncomeVendor?.data?.count ??
    getIncomeVendor?.data?.data?.[0]?.cust?.length ??
    0;
  const vendorPageFromApi = getIncomeVendor?.data?.page ?? vendorPage;
  const vendorPageSizeFromApi =
    getIncomeVendor?.data?.page_size ?? VENDOR_PAGE_SIZE;
  const vendorTotalPages = getIncomeVendor?.data?.total_pages ?? 1;
  const vendorHasNext = Boolean(getIncomeVendor?.data?.has_next);
  const vendorHasPrevious = Boolean(getIncomeVendor?.data?.has_previous);
  const vendorStart =
    vendorCount === 0
      ? 0
      : (vendorPageFromApi - 1) * vendorPageSizeFromApi + 1;
  const vendorEnd =
    vendorCount === 0
      ? 0
      : Math.min(vendorPageFromApi * vendorPageSizeFromApi, vendorCount);

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
          className={`transition-all duration-300 ${currState === "expanded" ? "max-w-[calc(100vw-256px)]" : "max-w-[100vw]"}`}
        >
          <Header title="Profit & Loss" />

          {!hasAccess(access, "3", "view") ? (
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

                  {type === 3 && (
                    <div className="grid w-full items-center gap-2">
                      <Label className=" gap-0">Customer Search</Label>
                      <Input
                        type="text"
                        placeholder="Search customer name or code"
                        className="w-full min-w-[220px]"
                        name="customerSearch"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                    </div>
                  )}

                  {type === 4 && (
                    <div className="grid w-full items-center gap-2">
                      <Label className=" gap-0">Vendor Search</Label>
                      <Input
                        type="text"
                        placeholder="Search vendor name or code"
                        className="w-full min-w-[220px]"
                        name="vendorSearch"
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="form-control w-full">
                      <div className="label"> &nbsp;</div>
                      <Button variant="second" onClick={clearFilters}>
                        Clear
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <div className="label"> &nbsp;</div>
                    <Button
                      variant="second"
                      onClick={async () => {
                        if (type === 1) {
                          await exportPLNormalExcel(
                            buildTree(getIncome.data?.data || []),
                            buildTree(getCOGS.data?.data || []),
                            buildTree(getExpense.data?.data || []),
                            buildTree(getOther.data?.data || []),
                            "One Outsource Direct Corporation",
                            fromDate,
                            toDate,
                          );
                        } else if (type === 2) {
                          await exportPLMonthlyExcel(
                            buildTree(getIncomeMonthly.data?.data || []),
                            buildTree(getCOGSMonthly.data?.data || []),
                            buildTree(getExpenseMonthly.data?.data || []),
                            buildTree(getOtherMonthly.data?.data || []),
                            "One Outsource Direct Corporation",
                            fromDate,
                            toDate,
                          );
                        } else if (type === 3) {
                          const [incomeCustomerExport, cogsCustomerExport, expenseCustomerExport, otherCustomerExport] =
                            await Promise.all([
                              getCustomerAccountsForExport({
                                type: 4,
                                fromD: fromDate,
                                toD: toDate,
                                search: customerSearch,
                                exportAll: true,
                              }).unwrap(),
                              getCustomerAccountsForExport({
                                type: 5,
                                fromD: fromDate,
                                toD: toDate,
                                search: customerSearch,
                                exportAll: true,
                              }).unwrap(),
                              getCustomerAccountsForExport({
                                type: 6,
                                fromD: fromDate,
                                toD: toDate,
                                search: customerSearch,
                                exportAll: true,
                              }).unwrap(),
                              getCustomerAccountsForExport({
                                type: 7,
                                fromD: fromDate,
                                toD: toDate,
                                search: customerSearch,
                                exportAll: true,
                              }).unwrap(),
                            ]);

                          await exportPLCustomerExcel(
                            buildTree(incomeCustomerExport?.data || []),
                            buildTree(cogsCustomerExport?.data || []),
                            buildTree(expenseCustomerExport?.data || []),
                            buildTree(otherCustomerExport?.data || []),
                            "One Outsource Direct Corporation",
                            fromDate,
                            toDate,
                          );
                        } else {
                          const [incomeVendorExport, cogsVendorExport, expenseVendorExport, otherVendorExport] =
                            await Promise.all([
                              getVendorAccountsForExport({
                                type: 4,
                                fromD: fromDate,
                                toD: toDate,
                                search: vendorSearch,
                                exportAll: true,
                              }).unwrap(),
                              getVendorAccountsForExport({
                                type: 5,
                                fromD: fromDate,
                                toD: toDate,
                                search: vendorSearch,
                                exportAll: true,
                              }).unwrap(),
                              getVendorAccountsForExport({
                                type: 6,
                                fromD: fromDate,
                                toD: toDate,
                                search: vendorSearch,
                                exportAll: true,
                              }).unwrap(),
                              getVendorAccountsForExport({
                                type: 7,
                                fromD: fromDate,
                                toD: toDate,
                                search: vendorSearch,
                                exportAll: true,
                              }).unwrap(),
                            ]);

                          await exportPLVendorExcel(
                            buildTree(incomeVendorExport?.data || []),
                            buildTree(cogsVendorExport?.data || []),
                            buildTree(expenseVendorExport?.data || []),
                            buildTree(otherVendorExport?.data || []),
                            "One Outsource Direct Corporation",
                            fromDate,
                            toDate,
                          );
                        }
                      }}
                    >
                      Export
                    </Button>
                  </div>

                  <label className="form-control w-full ">
                    <div className="label"> &nbsp;</div>

                    <div className="flex border rounded-sm">
                      <div
                        className={`border-r px-2 py-1  rounded-sm cursor-pointer ${
                          type === 1 ? `bg-blue-300` : ``
                        }`}
                        onClick={() => setType(1)}
                      >
                        <GripVertical />
                      </div>
                      <div
                        className={`border-r px-2 py-1 rounded-sm cursor-pointer ${
                          type === 2 ? `bg-blue-300` : ``
                        }`}
                        onClick={() => setType(2)}
                      >
                        <Grip />
                      </div>
                      <div
                        className={`border-r px-2 py-1 rounded-sm cursor-pointer ${
                          type === 3 ? `bg-blue-300` : ``
                        }`}
                        onClick={() => setType(3)}
                      >
                        <Users />
                      </div>
                      <div
                        className={`px-2 py-1 rounded-sm cursor-pointer ${
                          type === 4 ? `bg-blue-300` : ``
                        }`}
                        onClick={() => setType(4)}
                      >
                        <Building2 />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col pb-4 pr-4 h-[75vh] overflow-y-auto">
                {type === 1
                  ? (() => {
                      const tree = buildTree(AccountList);
                      tree.forEach(computeSubtotal);

                      const income = buildTree(getIncome?.data?.data);
                      const cogs = buildTree(getCOGS?.data?.data);
                      const expense = buildTree(getExpense?.data?.data);
                      const other = buildTree(getOther?.data?.data);

                      const totalIncome = -getIncome?.data?.data.reduce(
                        (s: any, n: any) => s + parseFloat(n.balance),
                        0,
                      );
                      const totalCogs = getCOGS?.data?.data.reduce(
                        (s: any, n: any) => s + parseFloat(n.balance),
                        0,
                      );
                      const totalExpense = getExpense?.data?.data.reduce(
                        (s: any, n: any) => s + parseFloat(n.balance),
                        0,
                      );
                      const totalOther = -getOther?.data?.data.reduce(
                        (s: any, n: any) => s + parseFloat(n.balance),
                        0,
                      );

                      return (
                        <>
                          <div key={type}>
                            {/* {totalLiab + totalEquity !== 0 && ( */}
                            <span className="font-medium pt-10">
                              Ordinary Income/Expense
                            </span>
                            {/* )} */}

                            {income.map((n) =>
                              renderNode(n, type, fromDate, toDate),
                            )}

                            {cogs.map((n) =>
                              renderNode(n, type, fromDate, toDate, "N"),
                            )}

                            <div className="flex justify-between font-medium pt-4">
                              <span>Gross Profit</span>
                              <span className="pr-0 md:pr-10">
                                {formatMoney(totalIncome - totalCogs)}
                              </span>
                            </div>

                            {expense.map((n) =>
                              renderNode(n, type, fromDate, toDate, "N"),
                            )}

                            <div className="flex justify-between font-medium pt-4">
                              <span>Net Ordinary Income</span>
                              <span className="pr-0 md:pr-10">
                                {formatMoney(
                                  totalIncome - totalCogs - totalExpense,
                                )}
                              </span>
                            </div>

                            <span className="font-medium pt-10">
                              Other Income/Expense
                            </span>

                            {other.map((n) =>
                              renderNode(n, type, fromDate, toDate),
                            )}

                            <div className="flex justify-between font-medium pt-4">
                              <span>Net Other Income</span>
                              <span className="pr-0 md:pr-10">
                                {formatMoney(totalOther)}
                              </span>
                            </div>

                            <div className="flex justify-between font-medium pt-4">
                              <span>Net Income</span>
                              <span className="pr-0 md:pr-10">
                                {formatMoney(
                                  totalIncome -
                                    totalCogs -
                                    totalExpense +
                                    totalOther,
                                )}
                              </span>
                            </div>

                            {/* {totalLiab + totalEquity !== 0 && (
                            <span className="font-medium pt-10">
                              Liabilities & Equity
                            </span>
                          )}

                          {liabilities.map((n) =>
                            renderNode(n, type, fromDate, toDate)
                          )}

                          {equity.map((n) =>
                            renderNode(n, type, fromDate, toDate)
                          )}

                          {totalLiab + totalEquity !== 0 && (
                            <div className="flex justify-between font-medium pt-4">
                              <span>Total Liabilities and Equity</span>
                              <span className="pr-0 md:pr-10">
                                {formatMoney(totalLiab + totalEquity)}
                              </span>
                            </div>
                          )} */}
                          </div>
                        </>
                      );
                    })()
                  : type === 2
                    ? (() => {
                        const incomeMonthly = buildTree(
                          getIncomeMonthly?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        const cogsMonthly = buildTree(
                          getCOGSMonthly?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        const incomeTotalsMonthly = sumTreeMonthly(
                          incomeMonthly,
                          fromDate,
                          toDate,
                        );

                        const cogsTotalsMonthly = sumTreeMonthly(
                          cogsMonthly,
                          fromDate,
                          toDate,
                        );

                        const grossProfitMonthly = incomeTotalsMonthly.map(
                          (val, i) => val + (cogsTotalsMonthly[i] || 0),
                        );

                        const expenseMonthly = buildTree(
                          getExpenseMonthly?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        const expenseTotalsMonthly = sumTreeMonthly(
                          expenseMonthly,
                          fromDate,
                          toDate,
                        );

                        const otherMonthly = buildTree(
                          getOtherMonthly?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        const otherTotalsMonthly = sumTreeMonthly(
                          otherMonthly,
                          fromDate,
                          toDate,
                        );

                        return (
                          <>
                            <div
                              className="relative overflow-x-auto"
                              key={type}
                            >
                              <div className="min-w-max flex">
                                <div className="sticky left-0 z-20 border-b !w-[270px] bg-white font-semibold">
                                  Account
                                </div>
                                {generateMonths(fromDate, toDate).map(
                                  (m) => (
                                    <div
                                      key={m}
                                      className={`text-right border-b !w-[120px] font-semibold`}
                                    >
                                      {m}
                                    </div>
                                  ),
                                )}
                              </div>

                              <span className="font-medium sticky left-0  z-20">
                                Ordinary Income/Expense
                              </span>

                              {incomeMonthly.map((n) =>
                                renderNode(n, type, fromDate, toDate),
                              )}
                              {cogsMonthly.map((n) =>
                                renderNode(n, type, fromDate, toDate, "N"),
                              )}

                              <div className="min-w-max flex">
                                <div className="sticky left-0 z-20  font-medium !w-[270px] bg-white">
                                  Gross Profit
                                </div>

                                {grossProfitMonthly.map((m, i) => (
                                  <div
                                    key={i}
                                    className={`text-right text-sm  !w-[120px]`}
                                  >
                                    {m === 0 ? "-" : formatMoney(-m)}
                                  </div>
                                ))}
                              </div>

                              <br />
                              {expenseMonthly.map((n) =>
                                renderNode(n, type, fromDate, toDate, "N"),
                              )}

                              <div className="min-w-max flex">
                                <div className="sticky left-0 z-20 font-medium bg-white !w-[270px]">
                                  Net Ordinary Income
                                </div>

                                {grossProfitMonthly.map((m, i) => {
                                  const netValue =
                                    m - (-expenseTotalsMonthly[i] || 0);

                                  return (
                                    <div
                                      key={i}
                                      className="text-right text-sm !w-[120px]"
                                    >
                                      {netValue === 0
                                        ? "-"
                                        : formatMoney(-netValue)}
                                    </div>
                                  );
                                })}
                              </div>

                              <br />

                              <span className="font-medium sticky left-0 bg-white z-20 ">
                                Other Income/Expense
                              </span>
                              {otherMonthly.map((n) =>
                                renderNode(n, type, fromDate, toDate),
                              )}

                              <div className="min-w-max flex">
                                <div className="sticky left-0 z-20 font-medium bg-white !w-[270px]">
                                  Net Other Income
                                </div>

                                {otherTotalsMonthly.map((m, i) => {
                                  return (
                                    <div
                                      key={i}
                                      className="text-right text-sm !w-[120px]"
                                    >
                                      {m === 0 ? "-" : formatMoney(-m)}
                                    </div>
                                  );
                                })}
                              </div>

                              <br />

                              <div className="min-w-max flex">
                                <div className="sticky left-0 z-20 border-t font-medium bg-white !w-[270px]">
                                  Net Income
                                </div>

                                {grossProfitMonthly.map((m, i) => {
                                  const netValue =
                                    m -
                                    (-expenseTotalsMonthly[i] || 0) +
                                    (otherTotalsMonthly[i] || 0);

                                  return (
                                    <div
                                      key={i}
                                      className="text-right text-sm border-t !w-[120px]"
                                    >
                                      {netValue === 0
                                        ? "-"
                                        : formatMoney(-netValue)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        );
                      })()
                    : type === 3
                      ? (() => {
                        // Build trees for each category
                        const incomeCust = buildTree(
                          getIncomeCust?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        const cogsCust = buildTree(
                          getCOGSCust?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        const expenseCust = buildTree(
                          getExpenseCust?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        const otherCust = buildTree(
                          getOtherCust?.data?.data || [],
                        ).map((node) => {
                          if (node.type === 2)
                            node.monthly_balances = node.monthly_balances || [];
                          return node;
                        });

                        // Recursive sum for node + children per customer
                        const sumCust = (nodes: any[]): number[] => {
                          if (!nodes || nodes.length === 0) return [];
                          const custIds =
                            nodes[0]?.cust?.map((c: any) => c.id) || [];

                          return custIds.map((cid: any) => {
                            const sumNode = (node: any): number => {
                              const nodeAmount =
                                node.cust?.find((c: any) => c.id === cid)
                                  ?.amount ?? 0;
                              const childrenAmount = (node.children || [])
                                .map(sumNode)
                                .reduce((a: any, b: any) => a + b, 0);
                              return nodeAmount + childrenAmount;
                            };
                            return nodes
                              .map(sumNode)
                              .reduce((a, b) => a + b, 0);
                          });
                        };

                        // Totals per customer
                        const incomeTotalsCust = sumCust(incomeCust);
                        const cogsTotalsCust = sumCust(cogsCust);
                        const grossProfitCust = incomeTotalsCust.map(
                          (val, i) => val + (cogsTotalsCust[i] || 0),
                        );

                        const expenseTotalsCust = sumCust(expenseCust);
                        const otherTotalsCust = sumCust(otherCust);

                        return (
                          <>
                            <div className="mb-3 flex items-center justify-between" key="customer-pagination">
                              <div className="text-sm text-slate-600">
                                {customerCount === 0
                                  ? "No customers found"
                                  : `Showing ${customerStart}-${customerEnd} of ${customerCount} customers`}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="second"
                                  onClick={() =>
                                    setCustomerPage((prev) => Math.max(1, prev - 1))
                                  }
                                  disabled={!customerHasPrevious}
                                >
                                  Prev
                                </Button>
                                <span className="text-sm text-slate-600">
                                  Page {customerPageFromApi} of {customerTotalPages}
                                </span>
                                <Button
                                  variant="second"
                                  onClick={() => setCustomerPage((prev) => prev + 1)}
                                  disabled={!customerHasNext}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>

                            <div className="relative overflow-x-auto" key={3}>
                            {/* Header row with customer names */}
                            <div className="min-w-max flex">
                              <div className="sticky left-0 z-20 border-b !w-[270px] bg-white font-semibold">
                                Account
                              </div>
                              {(getIncomeCust?.data?.data?.[0]?.cust || []).map(
                                (c: any) => (
                                  <div
                                    key={`cust${c.id}`}
                                    className="text-center border-b !w-[120px] font-semibold"
                                  >
                                    {c.name}
                                  </div>
                                ),
                              )}
                            </div>

                            {/* Ordinary Income/Expense */}
                            <span className="font-medium sticky left-0 z-20">
                              Ordinary Income/Expense
                            </span>
                            {incomeCust.map((n) =>
                              renderNodeByCustomer(n, 3, fromDate, toDate),
                            )}
                            {cogsCust.map((n) =>
                              renderNodeByCustomer(n, 3, fromDate, toDate, "N"),
                            )}

                            {/* Gross Profit */}
                            <div className="min-w-max flex">
                              <div className="sticky left-0 z-20 font-medium !w-[270px] bg-white">
                                Gross Profit
                              </div>
                              {grossProfitCust.map((amt, i) => (
                                <div
                                  key={i}
                                  className="text-right text-sm !w-[120px]"
                                >
                                  {amt === 0 ? "-" : formatMoney(-amt)}
                                </div>
                              ))}
                            </div>

                            <br />
                            {/* Expenses */}
                            <span className="font-medium sticky left-0 z-20">
                              Expenses
                            </span>
                            {expenseCust.map((n) =>
                              renderNodeByCustomer(n, 3, fromDate, toDate, "N"),
                            )}

                            {/* Net Ordinary Income */}
                            <div className="min-w-max flex">
                              <div className="sticky left-0 z-20 font-medium bg-white !w-[270px]">
                                Net Ordinary Income
                              </div>
                              {grossProfitCust.map((val, i) => {
                                const netVal =
                                  val - (-expenseTotalsCust[i] || 0);
                                return (
                                  <div
                                    key={i}
                                    className="text-right text-sm !w-[120px]"
                                  >
                                    {netVal === 0 ? "-" : formatMoney(-netVal)}
                                  </div>
                                );
                              })}
                            </div>

                            <br />

                            {/* Other Income/Expense */}
                            <span className="font-medium sticky left-0 z-20">
                              Other Income/Expense
                            </span>
                            {otherCust.map((n) =>
                              renderNodeByCustomer(n, 3, fromDate, toDate),
                            )}

                            {/* Net Other Income */}
                            <div className="min-w-max flex">
                              <div className="sticky left-0 z-20 font-medium bg-white !w-[270px]">
                                Net Other Income
                              </div>
                              {otherTotalsCust.map((amt, i) => (
                                <div
                                  key={i}
                                  className="text-right text-sm !w-[120px]"
                                >
                                  {amt === 0 ? "-" : formatMoney(-amt)}
                                </div>
                              ))}
                            </div>

                            <br />

                            {/* Net Income */}
                            <div className="min-w-max flex">
                              <div className="sticky left-0 z-20 border-t font-medium bg-white !w-[270px]">
                                Net Income
                              </div>
                              {grossProfitCust.map((val, i) => {
                                const netVal =
                                  val -
                                  (-expenseTotalsCust[i] || 0) +
                                  (otherTotalsCust[i] || 0);
                                return (
                                  <div
                                    key={i}
                                    className="text-right text-sm border-t !w-[120px]"
                                  >
                                    {netVal === 0 ? "-" : formatMoney(-netVal)}
                                  </div>
                                );
                              })}
                            </div>
                            </div>
                          </>
                        );
                      })()
                      : (() => {
                          const incomeVendor = buildTree(
                            getIncomeVendor?.data?.data || [],
                          ).map((node) => {
                            if (node.type === 2)
                              node.monthly_balances =
                                node.monthly_balances || [];
                            return node;
                          });

                          const cogsVendor = buildTree(
                            getCOGSVendor?.data?.data || [],
                          ).map((node) => {
                            if (node.type === 2)
                              node.monthly_balances =
                                node.monthly_balances || [];
                            return node;
                          });

                          const expenseVendor = buildTree(
                            getExpenseVendor?.data?.data || [],
                          ).map((node) => {
                            if (node.type === 2)
                              node.monthly_balances =
                                node.monthly_balances || [];
                            return node;
                          });

                          const otherVendor = buildTree(
                            getOtherVendor?.data?.data || [],
                          ).map((node) => {
                            if (node.type === 2)
                              node.monthly_balances =
                                node.monthly_balances || [];
                            return node;
                          });

                          const sumVendor = (nodes: any[]): number[] => {
                            if (!nodes || nodes.length === 0) return [];
                            const vendorIds =
                              nodes[0]?.cust?.map((c: any) => c.id) || [];

                            return vendorIds.map((cid: any) => {
                              const sumNode = (node: any): number => {
                                const nodeAmount =
                                  node.cust?.find((c: any) => c.id === cid)
                                    ?.amount ?? 0;
                                const childrenAmount = (node.children || [])
                                  .map(sumNode)
                                  .reduce((a: any, b: any) => a + b, 0);
                                return nodeAmount + childrenAmount;
                              };
                              return nodes.map(sumNode).reduce((a, b) => a + b, 0);
                            });
                          };

                          const incomeTotalsVendor = sumVendor(incomeVendor);
                          const cogsTotalsVendor = sumVendor(cogsVendor);
                          const grossProfitVendor = incomeTotalsVendor.map(
                            (val, i) => val + (cogsTotalsVendor[i] || 0),
                          );

                          const expenseTotalsVendor = sumVendor(expenseVendor);
                          const otherTotalsVendor = sumVendor(otherVendor);

                          return (
                            <>
                              <div className="mb-3 flex items-center justify-between" key="vendor-pagination">
                                <div className="text-sm text-slate-600">
                                  {vendorCount === 0
                                    ? "No vendors found"
                                    : `Showing ${vendorStart}-${vendorEnd} of ${vendorCount} vendors`}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="second"
                                    onClick={() =>
                                      setVendorPage((prev) => Math.max(1, prev - 1))
                                    }
                                    disabled={!vendorHasPrevious}
                                  >
                                    Prev
                                  </Button>
                                  <span className="text-sm text-slate-600">
                                    Page {vendorPageFromApi} of {vendorTotalPages}
                                  </span>
                                  <Button
                                    variant="second"
                                    onClick={() => setVendorPage((prev) => prev + 1)}
                                    disabled={!vendorHasNext}
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>

                              <div className="relative overflow-x-auto" key={4}>
                                <div className="min-w-max flex">
                                  <div className="sticky left-0 z-20 border-b !w-[270px] bg-white font-semibold">
                                    Account
                                  </div>
                                  {(getIncomeVendor?.data?.data?.[0]?.cust || []).map(
                                    (c: any) => (
                                      <div
                                        key={`vendor${c.id}`}
                                        className="text-center border-b !w-[120px] font-semibold"
                                      >
                                        {c.name}
                                      </div>
                                    ),
                                  )}
                                </div>

                                <span className="font-medium sticky left-0 z-20">
                                  Ordinary Income/Expense
                                </span>
                                {incomeVendor.map((n) =>
                                  renderNodeByCustomer(n, 4, fromDate, toDate),
                                )}
                                {cogsVendor.map((n) =>
                                  renderNodeByCustomer(n, 4, fromDate, toDate, "N"),
                                )}

                                <div className="min-w-max flex">
                                  <div className="sticky left-0 z-20 font-medium !w-[270px] bg-white">
                                    Gross Profit
                                  </div>
                                  {grossProfitVendor.map((amt, i) => (
                                    <div
                                      key={i}
                                      className="text-right text-sm !w-[120px]"
                                    >
                                      {amt === 0 ? "-" : formatMoney(-amt)}
                                    </div>
                                  ))}
                                </div>

                                <br />

                                <span className="font-medium sticky left-0 z-20">
                                  Expenses
                                </span>
                                {expenseVendor.map((n) =>
                                  renderNodeByCustomer(n, 4, fromDate, toDate, "N"),
                                )}

                                <div className="min-w-max flex">
                                  <div className="sticky left-0 z-20 font-medium bg-white !w-[270px]">
                                    Net Ordinary Income
                                  </div>
                                  {grossProfitVendor.map((val, i) => {
                                    const netVal =
                                      val - (-expenseTotalsVendor[i] || 0);
                                    return (
                                      <div
                                        key={i}
                                        className="text-right text-sm !w-[120px]"
                                      >
                                        {netVal === 0 ? "-" : formatMoney(-netVal)}
                                      </div>
                                    );
                                  })}
                                </div>

                                <br />

                                <span className="font-medium sticky left-0 z-20">
                                  Other Income/Expense
                                </span>
                                {otherVendor.map((n) =>
                                  renderNodeByCustomer(n, 4, fromDate, toDate),
                                )}

                                <div className="min-w-max flex">
                                  <div className="sticky left-0 z-20 font-medium bg-white !w-[270px]">
                                    Net Other Income
                                  </div>
                                  {otherTotalsVendor.map((amt, i) => (
                                    <div
                                      key={i}
                                      className="text-right text-sm !w-[120px]"
                                    >
                                      {amt === 0 ? "-" : formatMoney(-amt)}
                                    </div>
                                  ))}
                                </div>

                                <br />

                                <div className="min-w-max flex">
                                  <div className="sticky left-0 z-20 border-t font-medium bg-white !w-[270px]">
                                    Net Income
                                  </div>
                                  {grossProfitVendor.map((val, i) => {
                                    const netVal =
                                      val -
                                      (-expenseTotalsVendor[i] || 0) +
                                      (otherTotalsVendor[i] || 0);
                                    return (
                                      <div
                                        key={i}
                                        className="text-right text-sm border-t !w-[120px]"
                                      >
                                        {netVal === 0 ? "-" : formatMoney(-netVal)}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          );
                        })()}
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default ProfitLoss;
