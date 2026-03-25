"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pencil, Eye } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import AdventureHeader from "./AdventureHeader";
import BlockList from "./BlockList";
import TableOfContents from "./TableOfContents";

interface AdventureViewProps {
  slug: string;
}

export default function AdventureView({ slug }: AdventureViewProps) {
  const adventure = useQuery(
    api.adventures.getBySlug,
    slug ? { slug } : "skip",
  );
  const blocks = useQuery(
    api.blocks.listByAdventure,
    adventure ? { adventureId: adventure._id } : "skip",
  );
  const [isEditing, setIsEditing] = useState(false);

  const { scrollY } = useScroll();
  // Title fades into the ToC sidebar as the cover header scrolls away
  const sidebarTitleOpacity = useTransform(scrollY, [220, 400], [0, 1]);

  if (adventure === undefined) {
    return (
      <div className="min-h-full bg-white">
        <div className="h-[60vh] min-h-100 bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-100 rounded animate-pulse"
              style={{ width: `${80 - i * 10}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (adventure === null) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <p className="text-gray-500">
          No adventure found for &ldquo;{slug}&rdquo;.
        </p>
      </div>
    );
  }

  if (blocks === undefined) {
    return (
      <div className="min-h-full bg-white">
        <div className="h-[60vh] min-h-100 bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-100 rounded animate-pulse"
              style={{ width: `${80 - i * 10}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const headings = blocks.flatMap((b) => {
    // Legacy heading blocks
    if (b.type === "heading") {
      return [
        {
          id: b._id,
          text: (b as Extract<typeof b, { type: "heading" }>).text,
          level: (b as Extract<typeof b, { type: "heading" }>).level,
        },
      ];
    }
    // Text blocks with `#` prefix
    if (b.type === "text") {
      const m = (b as Extract<typeof b, { type: "text" }>).markdown.match(
        /^(#{1,4})\s+(.+)/,
      );
      if (m) return [{ id: b._id, text: m[2].trimEnd(), level: m[1].length }];
    }
    return [];
  });

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Fixed header (in read mode) — needs a spacer to push content below it */}
      <AdventureHeader adventure={adventure} isEditing={isEditing} />
      {!isEditing && <div className="h-125" />}

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        {/* Table of contents */}
        <aside className="hidden xl:block w-48 shrink-0">
          <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-1 flex flex-col gap-3">
            {/* Adventure title — fades in as cover scrolls away */}
            <motion.div
              style={{ opacity: sidebarTitleOpacity }}
              className="shrink-0"
            >
              <h2 className="font-heading text-base font-bold text-gray-900 leading-snug mb-3">
                {adventure.title}
              </h2>
            </motion.div>

            <TableOfContents headings={headings} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <BlockList
            adventureId={adventure._id}
            blocks={blocks ?? []}
            isEditing={isEditing}
          />
        </main>
      </div>

      {/* Edit toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm shadow-lg transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] ${
            isEditing
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {isEditing ? (
            <>
              <Eye size={16} /> Preview
            </>
          ) : (
            <>
              <Pencil size={16} /> Edit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
