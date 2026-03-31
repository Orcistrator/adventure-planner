"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FilterChip,
  FilterClearAll,
  type FilterOption,
} from "@/components/ui/filter-bar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ADVENTURE_TYPES,
  ENVIRONMENTS,
  LEVEL_OPTIONS,
  getEnvStyle,
} from "@/lib/adventure-presets";

function toSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "adventure"
  );
}

type SortKey = "newest" | "oldest" | "az" | "za";

const TYPE_OPTIONS: FilterOption[] = ADVENTURE_TYPES.map((t) => ({
  value: t.name,
  label: t.name,
}));

const ENV_OPTIONS: FilterOption[] = ENVIRONMENTS.map((e) => ({
  value: e.name,
  label: e.name,
}));

function levelMatches(
  levelStr: string | undefined,
  selectedLevels: string[],
): boolean {
  if (!levelStr) return false;
  const [min, max] = levelStr.includes("-")
    ? levelStr.split("-").map(Number)
    : [Number(levelStr), Number(levelStr)];
  return selectedLevels.some((l) => {
    const n = Number(l);
    return n >= min && n <= max;
  });
}

export default function AdventuresPage() {
  const router = useRouter();
  const adventures = useQuery(api.adventures.listWithDescriptions);
  const removeAdventure = useMutation(api.adventures.remove);
  const createAdventure = useMutation(api.adventures.create);

  const [sort, setSort] = useState<SortKey>("newest");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [envFilter, setEnvFilter] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<Id<"adventures">>>(new Set());

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const slug = toSlug(newTitle) + "-" + Date.now().toString(36);
    await createAdventure({ title: newTitle.trim(), slug, tags: [] });
    setCreating(false);
    setNewTitle("");
    router.push(`/adventure/${slug}?edit=true`);
  };

  const filtered = useMemo(() => {
    if (!adventures) return [];
    let result = [...adventures];

    if (typeFilter.length > 0) {
      result = result.filter((a) => a.type && typeFilter.includes(a.type));
    }
    if (envFilter.length > 0) {
      result = result.filter((a) => a.tags.some((t) => envFilter.includes(t)));
    }
    if (levelFilter.length > 0) {
      result = result.filter((a) => levelMatches(a.level, levelFilter));
    }

    switch (sort) {
      case "oldest":
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [adventures, sort, typeFilter, envFilter, levelFilter]);

  const toggleSelect = (id: Id<"adventures">) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    await Promise.all([...selected].map((id) => removeAdventure({ id })));
    setSelected(new Set());
  };

  const hasSelection = selected.size > 0;
  const hasFilters =
    typeFilter.length > 0 || envFilter.length > 0 || levelFilter.length > 0;

  return (
    <div className="flex h-full flex-col gap-6 rounded-lg bg-white px-40 py-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading leading-tightest text-4xl text-stone-300">
          Adventures
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewTitle("");
              setCreating(true);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-stone-200 transition-colors duration-150 hover:bg-stone-800"
          >
            New Adventure
          </button>
        </div>
      </div>

      <Dialog
        open={creating}
        onOpenChange={(o) => {
          setCreating(o);
          if (!o) setNewTitle("");
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>New adventure</DialogTitle>
          </DialogHeader>
          <Input
            ref={titleInputRef}
            autoFocus
            placeholder="Adventure title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2">
        <FilterChip
          label="Type"
          options={TYPE_OPTIONS}
          selected={typeFilter}
          onChange={setTypeFilter}
        />
        <FilterChip
          label="Environment"
          options={ENV_OPTIONS}
          selected={envFilter}
          onChange={setEnvFilter}
        />
        <FilterChip
          label="Level"
          options={LEVEL_OPTIONS}
          selected={levelFilter}
          onChange={setLevelFilter}
        />
        {hasFilters && (
          <FilterClearAll
            onClear={() => {
              setTypeFilter([]);
              setEnvFilter([]);
              setLevelFilter([]);
            }}
          />
        )}
        {hasSelection && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="h-9 border-none bg-red-50 text-sm text-red-600 shadow-none hover:bg-red-100 hover:text-red-600"
            >
              Delete {selected.size}
            </Button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {adventures === undefined ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {adventures.length === 0
              ? "No adventures yet."
              : "No adventures match."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((adventure) => {
              const isSelected = selected.has(adventure._id);
              return (
                <div
                  key={adventure._id}
                  className={`group flex items-center gap-6 rounded-3xl border p-6 transition-shadow hover:shadow-md`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(adventure._id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-stone-900 bg-stone-900"
                        : "border-gray-300 hover:border-stone-400"
                    }`}
                  >
                    {isSelected && (
                      <Check size={11} strokeWidth={3} className="text-white" />
                    )}
                  </button>

                  {/* Content */}
                  <Link
                    href={`/adventure/${adventure.slug}`}
                    className="flex min-w-0 flex-1"
                  >
                    {/* Thumbnail — slides in on hover */}
                    <div className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-400 ease-in-out group-hover:grid-cols-[1fr]">
                      <div className="overflow-hidden">
                        <div
                          className={`mr-4 h-20 w-20 rounded-xl bg-cover bg-center ${adventure.coverImage ? "" : "bg-gray-100"}`}
                          style={
                            adventure.coverImage
                              ? {
                                  backgroundImage: `url(${adventure.coverImage})`,
                                }
                              : undefined
                          }
                        />
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      {/* Top row: title + meta */}
                      <div className="flex items-center gap-2">
                        {/* Title */}
                        <span className="shrink-0 text-base font-medium text-gray-900">
                          {adventure.title}
                        </span>

                        {/* Level */}
                        {adventure.level && (
                          <span className="ml-1 text-xs font-semibold tracking-[0.6px] text-stone-400 uppercase">
                            Lv {adventure.level}
                          </span>
                        )}

                        {/* Type + env tags — slides in from left on hover */}
                        {(adventure.type || adventure.tags.length > 0) && (
                          <div className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-out group-hover:grid-cols-[1fr]">
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2 pl-2">
                                {adventure.type && (
                                  <span className="shrink-0 text-xs font-semibold tracking-[0.6px] text-stone-400 uppercase">
                                    {adventure.type}
                                  </span>
                                )}
                                {adventure.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-medium tracking-[0.5px] uppercase ${getEnvStyle(tag)}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {adventure.description && (
                        <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                          {adventure.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
