import CustomDialog from "@/components/reusables/CustomDialog";
import { exportARAgingAll } from "@/components/reusables/exportARAgingAll";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/utils";
import type { e } from "node_modules/framer-motion/dist/types.d-a9pt5qxk";
import type { Dispatch, SetStateAction } from "react";

interface ARAgingAllProps {
  setOpenAgingClient: Dispatch<SetStateAction<boolean>>;
  data: any[];
  setActiveClient: Dispatch<SetStateAction<number>>;
  setActiveClientN: Dispatch<SetStateAction<string>>;
  setOpenAgingInvoices: Dispatch<SetStateAction<boolean>>;
}

function ARAgingAll({
  setOpenAgingClient,
  data,
  setActiveClient,
  setActiveClientN,
  setOpenAgingInvoices,
}: ARAgingAllProps) {
  return (
    <CustomDialog
      close={setOpenAgingClient}
      title=""
      width="!w-[70vw]"
      height="!h-[80vh]"
      closeIcon="Y"
      button=""
      escape="N"
    >
      <div className="flex flex-col gap-4 ">
        <div className="flex justify-between items-center pr-8">
          <span className="font-medium text-xl">AR Aging</span>
          <span>
            <Button
              variant="second"
              size={"sm"}
              onClick={async () => {
                await exportARAgingAll(
                  data,
                  "One Outsource Direct Corporation",
                );
              }}
            >
              Export
            </Button>
          </span>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-200 hover:bg-gray-200">
                <TableHead className="w-[100px]">Client</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">1-30 (days)</TableHead>
                <TableHead className="text-right">31-60 (days)</TableHead>
                <TableHead className="text-right">61-90 (days)</TableHead>
                <TableHead className="text-right">91-120 (days)</TableHead>
                <TableHead className="text-right">121-150 (days)</TableHead>
                <TableHead className="text-right">150+ (days)</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((a: any, b: number) => (
                <TableRow key={b}>
                  <TableCell
                    className="font-medium underline cursor-pointer"
                    onClick={() => {
                      setActiveClient(a?.cid);
                      setActiveClientN(a?.cname);
                      setOpenAgingInvoices(true);
                    }}
                  >
                    {a?.cname}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.a0 === 0 ? `-` : formatMoney(a?.a0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.a1 === 0 ? `-` : formatMoney(a?.a1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.a2 === 0 ? `-` : formatMoney(a?.a2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.a3 === 0 ? `-` : formatMoney(a?.a3)}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.a4 === 0 ? `-` : formatMoney(a?.a4)}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.a5 === 0 ? `-` : formatMoney(a?.a5)}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.a6 === 0 ? `-` : formatMoney(a?.a6)}
                  </TableCell>
                  <TableCell className="text-right">
                    {a?.totalAmount === 0
                      ? `-`
                      : formatMoney(
                          a?.a0 + a?.a1 + a?.a2 + a?.a3 + a?.a4 + a?.a5 + a?.a6,
                        )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CustomDialog>
  );
}

export default ARAgingAll;
