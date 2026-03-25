"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  ImageIcon,
  Search,
  Skull,
  Gem,
  Shield,
  Compass,
  Swords,
  Heart,
  Crown,
  FileSearch,
  Flame,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

// ─── Presets ──────────────────────────────────────────────────────────────────

const ENVIRONMENTS = [
  { name: "Forest",      tw: "text-green-400   border-green-500" },
  { name: "Desert",      tw: "text-amber-400   border-amber-500" },
  { name: "Mountain",    tw: "text-stone-300   border-stone-400" },
  { name: "Urban",       tw: "text-blue-400    border-blue-500" },
  { name: "Underground", tw: "text-purple-400  border-purple-500" },
  { name: "Coastal",     tw: "text-cyan-400    border-cyan-500" },
  { name: "Arctic",      tw: "text-sky-300     border-sky-400" },
  { name: "Swamp",       tw: "text-emerald-400 border-emerald-500" },
  { name: "Ruins",       tw: "text-orange-400  border-orange-500" },
  { name: "Dungeon",     tw: "text-red-400     border-red-500" },
] as const;

const ADVENTURE_TYPES: { name: string; icon: LucideIcon }[] = [
  { name: "Mystery",       icon: Search },
  { name: "Horror",        icon: Skull },
  { name: "Heist",         icon: Gem },
  { name: "Escort",        icon: Shield },
  { name: "Exploration",   icon: Compass },
  { name: "Combat",        icon: Swords },
  { name: "Rescue",        icon: Heart },
  { name: "Political",     icon: Crown },
  { name: "Investigation", icon: FileSearch },
  { name: "Survival",      icon: Flame },
];

function getEnvStyle(name: string) {
  return (
    ENVIRONMENTS.find((e) => e.name === name)?.tw ?? "text-amber-400 border-amber-500"
  );
}

function getTypeIcon(name: string): LucideIcon {
  return ADVENTURE_TYPES.find((t) => t.name === name)?.icon ?? Search;
}

// ─── Level helpers ─────────────────────────────────────────────────────────────

function parseLevel(level?: string): [number, number] {
  if (!level) return [1, 1];
  const parts = level.split("-").map(Number).filter((n) => !isNaN(n) && n > 0);
  if (parts.length === 0) return [1, 1];
  if (parts.length === 1) return [parts[0], parts[0]];
  return [parts[0], parts[1]];
}

function formatLevel(min: number, max: number): string {
  return min === max ? String(min) : `${min}-${max}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

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
  const [levelMin, setLevelMin] = useState(() => parseLevel(adventure.level)[0]);
  const [levelMax, setLevelMax] = useState(() => parseLevel(adventure.level)[1]);

  useEffect(() => {
    setTitle(adventure.title);
    setType(adventure.type ?? "");
    setTags(adventure.tags);
    setCoverImage(adventure.coverImage ?? "");
    const [min, max] = parseLevel(adventure.level);
    setLevelMin(min);
    setLevelMax(max);
  }, [adventure]);

  const save = (patch: Record<string, unknown>) => {
    updateAdventure({ id: adventure._id, ...patch } as Parameters<typeof updateAdventure>[0]);
  };

  const saveLevel = (min: number, max: number) => save({ level: formatLevel(min, max) });

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

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 440], [500, 0]);
  const metaOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const titleOpacity = useTransform(scrollY, [80, 280], [1, 0]);

  const TypeIcon = getTypeIcon(type);

  // ── Edit mode ────────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <header className="relative h-125 flex items-end pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {coverImage ? (
            <Image src={coverImage} alt="" fill unoptimized className="object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-950/10 to-gray-950" />
          )}
        </div>
        <div className="absolute inset-0 z-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />

        {/* Cover image URL */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 bg-black/60 rounded-lg px-3 py-2 backdrop-blur-sm">
            <ImageIcon size={14} className="text-white/70" />
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              onBlur={() => save({ coverImage: coverImage || undefined })}
              placeholder="Cover image URL"
              className="bg-transparent text-white text-sm outline-none placeholder:text-white/40 w-64"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col gap-4">
          {/* Level + Environments */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Level range */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Lvl</span>
              <input
                type="number"
                min={1}
                max={20}
                value={levelMin}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(20, Number(e.target.value)));
                  setLevelMin(v);
                  if (v > levelMax) setLevelMax(v);
                }}
                onBlur={() => saveLevel(levelMin, levelMax)}
                className="w-8 bg-white/10 text-white text-xs text-center rounded px-1 py-0.5 outline-none focus:bg-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-white/40 text-xs">–</span>
              <input
                type="number"
                min={levelMin}
                max={20}
                value={levelMax}
                onChange={(e) => {
                  const v = Math.max(levelMin, Math.min(20, Number(e.target.value)));
                  setLevelMax(v);
                }}
                onBlur={() => saveLevel(levelMin, levelMax)}
                className="w-8 bg-white/10 text-white text-xs text-center rounded px-1 py-0.5 outline-none focus:bg-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            {/* Environments */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {ENVIRONMENTS.map(({ name, tw }) => (
                <button
                  key={name}
                  onClick={() => toggleEnvironment(name)}
                  className={`px-2 py-0.5 rounded-sm text-xs font-bold tracking-widest uppercase border transition-colors duration-100 ${
                    tags.includes(name)
                      ? tw
                      : "border-white/20 text-white/30 hover:text-white/60 hover:border-white/40"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save({ title })}
            className="font-heading text-5xl md:text-7xl text-white font-bold leading-tight drop-shadow-lg bg-transparent outline-none border-b-2 border-white/30 focus:border-white w-full pb-1 placeholder:text-white/40"
            placeholder="Adventure title"
          />

          {/* Type */}
          <Select value={type || undefined} onValueChange={(v) => selectType(v ?? "")}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white text-sm focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Adventure type…" />
            </SelectTrigger>
            <SelectContent>
              {ADVENTURE_TYPES.map(({ name, icon: Icon }) => (
                <SelectItem key={name} value={name}>
                  <span className="flex items-center gap-2">
                    <Icon size={13} />
                    {name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>
    );
  }

  // ── Read mode ────────────────────────────────────────────────────────────────
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 overflow-hidden"
      style={{ height: headerHeight }}
    >
      <div className="absolute inset-0 z-0">
        {coverImage ? (
          <Image src={coverImage} alt="" fill unoptimized className="object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-gray-950/10 to-gray-950" />
        )}
      </div>
      <div className="absolute inset-0 z-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="max-w-6xl mx-auto px-6 relative" style={{ height: 500 }}>
          {/* Meta row */}
          <motion.div
            style={{ opacity: metaOpacity, bottom: 192 }}
            className="absolute left-6 xl:left-66 right-6 flex items-center gap-3 flex-wrap"
          >
            {adventure.level && (
              <span className="text-white font-semibold tracking-wider text-sm">
                LEVEL {adventure.level.toUpperCase()}
              </span>
            )}
            {adventure.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 border text-xs font-bold tracking-widest uppercase rounded-sm ${getEnvStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Title */}
          <motion.h1
            style={{ opacity: titleOpacity, bottom: 88 }}
            className="absolute left-6 xl:left-66 right-6 font-heading text-5xl md:text-6xl text-white font-bold leading-tight drop-shadow-lg"
          >
            {adventure.title}
          </motion.h1>

          {/* Type row */}
          {adventure.type && (
            <motion.div
              style={{ opacity: metaOpacity, bottom: 48 }}
              className="absolute left-6 xl:left-66 right-6 flex items-center gap-2 text-gray-300 text-lg"
            >
              <TypeIcon size={20} />
              <span>{adventure.type}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
