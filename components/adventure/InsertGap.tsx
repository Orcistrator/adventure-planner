"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, BookOpen, Swords, Gem, Minus, AlignLeft, Image as ImageIcon } from "lucide-react";

const BLOCK_TYPES = [
  { type: "text", label: "Text", icon: <AlignLeft size={14} /> },
  { type: "read-aloud", label: "Read Aloud", icon: <BookOpen size={14} /> },
  { type: "encounter", label: "Encounter", icon: <Swords size={14} /> },
  { type: "treasure-table", label: "Table", icon: <Gem size={14} /> },
  { type: "image", label: "Image", icon: <ImageIcon size={14} /> },
  { type: "divider", label: "Divider", icon: <Minus size={14} /> },
];

interface InsertGapProps {
  afterOrder: number;
  page: number;
  adventureId: Id<"adventures">;
  onAdded: (newId: Id<"blocks">, type: string) => void;
}

export default function InsertGap({
  afterOrder,
  page,
  adventureId,
  onAdded,
}: InsertGapProps) {
  const [hovered, setHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const addBlock = useMutation(api.blocks.add);

  const handleAdd = async (type: string) => {
    const newId = await addBlock({
      adventureId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      page,
      afterOrder,
    });
    onAdded(newId, type);
    setPickerOpen(false);
    setHovered(false);
  };

  const close = () => {
    setPickerOpen(false);
    setHovered(false);
  };

  return (
    <div
      className="relative h-7 flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => !pickerOpen && setHovered(false)}
    >
      {/* Hover line + button */}
      <div
        className={`absolute inset-x-0 flex items-center gap-2 transition-opacity duration-150 ${
          hovered || pickerOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex-1 h-px bg-gray-200" />
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-[background-color,border-color,color,transform] duration-100 active:scale-90 shadow-sm"
          title="Insert block"
        >
          <Plus size={11} strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Picker dropdown */}
      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-45">
            {BLOCK_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleAdd(type)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-[background-color,transform] duration-100 active:scale-[0.97]"
              >
                <span className="text-gray-400">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
