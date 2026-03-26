'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { EntityPopoverCard } from './EntitySummaryCard';
import { useEntityDrawer } from './EntityDrawerContext';

interface EntityLinkProps {
  /** Entity slug */
  id: string;
  children: React.ReactNode;
}

export default function EntityLink({ id, children }: EntityLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entity = useQuery(api.entities.getBySlug, { slug: id });
  const { open } = useEntityDrawer();

  // While loading or not found, still render the link text
  if (!entity) {
    return (
      <span className="font-semibold text-indigo-700 border-b border-indigo-300 border-dashed">
        {children}
      </span>
    );
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span
        className="font-semibold text-indigo-700 cursor-pointer border-b border-indigo-300 border-dashed hover:border-indigo-700 transition-colors"
        onClick={() => open(entity)}
      >
        {children}
      </span>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-72 bg-white rounded-xl shadow-xl border border-[oklch(92.8%_0.006_264.5)] overflow-hidden">
          <EntityPopoverCard entity={entity} />
          {/* Caret */}
          <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-[oklch(92.8%_0.006_264.5)] rotate-45" />
        </div>
      )}
    </span>
  );
}
