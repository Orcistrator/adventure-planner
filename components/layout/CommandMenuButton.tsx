"use client";

import { BookSearch } from "lucide-react";
import { useCommandMenu } from "./CommandMenuContext";

export function CommandMenuButton() {
  const { openMenu } = useCommandMenu();

  return (
    <button
      onClick={openMenu}
      aria-label="Search"
      className="cursor-pointer rounded-md bg-stone-100 p-2 text-stone-400 transition-colors duration-150 hover:bg-stone-200"
    >
      <BookSearch size={16} strokeWidth={1.75} />
    </button>
  );
}
