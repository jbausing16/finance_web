"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect } from "react";

/* -------------------- Types -------------------- */

interface SelectWithSearch2Props {
  options: any[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  noPadding?: boolean;
  noPadding1?: boolean;
  readOnly?: boolean;
  id: string;
}

interface CommandOption {
  id: number;
  code: string;
  type: number;
  level: number;
  name: string;
  child: any[];
  ancestors?: CommandOption[];
}

interface CommandGroupData {
  heading: string;
  level: number;
  options: CommandOption[];
}

/* -------------------- Data Extractor -------------------- */

function extractGroups(accounts: any[]): CommandGroupData[] {
  const groups: CommandGroupData[] = [];

  function walk(nodes: any[], ancestors: any[] = []) {
    nodes.forEach((node) => {
      const nextAncestors = [...ancestors, node];

      if (node.type === 1) {
        const options: CommandOption[] = (node.child || [])
          .filter((child: any) => child.type === 2)
          .map((child: any) => ({
            ...child,
            ancestors: nextAncestors, // 👈 attach parents + grandparents
          }));

        groups.push({
          heading: node.name,
          level: node.level,
          options,
        });

        if (node.child?.length) {
          walk(node.child, nextAncestors);
        }
      }
    });
  }

  walk(accounts);
  return groups;
}

/* -------------------- Component -------------------- */

export function SelectWithSearch2({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  noPadding,
  noPadding1,
  readOnly,
  id,
}: SelectWithSearch2Props) {
  // console.log(options);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const flattenedGroups = React.useMemo(
    () => extractGroups(options),
    [options],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-md border text-sm bg-transparent h-9 px-2 ",
            "!py-0",
            noPadding &&
              "!p-0 !m-0 !h-auto !min-h-0 !leading-none !px-1 rounded-none",
            noPadding1 &&
              "!p-0 !m-0 !h-auto !min-h-8 !leading-none !px-1 rounded-none",
            readOnly && "pointer-events-none select-none cursor-default",
            className,
          )}
        >
          <span className="truncate">
            {value ? (
              value
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            // value={query}
            // onValueChange={setQuery}
            showSearchIcon={false}
          />

          <CommandList>
            {query.length > 0 && <CommandEmpty>No results found.</CommandEmpty>}
            <CommandItem
              value={"0"}
              onSelect={() => {
                onChange?.(String(0));
                setOpen(false);
              }}
            >
              {"All Accounts"}{" "}
              {id === "0" && <Check className="ml-auto h-4 w-4" />}
            </CommandItem>

            {flattenedGroups.map((group) => {
              if (query && group.options.length === 0) return null;

              return (
                <CommandGroup
                  key={group.heading}
                  heading={group.heading}
                  className={cn(
                    "py-0",
                    "[&_[cmdk-group-heading]]:pl-[var(--pl)]",
                  )}
                  style={
                    {
                      "--pl": `${group.level * 12}px`,
                    } as React.CSSProperties
                  }
                >
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={[
                        ...(option.ancestors?.map((a) => a.name) || []),
                        option.name,
                        option.code,
                      ].join(" ")}
                      onSelect={() => {
                        onChange?.(String(option.id));
                        setOpen(false);
                      }}
                      style={{ paddingLeft: option.level * 12 }}
                    >
                      {option.name}{" "}
                      <span className="text-gray-600">({option.code})</span>
                      {id === String(option.id) && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
