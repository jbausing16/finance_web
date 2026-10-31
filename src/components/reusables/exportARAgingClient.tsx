import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportARAgingClient(data: any[], client: string) {
  console.log("Data: ", data);
  const workbook = new ExcelJS.Workbook();

  const template = workbook.addWorksheet("Template");

  template.columns = [
    { header: "Invoice No", key: "inv", width: 18 },
    { header: "Posting Date", key: "pdate", width: 18 },
    { header: "Receipt Date", key: "rdate", width: 18 },
    { header: "Remarks", key: "remarks", width: 30 },
    { header: "Aging (days)", key: "aging", width: 18 },
    { header: "Balance", key: "balance", width: 18 },
  ];

  template.spliceRows(1, 0, [], [], []);

  const headerRow = template.getRow(4);
  headerRow.font = { bold: true };

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    cell.alignment = {
      horizontal: cell.value === "Remarks" ? "left" : "center",
      vertical: "middle",
    };
  });

  template.getRow(1).font = { bold: true };

  data.forEach((item, index) => {
    const rowNumber = 5 + index;
    const row = template.getRow(rowNumber);

    row.values = [
      item.invoice_num,
      item.posting_date,
      item.receipt_date,
      item.remarks,
      item.days,
      item.balance,
    ];

    row.font = { bold: false };

    for (let col = 1; col <= 9; col++) {
      if (col === 1 || col === 2 || col === 3 || col === 5) {
        row.getCell(col).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      } else if (col === 4) {
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

  template.getColumn("balance").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getCell("A1").value = `Statement of Account`;
  template.getCell("A2").value = `${client}`;

  template.getCell("A1").font = { bold: true };
  template.getCell("A2").font = { bold: true };

  await downloadWorkbook(workbook, "AR_Aging_All_Client.xlsx");
}
