'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useQuery } from 'convex/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { BookOpenIcon } from './BookOpenIcon';

interface CampaignCardProps {
  campaign: Doc<'campaigns'>;
  onEdit: (campaign: Doc<'campaigns'>) => void;
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

  // ResizeObserver handles both initial measurement and content changes
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
      className="rounded-[14px] overflow-clip flex flex-col bg-white [border-width:0.666667px] border-solid border-[oklch(92.8%_0.006_264.5)] [box-shadow:0px_1px_3px_#0000001A,0px_1px_2px_-1px_#0000001A]"
    >
      {/* Cover */}
      <div className="relative h-40 shrink-0 bg-[oklch(21%_0.034_264.7)]">
        <div className="flex flex-col justify-end h-full overflow-clip relative p-6">
          {campaign.coverImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${campaign.coverImage})` }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(in oklab 0deg, oklab(0% 0 0 / 90%) 0%, oklab(0% 0 0 / 40%) 50%, oklab(0% 0 0 / 0%) 100%)',
            }}
          />
          <h2 className="text-2xl leading-tight relative text-white font-heading">
            {campaign.name}
          </h2>
        </div>
        <button
          onClick={() => onEdit(campaign)}
          className="content-center rounded-lg top-1.5 right-[14px] absolute bg-[oklab(0%_0_0/30%)] p-1.5 hover:bg-[oklab(0%_0_0/50%)] transition-[background-color,transform] duration-100 active:scale-90"
          aria-label="Edit campaign"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        <p className="text-[14px] leading-[1.43] mb-4 text-[oklch(44.6%_0.030_256.8)] line-clamp-4">
          {campaign.description}
        </p>
        <h4 className="text-[12px] tracking-[0.6px] leading-[1.33] mb-2 uppercase text-[oklch(70.7%_0.022_261.3)] font-bold">
          Adventures
        </h4>
        <div className="relative">
          <div
            ref={listRef}
            onScroll={updateFade}
            className="max-h-44 overflow-y-auto"
          >
            {adventures === undefined ? (
              <p className="text-[14px] text-[oklch(70.7%_0.022_261.3)] px-3 py-2">
                Loading…
              </p>
            ) : adventures.length === 0 ? (
              <p className="text-[14px] text-[oklch(70.7%_0.022_261.3)] italic px-3 py-2">
                No adventures yet.
              </p>
            ) : (
              adventures.map((adventure) => (
                <Link
                  key={adventure._id}
                  href={`/adventure/${adventure.slug}`}
                  className="items-center flex w-full rounded-lg py-2 px-3 gap-2 hover:bg-stone-50 transition-colors"
                >
                  <BookOpenIcon />
                  <span className="text-[14px] leading-[1.43] text-[oklch(66.6%_0.179_58.3)] font-medium shrink-0">
                    {adventure.title}
                  </span>
                  {adventure.status === 'draft' && (
                    <span className="text-[12px] leading-[1.33] ml-auto text-[oklch(70.7%_0.022_261.3)] shrink-0">
                      Draft
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
          {showFade && (
            <div
              className="pointer-events-none absolute bottom-0 inset-x-0 h-16 transition-opacity duration-150"
              style={{
                backgroundImage:
                  'linear-gradient(in oklab 0deg, oklab(100% 0 0 / 90%) 0%, oklab(100% 0 0 / 40%) 50%, oklab(100% 0 0 / 0%) 100%)',
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
