'use client';

import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

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
      <div className={cn('flex items-center', className)}>
        <PopoverTrigger
          className={cn(
            'inline-flex h-8 items-center gap-1 px-3 text-xs font-medium border transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            isActive
              ? 'rounded-l-lg rounded-r-none border-r-0 bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
              : 'rounded-lg border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {label}
          {isActive && (
            <span className="rounded-sm bg-white/20 px-1 text-[10px] font-bold tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronDown size={12} className="opacity-50" />
        </PopoverTrigger>
        {isActive && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="flex h-8 items-center justify-center rounded-r-lg border border-l-0 border-stone-900 bg-stone-900 px-1.5 text-white/50 transition-colors hover:text-white"
          >
            <X size={11} />
          </button>
        )}
      </div>
      <PopoverContent align="start" sideOffset={4} className="w-44 p-1">
        <div className="max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <div
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                  selected.includes(opt.value)
                    ? 'bg-stone-900 border-stone-900'
                    : 'border-input',
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
