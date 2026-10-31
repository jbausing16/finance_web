import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportARAgingAll(data: any[], company: string) {
  console.log("Data: ", data);
  const workbook = new ExcelJS.Workbook();

  const template = workbook.addWorksheet("Template");

  template.columns = [
    { header: "Client", key: "client", width: 30 },
    { header: "Current", key: "a0", width: 18 },
    { header: "1-30 (days)", key: "a1", width: 18 },
    { header: "31-60 (days)", key: "a2", width: 18 },
    { header: "61-90 (days)", key: "a3", width: 18 },
    { header: "91-120 (days)", key: "a4", width: 18 },
    { header: "121-150 (days)", key: "a5", width: 18 },
    { header: "150+ (days)", key: "a6", width: 18 },
    { header: "Total", key: "total", width: 22 },
  ];

  template.spliceRows(1, 0, [], [], []);

  const headerRow = template.getRow(4);
  headerRow.font = { bold: true };
  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

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
    const rowNumber = 5 + index;
    const row = template.getRow(rowNumber);

    row.values = [
      item.cname,
      item.a0,
      item.a1,
      item.a2,
      item.a3,
      item.a4,
      item.a5,
      item.a6,
      { formula: `SUM(B${rowNumber}:H${rowNumber})` },
    ];

    row.font = { bold: false };

    row.getCell(1).alignment = {
      horizontal: "left",
      vertical: "middle",
    };

    for (let col = 2; col <= 9; col++) {
      row.getCell(col).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    }
  });

  const totalRowNumber = template.rowCount + 1;

  const totalRow = template.addRow([
    "TOTAL",
    { formula: `SUM(B2:B${totalRowNumber - 1})` },
    { formula: `SUM(C2:C${totalRowNumber - 1})` },
    { formula: `SUM(D2:D${totalRowNumber - 1})` },
    { formula: `SUM(E2:E${totalRowNumber - 1})` },
    { formula: `SUM(F2:F${totalRowNumber - 1})` },
    { formula: `SUM(G2:G${totalRowNumber - 1})` },
    { formula: `SUM(H2:H${totalRowNumber - 1})` },
    { formula: `SUM(I2:I${totalRowNumber - 1})` },
  ]);

  totalRow.font = { bold: true };

  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
    };
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

  template.getColumn("a0").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getColumn("a1").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getColumn("a2").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getColumn("a3").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getColumn("a4").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getColumn("a5").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getColumn("a6").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getColumn("total").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getCell("A1").value = `${company}`;
  template.getCell("A2").value = "A/R Aging";

  template.getCell("A1").font = { bold: true };
  template.getCell("A2").font = { bold: true };

  //   const sheet = workbook.addWorksheet("Accounts");

  //   sheet.columns = [
  //     { header: "ID", key: "id", width: 12 },
  //     { header: "Code", key: "code", width: 14 },
  //     { header: "Account", key: "account", width: 70 },
  //   ];

  //   coa.map((item: any) => {
  //     const addRow = sheet.addRow([
  //       item.id,
  //       item.code,
  //       indentName(item.name, item.level),
  //     ]);

  //     if (parseInt(item.type) === 1) {
  //       addRow.getCell("account").font = { bold: true };
  //     }
  //   });

  await downloadWorkbook(workbook, "AR_Aging_All_Client.xlsx");
}
