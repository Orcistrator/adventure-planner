"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EntityPopoverCard } from "./EntitySummaryCard";
import { useEntityDrawer } from "./EntityDrawerContext";

interface EntityLinkProps {
  /** Entity slug */
  id: string;
  children: React.ReactNode;
}

export default function EntityLink({ id, children }: EntityLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
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

  const handleMouseEnter = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <>
      <span
        ref={spanRef}
        className="font-semibold text-indigo-700 cursor-pointer border-b border-indigo-300 border-dashed hover:border-indigo-700 transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => open(entity)}
      >
        {children}
      </span>

      {isOpen && popoverPos && createPortal(
        <div
          style={{
            position: 'fixed',
            top: popoverPos.top - 10,
            left: popoverPos.left,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="w-72 bg-white rounded-xl shadow-xl border border-[oklch(92.8%_0.006_264.5)] overflow-hidden"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <EntityPopoverCard entity={entity} />
          {/* Caret */}
          <div className="absolute -bottom-1.25 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-[oklch(92.8%_0.006_264.5)] rotate-45" />
        </div>,
        document.body
      )}
    </>
  );
}
