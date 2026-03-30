"use client";

import { useState } from "react";
import { ChevronDown, Grid2x2Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntitySummaryCard } from "@/components/entities/EntitySummaryCard";
import { MonsterFormModal } from "@/components/entities/MonsterFormModal";
import { NpcFormModal } from "@/components/entities/NpcFormModal";
import { ItemFormModal } from "@/components/entities/ItemFormModal";
import { LocationFormModal } from "@/components/entities/LocationFormModal";

const TABS = [
  { key: "all", label: "All" },
  { key: "monster", label: "Monsters" },
  { key: "character", label: "NPCs" },
  { key: "item", label: "Items" },
  { key: "location", label: "Locations" },
] as const;

type TabKey = (typeof TABS)[number]["key"];
type EntityType = "monster" | "character" | "item" | "location";

const ADD_OPTIONS: { type: EntityType; label: string }[] = [
  { type: "monster", label: "Monster" },
  { type: "character", label: "NPC" },
  { type: "item", label: "Item" },
  { type: "location", label: "Location" },
];

export default function EntitiesPage() {
  const entities = useQuery(api.entities.list, {});
  const removeEntity = useMutation(api.entities.remove);

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [activeModal, setActiveModal] = useState<EntityType | null>(null);
  const [editing, setEditing] = useState<Doc<"entities"> | undefined>(
    undefined,
  );

  const filtered =
    entities === undefined
      ? undefined
      : activeTab === "all"
        ? entities
        : entities.filter((e) => e.type === activeTab);

  function openCreate(type: EntityType) {
    setEditing(undefined);
    setActiveModal(type);
  }

  function openEdit(entity: Doc<"entities">) {
    setEditing(entity);
    setActiveModal(entity.type as EntityType);
  }

  function closeModal() {
    setActiveModal(null);
    setEditing(undefined);
  }

  async function handleDelete() {
    if (!editing) return;
    if (confirm(`Delete "${editing.name}"? This cannot be undone.`)) {
      await removeEntity({ id: editing._id });
      closeModal();
    }
  }

  const counts =
    entities === undefined
      ? {}
      : entities.reduce<Record<string, number>>((acc, e) => {
          acc[e.type] = (acc[e.type] ?? 0) + 1;
          return acc;
        }, {});

  const allCount = entities?.length ?? 0;

  return (
    <>
      <div className="h-screen overflow-hidden bg-stone-200 p-2">
        <div className="flex h-full flex-col gap-6 rounded-lg bg-white p-32">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="font-heading leading-tightest text-4xl text-stone-300">
              Entities
            </h1>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-md bg-stone-900 py-2 pr-2 pl-3 text-sm font-medium text-stone-200 transition-colors duration-150 hover:bg-stone-800">
                <Grid2x2Plus
                  size={16}
                  className="text-stone-400"
                  strokeWidth={1.5}
                />
                Add Entity
                <ChevronDown
                  size={16}
                  className="text-stone-200"
                  strokeWidth={1.5}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 rounded-md bg-stone-950 p-1 shadow-xl ring-0"
              >
                {ADD_OPTIONS.map(({ type, label }) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => openCreate(type)}
                    className="cursor-pointer rounded-sm p-2 text-sm text-stone-300 focus:bg-stone-800 focus:text-stone-100"
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabKey)}
          >
            <TabsList className="w-fit shrink-0 self-start">
              {TABS.map((tab) => {
                const count =
                  tab.key === "all" ? allCount : (counts[tab.key] ?? 0);
                const isActive = activeTab === tab.key;
                return (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    {tab.label}
                    {isActive && count > 0 && (
                      <span className="rounded-full text-xs font-medium text-stone-400">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto">
            {filtered === undefined ? (
              <div className="text-sm text-stone-400">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-stone-500 italic">
                {activeTab === "all"
                  ? "No entities yet."
                  : `No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} yet.`}
              </div>
            ) : (
              <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                <AnimatePresence initial={false}>
                  {filtered.map((entity) => (
                    <motion.div
                      key={entity._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <EntitySummaryCard
                        entity={entity}
                        onEdit={() => openEdit(entity)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal === "monster" && (
          <MonsterFormModal
            key="monster"
            entity={editing}
            onClose={closeModal}
            onDelete={editing ? handleDelete : undefined}
          />
        )}
        {activeModal === "character" && (
          <NpcFormModal
            key="npc"
            entity={editing}
            onClose={closeModal}
            onDelete={editing ? handleDelete : undefined}
          />
        )}
        {activeModal === "item" && (
          <ItemFormModal
            key="item"
            entity={editing}
            onClose={closeModal}
            onDelete={editing ? handleDelete : undefined}
          />
        )}
        {activeModal === "location" && (
          <LocationFormModal
            key="location"
            entity={editing}
            onClose={closeModal}
            onDelete={editing ? handleDelete : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}
