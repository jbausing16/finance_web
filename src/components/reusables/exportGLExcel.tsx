import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatDateNormal } from "@/lib/utils";

type Trans = {
  id: number;
  amt: number;
  credit: number;
  debit: number;
  date: string;
  memo: string;
  name: string;
  num: string;
  split: string;
  type: string;
};

type AccountNode = {
  id: number;
  name: string;
  level: number;
  type: number;
  start: string;
  trans: Trans[];
};

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportGLExcel(
  data: AccountNode[],
  company: String,
  from: String,
  to: String,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("General Ledger");

  sheet.columns = [
    { header: "Account", key: "acc", width: 9 },
    { header: "Type", key: "type", width: 20 },
    { header: "Date", key: "date", width: 15 },
    { header: "Num", key: "num", width: 10 },
    { header: "Name", key: "name", width: 25 },
    { header: "Memo", key: "memo", width: 30 },
    { header: "Split", key: "split", width: 15 },
    { header: "Debit", key: "debit", width: 15 },
    { header: "Credit", key: "credit", width: 15 },
    { header: "Balance", key: "balance", width: 15 },
  ];

  sheet.spliceRows(1, 0, [], [], [], []);

  sheet.getCell("A1").value = `${company}`;
  sheet.getCell("A2").value = "General Ledger";
  sheet.getCell("A3").value =
    `${formatDateNormal(String(from))} - ${formatDateNormal(String(to))}`;

  sheet.getCell("A1").font = { bold: true };
  sheet.getCell("A2").font = { bold: true };
  sheet.getCell("A3").font = { bold: true };

  sheet.getRow(5).font = { bold: true };

  data.map((item) => {
    const row = sheet.addRow([
      item.name,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      item.start === "0.00" ? 0 : parseFloat(item.start),
    ]);
    row.font = { bold: true };

    item?.trans?.map((trans) => {
      const dat = sheet.addRow([
        null,
        trans.type,
        trans.date,
        trans.num,
        trans.name,
        trans.memo,
        trans.split,
        trans.debit,
        trans.credit,
        Number(item.start) + Number(trans.debit - trans.credit),
      ]);
      dat.getCell(1).alignment = { indent: 1 };
    });

    const row1 = sheet.addRow([
      "Total " + item.name,
      null,
      null,
      null,
      null,
      null,
      null,
      item?.trans?.reduce((a, b) => (a += b.debit), 0),
      item?.trans?.reduce((a, b) => (a += b.credit), 0),
      Number(item.start) +
        Number(
          item?.trans?.reduce((a, b) => (a += b.debit), 0) -
            item?.trans?.reduce((a, b) => (a += b.credit), 0),
        ),
    ]);
    row1.font = { bold: true };
    row1.getCell("debit").border = { top: { style: "thin" } };
    row1.getCell("credit").border = { top: { style: "thin" } };
    row1.getCell("balance").border = { top: { style: "thin" } };

    sheet.addRow({});
  });

  const accountingFmt = '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  sheet.getColumn("debit").numFmt = accountingFmt;
  sheet.getColumn("credit").numFmt = accountingFmt;
  sheet.getColumn("balance").numFmt = accountingFmt;

  await downloadWorkbook(workbook, "General_Ledger.xlsx");
}
