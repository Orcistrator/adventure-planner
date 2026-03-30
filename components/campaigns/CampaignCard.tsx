"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { useRef, useState, useEffect, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Pencil } from "lucide-react";
import { getEnvStyle } from "@/lib/adventure-presets";

interface CampaignCardProps {
  campaign: Doc<"campaigns">;
  onEdit: (campaign: Doc<"campaigns">) => void;
}

export function CampaignCard({ campaign, onEdit }: CampaignCardProps) {
  const adventures = useQuery(api.campaignAdventures.listForCampaign, {
    campaignId: campaign._id,
  });

  const listRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  const updateFade = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setShowFade(isScrollable && !isAtBottom);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateFade);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateFade]);

  return (
    <motion.div
      layoutId={`campaign-card-${campaign._id}`}
      className="group/card flex flex-row overflow-clip rounded-3xl border border-stone-300 p-2"
    >
      {/* Left: image + title + description */}
      <div className="flex w-[45%] shrink-0 flex-col">
        {/* Cover */}
        <div className="relative h-36 overflow-clip rounded-xl bg-stone-200">
          {campaign.coverImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${campaign.coverImage})` }}
            />
          )}
          <button
            onClick={() => onEdit(campaign)}
            className="absolute top-2 right-2 cursor-pointer content-center rounded-lg bg-stone-950/50 p-1.5 transition duration-100 hover:bg-stone-950/65"
            aria-label="Edit campaign"
          >
            <Pencil size={14} className="text-white" />
          </button>
        </div>

        {/* Title + description */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h2 className="font-heading text-lg leading-tight text-stone-950">
            {campaign.name}
          </h2>
          <p className="text-md line-clamp-4 text-stone-500">
            {campaign.description}
          </p>
        </div>
      </div>

      {/* Right: adventures list */}
      <div className="flex flex-1 flex-col px-6 py-3">
        <h4 className="mb-2 text-xs font-semibold tracking-wider text-stone-400 uppercase">
          Adventures
        </h4>
        <div className="relative flex-1">
          <div
            ref={listRef}
            onScroll={updateFade}
            className="absolute inset-0 overflow-y-auto"
          >
            {adventures === undefined ? (
              <p className="text-xs text-stone-400 italic">Loading…</p>
            ) : adventures.length === 0 ? (
              <p className="text-xs text-stone-400 italic">
                No adventures yet.
              </p>
            ) : (
              adventures.map((adventure) => (
                <Link
                  key={adventure._id}
                  href={`/adventure/${adventure.slug}`}
                  className="group flex w-full items-center gap-2 rounded-md p-2 transition-colors hover:bg-stone-100"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="text-md shrink-0 font-medium text-gray-950">
                      {adventure.title}
                    </span>
                    {adventure.level && (
                      <span className="shrink-0 text-xs font-semibold tracking-[0.6px] text-stone-400 uppercase">
                        Lv {adventure.level}
                      </span>
                    )}
                    {(adventure.type || adventure.tags.length > 0) && (
                      <div className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-400 ease-out group-hover:grid-cols-[1fr]">
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 pl-1">
                            {adventure.type && (
                              <span className="shrink-0 text-xs font-semibold text-stone-400 uppercase">
                                {adventure.type}
                              </span>
                            )}
                            {adventure.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex h-4 shrink-0 items-center rounded-full px-2 text-[10px] font-medium uppercase ${getEnvStyle(tag)}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
