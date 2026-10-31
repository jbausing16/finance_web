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
} from "@/components/ui/command";

interface Option {
  label: string;
  value: string;
}

interface SelectWithSearchProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  noPadding?: boolean;
  noPadding1?: boolean;
  readOnly?: boolean;
}

export function SelectWithSearch({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  noPadding,
  noPadding1,
  readOnly,
}: SelectWithSearchProps) {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-md border text-sm bg-transparent",
            "h-9 px-2",
            "!py-0",
            noPadding &&
              "!p-0 !m-0 !h-auto !min-h-0 !leading-none !py-0 !px-1 rounded-none border focus-visible:ring-[1px] ",
            noPadding1 &&
              "!p-0 !m-0 !h-auto !min-h-8 !leading-none !py-0 !px-1 rounded-none  ",
            readOnly && "pointer-events-none select-none cursor-default",
            className
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

      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] ">
        <Command>
          <CommandInput
            placeholder="Search..."
            className="!px-0 !py-0 "
            showSearchIcon={false}
          />
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup className="max-h-72 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.label}
                value={option.value}
                className="cursor-pointer"
                onSelect={() => {
                  onChange?.(option.label);
                  setOpen(false);
                }}
              >
                {option.value}
                {value === option.value && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
