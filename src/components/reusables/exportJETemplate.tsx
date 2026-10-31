import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const indentName = (name: string, level: number, indent?: number) =>
  `${" ".repeat(indent ? indent : (level - 1) * 6)}${name}`;

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportJETemplate(customer: any[], coa: any[]) {
  const workbook = new ExcelJS.Workbook();

  const template = workbook.addWorksheet("Template");

  template.columns = [
    { header: "ID", key: "id", width: 12 },
    { header: "Code", key: "code", width: 14 },
    { header: "Name", key: "name", width: 25 },
    { header: "Debit", key: "debit", width: 18 },
    { header: "Credit", key: "credit", width: 18 },
    { header: "Customer ID", key: "cid", width: 18 },
    { header: "Customer", key: "customer", width: 18 },
    { header: "Remarks", key: "remarks", width: 25 },
  ];

  template.getRow(1).font = { bold: true };
  template.getCell("A1").note = "Account ID based on the `Account` sheet.";
  template.getCell("B1").note = "Automatic based on the Account ID inputted.";
  template.getCell("C1").note = "Automatic based on the Account ID inputted.";
  template.getCell("D1").note = "Input debit amount.";
  template.getCell("E1").note = "Input credit amount.";
  template.getCell("F1").note = "Customer ID based on the `Customer` sheet.";
  template.getCell("G1").note =
    "Automatic based on the id you inputted on Customer ID.";
  template.getCell("H1").note = "Input Remarks.";

  template.getCell("A1").value = {
    richText: [
      { text: "ID" },
      { text: " *", font: { color: { argb: "FFFF0000" } } },
    ],
  };

  template.getCell("F1").value = {
    richText: [
      { text: "Customer ID" },
      { text: " *", font: { color: { argb: "FFFF0000" } } },
    ],
  };

  template.getCell("D1").value = {
    richText: [
      { text: "Debit" },
      { text: " *", font: { color: { argb: "FFFF0000" } } },
    ],
  };

  template.getCell("E1").value = {
    richText: [
      { text: "Credit" },
      { text: " *", font: { color: { argb: "FFFF0000" } } },
    ],
  };

  for (let row = 2; row <= 1000; row++) {
    template.getCell(`B${row}`).value = {
      formula: `
      IF(A${row}<>"",
        IFERROR(TRIM(VLOOKUP(A${row}, Accounts!A:C, 2, FALSE)), ""),
          ""
      )
    `.replace(/\s+/g, " "),
    };
  }

  for (let row = 2; row <= 1000; row++) {
    template.getCell(`C${row}`).value = {
      formula: `
      IF(A${row}<>"",
        IFERROR(TRIM(VLOOKUP(A${row}, Accounts!A:C, 3, FALSE)), ""),
        ""
      )
    `.replace(/\s+/g, " "),
    };
  }

  for (let row = 2; row <= 1000; row++) {
    template.getCell(`G${row}`).value = {
      formula: `
      IF(F${row}<>"",
        IFERROR(TRIM(VLOOKUP(F${row}, Customer!A:C, 3, FALSE)), ""),
        ""
        )
    `.replace(/\s+/g, " "),
    };
  }

  const sheet = workbook.addWorksheet("Accounts");

  sheet.columns = [
    { header: "ID", key: "id", width: 12 },
    { header: "Code", key: "code", width: 14 },
    { header: "Account", key: "account", width: 70 },
  ];

  coa.map((item: any) => {
    const addRow = sheet.addRow([
      item.id,
      item.code,
      indentName(item.name, item.level),
    ]);

    if (parseInt(item.type) === 1) {
      addRow.getCell("account").font = { bold: true };
    }
  });

  const cust = workbook.addWorksheet("Customer");

  cust.columns = [
    { header: "ID", key: "id", width: 12 },
    { header: "Code", key: "code", width: 12 },
    { header: "Name", key: "name", width: 12 },
  ];

  customer.map((item: any) => {
    cust.addRow([item.id, item.code, item.name]);
  });

  await downloadWorkbook(workbook, "Journal_Entry_Template.xlsx");
}
