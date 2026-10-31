import React, { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { AppSidebar } from "../../reusables/sidebar/app-sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckIcon, ChevronsUpDownIcon, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/reusables/sidebar/search-form";
import CustomDialog from "@/components/reusables/CustomDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Header from "@/components/reusables/Header";
import {
  useGetAllAccountsQuery,
  useGetAutoEntriesQuery,
  useUpAutoEntriesMutation,
} from "@/store/api/AdministrationApi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn, hasAccess } from "@/lib/utils";
import { toast } from "sonner";
import { Loading } from "@/components/reusables/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Empty from "@/components/reusables/Empty";

// Type definitions for automatic entries data structure
type entries = {
  id: number;
  module: string;
  type: string;
  account: number;
  rate: number;
};

// Type definitions for account data structure
type account = {
  id: number;
  acc_type: string;
  account: string;
  code: string;
  level: number;
  parent: number;
  type: number;
};

/**
 * AutomaticEntries Component
 *
 * This component manages automatic entries configuration for different financial modules.
 * It allows administrators to view, search, and edit automatic entries that are used
 * in various financial operations like withholding tax calculations.
 *
 * Features:
 * - Displays a table of automatic entries with module, type, rate, and account information
 * - Provides search functionality to filter entries by module
 * - Allows editing of entries through a modal dialog
 * - Implements access control based on user permissions
 * - Supports hierarchical account selection with proper indentation
 */
function AutomaticEntries() {
  // State for storing automatic entries data from API
  const [entries, setEntries] = useState<entries[]>([]);

  // State for storing accounts data for dropdown selection
  const [accounts, setAccounts] = useState<account[]>([]);

  // State for controlling account selection popover
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  // State for controlling the add/edit dialog
  const [openAdd, setOpenAdd] = useState(false);
  const [type, setType] = useState(1); // 1 for add, 2 for edit

  // State for search functionality with debouncing
  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // State for editing entries - holds the current entry being edited
  const [editEntries, setEditEntries] = useState({
    id: 0,
    module: "",
    type: "",
    account: 0,
    rate: 0,
  });

  // Debounced search effect - delays API call until user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchUser(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // API queries for fetching data
  const getEntries = useGetAutoEntriesQuery({ search: searchUser });
  const getAccounts = useGetAllAccountsQuery({});

  // Effect to update entries state when API data is successfully fetched
  useEffect(() => {
    if (getEntries.isSuccess && getEntries.data) {
      setEntries(getEntries.data.data);
    }
  }, [getEntries.isSuccess, getEntries.data]);

  // Effect to update accounts state when API data is successfully fetched
  useEffect(() => {
    if (getAccounts.isSuccess && getAccounts.data) {
      setAccounts(getAccounts.data.data);
      console.log(getAccounts.data.data);
    }
  }, [getAccounts.isSuccess, getAccounts.data]);

  // Mutation for updating automatic entries
  const [upAutoEntries] = useUpAutoEntriesMutation();

  /**
   * Handles the submission of automatic entries updates
   * Sends the edited entry data to the server and shows success/error messages
   */
  const submitAutoEntries = async () => {
    try {
      const formData = new FormData();
      formData.append("datas", JSON.stringify(editEntries));

      const checkstat = await upAutoEntries(formData).unwrap();

      if (checkstat.success) {
        setOpenAdd(false);
        toast.success("Successfully Updated.");
      } else {
        toast.error(checkstat.message);
      }

      // console.log(checkstat);
    } catch (error) {}
  };

  // Get user access permissions from Redux store
  const access = useSelector((state: RootState) => state.auth.access);

  // Show loading component if access data is not available yet
  if (!access || access.length === 0) {
    return <Loading />;
  }

  return (
    <>
      {/* Main layout with sidebar */}
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Page header */}
          <Header title="Automatic Entries" />

          {/* Access control check - show empty state if no view permission */}
          {!hasAccess(access, "10", "view") ? (
            <Empty />
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 px-10 ">
              {/* Loading skeleton while accounts data is being fetched */}
              {getAccounts.isLoading ? (
                <>
                  <Skeleton className="h-10 w-[230px]" />
                  <Skeleton className="h-96 w-full " />
                </>
              ) : (
                <>
                  {/* Search form for filtering entries by module */}
                  <div
                    className="flex justify-between
            "
                  >
                    <SearchForm
                      search={search}
                      setSearch={setSearch}
                      placeholder="Search Module"
                      className="max-w-80"
                    />
                  </div>

                  {/* Main table displaying automatic entries */}
                  <Table className="shadow-sm border">
                    <TableHeader className="bg-gray-100 dark:bg-gray-800 rounded-b-sm select-none">
                      <TableRow className="">
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 ">
                          <span className="cursor-pointer flex items-center">
                            Module
                          </span>
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3">
                          Type
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Rate
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Account
                        </TableHead>
                        <TableHead className="font-archivo text-muted-foreground font-semibold py-3 text-center">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="font-inter text-foreground">
                      {/* Render each entry as a table row */}
                      {entries.map((item, idx) => (
                        <TableRow key={idx} className="">
                          <TableCell className="py-2 text-left">
                            {item.module}
                          </TableCell>
                          <TableCell className="py-2 text-left">
                            {item.type}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {item.rate}
                          </TableCell>

                          {/* Display account name by finding matching account */}
                          <TableCell className="py-2 text-center align-middle">
                            {
                              accounts.find(
                                (item1) => item1.id === item.account,
                              )?.account
                            }
                          </TableCell>

                          {/* Action button for editing entries - only enabled if user has edit permission */}
                          <TableCell className="py-2 text-center align-middle">
                            <div
                              className="flex justify-center items-center h-full cursor-pointer"
                              onClick={() => {
                                if (hasAccess(access, "10", "edit")) {
                                  setType(2); // Set to edit mode
                                  setOpenAdd(true); // Open edit dialog
                                  setEditEntries(item); // Pre-populate with current entry data
                                }
                              }}
                            >
                              <SquarePen
                                size={18}
                                className={`text-blue-700 ${!hasAccess(access, "10", "edit") ? `cursor-not-allowed` : ``}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>

      {/* Edit dialog - conditionally rendered when openAdd is true */}
      {openAdd && (
        <CustomDialog
          close={setOpenAdd}
          title={`${type === 1 ? `Add` : `Edit`}`}
          width={`!w-[30vw]`}
          height={``}
          closeIcon={`Y`}
          button=""
        >
          <div className="grid grid-cols-1 py-5 gap-4">
            {/* Module field - read-only */}
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Module</Label>
              <Input
                type="text"
                placeholder="Module"
                className={`w-full bg-gray-50`}
                value={editEntries.module}
                readOnly
              />
            </div>

            {/* Type field - read-only except for Wtax module */}
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Type</Label>
              <Input
                type="text"
                placeholder="Type"
                className={`w-full bg-gray-50`}
                onChange={(e) =>
                  setEditEntries({ ...editEntries, type: e.target.value })
                }
                value={editEntries.type}
                readOnly={editEntries.module !== "Wtax"}
              />
            </div>

            {/* Rate field - only shown for Wtax module */}
            {editEntries.module === "Wtax" && (
              <div className="grid w-full items-center gap-2">
                <Label className=" gap-0">Rate</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className={`w-full bg-gray-50`}
                  value={editEntries.rate}
                  onChange={(e) =>
                    setEditEntries({
                      ...editEntries,
                      rate: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}

            {/* Account selection dropdown using Popover and Command components */}
            <div className="grid w-full items-center gap-2">
              <Label className=" gap-0">Account</Label>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {/* Display selected account name or placeholder */}
                    {
                      accounts.find(
                        (item) =>
                          String(item.id) === String(editEntries.account),
                      )?.account
                    }
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 ">
                  <Command>
                    <CommandInput placeholder="Search account..." />
                    <CommandList>
                      <CommandEmpty>No account found.</CommandEmpty>
                      <CommandGroup>
                        {accounts
                          .filter(
                            (item) =>
                              !search ||
                              item.account
                                .toLowerCase()
                                .includes(search.toLowerCase()),
                          )
                          .sort((a, b) =>
                            !search ? a.code.localeCompare(b.code) : 0,
                          )

                          .map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.account.toLowerCase()}
                              onSelect={(currentValue) => {
                                setValue(
                                  currentValue === value ? "" : currentValue,
                                );
                                setEditEntries({
                                  ...editEntries,
                                  account: item.id,
                                });
                                setOpen(false);
                              }}
                              className={` ${
                                item.type === 1
                                  ? " font-bold pointer-events-none select-none"
                                  : ""
                              } ${
                                item.level === 2
                                  ? `pl-[20px]`
                                  : item.level === 3
                                    ? `pl-[40px]`
                                    : item.level === 4
                                      ? `pl-[60px]`
                                      : item.level === 5
                                        ? `pl-[80px]`
                                        : item.level === 6
                                          ? `pl-[60px]`
                                          : `pl-0`
                              }`}
                            >
                              <CheckIcon
                                className={cn(
                                  "h-4 w-4",
                                  editEntries.account === item.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {item.account}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <hr className="mb-5" />

          <div className="flex justify-end gap-4">
            <Button
              size="sm"
              variant="second"
              onClick={() => setOpenAdd(false)}
            >
              Cancel
            </Button>

            <Button size="sm" variant="primary" onClick={submitAutoEntries}>
              {`${type === 1 ? `Add` : `Update`}`}
            </Button>
          </div>
        </CustomDialog>
      )}
    </>
  );
}

export default AutomaticEntries;
