// Calendar.tsx
import { useEffect, useState } from "react";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parse,
  isValid,
  isBefore,
} from "date-fns";
import {
  CalendarDays,
  SquareChevronLeft,
  SquareChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { useGetCalendarQuery } from "@/store/api/Events";
// import CustomDialog from "@/components/ui/CustomDialog";
import { Button } from "@/components/ui/button";
// import { Calendar1 } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import CustomDialog from "@/components/reusables/CustomDialog";
import { Calendar1 } from "@/components/ui/calendar";
import { useGetAPCalQuery } from "@/store/api/ReportsApi";
import { ButtonGroup } from "@/components/ui/button-group";
import { formatMoney } from "@/lib/utils";

type Task = {
  id: number;
  date: string;
  edate: string;
  title: string;
  time: string;
  etime: string;
  status: number;
  cover: string;
  location: string;
  description: string;
};

type Recs = {
  id: number;
  cust: string;
  rem: string;
  num: string;
  due: string;
  bal: number;
  total: number;
  status: number;
};

const bgColors = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-indigo-400",
  "bg-teal-400",
];

const colors = [
  {
    id: 0,
    name: "live",
    value: "bg-[#2df134]",
  },
  {
    id: 1,
    name: "upcoming",
    value: "bg-[#17a0e9]",
  },
  {
    id: 2,
    name: "completed",
    value: "bg-[#bfbfbf]",
  },
  {
    id: 3,
    name: "canceled",
    value: "bg-[#ff3333]",
  },
];

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function CalendarExpense() {
  const apiDomain = import.meta.env.VITE_API_BASE;
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[] | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [lastOpenedModal, setLastOpenedModal] = useState<
    "dialog" | "calendar" | null
  >(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  // Initial date setup
  const initialDate = new Date();
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [month, setMonth] = useState<Date>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [value, setValue] = useState(formatDate(initialDate));

  const [red, setRed] = useState(1);
  const [blue, setBlue] = useState(1);
  const [green, setGreen] = useState(1);
  const [redData, setRedData] = useState([]);
  const [blueData, setBlueData] = useState([]);
  const [greenData, setGreenData] = useState([]);

  const [allData, setAllData] = useState<Recs[]>([]);

  const [newRedData, setNewRedData] = useState<Recs[]>([]);
  const [newBlueData, setNewBlueData] = useState<Recs[]>([]);
  const [newGreenData, setNewGreenData] = useState<Recs[]>([]);

  const [counter, setCounter] = useState(0);

  const [openPreview, setOpenPreview] = useState(false);
  const [currDay, setCurrDay] = useState("");
  const [curStatus, setCurrStatus] = useState(0);

  const dateNow = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-(\d{2})$/, "-$1");

  // Sync state when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setValue(input);

    const parsed = parse(input, "MMMM dd, yyyy", new Date());
    if (isValid(parsed)) {
      setDate(parsed);
      setMonth(parsed);
      setCurrentMonth(parsed);
    }
  };

  // Month navigation
  const handlePrev = () => {
    const newMonth = addMonths(currentMonth, -1);
    setCurrentMonth(newMonth);
    setMonth(newMonth);
    setDate(newMonth);
    setValue(formatDate(newMonth));
  };

  const handleNext = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    setMonth(newMonth);
    setDate(newMonth);
    setValue(formatDate(newMonth));
  };

  const getAPCal = useGetAPCalQuery(
    {
      date: format(String(date), "yyyy-MM-dd"),
      counter: counter,
    },
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (getAPCal.isSuccess && getAPCal.data) {
      setAllData(getAPCal.data.cal);
    }
  }, [getAPCal.isSuccess, getAPCal.data]);

  useEffect(() => {
    if (open) {
      setCounter((prev) => prev + 1);
    }
  }, [open]);

  // Header (with input + picker + nav)
  const renderHeader = () => (
    <div className="flex justify-between items-center p-4 bg-blue-700 rounded-t-md select-none text-black">
      <div className="text-3xl font-bold text-white">
        {value.slice(0, value.indexOf(",") - 3) +
          " " +
          value.slice(value.length - 4, value.length)}
      </div>
      <div className="flex gap-6 lg:gap-10 ">
        <div className="flex justify-center items-center gap-2 ">
          <div className="w-4 h-4 bg-red-600 flex rounded-xs border border-white" />
          <div className="text-lg font-medium text-white">Overdue</div>
        </div>

        <div className="flex justify-center items-center gap-2 ">
          <div className="w-4 h-4 bg-blue-600 flex rounded-xs border border-white" />
          <div className="text-lg font-medium text-white">Unpaid</div>
        </div>

        <div className="flex justify-center items-center gap-2 ">
          <div className="w-4 h-4 bg-green-600 flex rounded-xs border border-white" />
          <div className="text-lg font-medium text-white">Paid</div>
        </div>
      </div>

      <div className="flex gap-3 items-center pr-10">
        <Popover open={open1} onOpenChange={setOpen1}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className=" size-8 hover:bg-transparent hover:cursor-pointer"
            >
              <CalendarDays className="size-7" color="white" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar1
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              // onMonthChange={setMonth}
              required
              onMonthChange={(newMonth) => {
                setMonth(newMonth);
                setCurrentMonth(newMonth);
                setDate(newMonth);
                setValue(formatDate(newMonth));
              }}
              onSelect={(dt: Date) => {
                if (!dt) return;
                setDate(dt);
                setMonth(dt);
                setCurrentMonth(dt);
                setValue(formatDate(dt));
                setOpen1(false);
              }}
              className="[&_.rdp-head]:hidden [&_.rdp-days]:hidden"
            />
          </PopoverContent>
        </Popover>

        <SquareChevronLeft
          size={30}
          onClick={handlePrev}
          className="cursor-pointer hover:bg-transparent "
          color="white"
        />

        <SquareChevronRight
          size={30}
          onClick={handleNext}
          className="cursor-pointer hover:bg-transparent "
          color="white"
        />
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <div className="grid grid-cols-7 text-center text-sm font-bold text-gray-700">
        {days.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "yyyy-MM-dd");
        const isToday = isSameDay(day, new Date());
        const taskOfDay = tasks
          .filter((task) => task.date === formattedDate)
          .sort((a, b) => a.time.localeCompare(b.time));
        const visibleTasks = taskOfDay
          .sort((a, b) => a.time.localeCompare(b.time))
          .slice(0, 3);
        const showMore = taskOfDay.length > 3;

        let redCount = allData.filter(
          (item: Recs) =>
            (item.status === 1 || item.status === 2) &&
            format(item.due, "yyyy-MM-dd") === formattedDate &&
            format(item.due, "yyyy-MM-dd") < dateNow,
        ).length;
        let blueCount = allData.filter(
          (item: Recs) =>
            (item.status === 1 || item.status === 2) &&
            format(item.due, "yyyy-MM-dd") === formattedDate &&
            format(item.due, "yyyy-MM-dd") >= dateNow,
        ).length;
        let greenCount = allData.filter(
          (item: Recs) =>
            item.status === 3 &&
            format(item.due, "yyyy-MM-dd") === formattedDate,
        ).length;

        days.push(
          <div
            key={day.toString()}
            className={`border p-2 min-h-[110px] text-sm relative flex flex-col justify-between
              ${
                !isSameMonth(day, currentMonth)
                  ? "bg-gray-100 text-gray-400"
                  : ""
              }
              ${taskOfDay.length > 0 ? "cursor-pointer" : ""}
            `}
            onClick={() => {
              if (taskOfDay.length > 3) {
                // setSelectedDateTasks(taskOfDay);
                // setOpenPreview(true);
                // setLastOpenedModal("dialog");
              }
            }}
          >
            <div
              className={`text-sm mb-1 ${
                isToday ? "text-blue-600 font-bold underline" : ""
              }`}
            >
              {format(day, "dd")}
              {/* {format(day, "yyyy-MM-dd")} */}
            </div>

            <div className="flex pb-1 justify-center">
              <ButtonGroup
                // variant="outlined"
                aria-label="Basic button group"
                className="flex justify-center gap-2"
              >
                {redCount > 0 && isSameMonth(day, currentMonth) ? (
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      setCurrDay(formattedDate);
                      setCurrStatus(1);
                      setOpenPreview(true);
                      setLastOpenedModal("dialog");
                    }}
                  >
                    {redCount}
                  </Button>
                ) : (
                  ""
                )}
                {blueCount > 0 && isSameMonth(day, currentMonth) ? (
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      setCurrDay(formattedDate);
                      setCurrStatus(2);
                      setOpenPreview(true);
                      setLastOpenedModal("dialog");
                    }}
                  >
                    {blueCount}
                  </Button>
                ) : (
                  ""
                )}
                {greenCount > 0 && isSameMonth(day, currentMonth) ? (
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      setCurrDay(formattedDate);
                      setCurrStatus(3);
                      setOpenPreview(true);
                      setLastOpenedModal("dialog");
                    }}
                  >
                    {greenCount}
                  </Button>
                ) : (
                  ""
                )}
              </ButtonGroup>
            </div>
          </div>,
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>,
      );
      days = [];
    }

    return <div className="space-y-0">{rows}</div>;
  };

  //   const getCal = useGetCalendarQuery(
  //     {
  //       date: format(currentMonth, "yyyy-MM-dd"),
  //     },
  //     {
  //       refetchOnMountOrArgChange: true,
  //     },
  //   );

  //   useEffect(() => {
  //     if (getCal.isSuccess && getCal.data) {
  //       setTasks(getCal?.data?.data);
  //     }
  //   }, [getCal.isSuccess, getCal.data]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (lastOpenedModal === "dialog") {
          setOpenPreview(false);
          setLastOpenedModal("calendar");
        } else if (lastOpenedModal === "calendar") {
          setOpen(false);
          setLastOpenedModal(null);
        }
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [lastOpenedModal]);

  return (
    <>
      {/* Calendar Button */}
      <span
        id="calendar_button"
        className="bg-white cursor-pointer border-gray-200 transition-colors p-1.5 rounded-md"
        style={{
          color: hovered ? "#000" : (localStorage.getItem("color") ?? "black"),
          borderColor: hovered
            ? "#000"
            : (localStorage.getItem("color") ?? "black"),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          setValue(formatDate(initialDate));
          setMonth(initialDate);
          setCurrentMonth(initialDate);
          setDate(initialDate);
          setOpen(true);
          setLastOpenedModal("calendar");
        }}
      >
        <CalendarDays />
      </span>

      {/* Full Calendar Dialog */}
      {open && (
        <>
          <CustomDialog
            close={setOpen}
            title=""
            width="!w-[80vw] !max-w-7xl"
            height=""
            closeIcon="Y"
            closeColor="white"
            button=""
            escape="N"
            className=""
            pad="N"
          >
            <div className="max-w-7xl mx-auto  bg-red-100">
              <div className="shadow rounded-md overflow-hidden border">
                {renderHeader()}
                <div className="p-2 bg-gray-50 max-h-[83vh] overflow-auto">
                  {renderDays()}
                  {renderCells()}
                </div>
              </div>
            </div>
          </CustomDialog>
        </>
      )}

      {openPreview && (
        <>
          <CustomDialog
            close={setOpenPreview}
            title=""
            width="!w-[50vw] !max-w-7xl"
            height=""
            closeIcon="Y"
            button=""
            escape="N"
            className=""
          >
            <div className="max-w-7xl mx-auto max-h-[70vh] pt-6">
              <table className="w-full">
                <thead>
                  <tr>
                    <td className="border py-1 px-2 border-gray-500 font-medium text-center">
                      Invoice No.
                    </td>
                    <td className="border py-1 px-2 border-gray-500 font-medium">
                      Vendor
                    </td>
                    <td className="border py-1 px-2 border-gray-500 font-medium">
                      Remarks
                    </td>
                    <td className="border py-1 px-2 border-gray-500 font-medium text-center">
                      Status
                    </td>
                    <td className="border py-1 px-2 border-gray-500 font-medium text-right">
                      Balance
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let data: Recs[] = [];
                    if (curStatus === 1) {
                      data = allData.filter(
                        (item: Recs) =>
                          (item.status === 1 || item.status === 2) &&
                          format(item.due, "yyyy-MM-dd") === currDay &&
                          format(item.due, "yyyy-MM-dd") <= dateNow,
                      );
                    } else if (curStatus === 2) {
                      data = allData.filter(
                        (item: Recs) =>
                          (item.status === 1 || item.status === 2) &&
                          format(item.due, "yyyy-MM-dd") === currDay &&
                          format(item.due, "yyyy-MM-dd") >= dateNow,
                      );
                    } else if (curStatus === 3) {
                      data = allData.filter(
                        (item: Recs) =>
                          item.status === 3 &&
                          format(item.due, "yyyy-MM-dd") === currDay,
                      );
                    }

                    return data.map((item: Recs, i: number) => (
                      <tr key={i}>
                        <td className="border py-1 px-2 border-gray-500 text-center">
                          {item.num}
                        </td>
                        <td className="border py-1 px-2 border-gray-500">
                          {item.cust}
                        </td>
                        <td className="border py-1 px-2 border-gray-500">
                          {item.rem}
                        </td>
                        <td className="border py-1 px-2 border-gray-500 text-center">
                          {curStatus === 1 ? (
                            <span className="px-2 bg-red-200 text-red-700 rounded-2xl">
                              Overdue
                            </span>
                          ) : curStatus === 2 ? (
                            <span className="px-2 bg-blue-200 text-blue-700 rounded-2xl">
                              Unpaid
                            </span>
                          ) : (
                            <span className="px-2 bg-green-200 text-green-700 rounded-2xl">
                              Paid
                            </span>
                          )}
                        </td>
                        <td className="border py-1 px-2 border-gray-500 text-right">
                          {formatMoney(item.bal)}
                        </td>
                      </tr>
                    ));
                  })()}

                  {/* {Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i}>
                      <td className="border py-1 px-2 border-gray-500">
                        Venndor
                      </td>
                      <td className="border py-1 px-2 border-gray-500">
                        asfgsd sdfdsf
                      </td>
                      <td className="border py-1 px-2 border-gray-500 text-center">
                        <span className="px-2 bg-red-200 text-red-700 rounded-2xl">
                          Overdue
                        </span>
                      </td>
                      <td className="border py-1 px-2 border-gray-500 text-right">
                        {formatMoney(100234)}
                      </td>
                    </tr>
                  ))} */}
                </tbody>
              </table>
            </div>
          </CustomDialog>
        </>
      )}

      {/* Task Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Events for{" "}
              {formatDate(new Date(selectedDateTasks?.[0]?.date || ""))}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2 max-h-[50vh] overflow-auto">
            {(selectedDateTasks ?? [])
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((task, i) => {
                let newColor = "";
                if (task.status === 1) {
                  const now = new Date();

                  // Combine task start and end date-times into full Date objects
                  const startDateTime = new Date(`${task.date}T${task.time}`);
                  const endDateTime = new Date(`${task.edate}T${task.etime}`);

                  if (
                    new Date().toLocaleDateString("en-CA") === task.date &&
                    new Date().toTimeString().split(" ")[0] >= task.time
                  ) {
                    newColor =
                      colors.find((i) => i.id === 0)?.value || "bg-red-500";
                  } else if (now >= startDateTime && now <= endDateTime) {
                    newColor =
                      colors.find((i) => i.id === 0)?.value || "bg-red-500";
                  } else {
                    newColor =
                      colors.find((i) => i.id === 1)?.value || "bg-red-500";
                  }
                } else {
                  newColor =
                    colors.find((i) => i.id === task.status)?.value ||
                    "bg-orange-500";
                }

                return (
                  <div key={i} className="flex">
                    <div
                      className="w-28 rounded-l border-r-0 border-[.1px]"
                      style={{
                        backgroundImage: `url(${
                          task?.cover !== null && task?.cover !== ""
                            ? apiDomain + task?.cover
                            : "/fallback.png"
                        })`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    ></div>
                    <div
                      className={`px-3 py-2 w-full ${newColor} text-sm rounded-r  border-[.1px] border-l-0 text-gray-800`}
                    >
                      {new Date(`1970-01-01T${task.time}`).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}{" "}
                      {task.title}
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
