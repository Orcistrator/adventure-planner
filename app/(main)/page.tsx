'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { AnimatePresence } from 'motion/react';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { CampaignFormModal } from '@/components/campaigns/CampaignFormModal';

export default function CampaignsPage() {
  const campaigns = useQuery(api.campaigns.list);
  const [editingCampaign, setEditingCampaign] = useState<Doc<'campaigns'> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function handleClose() {
    setEditingCampaign(null);
    setIsCreating(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[30px] leading-[1.2] font-heading text-[oklch(21%_0.034_264.7)]">
          Campaigns
        </h1>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg py-2 px-4 bg-stone-950 text-white text-[14px] font-medium hover:bg-stone-800 transition-colors"
        >
          + New Campaign
        </button>
      </div>

      {campaigns === undefined ? (
        <div className="text-sm text-stone-400">Loading…</div>
      ) : campaigns.length === 0 ? (
        <div className="text-sm text-stone-500 italic">
          No campaigns yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {campaigns.map((campaign) =>
            // Remove the card being edited so its layoutId is free for the modal to animate from
            editingCampaign?._id === campaign._id ? null : (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onEdit={setEditingCampaign}
              />
            )
          )}
        </div>
      )}

      <AnimatePresence>
        {(isCreating || editingCampaign !== null) && (
          <CampaignFormModal
            key={editingCampaign?._id ?? 'new'}
            campaign={editingCampaign ?? undefined}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
