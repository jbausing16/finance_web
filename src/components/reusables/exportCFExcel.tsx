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
export async function exportCFExcel(
  data: any,
  company: string,
  from: string,
  to: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Cash Flow");

  const now = new Date();

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  sheet.columns = [
    // { header: "Level", key: "level", width: 18 },
    // { header: "Type", key: "type", width: 18 },
    { header: "", key: "a1", width: 5 },
    { header: "", key: "a2", width: 5 },
    { header: "", key: "a3", width: 5 },
    { header: "", key: "a4", width: 5 },
    { header: "", key: "a5", width: 60 },
    { header: "", key: "a6", width: 15 },
  ];

  sheet.spliceRows(1, 0, [], [], [], []);

  sheet.getCell("A1").value = `${company}`;
  sheet.getCell("A2").value = "Statement of Cash Flows";
  sheet.getCell("A3").value =
    `${formatDateNormal(String(from))} - ${formatDateNormal(String(to))}`;

  sheet.getCell("F1").value = `${timeStr}`;
  sheet.getCell("F2").value = `${formattedDate}`;

  sheet.getCell("F1").font = {
    bold: true,
    size: 8,
    color: { argb: "FF000080" },
  };
  sheet.getCell("F2").font = {
    bold: true,
    size: 8,
    color: { argb: "FF000080" },
  };

  sheet.getCell("F1").alignment = { horizontal: "right" };
  sheet.getCell("F2").alignment = { horizontal: "right" };

  sheet.getCell("A1").font = {
    bold: true,
    size: 12,
    color: { argb: "FF000080" },
  };
  sheet.getCell("A2").font = {
    bold: true,
    size: 14,
    color: { argb: "FF000080" },
  };
  sheet.getCell("A3").font = {
    bold: true,
    size: 10,
    color: { argb: "FF000080" },
  };

  sheet.mergeCells("A1:E1");
  sheet.mergeCells("A2:E2");
  sheet.mergeCells("A3:E3");

  sheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  sheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  sheet.getCell("A3").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  sheet.getCell("C5").value = "OPERATING ACTIVITIES";
  sheet.getCell("C5").font = { bold: true };
  sheet.mergeCells("C5:E5");

  sheet.getCell("D6").value = "Net Income";
  sheet.getCell("D6").font = { bold: true };
  sheet.getCell("F6").value = data?.ni;
  sheet.getCell("F6").font = { bold: true };

  sheet.getCell("D7").value = "Adjustments to reconcile Net Income";
  sheet.getCell("D7").font = { bold: true };
  sheet.mergeCells("D7:E7");

  sheet.getCell("D8").value = "to net cash provided by operations:";
  sheet.getCell("D8").font = { bold: true };
  sheet.mergeCells("D8:E8");

  //Operating Activities
  data?.ca.map((item: any) => {
    sheet.addRow(["", "", "", "", item.name, item.balance]);
  });

  const ncpoa = sheet.addRow([
    "",
    "",
    "Net cash provided by Operating Activities",
    "",
    "",
    data?.ca.reduce((a: any, b: any) => (a += b.balance), 0),
  ]);
  ncpoa.font = { bold: true };
  ncpoa.getCell("a6").border = { top: { style: "thin" } };
  sheet.mergeCells(`C${ncpoa.number}:E${ncpoa.number}`);

  //Investing Activities
  const iactivities = sheet.addRow([
    "",
    "",
    "Investing Activities",
    "",
    "",
    "",
  ]);
  iactivities.font = { bold: true };
  iactivities.height = 30;
  iactivities.getCell("a6").border = { top: { style: "thin" } };
  sheet.mergeCells(`C${iactivities.number}:E${iactivities.number}`);

  data?.fa.map((item: any) => {
    sheet.addRow(["", "", "", "", item.name, item.balance]);
  });

  const ncpia = sheet.addRow([
    "",
    "",
    "Net cash provided by Investing Activities",
    "",
    "",
    data?.fa.reduce((a: any, b: any) => (a += b.balance), 0),
  ]);
  ncpia.font = { bold: true };
  ncpia.getCell("a6").border = { top: { style: "thin" } };
  sheet.mergeCells(`C${ncpia.number}:E${ncpia.number}`);

  const ncincrease = sheet.addRow([
    "",
    "Net cash increase for the period",
    "",
    "",
    "",
    data?.ca.reduce((a: any, b: any) => (a += b.balance), 0) +
      data?.fa.reduce((a: any, b: any) => (a += b.balance), 0),
  ]);
  ncincrease.height = 30;
  ncincrease.font = { bold: true };
  ncincrease.getCell("a6").border = { top: { style: "thin" } };
  sheet.mergeCells(`B${ncincrease.number}:E${ncincrease.number}`);

  const cbp = sheet.addRow([
    "",
    "Cash at beginning of period",
    "",
    "",
    "",
    data?.begin_cash,
  ]);
  cbp.height = 30;
  cbp.font = { bold: true };
  cbp.getCell("a6").border = { top: { style: "thin" } };
  sheet.mergeCells(`B${cbp.number}:E${cbp.number}`);

  const cep = sheet.addRow([
    "Cash at end of period",
    "",
    "",
    "",
    "",
    data?.ca.reduce((a: any, b: any) => (a += b.balance), 0) +
      data?.fa.reduce((a: any, b: any) => (a += b.balance), 0) +
      data?.begin_cash,
  ]);
  cep.height = 30;
  cep.font = { bold: true };
  cep.getCell("a6").border = { top: { style: "thin" } };
  sheet.mergeCells(`A${cep.number}:E${cep.number}`);

  sheet.getColumn("a6").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  await downloadWorkbook(workbook, "Cash_Flow.xlsx");
}

/* ===========================
   EXPORT — MONTHLY VIEW
=========================== */
export async function exportCFExcelMonthly(
  data: AccountNode[],
  company: string,
  fromD: string,
  toD: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Cash Flow");

  const months = generateMonths(fromD, toD);

  //   sheet.columns = [
  //     { header: "Account", key: "account", width: 50 },
  //     ...months.map((m) => ({
  //       header: m,
  //       key: m,
  //       width: 15,
  //     })),
  //   ];
  //   sheet.spliceRows(1, 0, [], [], [], []);

  //   sheet.getRow(5).font = { bold: true };

  //   sheet.getCell("A1").value = `${company}`;
  //   sheet.getCell("A2").value = "Cash Flow";
  //   sheet.getCell("A3").value =
  //     `${formatDateNormal(String(fromD))} - ${formatDateNormal(String(toD))}`;

  //   sheet.getCell("A1").font = { bold: true };
  //   sheet.getCell("A2").font = { bold: true };
  //   sheet.getCell("A3").font = { bold: true };

  //   const addSection = (title: string, nodes: AccountNode[]) => {
  //     // flatten nodes with monthly subtotals

  //     const flattened = flattenMonthly(nodes, months);

  //     flattened.forEach((r) => {
  //       const row = sheet.addRow({
  //         account: r.Account,
  //         ...r,
  //       });

  //       // Bold group headers (type === 1)
  //       if (r.type === 1) {
  //         row.getCell("account").font = { bold: true };
  //       }

  //       // Subtotal formatting
  //       if (r.isSubtotal) {
  //         row.font = { bold: true };
  //         // Add top border for all month columns
  //         months.forEach((m) => {
  //           row.getCell(m).border = {
  //             top: { style: "thin" },
  //           };
  //         });
  //       }
  //     });

  //     // Optional empty row after section
  //     sheet.addRow({});
  //   };

  //   addSection("", assets);
  //   addSection("", liabilities);
  //   addSection("", equity);

  //   // Add Total Liabilities & Equity per month
  //   const totalRowData: any = { account: "Total Liabilities and Equity" };
  //   months.forEach((m, i) => {
  //     // Sum all monthly balances for liabilities and equity
  //     const sum = (nodes: AccountNode[]): number => {
  //       let total = 0;
  //       const traverse = (n: AccountNode) => {
  //         if (n.monthly_balances?.[i] != null) total += n.monthly_balances[i];
  //         if (n.children?.length) n.children.forEach(traverse);
  //       };
  //       nodes.forEach(traverse);
  //       return total;
  //     };

  //     totalRowData[m] = sum(liabilities) + sum(equity);
  //   });

  //   const totalRow = sheet.addRow(totalRowData);
  //   totalRow.font = { bold: true };
  //   months.forEach((m) => {
  //     totalRow.getCell(m).border = { top: { style: "thin" } };
  //   });

  months.forEach((m) => {
    sheet.getColumn(m).numFmt =
      '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';
  });

  await downloadWorkbook(workbook, "Cash_Flow_Monthly.xlsx");
}
