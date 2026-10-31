import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";
import Notifications from "./Notifications";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearLogoutReason, logout } from "@/store/auth/authSlice";
import type { RootState } from "@/store";
import { useLogoutMutation } from "@/store/api/authApi";
import { FORCED_LOGOUT_REASON_STORAGE_KEY } from "@/store/api/baseQueryWithReauth";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentRole = useSelector((state: RootState) => state.auth.role);

  const [logoutAll] = useLogoutMutation();

  const handleLogout = async () => {
    dispatch(clearLogoutReason());
    dispatch(logout());

    try {
      await logoutAll().unwrap();
    } catch {
      // Logout still continues locally if server-side logout fails.
    }

    sessionStorage.removeItem(FORCED_LOGOUT_REASON_STORAGE_KEY);
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const apiDomain = import.meta.env.VITE_API_BASE;
  const name = useSelector((state: RootState) => state.auth.name);
  const email = useSelector((state: RootState) => state.auth.email);
  const image = useSelector((state: RootState) => state.auth.image);
  return (
    <header className="bg-background sticky top-0 flex h-12 shrink-0 items-center gap-2 border-b px-4 z-10 pr-8">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex items-center justify-between w-full">
        <div className="font-medium">{title}</div>
        <div className="flex gap-4 items-center">
          {currentRole !== 1 && <Notifications />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="hover:!bg-transparent focus:!bg-transparent active:!bg-transparent data-[state=open]:!bg-transparent data-[state=open]:text-sidebar-accent-foreground cursor-pointer">
                <Avatar className="h-10 w-10 shadow-md">
                  <AvatarImage
                    src={apiDomain + image}
                    className="object-cover"
                  />
                  <AvatarFallback>{getInitials(name ?? "AA")}</AvatarFallback>
                </Avatar>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="rounded-lg"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="shadow-md">
                    <AvatarImage
                      src={apiDomain + image}
                      className="object-cover"
                    />
                    <AvatarFallback>{getInitials(name ?? "AA")}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
