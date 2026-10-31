import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}

export async function exportJournalReport(data: any[], client: string) {
  console.log("Data: ", data);
  const workbook = new ExcelJS.Workbook();

  const template = workbook.addWorksheet("Template");

  template.columns = [
    { header: "Txn No.", key: "txn", width: 15 },
    { header: "Type", key: "type", width: 20 },
    { header: "Date", key: "date", width: 18 },
    { header: "Ref No.", key: "ref", width: 13 },
    { header: "Name", key: "name", width: 20 },
    { header: "Memo", key: "memo", width: 25 },
    { header: "Account", key: "acct", width: 23 },
    { header: "Debit", key: "debit", width: 15 },
    { header: "Credit", key: "credit", width: 15 },
  ];

  template.spliceRows(1, 0, [], [], []);

  const headerRow = template.getRow(4);
  headerRow.font = { bold: true };

  headerRow.eachCell((cell) => {
    // cell.border = {
    //   top: { style: "thin" },
    //   left: { style: "thin" },
    //   bottom: { style: "thin" },
    //   right: { style: "thin" },
    // };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  template.getRow(1).font = { bold: true };

  let currentRow = 5;

  let currentTxn = data.length ? data[0].no : null;
  let debitTotal = 0;
  let creditTotal = 0;

  data.forEach((item) => {
    if (currentTxn !== null && item.no !== currentTxn) {
      const totalRow = template.getRow(currentRow);

      totalRow.getCell(8).value = debitTotal;
      totalRow.getCell(9).value = creditTotal;

      totalRow.getCell(8).border = {
        top: { style: "thin" },
      };
      totalRow.getCell(9).border = {
        top: { style: "thin" },
      };

      totalRow.font = { bold: true };

      totalRow.getCell(7).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      totalRow.getCell(8).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      totalRow.getCell(9).alignment = {
        horizontal: "right",
        vertical: "middle",
      };

      currentRow++;
      currentRow++;

      currentTxn = item.no;
      debitTotal = 0;
      creditTotal = 0;
    }

    const row = template.getRow(currentRow);

    const debit = parseFloat(item.debit) || 0;
    const credit = parseFloat(item.credit) || 0;

    const isSameTxn = item.no === currentTxn;

    row.values = [
      isSameTxn && debitTotal > 0 ? "" : item.no,
      isSameTxn && debitTotal > 0 ? "" : item.type,
      isSameTxn && debitTotal > 0 ? "" : item.post_date,
      isSameTxn && debitTotal > 0 ? "" : item.origin,
      item.bp,
      item.remarks,
      item.account,
      debit,
      credit,
    ];

    for (let col = 1; col <= 9; col++) {
      if ([1, 3, 4, 6].includes(col)) {
        row.getCell(col).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      } else if ([2, 5, 7].includes(col)) {
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

    debitTotal += debit;
    creditTotal += credit;

    currentRow++;
  });

  template.getColumn("debit").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';
  template.getColumn("credit").numFmt =
    '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)';

  template.getCell("A1").value = `${client}`;
  template.getCell("A2").value = `Business Partner - Masterdata`;

  template.getCell("A1").font = { bold: true };
  template.getCell("A2").font = { bold: true };

  await downloadWorkbook(workbook, "Journal Report.xlsx");
}
