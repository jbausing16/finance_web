import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { SearchForm } from "@/components/reusables/sidebar/search-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { viewSide } from "@/store/auth/authSlice";
import {
  useGetSideBarQuery,
  useGetSideBarSubQuery,
} from "@/store/api/AdministrationApi";
import { hasAccess } from "@/lib/utils";

// const navMain = [
//   { title: "Dashboard", url: "/dashboard", items: [] },
//   {
//     title: "Reports",
//     url: "#",
//     items: [
//       { title: "Balance Sheet", url: "/reports/balance-sheet" },
//       { title: "Profit & Loss", url: "/reports/profit-loss" },
//       { title: "Cash Flow", url: "/reports/cash-flow" },
//       { title: "General Ledger", url: "/reports/general-ledger" },
//       { title: "Financial Performance", url: "/reports/financial-performance" },
//       { title: "Projection", url: "/reports/projection" },
//     ],
//   },
//   {
//     title: "Administration",
//     url: "#",
//     items: [
//       { title: "Users", url: "/administration/users" },
//       { title: "Approval Process", url: "/administration/approval" },
//       { title: "Automatic Entries", url: "/administration/automatic-entries" },
//       { title: "Posting Periods", url: "/administration/posting-period" },
//       { title: "Document Number", url: "/administration/document-number" },
//       { title: "Banks Setup", url: "/administration/bank" },
//       { title: "A/R Payment Terms", url: "/administration/payment-terms" },
//     ],
//   },
//   {
//     title: "Financials",
//     url: "#",
//     items: [
//       { title: "Chart of Accounts", url: "/financials/chart-of-accounts" },
//       { title: "Journal Entry", url: "/financials/journal-entry" },
//       { title: "Journal Report", url: "/financials/journal-report" },
//     ],
//   },
//   {
//     title: "Sales - A/R",
//     url: "#",
//     items: [
//       // { title: "Sales Order", url: "#" },
//       // { title: "Delivery", url: "#" },
//       { title: "A/R Invoice", url: "/sales/invoice" },
//       { title: "A/R Credit Memo", url: "/sales/credit-memo" },
//       { title: "Recurring Transactions", url: "/sales/recurring-transactions" },
//     ],
//   },
//   {
//     title: "Purchasing - A/P",
//     url: "#",
//     items: [
//       // { title: "Purchase Order", url: "#" },
//       // { title: "Goods Receipt PO", url: "#" },
//       { title: "A/P Invoice", url: "/purchasing/invoice" },
//       { title: "A/P Credit Memo", url: "/purchasing/credit-memo" },
//       {
//         title: "Recurring Transactions",
//         url: "/purchasing/recurring-transactions",
//       },
//     ],
//   },
//   {
//     title: "Banking",
//     url: "#",
//     items: [
//       { title: "Incoming Payment", url: "/banking/incoming-payment" },
//       { title: "Outgoing Payment", url: "/banking/outgoing-payment" },
//       { title: "Bank Reconciliation", url: "/banking/bank-recon" },
//     ],
//   },
//   { title: "Business Partner", url: "/business-partner", items: [] },
//   { title: "Inventory", url: "/inventory", items: [] },
//   { title: "Approval", url: "/approval", items: [] },
// ];

const AdminNav = [
  { title: "Client", url: "/admin/client", items: [] },
  { title: "Users", url: "/admin/users", items: [] },
  { title: "Access", url: "/admin/access", items: [] },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch();
  const location = useLocation();
  const activePath = location.pathname;
  // const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    return localStorage.getItem("openSidebarGroup");
  });
  const [search, setSearch] = useState("");

  const { state } = useSidebar();

  useEffect(() => {
    localStorage.setItem("side", state);
    dispatch(
      viewSide({
        stat: state,
      }),
    );
  }, [state]);

  const currentRole = useSelector((state: RootState) => state.auth.role);
  const access = useSelector((state: RootState) => state.auth.access);
  // console.log("Access here: ", access);

  const sideBar = useGetSideBarQuery({});

  // console.log(sideBar?.data?.data);
  const sideB = sideBar?.data?.data;
  const dashboard = sideB?.find((item: any) => item.name === "Dashboard");
  const reports = sideB?.find((item: any) => item.name === "Reports");
  const administration = sideB?.find(
    (item: any) => item.name === "Administration",
  );
  const financials = sideB?.find((item: any) => item.name === "Financials");
  const sales = sideB?.find((item: any) => item.name === "Sales - A/R");
  const purchasing = sideB?.find(
    (item: any) => item.name === "Purchasing - A/P",
  );
  const banking = sideB?.find((item: any) => item.name === "Banking");
  const bp = sideB?.find((item: any) => item.name === "Business Partner");
  const inventory = sideB?.find((item: any) => item.name === "Inventory");
  const approval = sideB?.find((item: any) => item.name === "Approval");

  const navMain = [
    ...(dashboard?.access > 0
      ? [
          {
            title: "Dashboard",
            url: "/dashboard",
            items: [],
          },
        ]
      : []),
    ...(reports?.access > 0
      ? [
          {
            title: "Reports",
            url: "#",
            items: [
              ...(hasAccess(access, "2", "view")
                ? [{ title: "Trial Balance", url: "/reports/trial-balance" }]
                : []),
              ...(hasAccess(access, "2", "view")
                ? [{ title: "Balance Sheet", url: "/reports/balance-sheet" }]
                : []),
              ...(hasAccess(access, "3", "view")
                ? [{ title: "Profit & Loss", url: "/reports/profit-loss" }]
                : []),
              ...(hasAccess(access, "4", "view")
                ? [{ title: "Cash Flow", url: "/reports/cash-flow" }]
                : []),
              ...(hasAccess(access, "5", "view")
                ? [{ title: "General Ledger", url: "/reports/general-ledger" }]
                : []),
              ...(hasAccess(access, "6", "view")
                ? [
                    {
                      title: "Financial Performance",
                      url: "/reports/financial-performance",
                    },
                  ]
                : []),
              ...(hasAccess(access, "7", "view")
                ? [{ title: "Projection", url: "/reports/projection" }]
                : []),
            ],
          },
        ]
      : []),
    ...(administration?.access > 0
      ? [
          {
            title: "Administration",
            url: "#",
            items: [
              ...(hasAccess(access, "8", "view")
                ? [{ title: "Users", url: "/administration/users" }]
                : []),
              ...(hasAccess(access, "9", "view")
                ? [
                    {
                      title: "Approval Process",
                      url: "/administration/approval",
                    },
                  ]
                : []),
              ...(hasAccess(access, "10", "view")
                ? [
                    {
                      title: "Automatic Entries",
                      url: "/administration/automatic-entries",
                    },
                  ]
                : []),
              ...(hasAccess(access, "11", "view")
                ? [
                    {
                      title: "Posting Periods",
                      url: "/administration/posting-period",
                    },
                  ]
                : []),
              ...(hasAccess(access, "12", "view")
                ? [
                    {
                      title: "Document Number",
                      url: "/administration/document-number",
                    },
                  ]
                : []),
              ...(hasAccess(access, "13", "view")
                ? [{ title: "Banks Setup", url: "/administration/bank" }]
                : []),
              ...(hasAccess(access, "14", "view")
                ? [
                    {
                      title: "A/R Payment Terms",
                      url: "/administration/payment-terms",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(financials?.access > 0
      ? [
          {
            title: "Financials",
            url: "#",
            items: [
              ...(hasAccess(access, "15", "view")
                ? [
                    {
                      title: "Chart of Accounts",
                      url: "/financials/chart-of-accounts",
                    },
                  ]
                : []),
              ...(hasAccess(access, "16", "view")
                ? [{ title: "Journal Entry", url: "/financials/journal-entry" }]
                : []),
              ...(hasAccess(access, "17", "view")
                ? [
                    {
                      title: "Journal Report",
                      url: "/financials/journal-report",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(sales?.access > 0
      ? [
          {
            title: "Sales - A/R",
            url: "#",
            items: [
              // { title: "Sales Order", url: "#" },
              // { title: "Delivery", url: "#" },
              ...(hasAccess(access, "18", "view")
                ? [{ title: "A/R Invoice", url: "/sales/invoice" }]
                : []),
              ...(hasAccess(access, "19", "view")
                ? [{ title: "A/R Credit Memo", url: "/sales/credit-memo" }]
                : []),
              ...(hasAccess(access, "20", "view")
                ? [
                    {
                      title: "Recurring Transactions",
                      url: "/sales/recurring-transactions",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(purchasing?.access > 0
      ? [
          {
            title: "Purchasing - A/P",
            url: "#",
            items: [
              { title: "Purchase Request", url: "#" },
              { title: "Purchase Order", url: "#" },
              { title: "Goods Receipt PO", url: "#" },
              ...(hasAccess(access, "21", "view")
                ? [{ title: "A/P Invoice", url: "/purchasing/invoice" }]
                : []),
              ...(hasAccess(access, "22", "view")
                ? [{ title: "A/P Credit Memo", url: "/purchasing/credit-memo" }]
                : []),
              ...(hasAccess(access, "23", "view")
                ? [
                    {
                      title: "Recurring Transactions",
                      url: "/purchasing/recurring-transactions",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(banking?.access > 0
      ? [
          {
            title: "Banking",
            url: "#",
            items: [
              ...(hasAccess(access, "24", "view")
                ? [
                    {
                      title: "Incoming Payment",
                      url: "/banking/incoming-payment",
                    },
                  ]
                : []),
              ...(hasAccess(access, "25", "view")
                ? [
                    {
                      title: "Outgoing Payment",
                      url: "/banking/outgoing-payment",
                    },
                  ]
                : []),
              ...(hasAccess(access, "26", "view")
                ? [{ title: "Bank Reconciliation", url: "/banking/bank-recon" }]
                : []),
            ],
          },
        ]
      : []),
    ...(bp?.access > 0
      ? [{ title: "Business Partner", url: "/business-partner", items: [] }]
      : []),
    ...(inventory?.access > 0
      ? [{ title: "Inventory", url: "/inventory", items: [] }]
      : []),
    ...(approval?.access > 0
      ? [{ title: "Approval", url: "/approval", items: [] }]
      : []),
  ];

  // Auto-open the group that contains the current route
  useEffect(() => {
    if (openGroup) return;

    const activeGroup = navMain.find((group) =>
      group.items.some((item) => item.url === activePath),
    );

    if (activeGroup) {
      setOpenGroup(activeGroup.title);
    }
  }, [activePath, navMain, openGroup]);

  useEffect(() => {
    if (openGroup) {
      localStorage.setItem("openSidebarGroup", openGroup);
    } else {
      localStorage.removeItem("openSidebarGroup");
    }
  }, [openGroup]);

  // Filter for search
  const filteredNav =
    currentRole !== 1
      ? (navMain
          .map((group) => {
            if (!search.trim()) return group;
            const q = search.toLowerCase();
            const matches = group.title.toLowerCase().includes(q);
            const items = group.items.filter((i) =>
              i.title.toLowerCase().includes(q),
            );
            if (matches || items.length) return { ...group, items };
            return null;
          })
          .filter(Boolean) as typeof navMain)
      : (AdminNav.map((group: any) => {
          if (!search.trim()) return group;
          const q = search.toLowerCase();
          const matches = group.title.toLowerCase().includes(q);
          const items = group.items.filter((i: any) =>
            i.title.toLowerCase().includes(q),
          );
          if (matches || items.length) return { ...group, items };
          return null;
        }).filter(Boolean) as typeof AdminNav);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(sidebarRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    console.log("Sidebar width:", width);
  }, [width]);

  return (
    <Sidebar
      ref={sidebarRef}
      {...props}
      className="transition-colors duration-300 ease-in-out font-archivo"
    >
      <SidebarHeader>
        <span className="flex gap-1 items-center">
          <img src="/oodc.png" className="h-10 w-10" />
          <span className="text-xl font-bold">One Outsource</span>
        </span>
        <SearchForm
          search={search}
          setSearch={setSearch}
          placeholder="Search Module"
        />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {filteredNav.map((group) => {
          const isActive =
            activePath === group.url ||
            group.items.some((item) => item.url === activePath);
          const isOpen = openGroup === group.title;

          return (
            <Collapsible
              key={group.title}
              open={isOpen}
              className="group/collapsible"
            >
              <SidebarGroup className="px-2 py-1">
                {group.items.length === 0 ? (
                  <SidebarGroupLabel
                    asChild
                    className={`text-sm transition-colors duration-300 cursor-pointer ${
                      isActive
                        ? "bg-blue-700 text-white hover:bg-blue-600"
                        : " hover:bg-blue-600 hover:text-white text-gray-700"
                    }`}
                  >
                    <Link to={group.url} onClick={() => setOpenGroup(null)}>
                      {group.title}
                    </Link>
                  </SidebarGroupLabel>
                ) : (
                  <SidebarGroupLabel
                    asChild
                    className={`text-sm transition-colors duration-300 cursor-pointer text-gray-700 `}
                  >
                    <CollapsibleTrigger
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenGroup(isOpen ? null : group.title);
                      }}
                      className="flex items-center w-full"
                    >
                      {group.title}
                      <ChevronRight
                        className={`ml-auto  ${isOpen ? "rotate-90" : ""}`}
                      />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                )}

                {group.items.length > 0 && isOpen && (
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              className={`pl-6 transition-colors duration-300 ease-in-out text-sm
  ${
    activePath === item.url
      ? "bg-blue-700 text-white hover:bg-blue-600 active:bg-blue-700 active:text-white hover:text-white"
      : "text-gray-700 hover:bg-blue-600 active:bg-blue-700 active:text-white hover:text-white"
  }`}
                            >
                              <Link to={item.url}>{item.title}</Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                )}
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
