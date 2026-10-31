import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatDateNormal, generateMonths } from "@/lib/utils";

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportFPExcel(
  income: number[],
  cogs: number[],
  expense: number[],
  other: number[],
  assets: number[],
  liabilities: number[],
  equity: number[],
  company: string,
  from: string,
  to: string,
) {
  const monthBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  const addMonthBorders = (row: ExcelJS.Row) => {
    row.eachCell((cell, colNumber) => {
      if (colNumber === 1) return;
      cell.border = monthBorder;
    });
  };

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Financial Performance");

  const months = generateMonths(from, to);

  sheet.columns = [
    { header: "", key: "", width: 20 },
    ...months.map((m, i) => ({
      header: m,
      key: `m${i}`,
      width: 15,
    })),
  ];

  sheet.spliceRows(1, 0, [], [], [], []);

  sheet.getCell("A1").value = company;
  sheet.getCell("A2").value = "Financial Performance";
  sheet.getCell("A3").value =
    `${formatDateNormal(from)} - ${formatDateNormal(to)}`;

  sheet.getCell("A1").font = { bold: true };
  sheet.getCell("A2").font = { bold: true };
  sheet.getCell("A3").font = { bold: true };

  const headerRow = sheet.getRow(5);
  headerRow.font = { bold: true };
  headerRow.height = 22;

  headerRow.eachCell((cell, i) => {
    if (i === 1) return;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF000000" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  const spacer = () => {
    const r = sheet.addRow([]);
  };

  const revenue = sheet.addRow([
    "REVENUE",
    ...months.map((_, i) => -(income[i] ?? 0)),
  ]);
  addMonthBorders(revenue);
  spacer();

  const cos = sheet.addRow(["COS", ...months.map((_, i) => cogs[i] ?? 0)]);
  addMonthBorders(cos);
  spacer();

  const gp = sheet.addRow([
    "GROSS PROFIT",
    ...months.map((_, i) => -(income[i] ?? 0) - (cogs[i] ?? 0)),
  ]);
  addMonthBorders(gp);

  const gpm = sheet.addRow([
    "GPM",
    ...months.map((_, i) =>
      -(income[i] ?? 0) !== 0 && (cogs[i] ?? 0) !== 0
        ? Math.ceil(
            ((-(income[i] ?? 0) - (cogs[i] ?? 0)) / -(income[i] ?? 0)) * 100,
          ) + "%"
        : "-",
    ),
  ]);
  addMonthBorders(gpm);

  gpm.eachCell((cell, i) => {
    if (i === 1) return;
    cell.alignment = { horizontal: "right" };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF000000" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });
  spacer();

  const gae = sheet.addRow(["GAE", ...months.map((_, i) => expense[i] ?? 0)]);
  addMonthBorders(gae);
  spacer();

  const ebit = sheet.addRow([
    "EBIT",
    ...months.map(
      (_, i) => -(income[i] ?? 0) - (cogs[i] ?? 0) - (expense[i] ?? 0),
    ),
  ]);
  addMonthBorders(ebit);
  spacer();

  const otherExp = sheet.addRow([
    "OTHER EXP",
    ...months.map((_, i) => other[i] ?? 0),
  ]);
  addMonthBorders(otherExp);
  spacer();

  const ni = sheet.addRow([
    "NET INCOME",
    ...months.map(
      (_, i) =>
        -(income[i] ?? 0) -
        (cogs[i] ?? 0) -
        (expense[i] ?? 0) -
        (other[i] ?? 0),
    ),
  ]);
  addMonthBorders(ni);
  spacer();
  spacer();

  const ar_month = sheet.addRow(["", ...months.map((m, i) => m)]);

  ar_month.eachCell((cell, i) => {
    if (i === 1) return;
    cell.alignment = { horizontal: "right" };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF000000" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });
  spacer();

  const assets1 = sheet.addRow([
    "ASSETS",
    ...months.map((_, i) => assets[i] ?? 0),
  ]);
  addMonthBorders(assets1);
  spacer();

  const liab = sheet.addRow([
    "LIABILITIES",
    ...months.map((_, i) => liabilities[i] ?? 0),
  ]);
  addMonthBorders(liab);
  spacer();

  const equi = sheet.addRow([
    "EQUITY",
    ...months.map((_, i) => equity[i] ?? 0),
  ]);
  addMonthBorders(equi);
  spacer();

  const accountingFmt = '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  for (let col = 2; col <= months.length + 1; col++) {
    sheet.getColumn(col).numFmt = accountingFmt;
  }

  sheet.getColumn(1).font = { bold: true };

  await downloadWorkbook(workbook, "Financial_Performance.xlsx");
}
