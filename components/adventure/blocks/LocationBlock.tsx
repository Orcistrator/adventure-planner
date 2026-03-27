"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Check, MapPin } from "lucide-react";
import Image from "next/image";
import { useEntityDrawer } from "@/components/entities/EntityDrawerContext";

interface LocationBlockProps {
  id: Id<"blocks">;
  entityId: string;
  isEditing: boolean;
  editTrigger?: number;
}

export default function LocationBlock({
  id,
  entityId,
  isEditing,
  editTrigger,
}: LocationBlockProps) {
  const [editOpen, setEditOpen] = useState(isEditing && entityId === "");
  const [search, setSearch] = useState("");
  const [draftEntityId, setDraftEntityId] = useState(entityId);
  const updateBlock = useMutation(api.blocks.update);
  const { open } = useEntityDrawer();

  useEffect(() => {
    if (editTrigger) setEditOpen(true);
  }, [editTrigger]);

  useEffect(() => {
    setDraftEntityId(entityId);
  }, [entityId]);

  const locations = useQuery(
    api.entities.list,
    editOpen ? { type: "location" } : "skip",
  );
  const entity = useQuery(
    api.entities.getBySlug,
    !editOpen && entityId ? { slug: entityId } : "skip",
  );

  const filtered = search
    ? (locations ?? []).filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()),
      )
    : (locations ?? []);

  const save = () => {
    updateBlock({ id, patch: { entityId: draftEntityId } });
    setEditOpen(false);
    setSearch("");
  };

  // ── Edit mode ────────────────────────────────────────────────────────────────

  if (isEditing && editOpen) {
    return (
      <div className="my-6 rounded-lg border-2 border-emerald-200 bg-emerald-50/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wider text-emerald-700 uppercase">
            Location
          </span>
          <button
            onClick={save}
            disabled={!draftEntityId}
            className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <Check size={14} /> Save
          </button>
        </div>

        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search locations…"
          className="mb-3 w-full rounded border border-emerald-200 bg-white p-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-300"
        />

        <div className="max-h-60 overflow-y-auto rounded border border-gray-200 bg-white">
          {locations === undefined ? (
            <div className="p-3 text-sm text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-400">No locations found.</div>
          ) : (
            filtered.slice(0, 30).map((loc) => (
              <button
                key={loc._id}
                type="button"
                onClick={() => setDraftEntityId(loc.slug)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-emerald-50 ${
                  draftEntityId === loc.slug ? "bg-emerald-50" : ""
                }`}
              >
                {loc.image ? (
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded">
                    <Image
                      src={loc.image}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-emerald-100">
                    <MapPin size={15} className="text-emerald-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {loc.name}
                  </div>
                  {(loc.locationType || loc.region) && (
                    <div className="truncate text-xs text-gray-400">
                      {[loc.locationType, loc.region]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                </div>
                {draftEntityId === loc.slug && (
                  <Check size={14} className="shrink-0 text-emerald-600" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── View mode ────────────────────────────────────────────────────────────────

  // Empty / loading / not-found states
  if (!entityId) {
    return (
      <div className="my-6 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-300">
        No location selected
      </div>
    );
  }

  if (entity === undefined) {
    return <div className="my-6 h-20" />;
  }

  if (entity === null) {
    return (
      <div className="my-6 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-300">
        Location not found
      </div>
    );
  }

  const meta = [entity.locationType, entity.region].filter(Boolean).join(" · ");

  return (
    <div
      className="my-2 flex cursor-pointer items-start gap-4 overflow-clip rounded-xl border border-stone-300 bg-white p-4 transition-all duration-200 ease-out hover:shadow-md"
      onClick={() => open(entity)}
    >
      {/* Square image */}
      <div className="relative h-50 w-50 shrink-0 overflow-clip rounded-sm bg-stone-100">
        {entity.image && (
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            unoptimized
            className="object-cover"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col items-start gap-4 p-0">
        <div className="flex flex-col items-start gap-1">
          <div className="font-heading text-[20px] leading-[round(up,125%,1px)] text-[oklch(21%_0.034_264.7)]">
            {entity.name}
          </div>
          {meta && (
            <div className="text-[12px] leading-[round(up,133.333%,1px)] tracking-[0.3px] text-[oklch(70.7%_0.022_261.3)] uppercase">
              {meta}
            </div>
          )}
        </div>
        {entity.description && (
          <div className="line-clamp-6 self-stretch text-[14px] leading-[round(up,150%,1px)] text-[oklch(44.6%_0.030_256.8)]">
            {entity.description}
          </div>
        )}
      </div>
    </div>
  );
}
