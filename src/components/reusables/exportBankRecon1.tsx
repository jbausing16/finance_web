import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportBankRecon1(
  data: any[],
  client: string,
  bank: string,
) {
  console.log("Data: ", data);
  const workbook = new ExcelJS.Workbook();

  const template = workbook.addWorksheet("Template");

  template.columns = [
    { header: "Date", key: "date", width: 18 },
    { header: "Description", key: "desc", width: 30 },
    { header: "Check No.", key: "check", width: 18 },
    { header: "Amount", key: "amount", width: 18 },
  ];

  template.spliceRows(1, 0, [], [], [], []);

  const headerRow = template.getRow(5);
  headerRow.font = { bold: true };

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  template.getRow(1).font = { bold: true };

  data.forEach((item, index) => {
    const rowNumber = 6 + index;
    const row = template.getRow(rowNumber);

    row.values = [item.date, item.description, item.check_no, item.amount];

    row.font = { bold: false };

    for (let col = 1; col <= 9; col++) {
      if (col === 1 || col === 3) {
        row.getCell(col).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      } else if (col === 2) {
        row.getCell(col).alignment = {
          horizontal: "left",
          vertical: "middle",
        };
      } else {
        row.getCell(col).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      }
    }
  });

  for (let rowNumber = 1; rowNumber <= template.rowCount; rowNumber++) {
    const row = template.getRow(rowNumber);

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  template.getColumn("amount").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getCell("A1").value = `${client}`;
  template.getCell("A2").value =
    `Bank Reconciliation - Unreconciled Transactions`;

  template.getCell("A3").value = `${bank}`;

  template.getCell("A1").font = { bold: true };
  template.getCell("A2").font = { bold: true };
  template.getCell("A3").font = { bold: true };

  await downloadWorkbook(workbook, "Bank_Recon_Unreconciled.xlsx");
}
