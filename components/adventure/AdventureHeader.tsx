"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { ImageIcon, Check, ChevronDown } from "lucide-react";
import { ENVIRONMENTS, ADVENTURE_TYPES, getEnvStyle } from "@/lib/adventure-presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

interface AdventureHeaderProps {
  adventure: Doc<"adventures">;
  isEditing: boolean;
}

export default function AdventureHeader({ adventure, isEditing }: AdventureHeaderProps) {
  const updateAdventure = useMutation(api.adventures.update);

  const [title, setTitle] = useState(adventure.title);
  const [type, setType] = useState(adventure.type ?? "");
  const [tags, setTags] = useState<string[]>(adventure.tags);
  const [coverImage, setCoverImage] = useState(adventure.coverImage ?? "");
  const [level, setLevel] = useState(adventure.level ?? "");

  const save = (patch: Record<string, unknown>) => {
    updateAdventure({ id: adventure._id, ...patch } as Parameters<typeof updateAdventure>[0]);
  };

  const toggleEnvironment = (name: string) => {
    const next = tags.includes(name) ? tags.filter((t) => t !== name) : [...tags, name];
    setTags(next);
    save({ tags: next });
  };

  const selectType = (name: string) => {
    const next = type === name ? "" : name;
    setType(next);
    save({ type: next || undefined });
  };

  const typeEntry = ADVENTURE_TYPES.find((t) => t.name === type);

  // ── Shared cover layout ───────────────────────────────────────────────────────
  const coverBg = (
    <div className="absolute inset-0">
      {coverImage ? (
        <Image src={coverImage} alt="" fill unoptimized priority className="object-cover" />
      ) : (
        <div className="h-full w-full bg-linear-to-br from-stone-950/10 to-stone-950" />
      )}
    </div>
  );

  // ── Edit mode ─────────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <header className="relative flex h-125 items-end overflow-hidden pb-12">
        {coverBg}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 xl:pl-34">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={level} onValueChange={(v) => { if (v) { setLevel(v); save({ level: v }); } }}>
              <SelectTrigger className="h-10! w-20 rounded-md border-none bg-black/50 py-0 text-sm text-white focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Level…" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Level {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger className="flex h-10 w-64 items-center gap-1.5 rounded-md border-none bg-black/50 px-3 text-sm text-white transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]">
                <span className="flex-1 truncate text-left">{tags.length > 0 ? tags.join(", ") : "Environments"}</span>
                <ChevronDown size={14} className="shrink-0 text-white/50" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-44 rounded-xl border-none bg-stone-950 p-1 shadow-lg">
                {ENVIRONMENTS.map(({ name }) => (
                  <button key={name} onClick={() => toggleEnvironment(name)} className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-stone-300 transition-colors duration-100 hover:bg-stone-900 active:bg-stone-800">
                    <span className="flex-1 text-left">{name}</span>
                    {tags.includes(name) && <Check size={16} className="shrink-0 text-stone-300" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save({ title })}
            className="font-heading w-full border-b-2 border-white/20 bg-transparent pb-1 text-5xl leading-tight font-bold text-white drop-shadow-lg transition-[border-color] duration-150 ease-out outline-none placeholder:text-white/40 focus:border-white md:text-6xl"
            placeholder="Adventure title"
          />

          <Select value={type} onValueChange={(v) => selectType(v ?? "")}>
            <SelectTrigger className="h-10! w-40 rounded-md border-none bg-black/50 py-0 text-sm text-white focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Type…" />
            </SelectTrigger>
            <SelectContent>
              {ADVENTURE_TYPES.map(({ name, icon: Icon }) => (
                <SelectItem key={name} value={name}>
                  <span className="flex items-center gap-2"><Icon size={13} />{name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="absolute top-4 right-4">
          <div className="flex h-10 items-center gap-2 rounded-md bg-black/50 px-3">
            <ImageIcon size={14} className="text-white/70" />
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              onBlur={() => save({ coverImage: coverImage || undefined })}
              placeholder="Cover image URL"
              className="w-64 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>
        </div>
      </header>
    );
  }

  // ── Read mode ─────────────────────────────────────────────────────────────────
  return (
    <header className="relative flex h-125 items-end overflow-hidden pb-12">
      {coverBg}
      <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 xl:pl-66">
        <div className="flex flex-wrap items-center gap-3">
          {adventure.level && (
            <span className="text-sm font-semibold tracking-wider text-white">
              LEVEL {adventure.level.toUpperCase()}
            </span>
          )}
          {adventure.tags.map((tag) => (
            <span key={tag} className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium tracking-[0.5px] uppercase ${getEnvStyle(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-heading text-5xl leading-tight font-bold text-white drop-shadow-lg md:text-6xl">
          {adventure.title}
        </h1>

        {adventure.type && typeEntry && (
          <div className="flex items-center gap-2 text-2xl font-medium text-stone-300">
            <typeEntry.icon size={20} />
            <span>{adventure.type}</span>
          </div>
        )}
      </div>
    </header>
  );
}
