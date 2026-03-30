"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BookOpen, Trash2, Check, Plus } from "lucide-react";
import { CommandMenuButton } from "@/components/layout/CommandMenuButton";
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
  const adventures = useQuery(api.adventures.list);
  const removeAdventure = useMutation(api.adventures.remove);
  const createAdventure = useMutation(api.adventures.create);

  const [sort, setSort] = useState<SortKey>("newest");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [envFilter, setEnvFilter] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<Id<"adventures">>>(new Set());
  const [confirming, setConfirming] = useState(false);

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
    setConfirming(false);
  };

  const handleDelete = async () => {
    await Promise.all([...selected].map((id) => removeAdventure({ id })));
    setSelected(new Set());
    setConfirming(false);
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
          <CommandMenuButton />
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
            {confirming ? (
              <>
                <span className="text-sm font-medium text-red-600">
                  Delete {selected.size} adventure
                  {selected.size > 1 ? "s" : ""}?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 size={13} /> Confirm
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 size={13} /> Delete {selected.size}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {adventures === undefined ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-gray-100"
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
          <ul className="flex flex-col gap-1">
            {filtered.map((adventure) => {
              const isSelected = selected.has(adventure._id);
              return (
                <li key={adventure._id} className="flex items-center gap-2">
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
                  <Link
                    href={`/adventure/${adventure.slug}`}
                    className={`flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-[background-color,transform] duration-150 hover:bg-gray-50 active:scale-[0.99] ${
                      isSelected ? "bg-stone-50" : ""
                    }`}
                  >
                    <BookOpen size={16} className="shrink-0 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {adventure.title}
                    </span>
                    {adventure.level && (
                      <span className="ml-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                        Lv {adventure.level}
                      </span>
                    )}
                    {adventure.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-gray-200 px-2 py-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
