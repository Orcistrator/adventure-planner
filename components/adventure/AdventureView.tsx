"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Pencil, Eye, Trash2 } from "lucide-react";
import AdventureHeader from "./AdventureHeader";
import BlockList from "./BlockList";
import TableOfContents from "./TableOfContents";

interface AdventureViewProps {
  slug: string;
  initialEditing?: boolean;
}

export default function AdventureView({ slug, initialEditing = false }: AdventureViewProps) {
  const adventure = useQuery(api.adventures.getBySlug, slug ? { slug } : "skip");
  const blocks = useQuery(
    api.blocks.listByAdventure,
    adventure ? { adventureId: adventure._id } : "skip",
  );
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const router = useRouter();
  const removeAdventure = useMutation(api.adventures.remove);

  if (adventure === undefined || adventure === null || blocks === undefined) {
    return (
      <div className="h-screen overflow-hidden bg-stone-200 p-2">
        <div className="h-full overflow-y-auto rounded-lg bg-white">
          {adventure === null ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No adventure found for &ldquo;{slug}&rdquo;.</p>
            </div>
          ) : (
            <>
              <div className="h-[60vh] min-h-100 animate-pulse bg-gray-100" />
              <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-gray-100" style={{ width: `${80 - i * 10}%` }} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const headings = blocks.flatMap((b) => {
    if (b.type === "heading") {
      return [{ id: b._id, text: (b as Extract<typeof b, { type: "heading" }>).text, level: (b as Extract<typeof b, { type: "heading" }>).level }];
    }
    if (b.type === "text") {
      const m = (b as Extract<typeof b, { type: "text" }>).markdown.match(/^(#{1,4})\s+(.+)/);
      if (m) return [{ id: b._id, text: m[2].trimEnd(), level: m[1].length }];
    }
    return [];
  });

  return (
    <div className="h-screen overflow-hidden bg-stone-200 p-2">
      <div className="h-full overflow-y-auto rounded-lg bg-white pb-24">
        <AdventureHeader adventure={adventure} isEditing={isEditing} />

        <div className="mx-auto flex max-w-6xl gap-12 px-6 py-12">
          {/* Table of contents */}
          <aside className="hidden w-48 shrink-0 xl:block">
            <div className="sticky top-8 flex flex-col gap-6 overflow-y-auto pr-1">
              <h2 className="font-heading text-xl leading-snug font-bold text-gray-900">
                {adventure.title}
              </h2>
              <TableOfContents headings={headings} />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <BlockList adventureId={adventure._id} blocks={blocks} isEditing={isEditing} />
          </main>
        </div>

        {/* Edit / delete controls */}
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2">
          {isEditing && (
            deleteConfirming ? (
              <>
                <span className="rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-lg">
                  Delete adventure?
                </span>
                <button
                  onClick={() => setDeleteConfirming(false)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { router.push("/adventures"); removeAdventure({ id: adventure._id }); }}
                  className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-[background-color,transform] duration-150 ease-out hover:bg-red-700 active:scale-[0.97]"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </>
            ) : (
              <button
                onClick={() => setDeleteConfirming(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-lg transition-[background-color,color,border-color,transform] duration-150 ease-out hover:border-red-200 hover:text-red-500 active:scale-[0.97]"
              >
                <Trash2 size={16} />
              </button>
            )
          )}
          <button
            onClick={() => { setIsEditing((v) => !v); setDeleteConfirming(false); }}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] ${
              isEditing ? "bg-gray-900 text-white hover:bg-gray-800" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {isEditing ? <><Eye size={16} /> Preview</> : <><Pencil size={16} /> Edit</>}
          </button>
        </div>
      </div>
    </div>
  );
}
