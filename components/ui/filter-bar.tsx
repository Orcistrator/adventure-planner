"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterChipProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function FilterChip({
  label,
  options,
  selected,
  onChange,
  className,
}: FilterChipProps) {
  const isActive = selected.length > 0;

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-olive-900/15 bg-olive-900/5 px-4 py-2 text-sm font-medium text-olive-500 shadow-xs transition-colors duration-150 outline-none hover:bg-olive-900/10",
          isActive && "border-olive-900/25 bg-olive-900/10",
          className,
        )}
      >
        {label}
        {isActive && (
          <span className="tabular-nums text-olive-400/75 text-xs font-medium">
            {selected.length}
          </span>
        )}
        <ChevronDown size={14} className="opacity-40" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-44 gap-0 bg-olive-900 p-1 text-olive-400">
        <div className="max-h-64 overflow-y-auto scrollbar-hide">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-olive-400 transition-colors duration-100 hover:bg-olive-800 hover:text-olive-50 active:bg-olive-700"
            >
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  selected.includes(opt.value)
                    ? "border-olive-400 bg-olive-400"
                    : "border-olive-600",
                )}
              >
                {selected.includes(opt.value) && (
                  <Check size={10} strokeWidth={3} className="text-olive-900" />
                )}
              </div>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface FilterClearAllProps {
  onClear: () => void;
  className?: string;
}

export function FilterClearAll({ onClear, className }: FilterClearAllProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      className={cn(
        "inline-flex h-9 items-center rounded-md px-1 text-sm font-medium text-stone-400 transition-colors hover:text-stone-950",
        className,
      )}
    >
      Clear
    </button>
  );
}
