"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { AnimatePresence } from "motion/react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { CampaignFormModal } from "@/components/campaigns/CampaignFormModal";

export default function CampaignsPage() {
  const campaigns = useQuery(api.campaigns.list);
  const [editingCampaign, setEditingCampaign] =
    useState<Doc<"campaigns"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function handleClose() {
    setEditingCampaign(null);
    setIsCreating(false);
  }

  return (
    <>
      <div className="flex h-full flex-col gap-6 rounded-lg bg-olive-50/95 px-40 py-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading leading-tightest text-4xl text-olive-900/25">
            Campaigns
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-olive-900/15 bg-olive-900/5 px-4 py-2 text-sm font-medium text-olive-500 shadow-xs transition-colors duration-150 hover:bg-olive-900/10"
            >
              New Campaign
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {campaigns === undefined ? (
            <div className="text-sm text-stone-400">Loading…</div>
          ) : campaigns.length === 0 ? (
            <div className="text-sm text-stone-500 italic">
              No campaigns yet. Create one to get started.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {campaigns.map((campaign) =>
                editingCampaign?._id === campaign._id ? null : (
                  <CampaignCard
                    key={campaign._id}
                    campaign={campaign}
                    onEdit={setEditingCampaign}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(isCreating || editingCampaign !== null) && (
          <CampaignFormModal
            key={editingCampaign?._id ?? "new"}
            campaign={editingCampaign ?? undefined}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
