import { Search, X } from "lucide-react";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  className?: ReactNode;
}

export function SearchForm({
  search,
  setSearch,
  placeholder,
  className,
}: SearchFormProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-1 pr-8 pl-10 focus:outline-none"
      />
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 opacity-50 select-none" />
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
        >
          ✕
        </button>
      )}
    </div>
  );
}
