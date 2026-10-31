import React, { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../reusables/sidebar/app-sidebar";
import { Separator } from "../ui/separator";
import Header from "../reusables/Header";
import { Button } from "../ui/button";
import { SquareArrowLeft, SquareArrowRight } from "lucide-react";
import Dash1 from "./dashboard/Dash1";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { hasAccess } from "@/lib/utils";
import Empty from "../reusables/Empty";
import { Loading } from "../reusables/Loading";

const formatDate1 = (dateString: Date) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

type Years = {
  id: number;
  value: number;
};

function formatDate(date: any) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

function Dashboard() {
  const [view, setView] = useState(1);
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();

  const [years, setYears] = useState<Years[]>([]);
  const [yearsVal, setYearsVal] = useState(String(currentYear));

  const dateNow1 = new Date();
  const [fromDate, setFromDate] = useState(
    formatDate1(new Date(dateNow1.getFullYear(), 0, 1)),
  );
  const [toDate, setToDate] = useState(
    formatDate1(new Date(dateNow1.getFullYear(), 11, 31)),
  );

  const clearFilters = () => {
    setFromDate(formatDate1(new Date(dateNow1.getFullYear(), 0, 1)));
    setToDate(formatDate1(new Date(dateNow1.getFullYear(), 11, 31)));
    setYearsVal(String(currentYear));
  };

  const dateNow = formatDate(new Date());
  useEffect(() => {
    if (dateNow) {
      let arr = [];
      let arra = currentYear;
      for (let i = 0; i <= 5; i++) {
        arr.push({
          id: i,
          value: arra - i,
        });
        setYears(arr);
      }
    }
    console.log("Years", years);
  }, [dateNow]);

  const access = useSelector((state: RootState) => state.auth.access);
  if (!access || access.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header title="Dashboard" />
          {!hasAccess(access, "1", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* <iframe
              src="https://oodc-ems.oneapp.ph/"
              width="100%"
              height="100%"
              title="Example iframe"
            ></iframe> */}
              <div className="flex justify-between gap-2">
                <div className="flex gap-2">
                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">Report Period</Label>

                    <Select
                      //   onValueChange={(e) => setFiltDate(parseInt(e))}
                      name="yearsVal"
                      value={yearsVal}
                      onValueChange={(e) => {
                        if (e === "") {
                          setFromDate("");
                          setToDate("");
                        } else {
                          setFromDate(formatDate1(new Date(Number(e), 0, 1)));
                          setToDate(formatDate1(new Date(Number(e), 11, 31)));
                          setYearsVal(e);
                        }
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="---" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((item) => (
                          <SelectItem key={item.id} value={String(item.value)}>
                            {item.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">From</Label>
                    <Input
                      type="date"
                      placeholder="From"
                      className={`w-full`}
                      name="fromDate"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="grid w-full items-center gap-2">
                    <Label className=" gap-0">To</Label>
                    <Input
                      type="date"
                      placeholder="To"
                      className={`w-full`}
                      name="toDate"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-control w-full">
                      <div className="label"> &nbsp;</div>
                      <Button variant="second" onClick={clearFilters}>
                        Clear
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* <div>
                  <div className="label"> &nbsp;</div>
                  <Button
                    variant={"primary"}
                    size={"sm"}
                    className="px-4"
                    onClick={() => setView(view - 1)}
                    disabled={view === 1}
                  >
                    <SquareArrowLeft className="!w-5 !h-5" /> Previous
                  </Button>
                </div>
                <div>
                  <div className="label"> &nbsp;</div>
                  <Button
                    variant={"primary"}
                    size={"sm"}
                    className="px-4"
                    onClick={() => setView(view + 1)}
                    disabled={view === 3}
                  >
                    Next <SquareArrowRight className="!w-5 !h-5" />
                  </Button>
                </div> */}
                </div>
              </div>
              {view === 1 && <Dash1 from={fromDate} to={toDate} />}
              {/* {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={index}
                className="bg-muted/50 aspect-video h-12 w-full rounded-lg"
              />
            ))} */}
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default Dashboard;
