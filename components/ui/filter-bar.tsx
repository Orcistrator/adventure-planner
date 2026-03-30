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
          "focus-visible:ring-ring/50 inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out outline-none focus-visible:ring-2",
          isActive
            ? "bg-stone-100 text-stone-950 hover:bg-stone-200"
            : "bg-stone-100 text-stone-950 hover:bg-stone-200",
          className,
        )}
      >
        {label}
        {isActive && (
          <span className="text-xs font-medium text-stone-400 tabular-nums">
            {selected.length}
          </span>
        )}
        <ChevronDown size={16} className="opacity-40" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-44 p-1">
        <div className="max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
            >
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  selected.includes(opt.value)
                    ? "border-stone-950 bg-stone-950"
                    : "border-stone-300",
                )}
              >
                {selected.includes(opt.value) && (
                  <Check size={10} strokeWidth={3} className="text-white" />
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
