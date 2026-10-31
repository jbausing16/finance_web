import { Printer } from "lucide-react";
import CustomDialog from "./CustomDialog";
import { useEffect, useRef, useState } from "react";
import { useGetPrintAPQuery, useGetPrintARQuery } from "@/store/api/ReportsApi";
import {
  formatDateFull,
  formatDateM,
  formatMoney,
  numberToWords,
} from "@/lib/utils";

interface PrintAPInvoiceProps {
  id: number;
  status?: number;
}

function PrintAPInvoice({ id, status }: PrintAPInvoiceProps) {
  const apiDomain = import.meta.env.VITE_API_BASE;
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // console.log("Data here: ", id);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body { margin: 0; font-family: sans-serif; }
              div { margin: 0; padding: 0; }
              @media print {
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
        newWindow.document.close();

        // Wait for images to load before printing
        const imgs = newWindow.document.images;
        let loadedCount = 0;
        if (imgs.length === 0) {
          newWindow.focus();
          newWindow.print();
          newWindow.close();
        } else {
          for (let i = 0; i < imgs.length; i++) {
            imgs[i].onload = imgs[i].onerror = () => {
              loadedCount++;
              if (loadedCount === imgs.length) {
                newWindow.focus();
                newWindow.print();
                newWindow.close();
              }
            };
          }
        }
      }
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const getPrint = useGetPrintAPQuery(id);
  const printAP = getPrint?.data?.data;

  return (
    <div>
      <Printer
        size={18}
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      />
      {open && (
        <CustomDialog
          close={setOpen}
          title={``}
          width={`!w-[55vw]`}
          height={`!h-[90vh]`}
          closeIcon={`Y`}
          button=""
        >
          <div ref={printRef}>
            <div>
              <button
                onClick={handlePrint}
                className="no-print bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
              >
                Print
              </button>
            </div>
            <div style={{ position: "relative" }}>
              {(status === 5 || status === 6) && (
                <div style={{ position: "absolute" }}>
                  <span
                    style={{
                      position: "absolute",
                      top: "400px",
                      left: "350px",
                      transform: "translate(-50%, -50%) rotate(-30deg)",
                      fontSize: "80px",
                      fontWeight: "bold",
                      opacity: 0.12,
                      border: "8px solid #000",
                      borderRadius: "25px",
                      padding: "20px 40px",
                      zIndex: 50,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status === 5 ? `FOR VERIFICATION` : `FOR APPROVAL`}
                  </span>
                </div>
              )}

              <table width="100%" border={0} role="presentation">
                <tr>
                  <td style={{ width: "50%" }}>
                    <img
                      src={apiDomain + printAP.cicon}
                      height={100}
                      className="h-14"
                    />
                    <br />
                    <span
                      style={{
                        fontWeight: "bold",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "20px",
                      }}
                    >
                      {printAP?.cname}
                    </span>
                    <br />
                    <span
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "20px",
                      }}
                    >
                      TIN: {printAP?.ctin}
                    </span>
                    <br />
                    <span
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "20px",
                      }}
                    >
                      {printAP?.cadd}
                    </span>
                    <br />
                    <span
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "20px",
                      }}
                    >
                      {printAP?.cadd1}
                    </span>
                    <br />
                  </td>
                  <td
                    style={{
                      width: "50%",
                      textAlign: "right",
                    }}
                    valign="top"
                  >
                    <br />
                    <br />
                    <span style={{ fontSize: "20px" }}>
                      Invoice #{printAP?.inv_num}
                    </span>
                    <br />
                    <br />
                    <span style={{ fontSize: "20px" }}>
                      Date: {formatDateFull(printAP?.inv_date)}
                    </span>
                    <br />
                    <br />
                  </td>
                </tr>
              </table>

              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "60px" }}
              >
                <tr>
                  <td
                    style={{
                      width: "70%",
                      textAlign: "left",
                      paddingLeft: "80px",
                      fontWeight: "bold",
                    }}
                  >
                    {printAP?.bname}
                  </td>
                  <td style={{ width: "30%", textAlign: "center" }}>
                    **PHP {formatMoney(printAP?.inv_total)}
                  </td>
                </tr>
              </table>

              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "10px" }}
              >
                <tr>
                  <td
                    style={{
                      width: "100%",
                      textAlign: "left",
                      paddingLeft: "20px",
                    }}
                  >
                    {numberToWords(printAP?.inv_total)}
                  </td>
                </tr>
              </table>

              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "10px" }}
              >
                <tr>
                  <td
                    style={{
                      width: "100%",
                      textAlign: "left",
                      paddingLeft: "20px",
                    }}
                  >
                    {printAP?.inv_remarks}
                  </td>
                </tr>
              </table>

              {/* Line Items */}
              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "40px", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #000" }}>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Account
                    </th>
                    <th style={{ textAlign: "center", padding: "8px" }}>
                      Memo
                    </th>
                    <th style={{ textAlign: "right", padding: "8px" }}>
                      Debit
                    </th>
                    <th style={{ textAlign: "right", padding: "8px" }}>
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {printAP?.rows?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: "8px" }}>{item.account}</td>
                      <td style={{ textAlign: "center", padding: "8px" }}>
                        {item.memo}
                      </td>
                      <td style={{ textAlign: "right", padding: "8px" }}>
                        {item.debit === 0 ? `-` : formatMoney(item.debit)}
                      </td>
                      <td style={{ textAlign: "right", padding: "8px" }}>
                        {item.credit === 0 ? `-` : formatMoney(item.credit)}
                      </td>
                    </tr>
                  ))}

                  <tr style={{ borderTop: "1px solid #000" }}>
                    <td style={{ textAlign: "left", padding: "8px" }}></td>
                    <td style={{ textAlign: "center", padding: "8px" }}></td>
                    <td style={{ textAlign: "right", padding: "8px" }}>
                      {formatMoney(
                        printAP?.rows?.reduce(
                          (a: any, b: any) => a + b.debit,
                          0,
                        ),
                      )}
                    </td>
                    <td style={{ textAlign: "right", padding: "8px" }}>
                      {formatMoney(
                        printAP?.rows?.reduce(
                          (a: any, b: any) => a + b.credit,
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatories */}
              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "60px" }}
              >
                <tr>
                  <td style={{ width: "33%", textAlign: "center" }}>
                    Prepared by:
                    <br />
                    <br />
                    <strong>
                      {printAP?.inv_prep === "" ? `\u00A0` : printAP?.inv_prep}
                    </strong>
                    <br />
                    {printAP?.inv_prep1 === "" ? `\u00A0` : printAP?.inv_prep1}
                  </td>
                  <td style={{ width: "33%", textAlign: "center" }}>
                    Verified by:
                    <br />
                    <br />
                    <strong>
                      {printAP?.inv_ver === "" ? `\u00A0` : printAP?.inv_ver}
                    </strong>
                    <br />
                    {printAP?.inv_ver1 === "" ? `\u00A0` : printAP?.inv_ver1}
                  </td>
                  <td style={{ width: "34%", textAlign: "center" }}>
                    Approved by:
                    <br />
                    <br />
                    <strong>
                      {printAP?.inv_app === "" ? `\u00A0` : printAP?.inv_app}
                    </strong>
                    <br />
                    {printAP?.inv_app1 === "" ? `\u00A0` : printAP?.inv_app1}
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </CustomDialog>
      )}
    </div>
  );
}

export default PrintAPInvoice;
