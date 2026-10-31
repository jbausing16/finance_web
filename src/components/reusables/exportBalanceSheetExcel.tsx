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

const indentName = (name: string, level: number) =>
  `${" ".repeat((level - 1) * 6)}${name}`;

/* ===========================
   FLATTEN TREE (NORMAL)
=========================== */
function flattenNormal(
  nodes: AccountNode[],
  rows: {
    type?: number;
    level?: number;
    name: string;
    balance?: number;
    isSubtotal?: boolean;
  }[] = [],
) {
  nodes.forEach((n) => {
    // Push the group or account row
    rows.push({
      type: n.type,
      level: n.level,
      name: indentName(n.name, n.level),
      balance: n.balance ?? 0,
    });

    let subtotal = 0;

    if (n.children?.length) {
      const startIndex = rows.length;

      flattenNormal(n.children, rows);

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
          name: indentName(`Total ${n.name}`, n.level),
          balance: subtotal,
          isSubtotal: true,
        });
      }
    }
  });

  return rows;
}

/* ===========================
   FLATTEN TREE (MONTHLY)
=========================== */
function flattenMonthly(
  nodes: AccountNode[],
  months: string[],
  rows: any[] = [],
) {
  nodes.forEach((n) => {
    const row: any = {
      Account: indentName(n.name, n.level),
      type: n.type,
    };

    months.forEach((m, i) => {
      row[m] = n.type === 1 ? "" : (n.monthly_balances?.[i] ?? 0);
    });

    rows.push(row);

    if (n.children?.length) {
      const startIndex = rows.length;
      flattenMonthly(n.children, months, rows);

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

/* ===========================
   EXCEL HELPERS
=========================== */
async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

/* ===========================
   EXPORT — NORMAL VIEW
=========================== */
export async function exportBalanceSheetNormalExcel(
  assets: AccountNode[],
  liabilities: AccountNode[],
  equity: AccountNode[],
  company: String,
  from: String,
  to: String,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Balance Sheet");

  sheet.columns = [
    // { header: "Level", key: "level", width: 18 },
    // { header: "Type", key: "type", width: 18 },
    { header: "", key: "account", width: 50 },
    { header: "Balance", key: "balance", width: 18 },
  ];

  sheet.spliceRows(1, 0, [], [], [], []);

  sheet.getCell("A1").value = `${company}`;
  sheet.getCell("A2").value = "Balance Sheet";
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
    sheet.addRow({});
  };

  addSection("", flattenNormal(assets));
  addSection("", flattenNormal(liabilities));
  addSection("", flattenNormal(equity));

  const sumBalance = (rows: any[]) =>
    rows
      .filter((a, b) => a.type === 2)
      .reduce((sum, r) => sum + (r.balance ?? 0), 0);

  const totalLiabilitiesEquity =
    sumBalance(flattenNormal(liabilities)) + sumBalance(flattenNormal(equity));

  // Add final row
  const totalRow = sheet.addRow({
    account: "Total Liabilities and Equity",
    balance: totalLiabilitiesEquity,
  });
  totalRow.font = { bold: true };
  totalRow.getCell("balance").border = { top: { style: "thin" } };

  sheet.getColumn("balance").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  await downloadWorkbook(workbook, "Balance_Sheet.xlsx");
}

/* ===========================
   EXPORT — MONTHLY VIEW
=========================== */
export async function exportBalanceSheetMonthlyExcel(
  assets: AccountNode[],
  liabilities: AccountNode[],
  equity: AccountNode[],
  company: string,
  fromD: string,
  toD: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Balance Sheet (Monthly)");

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
  sheet.getCell("A2").value = "Balance Sheet";
  sheet.getCell("A3").value =
    `${formatDateNormal(String(fromD))} - ${formatDateNormal(String(toD))}`;

  sheet.getCell("A1").font = { bold: true };
  sheet.getCell("A2").font = { bold: true };
  sheet.getCell("A3").font = { bold: true };

  const addSection = (title: string, nodes: AccountNode[]) => {
    // flatten nodes with monthly subtotals

    const flattened = flattenMonthly(nodes, months);

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

  addSection("", assets);
  addSection("", liabilities);
  addSection("", equity);

  // Add Total Liabilities & Equity per month
  const totalRowData: any = { account: "Total Liabilities and Equity" };
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

    totalRowData[m] = sum(liabilities) + sum(equity);
  });

  const totalRow = sheet.addRow(totalRowData);
  totalRow.font = { bold: true };
  months.forEach((m) => {
    totalRow.getCell(m).border = { top: { style: "thin" } };
  });

  months.forEach((m) => {
    sheet.getColumn(m).numFmt =
      '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';
  });

  await downloadWorkbook(workbook, "Balance_Sheet_Monthly.xlsx");
}
