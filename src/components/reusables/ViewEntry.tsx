import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/utils";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useGetInvoiceEntryQuery } from "@/store/api/AdministrationApi";
import { Loading } from "./Loading";

type ViewEntryProps = {
  id: number;
  origin: number;
  type?: number;
};

type entry = {
  id: number;
  account: string;
  code: string;
  name: string;
  debit: number;
  credit: number;
  bp: number;
  remarks: string;
  post_date: string;
};

type header = {
  id: number;
  no: string;
  origin: number;
  origin_no: string;
  remarks: string;
  post_date: string;
  due_date: string;
  doc_date: string;
  trans_no: string;
  total: string;
  status: number;
  client: number;
  rows: entry[];
};

function ViewEntry({ id, origin, type }: ViewEntryProps) {
  const [rows, setRows] = useState([
    {
      id: 1,
      code: "",
      name: "",
      debit: "",
      credit: "",
      customer: "",
      remarks: "",
    },
  ]);

  const [je, setJE] = useState<header>();

  const getEntry = useGetInvoiceEntryQuery({
    origin: origin,
    id: id,
    type: type ?? 1,
  });
  useEffect(() => {
    if (getEntry.isSuccess && getEntry.data) {
      setJE(getEntry.data.data);

      const rows = getEntry.data.data.rows;

      // Ensure at least 10 rows
      const minimumRows = 10;
      const filledRows = [...rows]; // Start with the rows from the API

      // If there are fewer than 10 rows, fill the remaining spots with empty rows
      while (filledRows.length < minimumRows) {
        filledRows.push({
          id: filledRows.length + 1, // Ensure unique id
          code: "",
          name: "",
          debit: "",
          credit: "",
          customer: "",
          remarks: "",
        });
      }
      setRows(filledRows);
    }
  }, [getEntry.isSuccess, getEntry.data]);

  return (
    <>
      {getEntry.isLoading ? (
        <Loading />
      ) : (
        <>
          <div>
            <span className="text-lg font-bold">Journal Entry</span>
          </div>
          <div className="grid grid-cols-1 gap-1 py-6 z-50 ">
            {/* <span>{id}</span> */}

            <div className="grid grid-cols-1 gap-1 pt-2">
              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">No</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={je?.no}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Posting Date</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="text"
                      value={je?.post_date}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3 ">
                  <div className=" border-b ">
                    <span className="text-sm">Origin</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={je?.origin}
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Due Date</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="date"
                      value={je?.due_date}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="grid grid-cols-3">
                  <div className=" border-b ">
                    <span className="text-sm">Origin No</span>
                  </div>
                  <div className="grid col-span-2">
                    <Input
                      noPadding
                      className="w-2/3"
                      type="text"
                      value={je?.origin_no}
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Document Date</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="date"
                      value={je?.doc_date}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 pb-4 items-start">
                <div className="grid grid-cols-3">
                  <div className=" border-b">
                    <span className="text-sm">Remarks</span>
                  </div>
                  <div className="grid col-span-2">
                    <Textarea
                      className="resize-none w-2/3 rounded-none p-1"
                      value={je?.remarks}
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div></div>
                  <div className=" border-b col-span-2">
                    <span className="text-sm">Transaction No</span>
                  </div>
                  <div className="grid col-span-2 justify-items-end">
                    <Input
                      noPadding
                      className="w-full"
                      type="text"
                      value={je?.trans_no}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto py-0 shadow">
              <table className="w-full">
                <thead className="bg-blue-300 sticky top-0 z-10">
                  <tr>
                    <th className="p-1 border">G/L Account</th>
                    <th className="p-1 border">G/L Name</th>
                    <th className="p-1 border">Debit</th>
                    <th className="p-1 border">Credit</th>
                    <th className="p-1 border">Customer</th>
                    <th className="p-1 border">Remarks</th>
                  </tr>
                </thead>
                <tbody className="">
                  {rows.map((item, index) => (
                    <tr key={index}>
                      <td className="p-1 border">
                        <input
                          className="w-full outline-none"
                          value={item.code}
                          readOnly
                        />
                      </td>
                      <td className="p-1 border">
                        <input
                          className="w-full outline-none"
                          value={item.name}
                          readOnly
                        />
                      </td>
                      <td className="p-1 border ">
                        <input
                          className="w-full outline-none text-right"
                          value={
                            Number(item.debit) === 0
                              ? ""
                              : formatMoney(Number(item.debit))
                          }
                          readOnly
                        />
                      </td>
                      <td className="p-1 border ">
                        <input
                          className="w-full outline-none text-right"
                          value={
                            Number(item.credit) === 0
                              ? ""
                              : formatMoney(Number(item.credit))
                          }
                          readOnly
                        />
                      </td>
                      <td className="p-1 border">
                        <input
                          className="w-full outline-none"
                          value={item.customer}
                          readOnly
                        />
                      </td>
                      <td className="p-1 border">
                        <input
                          className="w-full outline-none"
                          value={item.remarks}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                  {/* <tr>
                <td colSpan={6} className="">
                  <div className="py-2 flex justify-end w-full">
                    <Button
                      size={"sm"}
                      variant={"primary"}
                      // onClick={addRow}
                    >
                      Add Row
                    </Button>
                  </div>
                </td>
              </tr> */}

                  <tr className="sticky bottom-0 z-10 bg-white">
                    <td colSpan={2} className="p-1 border"></td>
                    <td className="p-1 border text-right">
                      {formatMoney(
                        Math.abs(
                          Number(
                            getEntry?.data?.data?.rows.reduce(
                              (a: number, b: any) => a + parseFloat(b?.debit),
                              0,
                            ),
                          ),
                        ),
                      )}
                    </td>
                    <td className="p-1 border text-right">
                      {formatMoney(
                        Math.abs(
                          Number(
                            getEntry?.data?.data?.rows.reduce(
                              (a: number, b: any) => a + parseFloat(b?.credit),
                              0,
                            ),
                          ),
                        ),
                      )}
                    </td>
                    <td colSpan={2} className="p-1 border"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ViewEntry;
