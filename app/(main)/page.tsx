'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
    <>
      <div className="h-screen overflow-hidden bg-stone-200 p-8">
        <div className="flex h-full flex-col gap-6 rounded-4xl bg-white pt-6 pr-6 pb-10 pl-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-[30px] leading-[1.2] text-[oklch(21%_0.034_264.7)]">
              Campaigns
            </h1>
            <button
              onClick={() => setIsCreating(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-taupe-950 py-2 pr-2.5 pl-3 text-[14px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-stone-800 active:scale-[0.97]"
            >
              <Plus size={16} strokeWidth={1.5} className="text-[#A6A09B]" />
              New Campaign
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {campaigns === undefined ? (
              <div className="text-sm text-stone-400">Loading…</div>
            ) : campaigns.length === 0 ? (
              <div className="text-sm text-stone-500 italic">
                No campaigns yet. Create one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                {campaigns.map((campaign) =>
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
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(isCreating || editingCampaign !== null) && (
          <CampaignFormModal
            key={editingCampaign?._id ?? 'new'}
            campaign={editingCampaign ?? undefined}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
