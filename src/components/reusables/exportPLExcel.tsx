import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatDateM, formatDateNormal, generateMonths } from "@/lib/utils";

type AccountNode = {
  id: number;
  name: string;
  level: number;
  type: number;
  balance: number;
  monthly_balances?: number[];
  children: AccountNode[];
};

type Customer = {
  id: number;
  name: string;
  amount: number;
};

type AccountNodeCust = {
  id: number;
  name: string;
  level: number;
  type: number;
  cust: Customer[];
  children: AccountNodeCust[];
};

const indentName = (name: string, level: number, indent?: number) =>
  `${" ".repeat(indent ? indent : (level + 2) * 6)}${name}`;

function flattenNormal(
  nodes: AccountNode[],
  rows: {
    type?: number;
    level?: number;
    name: string;
    balance?: number;
    isSubtotal?: boolean;
  }[] = [],
  type?: number,
  indent?: number,
) {
  nodes.forEach((n) => {
    // Push the group or account row
    rows.push({
      type: n.type,
      level: n.level,
      name: indentName(n.name, n.level, indent),
      balance: type === 1 ? n.balance * -1 : (n.balance ?? 0),
    });

    let subtotal = 0;

    if (n.children?.length) {
      const startIndex = rows.length;

      flattenNormal(n.children, rows, type);

      // Sum balances of rows added by children, ignoring previous subtotals
      for (let i = startIndex; i < rows.length; i++) {
        if (!rows[i].isSubtotal) {
          subtotal += rows[i].balance ?? 0;
        }
      }

      // Add subtotal row ONLY for type === 1
      if (n.type === 1) {
        rows.push({
          type: 99, // arbitrary type for subtotal
          level: n.level,
          name: indentName(`Total ${n.name}`, n.level, indent),
          balance: subtotal,
          isSubtotal: true,
        });
      }
    }
  });

  return rows;
}

function flattenMonthly(
  nodes: AccountNode[],
  months: string[],
  rows: any[] = [],
  type?: number,
  indent?: number,
) {
  nodes.forEach((n) => {
    const row: any = {
      Account: indentName(n.name, n.level),
      type: n.type,
    };

    // console.log("Months: ", months);

    months.forEach((m, i) => {
      const value = n.monthly_balances?.[i] ?? 0;

      row[m] = n.type === 1 ? "" : type === 1 ? value * -1 : value;
    });

    rows.push(row);

    if (n.children?.length) {
      const startIndex = rows.length;
      flattenMonthly(n.children, months, rows, type);

      // Calculate subtotal for this node
      const subtotalRow: any = {
        Account: indentName(`Total ${n.name}`, n.level),
      };

      months.forEach((m, i) => {
        let subtotal = 0;
        for (let j = startIndex; j < rows.length; j++) {
          if (!rows[j].isSubtotal) {
            subtotal += rows[j][m] || 0;
          }
        }
        subtotalRow[m] = subtotal;
      });

      if (n.type === 1) {
        subtotalRow.isSubtotal = true;
        rows.push(subtotalRow);
      }
    }
  });

  return rows;
}

function flattenCust(
  nodes: any[],
  months: string[],
  rows: any[] = [],
  type?: number,
  indent?: number,
) {
  nodes.forEach((n) => {
    const row: any = {
      Account: indentName(n.name, n.level),
      type: n.type,
      isSubtotal: false,
    };

    n?.cust?.forEach((m: any) => {
      const value =
        n.cust?.find((a: any) => String(m.id) === String(a.id))?.amount ?? 0;

      row["c" + m.id] = type === 1 ? value * -1 : value;
    });

    rows.push(row);

    if (n.children?.length) {
      const startIndex = rows.length;

      flattenCust(n.children, months, rows, type);

      const subtotalRow: any = {
        Account: indentName(`Total ${n.name}`, n.level),
        isSubtotal: true,
      };

      n?.cust?.forEach((m: any) => {
        let subtotal = 0;
        const key = "c" + m.id;

        for (let j = startIndex; j < rows.length; j++) {
          if (!rows[j].isSubtotal) {
            subtotal += rows[j][key] || 0;
          }
        }

        subtotalRow[key] = subtotal;
      });

      if (n.type === 1) {
        rows.push(subtotalRow);
      }
    }
  });

  return rows;
}

function flattenCustomerTree(
  node: AccountNodeCust,
  rows: any[] = [],
  customers: Customer[] = [],
) {
  const indent = " ".repeat(node.level * 4);

  const row: any = { Account: `${indent}${node.name}` };
  customers.forEach((c) => {
    const amt = node.cust.find((cc) => cc.id === c.id)?.amount ?? 0;
    row[c.name] = node.type === 1 ? 0 : amt; // keep group 0 for now
  });
  rows.push(row);

  if (node.children?.length) {
    node.children.forEach((child) =>
      flattenCustomerTree(child, rows, customers),
    );

    // Subtotal row per group
    if (node.type === 1) {
      const subtotalRow: any = { Account: `${indent}Total ${node.name}` };
      customers.forEach((c) => {
        const sum = node.children.reduce(
          (s, child) => {
            const amt = child.cust.find((cc) => cc.id === c.id)?.amount ?? 0;
            return s + amt;
          },
          node.cust.find((cc) => cc.id === c.id)?.amount ?? 0,
        );
        subtotalRow[c.name] = sum;
      });
      subtotalRow.isSubtotal = true;
      rows.push(subtotalRow);
    }
  }

  return rows;
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportPLNormalExcel(
  income: AccountNode[],
  cogs: AccountNode[],
  expense: AccountNode[],
  other: AccountNode[],
  company: String,
  from: String,
  to: String,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Profit and Loss");

  sheet.columns = [
    // { header: "Level", key: "level", width: 18 },
    // { header: "Type", key: "type", width: 18 },
    { header: "", key: "account", width: 50 },
    { header: "Balance", key: "balance", width: 18 },
  ];

  sheet.spliceRows(1, 0, [], [], [], []);

  sheet.getCell("A1").value = `${company}`;
  sheet.getCell("A2").value = "Profit and Loss";
  sheet.getCell("A3").value =
    `${formatDateNormal(String(from))} - ${formatDateNormal(String(to))}`;

  sheet.getCell("A1").font = { bold: true };
  sheet.getCell("A2").font = { bold: true };
  sheet.getCell("A3").font = { bold: true };

  sheet.getCell("B5").value = "Balance";
  sheet.getCell("B5").font = { bold: true };

  const addSection = (title: string, rows: any[]) => {
    // sheet.addRow({ account: title }).font = { bold: true };
    rows.forEach((r) => {
      const row = sheet.addRow({
        account: r.name,
        balance: r.type === 1 ? `` : r.balance,
      });

      // Group headers
      if (r.type === 1) {
        row.getCell("account").font = { bold: true };
      }

      // Subtotals
      if (r.isSubtotal) {
        row.font = { bold: true };
        // row.getCell("account").alignment = { horizontal: "right" };
        row.getCell("balance").border = {
          top: { style: "thin" },
        };
      }
    });
    // sheet.addRow({});
  };

  const ordinaryIncome = sheet.addRow({
    account: "Ordinary Income/Expense",
    balance: "",
  });
  ordinaryIncome.font = { bold: true };
  ordinaryIncome.alignment = { indent: 2 };

  addSection("", flattenNormal(income, [], 1));
  sheet.addRow({});
  addSection("", flattenNormal(cogs, [], 0));
  sheet.addRow({});

  const sumBalance = (rows: any[]) =>
    rows
      .filter((a, b) => a.type === 2)
      .reduce((sum, r) => sum + (r.balance ?? 0), 0);

  const GrossProfit =
    sumBalance(flattenNormal(income, [], 1)) -
    sumBalance(flattenNormal(cogs, [], 0));

  const grossProfit = sheet.addRow({
    account: "Gross Profit",
    balance: GrossProfit,
  });
  grossProfit.font = { bold: true };
  grossProfit.alignment = { indent: 4 };
  grossProfit.getCell("balance").alignment = { horizontal: "right" };
  grossProfit.getCell("balance").border = { top: { style: "thin" } };

  sheet.addRow({});

  addSection("", flattenNormal(expense));
  sheet.addRow({});

  const netOrdinaryIncome = sheet.addRow({
    account: "Net Ordinary Income",
    balance: GrossProfit - sumBalance(flattenNormal(expense, [], 0)),
  });
  netOrdinaryIncome.font = { bold: true };
  netOrdinaryIncome.alignment = { indent: 2 };
  netOrdinaryIncome.getCell("balance").alignment = { horizontal: "right" };
  netOrdinaryIncome.getCell("balance").border = { top: { style: "thin" } };

  sheet.addRow({});
  addSection("", flattenNormal(other, [], 0, 6));

  const netIncome = sheet.addRow({
    account: "Net Income",
    balance:
      GrossProfit -
      sumBalance(flattenNormal(expense, [], 0)) -
      sumBalance(flattenNormal(other, [], 0)),
  });
  netIncome.font = { bold: true };
  netIncome.getCell("balance").alignment = { horizontal: "right" };
  netIncome.getCell("balance").border = { top: { style: "thin" } };

  sheet.getColumn("balance").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  await downloadWorkbook(workbook, "Profit_and_Loss.xlsx");
}

export async function exportPLMonthlyExcel(
  income: AccountNode[],
  cogs: AccountNode[],
  expense: AccountNode[],
  other: AccountNode[],
  company: String,
  fromD: string,
  toD: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Profit and Loss (Monthly)");

  const months = generateMonths(fromD, toD);

  sheet.columns = [
    { header: "Account", key: "account", width: 50 },
    ...months.map((m) => ({
      header: m,
      key: m,
      width: 15,
    })),
  ];
  sheet.spliceRows(1, 0, [], [], [], []);

  sheet.getRow(5).font = { bold: true };

  sheet.getCell("A1").value = `${company}`;
  sheet.getCell("A2").value = "Profit and Loss";
  sheet.getCell("A3").value =
    `${formatDateNormal(String(fromD))} - ${formatDateNormal(String(toD))}`;

  sheet.getCell("A1").font = { bold: true };
  sheet.getCell("A2").font = { bold: true };
  sheet.getCell("A3").font = { bold: true };

  const addSection = (title: string, nodes: AccountNode[], type?: number) => {
    // flatten nodes with monthly subtotals

    const flattened = flattenMonthly(nodes, months, [], type);

    flattened.forEach((r) => {
      const row = sheet.addRow({
        account: r.Account,
        ...r,
      });

      // Bold group headers (type === 1)
      if (r.type === 1) {
        row.getCell("account").font = { bold: true };
      }

      // Subtotal formatting
      if (r.isSubtotal) {
        row.font = { bold: true };
        // Add top border for all month columns
        months.forEach((m) => {
          row.getCell(m).border = {
            top: { style: "thin" },
          };
        });
      }
    });

    // Optional empty row after section
    sheet.addRow({});
  };

  const ordinaryIncome = sheet.addRow({
    account: "Ordinary Income/Expense",
    balance: "",
  });
  ordinaryIncome.font = { bold: true };
  ordinaryIncome.alignment = { indent: 2 };

  addSection("", income, 1);
  addSection("", cogs);

  const gProfit: any = { account: "Gross Profit" };
  months.forEach((m, i) => {
    // Sum all monthly balances for liabilities and equity
    const sum = (nodes: AccountNode[]): number => {
      let total = 0;
      const traverse = (n: AccountNode) => {
        if (n.monthly_balances?.[i] != null) total += n.monthly_balances[i];
        if (n.children?.length) n.children.forEach(traverse);
      };
      nodes.forEach(traverse);
      return total;
    };

    gProfit[m] = sum(income) * -1 - sum(cogs);
  });

  const grossProfit = sheet.addRow(gProfit);
  grossProfit.font = { bold: true };
  grossProfit.alignment = { indent: 2 };
  months.forEach((m) => {
    grossProfit.getCell(m).border = { top: { style: "thin" } };
    grossProfit.getCell(m).alignment = { horizontal: "right" };
  });

  sheet.addRow({});
  addSection("", expense);

  const noi: any = { account: "Net Ordinary Income" };
  months.forEach((m, i) => {
    // Sum all monthly balances for liabilities and equity
    const sum = (nodes: AccountNode[]): number => {
      let total = 0;
      const traverse = (n: AccountNode) => {
        if (n.monthly_balances?.[i] != null) total += n.monthly_balances[i];
        if (n.children?.length) n.children.forEach(traverse);
      };
      nodes.forEach(traverse);
      return total;
    };

    noi[m] = sum(income) * -1 - sum(cogs) - sum(expense);
  });

  const netOtherIncome = sheet.addRow(noi);
  netOtherIncome.font = { bold: true };
  netOtherIncome.alignment = { indent: 2 };
  months.forEach((m) => {
    netOtherIncome.getCell(m).border = { top: { style: "thin" } };
    netOtherIncome.getCell(m).alignment = { horizontal: "right" };
  });

  sheet.addRow({});
  addSection("", other);

  const ni: any = { account: "Net Income" };
  months.forEach((m, i) => {
    const sum = (nodes: AccountNode[]): number => {
      let total = 0;
      const traverse = (n: AccountNode) => {
        if (n.monthly_balances?.[i] != null) total += n.monthly_balances[i];
        if (n.children?.length) n.children.forEach(traverse);
      };
      nodes.forEach(traverse);
      return total;
    };

    ni[m] = sum(income) * -1 - sum(cogs) - sum(expense) - sum(other);
  });

  const netIncome = sheet.addRow(ni);
  netIncome.font = { bold: true };
  netIncome.alignment = { indent: 0 };
  months.forEach((m) => {
    netIncome.getCell(m).border = { top: { style: "thin" } };
    netIncome.getCell(m).alignment = { horizontal: "right" };
  });

  months.forEach((m) => {
    sheet.getColumn(m).numFmt =
      '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';
  });

  await downloadWorkbook(workbook, "Profit_and_Loss_Monthly.xlsx");
}

export async function exportPLCustomerExcel(
  income: any[],
  cogs: any[],
  expense: any[],
  other: any[],
  company: String,
  fromD: string,
  toD: string,
  entityLabel: "Customer" | "Vendor" = "Customer",
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Profit and Loss (${entityLabel})`);

  const months = generateMonths(fromD, toD);
  const customers = income?.[0]?.cust || [];

  const sumSection = (rows: any[], custId: number): number => {
    const key = "c" + custId;
    return rows.reduce((total, r) => {
      if (!r.isSubtotal && typeof r[key] === "number") {
        total += r[key];
      }
      return total;
    }, 0);
  };

  const negateSection = (rows: any[]) =>
    rows.map((r) => {
      const copy: any = { ...r };
      customers.forEach((c: any) => {
        const key = "c" + c.id;
        if (typeof copy[key] === "number") {
          copy[key] = -copy[key];
        }
      });
      return copy;
    });

  const buildTotalRow = (label: string, sections: any[][], indent = 2) => {
    const row: any = { account: label };

    customers.forEach((c: any) => {
      row["c" + c.id] = sections.reduce(
        (sum, section) => sum + sumSection(section, c.id),
        0,
      );
    });

    const excelRow = sheet.addRow(row);
    excelRow.font = { bold: true };
    excelRow.alignment = { indent };

    customers.forEach((c: any) => {
      excelRow.getCell("c" + c.id).border = {
        top: { style: "thin" },
      };
      excelRow.getCell("c" + c.id).alignment = {
        horizontal: "right",
      };
    });
  };

  sheet.columns = [
    { header: "Account", key: "account", width: 50 },
    ...customers.map((c: any) => ({
      header: c.name,
      key: "c" + c.id,
      width: 15,
    })),
  ];

  sheet.spliceRows(1, 0, [], [], [], []);

  sheet.getCell("A1").value = `${company}`;
  sheet.getCell("A2").value = "Profit and Loss";
  sheet.getCell("A3").value =
    `${formatDateNormal(String(fromD))} - ${formatDateNormal(String(toD))}`;

  sheet.getCell("A1").font = { bold: true };
  sheet.getCell("A2").font = { bold: true };
  sheet.getCell("A3").font = { bold: true };
  sheet.getRow(5).font = { bold: true };

  const addSection = (nodes: AccountNode[], type?: number) => {
    const flattened = flattenCust(nodes, months, [], type);

    flattened.forEach((r) => {
      const row = sheet.addRow({
        account: r.Account,
        ...r,
      });

      if (r.type === 1) {
        row.getCell("account").font = { bold: true };
      }

      if (r.isSubtotal) {
        row.font = { bold: true };
        customers.forEach((c: any) => {
          row.getCell("c" + c.id).border = {
            top: { style: "thin" },
          };
        });
      }
    });

    sheet.addRow({});
    return flattened;
  };

  const ordinaryIncome = sheet.addRow({
    account: "Ordinary Income/Expense",
  });
  ordinaryIncome.font = { bold: true };
  ordinaryIncome.alignment = { indent: 2 };

  const incomeRows = addSection(income, 1);
  const cogsRows = addSection(cogs);

  buildTotalRow("Gross Profit", [incomeRows, negateSection(cogsRows)], 2);

  const expenseRows = addSection(expense);

  buildTotalRow(
    "Net Ordinary Income",
    [incomeRows, negateSection(cogsRows), negateSection(expenseRows)],
    2,
  );

  const otherRows = addSection(other);

  buildTotalRow(
    "Net Income",
    [
      incomeRows,
      negateSection(cogsRows),
      negateSection(expenseRows),
      negateSection(otherRows),
    ],
    0,
  );

  customers.forEach((c: any) => {
    sheet.getColumn("c" + c.id).numFmt =
      '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';
  });

  await downloadWorkbook(workbook, `Profit_and_Loss_${entityLabel}.xlsx`);
}

export async function exportPLVendorExcel(
  income: any[],
  cogs: any[],
  expense: any[],
  other: any[],
  company: String,
  fromD: string,
  toD: string,
) {
  await exportPLCustomerExcel(
    income,
    cogs,
    expense,
    other,
    company,
    fromD,
    toD,
    "Vendor",
  );
}
