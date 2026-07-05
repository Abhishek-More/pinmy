"use client";

import { ChevronDown } from "lucide-react";

export interface CategoryOption {
  name: string;
  count: number;
}

/** Brutal-styled native select for filtering by category/collection. */
export const CategorySelect = ({
  allLabel,
  options,
  value,
  onChange,
}: {
  allLabel: string;
  options: CategoryOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) => {
  const total = options.reduce((sum, option) => sum + option.count, 0);
  return (
    <div className="relative shrink-0">
      <select
        value={value ?? "ALL"}
        onChange={(e) => onChange(e.target.value === "ALL" ? null : e.target.value)}
        className="h-10 cursor-pointer appearance-none border-2 border-black bg-white pr-8 pl-3 text-sm font-semibold"
      >
        <option value="ALL">
          {allLabel} ({total})
        </option>
        {options.map((option) => (
          <option key={option.name} value={option.name}>
            {option.name} ({option.count})
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2" />
    </div>
  );
};
