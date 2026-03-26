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
      <div className="my-6 border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
            Location
          </span>
          <button
            onClick={save}
            disabled={!draftEntityId}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 disabled:opacity-40"
          >
            <Check size={14} /> Save
          </button>
        </div>

        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search locations…"
          className="w-full border border-emerald-200 rounded p-2 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-emerald-300 mb-3"
        />

        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded bg-white">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 text-left transition-colors ${
                  draftEntityId === loc.slug ? "bg-emerald-50" : ""
                }`}
              >
                {loc.image ? (
                  <div className="relative w-9 h-9 rounded overflow-hidden shrink-0">
                    <Image
                      src={loc.image}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-emerald-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {loc.name}
                  </div>
                  {(loc.locationType || loc.region) && (
                    <div className="text-xs text-gray-400 truncate">
                      {[loc.locationType, loc.region]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                </div>
                {draftEntityId === loc.slug && (
                  <Check size={14} className="text-emerald-600 shrink-0" />
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
      <div className="my-6 rounded-lg border-2 border-dashed border-gray-200 h-20 flex items-center justify-center text-gray-300 text-sm">
        No location selected
      </div>
    );
  }

  if (entity === undefined) {
    return <div className="my-6 h-20" />;
  }

  if (entity === null) {
    return (
      <div className="my-6 rounded-lg border-2 border-dashed border-gray-200 h-20 flex items-center justify-center text-gray-300 text-sm">
        Location not found
      </div>
    );
  }

  const meta = [entity.locationType, entity.region].filter(Boolean).join(" · ");

  return (
    <div
      className="rounded-xl overflow-clip flex items-start gap-4 bg-white border border-stone-300 my-2 p-4 cursor-pointer transition-all duration-200 ease-out hover:shadow-md"
      onClick={() => open(entity)}
    >
      {/* Square image */}
      <div className="relative rounded-sm overflow-clip h-50 w-50 bg-stone-100 shrink-0">
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
      <div className="min-w-0 flex flex-col items-start gap-4 p-0">
        <div className="flex flex-col items-start gap-1">
          <div className="text-[20px] leading-[round(up,125%,1px)] text-[oklch(21%_0.034_264.7)] font-heading">
            {entity.name}
          </div>
          {meta && (
            <div className="text-[12px] tracking-[0.3px] leading-[round(up,133.333%,1px)] uppercase text-[oklch(70.7%_0.022_261.3)]">
              {meta}
            </div>
          )}
        </div>
        {entity.description && (
          <div className="text-[14px] leading-[round(up,150%,1px)] self-stretch text-[oklch(44.6%_0.030_256.8)] line-clamp-6">
            {entity.description}
          </div>
        )}
      </div>
    </div>
  );
}
