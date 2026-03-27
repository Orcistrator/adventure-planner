"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pencil, Eye } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
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
  const [titleExpanded, setTitleExpanded] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setTitleExpanded(y > 220));

  if (adventure === undefined) {
    return (
      <div className="min-h-full bg-white">
        <div className="h-[60vh] min-h-100 animate-pulse bg-gray-100" />
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-gray-100"
              style={{ width: `${80 - i * 10}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (adventure === null) {
    return (
      <div className="flex min-h-full items-center justify-center bg-white">
        <p className="text-gray-500">
          No adventure found for &ldquo;{slug}&rdquo;.
        </p>
      </div>
    );
  }

  if (blocks === undefined) {
    return (
      <div className="min-h-full bg-white">
        <div className="h-[60vh] min-h-100 animate-pulse bg-gray-100" />
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-gray-100"
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

      <div className="mx-auto flex max-w-6xl gap-12 px-6 py-12">
        {/* Table of contents */}
        <aside className="hidden w-48 shrink-0 xl:block">
          <div className="sticky top-8 flex flex-col overflow-y-auto pr-1">
            {/* Adventure title — fades in as cover scrolls away */}
            <motion.div
              style={{ opacity: sidebarTitleOpacity }}
              animate={{
                height: titleExpanded ? "auto" : 0,
                marginBottom: titleExpanded ? 32 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="shrink-0 overflow-hidden"
            >
              <h2 className="font-heading text-xl leading-snug font-bold text-gray-900">
                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {adventure.title}
                </a>
              </h2>
            </motion.div>

            <TableOfContents headings={headings} />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <BlockList
            adventureId={adventure._id}
            blocks={blocks ?? []}
            isEditing={isEditing}
          />
        </main>
      </div>

      {/* Edit toggle */}
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] ${
            isEditing
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
