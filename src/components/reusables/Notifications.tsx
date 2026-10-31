import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Bell,
  Check,
  Dot,
  Ellipsis,
  LoaderCircle,
  LucideArrowDownRight,
  Proportions,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { useGetNotifsQuery, useUpNotifMutation } from "@/store/api/Admin";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { useGetNotifQuery, useUpNotifMutation } from "@/store/api/ReportsApi";
import { Loading } from "./Loading";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

interface StyleProps {
  color?: string;
}

type Notif = {
  id: number;
  date: string;
  event: string;
  message: string;
  site: string;
  read: number;
  time: string;
};

function Notifications({ color }: StyleProps) {
  const navigate = useNavigate();
  const apiDomain = import.meta.env.VITE_API_BASE;
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(false);

  const [unread, setUnread] = useState<number>(0);

  const uid = localStorage.getItem("uid");

  const { data, isSuccess, isFetching } = useGetNotifQuery(
    { page },
    { refetchOnMountOrArgChange: true },
  );

  const cid: number = parseInt(localStorage.getItem("cid") || "0");

  useEffect(() => {
    if (isSuccess && data) {
      setNotifs((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newNotifs = data.results.filter(
          (n: Notif) => !existingIds.has(n.id),
        );
        return [...prev, ...newNotifs];
      });
      setUnread(data?.notif);
      setHasNextPage(!!data.next);
    }
  }, [isSuccess, data]);

  const groupNotifs = () => {
    const today: Notif[] = [];
    const yesterday: Notif[] = [];
    const others: Record<string, Notif[]> = {};

    notifs.forEach((notif) => {
      const fullDate = dayjs(notif.date);

      if (fullDate.isToday()) {
        today.push(notif);
      } else if (fullDate.isYesterday()) {
        yesterday.push(notif);
      } else {
        const label = fullDate.format("MMMM D, YYYY");
        if (!others[label]) others[label] = [];
        others[label].push(notif);
      }
    });

    return { today, yesterday, others };
  };

  const { today, yesterday, others } = groupNotifs();

  const renderNotif = (notif: Notif, i: number) => (
    <div
      key={i}
      className={`py-1 h-16 flex gap-2 cursor-pointer  hover:bg-gray-300 px-2 rounded-sm ${
        notif.read === 2 ? `bg-gray-100` : `bg-white`
      }`}
      onClick={() => {
        upNotif(notif.id);
        navigate(`${notif.site}`);
      }}
    >
      {/* <img
        src={apiDomain + notif.photo}
        className="w-20 h-15 object-cover"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.currentTarget;
          target.onerror = null;
          target.src = "/fallback.png";
        }}
      /> */}
      <div className="flex flex-col flex-grow">
        <span className="font-bold text-sm">{notif.message}</span>
        {/* <span className="text-[10px]">{notif.message}</span> */}
      </div>
      <div className="flex flex-col text-right">
        <span className="text-gray-400 text-[10px] whitespace-nowrap">
          {dayjs(`${notif.date}T${notif.time}`).format("hh:mm A")}
        </span>
        {notif.read === 2 && (
          <span className="flex justify-end text-blue-700">
            <Dot size={40} />
          </span>
        )}
      </div>
    </div>
  );

  const [upNotification] = useUpNotifMutation();

  const upNotif = async (id: number) => {
    setLoading(true);
    try {
      const checkstat = await upNotification(id).unwrap();

      if (checkstat.success === true) {
        setLoading(false);
        if (id === 0) {
          setNotifs((prev) =>
            prev.map((notif) => ({
              ...notif,
              read: 1,
            })),
          );
          setUnread(0);
        } else {
          setNotifs((prev) =>
            prev.map((notif) =>
              notif.id === id ? { ...notif, read: 1 } : notif,
            ),
          );
          setUnread((prev) => (prev > 0 ? prev - 1 : 0));
        }
      } else {
        setLoading(false);
        toast.error("Failed to update notification");
      }
    } catch (error) {
      toast.error("Something went wrong 🥺");
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}notif_${uid}/`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const index = notifs.filter(
        (notif) => String(data.id) === String(notif.id),
      );
      console.log("Received Notif:", data);
      console.log("Index: ", index);

      // if (index) {
      // } else {
      if (String(data.type) === "2") {
        setUnread((prev) => prev + 1);
        setNotifs((prevNotifs) => {
          const newNotif: Notif = {
            id: data.id,
            date: data.date,
            message: data.message,
            site: data.site,
            event: data.event,
            read: data.read,
            time: data.time,
          };

          return [newNotif, ...prevNotifs];
        });
      }

      // }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      {/* {loading && <Loading />} */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {unread > 0 && (
              <Badge className="absolute h-4 min-w-3 -right-1 -top-2 rounded-full px-1 text-[9px] bg-blue-700 text-white">
                {unread}
              </Badge>
            )}
            <Bell
              className="cursor-pointer"
              style={{ color: open ? "#000" : hovered ? "#000" : color }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-96"
          align="end"
          alignOffset={-40}
          sideOffset={10}
        >
          <div className="absolute -top-[5px] right-11 w-3 h-3 rotate-45 bg-white border-l border-t border-gray-200"></div>
          <div>
            <div className="flex justify-between items-center pb-2">
              <span className="font-bold">Notifications</span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="p-2 hover:bg-gray-100 rounded-full">
                    <Ellipsis size={16} />
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  side="left"
                  align="start"
                  className="w-auto p-2 flex flex-col space-y-1"
                >
                  <button
                    className="hover:bg-gray-200 p-1 px-2 rounded-md cursor-pointer text-sm flex gap-2 items-center"
                    onClick={() => upNotif(0)}
                  >
                    {loading ? (
                      <LoaderCircle className="animate-spin text-blue-500" />
                    ) : (
                      <Check size={16} />
                    )}
                    Mark All as Read
                  </button>
                  {/* <span
                  className="hover:bg-gray-200 p-1 px-2 rounded-md cursor-pointer text-sm flex gap-2 items-center"
                  onClick={() => navigate("/notifications")}
                >
                  <Proportions size={16} />
                  Open Notifications
                </span> */}
                </PopoverContent>
              </Popover>
            </div>
            <hr />

            <div className="max-h-[40vh] overflow-y-auto space-y-2">
              {today.length > 0 && (
                <div>
                  <span className="text-gray-500 text-xs font-bold">Today</span>
                  <div className="space-y-1">{today.map(renderNotif)}</div>
                </div>
              )}
              <hr />
              {yesterday.length > 0 && (
                <div>
                  <span className="text-gray-500 text-xs font-bold">
                    Yesterday
                  </span>
                  <div className="space-y-1">{yesterday.map(renderNotif)}</div>
                </div>
              )}
              <hr />
              {Object.keys(others).map((dateLabel) => (
                <div key={dateLabel}>
                  <span className="text-gray-500 text-xs font-bold">
                    {dateLabel}
                  </span>
                  <div className="space-y-1">
                    {others[dateLabel].map(renderNotif)}
                  </div>
                </div>
              ))}

              {hasNextPage && (
                <div className="mt-2 flex justify-center">
                  <Button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={isFetching}
                    className="text-xs focus-visible:ring-0 text-gray-700"
                    variant={"link"}
                  >
                    {isFetching ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default Notifications;
