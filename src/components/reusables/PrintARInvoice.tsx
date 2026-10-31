import { Printer } from "lucide-react";
import CustomDialog from "./CustomDialog";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetPrintARQuery } from "@/store/api/ReportsApi";
import { formatMoney } from "@/lib/utils";

interface PrintARInvoiceProps {
  id: number;
  status?: number;
}

function PrintARInvoice({ id, status }: PrintARInvoiceProps) {
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

  const getPrint = useGetPrintARQuery(id);
  const printAR = getPrint?.data?.data;

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
                      src={apiDomain + printAR.cicon}
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
                      {printAR?.cname}
                    </span>
                    <br />
                    <span
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "20px",
                      }}
                    >
                      TIN: {printAR?.ctin}
                    </span>
                    <br />
                    <span
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "20px",
                      }}
                    >
                      {printAR?.cadd}
                    </span>
                    <br />
                    <span
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "20px",
                      }}
                    >
                      {printAR?.cadd1}
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
                    <span style={{ fontSize: "40px" }}>Invoice</span>
                    <br />
                    <span style={{ fontSize: "20px" }}>{printAR?.inv_num}</span>
                    <br />
                    <br />
                    <span style={{ fontSize: "20px" }}>Balance Due</span>
                    <br />
                    <br />
                    <span style={{ fontSize: "20px" }}>
                      PHP {formatMoney(printAR?.inv_balance)}
                    </span>
                  </td>
                </tr>
              </table>

              {/* Bill To + Invoice Info */}
              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "20px" }}
              >
                <tr>
                  <td style={{ width: "60%" }} valign="top">
                    <strong>Bill To</strong>
                    <br />
                    <span style={{ fontWeight: "bold" }}>{printAR?.bname}</span>
                    <br />
                    <span>TIN: {printAR?.btin}</span>
                    <br />
                    <span> {printAR?.badd}</span>
                    <br />
                  </td>

                  <td style={{ width: "40%" }} valign="top">
                    <table width="100%" border={0} role="presentation">
                      <tr>
                        <td>Invoice Date:</td>
                        <td style={{ textAlign: "right" }}>
                          {printAR?.inv_date}
                        </td>
                      </tr>
                      <tr>
                        <td>Terms:</td>
                        <td style={{ textAlign: "right" }}>
                          {printAR?.inv_terms} Days
                        </td>
                      </tr>
                      <tr>
                        <td>Due Date:</td>
                        <td style={{ textAlign: "right" }}>
                          {printAR?.inv_due}
                        </td>
                      </tr>
                      <tr>
                        <td>P.O. No.:</td>
                        <td style={{ textAlign: "right" }}>
                          {printAR?.inv_po}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {/* Line Items */}
              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "20px", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #000" }}>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Description
                    </th>
                    <th style={{ textAlign: "right", padding: "8px" }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "8px" }}>Rate</th>
                    <th style={{ textAlign: "right", padding: "8px" }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {printAR?.rows?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: "8px" }}>{item.desc}</td>
                      <td style={{ textAlign: "right", padding: "8px" }}></td>
                      <td style={{ textAlign: "right", padding: "8px" }}>
                        {formatMoney(item.rate)}
                      </td>
                      <td style={{ textAlign: "right", padding: "8px" }}>
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "20px" }}
              >
                <tr>
                  <td style={{ width: "60%" }}></td>
                  <td style={{ width: "40%" }}>
                    <table width="100%" border={0} role="presentation">
                      <tr>
                        <td>Sub Total</td>
                        <td style={{ textAlign: "right" }}>
                          PHP {formatMoney(printAR?.inv_subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td>VAT (12.0%)</td>
                        <td style={{ textAlign: "right" }}>
                          PHP {formatMoney(printAR?.inv_vat)}
                        </td>
                      </tr>
                      <tr style={{ fontWeight: "bold" }}>
                        <td>Total</td>
                        <td style={{ textAlign: "right" }}>
                          PHP {formatMoney(printAR?.inv_total)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {/* Balance Due */}
              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "10px" }}
              >
                <tr>
                  <td style={{ width: "60%" }}></td>
                  <td
                    style={{
                      width: "40%",
                      background: "#eee",
                      fontWeight: "bold",
                    }}
                  >
                    <table width="100%">
                      <tr>
                        <td>Balance Due</td>
                        <td style={{ textAlign: "right" }}>
                          PHP {formatMoney(printAR?.inv_total)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {/* Signatories */}
              <table
                width="100%"
                border={0}
                role="presentation"
                style={{ marginTop: "40px" }}
              >
                <tr>
                  <td style={{ width: "50%" }}>
                    Prepared by:
                    <br />
                    <br />
                    <strong>
                      {printAR?.inv_prep === "" ? `\u00A0` : printAR?.inv_prep}
                    </strong>
                    <br />
                    {printAR?.inv_prep1 === "" ? `\u00A0` : printAR?.inv_prep1}
                  </td>
                  <td style={{ width: "50%" }}>
                    Checked by:
                    <br />
                    <br />
                    <strong>
                      {/* {printAR?.inv_ver === "" ? `\u00A0` : printAR?.inv_ver} */}
                      Maria Medrano
                    </strong>
                    <br />
                    {/* {printAR?.inv_ver1 === "" ? `\u00A0` : printAR?.inv_ver1} */}
                    Operations Head
                  </td>
                </tr>
              </table>

              {/* Footer / Bank Details */}
              <div style={{ marginTop: "30px", fontSize: "12px" }}>
                <strong>Terms & Conditions</strong>
                <br />
                Please remit payment to:
                <br />
                {printAR?.terms_client}
                <br />
                Bank Name: {printAR?.terms_bname}
                <br />
                Bank Account: {printAR?.terms_bacct}
                <br />
                Bank Account Number: {printAR?.terms_no}
                <br />
                Swift Code: {printAR?.terms_swift}
              </div>
            </div>
          </div>
        </CustomDialog>
      )}
    </div>
  );
}

export default PrintARInvoice;
