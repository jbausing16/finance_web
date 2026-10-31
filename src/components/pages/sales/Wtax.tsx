import CustomDialog from "@/components/reusables/CustomDialog";
import { ArrowBigRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { wtax, wtaxRate } from "./ARInvoice";
import { formatMoney } from "@/lib/utils";
import { useGetWtaxRateQuery } from "@/store/api/AdministrationApi";

interface WtaxProps {
  wtax: wtax[];
  setWtax: React.Dispatch<React.SetStateAction<wtax[]>>;
  taxableAmt: number;
  wtaxOpt: wtaxRate[];
  type: number;
  //   setTotalWTax: React.Dispatch<React.SetStateAction<number>>;
}

function Wtax({ wtax, setWtax, taxableAmt, wtaxOpt, type }: WtaxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ArrowBigRight
        size={17}
        fill="yellow"
        color="black"
        strokeWidth={0.5}
        onClick={() => {
          //   setWtax((prev) => {
          //     const newWtax = [...prev];
          //     newWtax[0] = { ...newWtax[0], tax_amt: taxableAmt };
          //     return newWtax;
          //   });
          setOpen(true);
        }}
        className="cursor-pointer"
      />

      {open && (
        <CustomDialog
          close={setOpen}
          title={``}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 gap-1 py-6">
            <table className="w-full h-40">
              <thead>
                <tr className="border bg-blue-300 sticky top-0 z-10">
                  <td className="p-1 border">Name</td>
                  <td className="p-1 border">Rate</td>
                  <td className="p-1 border">Taxable Amount</td>
                  <td className="p-1 border">WTax Amount</td>
                </tr>
              </thead>
              <tbody className="">
                {wtax.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1 border">
                      <select
                        className="outline-none text-sm appearance-none w-full text-center"
                        onChange={(e) => {
                          if (e.target.value === "0") {
                            const newRows = [...wtax];
                            newRows[index].code = "0";
                            newRows[index].name = "";
                            newRows[index].tax_amt = 0;
                            newRows[index].wtax_amt = 0;
                            setWtax(newRows);
                          } else {
                            let tax = wtaxOpt.find(
                              (item1) => e.target.value === String(item1.id),
                            );
                            const newRows = [...wtax];
                            newRows[index].code = e.target.value;
                            newRows[index].name = tax?.type || "";
                            newRows[index].tax_amt = taxableAmt;
                            newRows[index].wtax_amt =
                              item.tax_amt * (tax?.rate || 0);
                            setWtax(newRows);
                          }
                        }}
                        value={item.code}
                        disabled={type === 2 || type === 3}
                      >
                        <option value={0}>&nbsp;</option>
                        {wtaxOpt.map((item1) => (
                          <option value={item1.id}>{item1.type}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1 border text-center">
                      {`${
                        item.code !== "0"
                          ? Number(
                              wtaxOpt.find(
                                (item1) => item.code === String(item1.id),
                              )?.rate,
                            ) *
                              100 +
                            `%`
                          : ``
                      }`}
                    </td>
                    <td className="p-1 border text-center">
                      <input
                        className="w-full outline-none text-right"
                        value={
                          parseFloat(item.code) !== 0
                            ? formatMoney(item.tax_amt)
                            : ``
                        }
                        onChange={(e) => {
                          let rate =
                            wtaxOpt.find(
                              (item1) => item.code === String(item1.id),
                            )?.rate || 0;
                          const newRows = [...wtax];
                          const value = parseFloat(e.target.value) || 0;
                          newRows[index].tax_amt = value;
                          newRows[index].wtax_amt = value * rate;
                          setWtax(newRows);
                        }}
                        readOnly={type === 2 || type === 3}
                      />
                    </td>

                    <td className="p-1 border text-center">
                      <input
                        className="w-full outline-none text-right"
                        value={
                          parseInt(item.code) !== 0
                            ? formatMoney(
                                item.tax_amt *
                                  (wtaxOpt.find(
                                    (item1) => item.code === String(item1.id),
                                  )?.rate || 0 / 100),
                              )
                            : ``
                        }
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default Wtax;
