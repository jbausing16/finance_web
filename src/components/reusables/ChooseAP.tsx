import { useEffect, useState } from "react";
import CustomDialog from "./CustomDialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import {
  useGetAPInvoicesQuery,
  useGetInvoicesQuery,
} from "@/store/api/AdministrationApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getStatus } from "../pages/sales/ARInvoice";

type invoices = {
  id: number;
  date: string;
  invoice: string;
  vendor: string;
  status: number;
  total: number;
};

interface Props {
  value: number;
  onChange: (val: number) => void;
}

function ChooseAP({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const [invoices, setInvoices] = useState<invoices[]>([]);

  const [currId, setCurrId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [inv, setInv] = useState("");

  const [search, setSearch] = useState("");

  const handlePreviousPage = () => {
    setPage(page - 1);
    setCurrentPage(page - 1);
  };
  const handleNextPage = () => {
    setPage(page + 1);
    setCurrentPage(page + 1);
  };

  const getInvoices = useGetAPInvoicesQuery({
    page: page,
    type: 0,
    date: 0,
    from: "",
    to: "",
    status: 0,
    search: search,
    mod: 2,
  });
  useEffect(() => {
    if (getInvoices.isSuccess && getInvoices.data) {
      setInvoices(getInvoices.data.results);
      setTotalPages(Math.ceil(getInvoices?.data?.count / 10));
      setCount(getInvoices.data.count);
    }
  }, [getInvoices.isSuccess, getInvoices.data]);

  return (
    <>
      <Input
        readOnly
        onClick={() => setOpen(true)}
        value={inv}
        className="w-full bg-gray-50"
      />

      {open && (
        <CustomDialog
          close={setOpen}
          title={``}
          width={`!w-[50vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 py-2 gap-4  pt-6">
            <Input
              type="text"
              placeholder="Search Invoice No."
              className={`w-full bg-gray-50`}
              onChange={(e) => {
                let value = e.target.value.replace(/,/g, "");

                if (!/^\d*$/.test(value)) return;
                setSearch(value);
              }}
              value={search}
            />

            <Table className="shadow-sm border">
              <TableHeader className="bg-gray-200 dark:bg-gray-800 rounded-b-sm select-none">
                <TableRow className="">
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3 ">
                    Date
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold py-3">
                    Invoice No
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                    Vendor
                  </TableHead>
                  <TableHead className="font-archivo text-center text-muted-foreground font-semibold cursor-pointer py-3">
                    Status
                  </TableHead>
                  <TableHead className="font-archivo text-right text-muted-foreground font-semibold py-3">
                    Total Amount
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="font-inter text-foreground">
                {invoices.map((item, idx) => (
                  <TableRow
                    className={`cursor-pointer ${
                      currId === item.id ? `bg-gray-100` : ``
                    }`}
                    onClick={() => {
                      setCurrId(item.id);
                      setInv(item.invoice);
                      setTimeout(() => {
                        onChange(item.id);
                        setOpen(false);
                      }, 150);
                    }}
                    key={idx}
                  >
                    <TableCell className="py-2 text-center ">
                      <span className="text-blue-800 underline cursor-pointer font-medium">
                        {item.date}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.invoice}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      {item.vendor}
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <span className={getStatus(item.status)?.style}>
                        {getStatus(item.status)?.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      {formatMoney(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center space-x-2 justify-end">
              <div className="text-sm text-muted-foreground">
                Showing {count === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, count)} of {count}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default ChooseAP;
