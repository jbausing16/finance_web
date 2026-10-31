import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportBusinessPartner(data: any[], client: string) {
  console.log("Data: ", data);
  const workbook = new ExcelJS.Workbook();

  const template = workbook.addWorksheet("Template");

  template.columns = [
    { header: "Type", key: "type", width: 15 },
    { header: "Code", key: "code", width: 15 },
    { header: "Name", key: "name", width: 18 },
    { header: "TIN", key: "tin", width: 18 },
    { header: "Vatable", key: "vat", width: 13 },
    { header: "Street", key: "street", width: 25 },
    { header: "Barangay", key: "brgy", width: 18 },
    { header: "Zip Code", key: "zip", width: 10 },
    { header: "Contact Person", key: "cperson", width: 18 },
    { header: "Contact Number", key: "cno", width: 18 },
    { header: "Contact Email", key: "cemail", width: 18 },
    { header: "Status", key: "status", width: 13 },
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
      horizontal: "center",
      vertical: "middle",
    };
  });

  template.getRow(1).font = { bold: true };

  data.forEach((item, index) => {
    const rowNumber = 5 + index;
    const row = template.getRow(rowNumber);

    row.values = [
      item.type === 1 ? "Customer" : "Vendor",
      item.code,
      item.name,
      item.tin,
      item.tax === 1 ? "Yes" : "No",
      item.street,
      item.bp_address.barangayName ?? "",
      item.zipcode,
      item.c_person,
      item.c_no,
      item.c_email,
      item.status === 1 ? "Active" : "Inactive",
    ];

    row.font = { bold: false };

    for (let col = 1; col <= 12; col++) {
      if ([1, 2, 4, 5, 8, 9, 10, 11, 12].includes(col)) {
        row.getCell(col).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      } else if ([3, 6].includes(col)) {
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

  template.getCell("A1").value = `${client}`;
  template.getCell("A2").value = `Business Partner - Masterdata`;

  template.getCell("A1").font = { bold: true };
  template.getCell("A2").font = { bold: true };

  await downloadWorkbook(workbook, "Business_Partner_Masterdata.xlsx");
}
