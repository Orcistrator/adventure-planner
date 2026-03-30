'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { X, Plus, ChevronsUpDown } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { BookOpenIcon } from './BookOpenIcon';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';


interface Props {
  campaign?: Doc<'campaigns'>;
  onClose: () => void;
}

export function CampaignFormModal({ campaign, onClose }: Props) {
  const [name, setName] = useState(campaign?.name ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');
  const [coverImage, setCoverImage] = useState(campaign?.coverImage ?? '');
  const [saving, setSaving] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [search, setSearch] = useState('');

  // For new campaigns: queue up links/creates to apply after campaign is saved
  const [toAdd, setToAdd] = useState<Id<'adventures'>[]>([]);
  const [toCreate, setToCreate] = useState<string[]>([]);
  // For edit campaigns: track removals too
  const [toRemove, setToRemove] = useState<Id<'adventures'>[]>([]);

  const createCampaign = useMutation(api.campaigns.create);
  const updateCampaign = useMutation(api.campaigns.update);
  const createAdventure = useMutation(api.adventures.create);
  const addLink = useMutation(api.campaignAdventures.add);
  const removeLink = useMutation(api.campaignAdventures.remove);

  const allAdventures = useQuery(api.adventures.list);
  const existingLinks = useQuery(
    api.campaignAdventures.listForCampaign,
    campaign ? { campaignId: campaign._id } : 'skip'
  );

  // Adventures currently shown in this campaign's list (existing minus removals plus pending adds)
  const linkedIds = useMemo(() => {
    const base = new Set((existingLinks ?? []).map((a) => a._id));
    toRemove.forEach((id) => base.delete(id));
    toAdd.forEach((id) => base.add(id));
    return base;
  }, [existingLinks, toRemove, toAdd]);

  const linkedAdventures = useMemo(() => {
    const existing = (existingLinks ?? []).filter((a) => !toRemove.includes(a._id));
    const existingIds = new Set(existing.map((a) => a._id));
    const pending = (allAdventures ?? []).filter((a) => toAdd.includes(a._id) && !existingIds.has(a._id));
    return [...existing, ...pending];
  }, [existingLinks, allAdventures, toRemove, toAdd]);

  // Adventures available to add (not already linked, not pending create)
  const availableAdventures = useMemo(() => {
    return (allAdventures ?? []).filter((a) => !linkedIds.has(a._id));
  }, [allAdventures, linkedIds]);

  const trimmedSearch = search.trim();
  const canCreate =
    trimmedSearch.length > 0 &&
    !toCreate.includes(trimmedSearch) &&
    !(allAdventures ?? []).some(
      (a) => a.title.toLowerCase() === trimmedSearch.toLowerCase()
    );

  function selectExisting(adventure: Doc<'adventures'>) {
    setToAdd((prev) => [...prev, adventure._id]);
    setSearch('');
    setComboOpen(false);
  }

  function queueCreate(title: string) {
    setToCreate((prev) => [...prev, title]);
    setSearch('');
    setComboOpen(false);
  }

  function removeAdventure(id: Id<'adventures'>) {
    if (toAdd.includes(id)) {
      setToAdd((prev) => prev.filter((x) => x !== id));
    } else {
      setToRemove((prev) => [...prev, id]);
    }
  }

  function removePendingCreate(title: string) {
    setToCreate((prev) => prev.filter((t) => t !== title));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let campaignId = campaign?._id;

      if (campaign) {
        await updateCampaign({
          id: campaign._id,
          name,
          description,
          coverImage: coverImage || undefined,
        });
        await Promise.all(
          toRemove.map((id) => removeLink({ campaignId: campaign._id, adventureId: id }))
        );
      } else {
        campaignId = await createCampaign({
          name,
          description,
          coverImage: coverImage || undefined,
        });
      }

      await Promise.all(
        toAdd.map((id) => addLink({ campaignId: campaignId!, adventureId: id }))
      );
      for (const title of toCreate) {
        const adventureId = await createAdventure({ title, slug: slugify(title), tags: [] });
        await addLink({ campaignId: campaignId!, adventureId });
      }

      onClose();
    } finally {
      setSaving(false);
    }
  }

  const hasAdventures = linkedAdventures.length > 0 || toCreate.length > 0;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <motion.div
          layoutId={campaign ? `campaign-card-${campaign._id}` : undefined}
          initial={!campaign ? { opacity: 0, scale: 0.95 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          exit={!campaign ? { opacity: 0, scale: 0.95 } : undefined}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          className="rounded-[14px] overflow-clip flex flex-col bg-white [border-width:0.666667px] border-solid border-[oklch(92.8%_0.006_264.5)] [box-shadow:0px_8px_32px_#00000033,0px_1px_3px_#0000001A] w-full max-w-md pointer-events-auto max-h-[90vh]"
        >
          {/* Cover preview */}
          <div className="relative h-40 shrink-0 bg-[oklch(21%_0.034_264.7)]">
            <div className="flex flex-col justify-end h-full overflow-clip relative p-6">
              {coverImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${coverImage})` }}
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
                {name || (campaign ? campaign.name : 'New Campaign')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="content-center rounded-lg top-1.5 right-[14px] absolute bg-[oklab(0%_0_0/30%)] p-1.5 hover:bg-[oklab(0%_0_0/50%)] transition-colors"
              aria-label="Close"
            >
              <X size={14} color="white" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable form body */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] tracking-[0.6px] uppercase text-[oklch(70.7%_0.022_261.3)] font-bold">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="Campaign name"
                className="w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none focus:border-stone-400 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] tracking-[0.6px] uppercase text-[oklch(70.7%_0.022_261.3)] font-bold">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="What is this campaign about?"
                className="w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none focus:border-stone-400 transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] tracking-[0.6px] uppercase text-[oklch(70.7%_0.022_261.3)] font-bold">
                Cover Image URL{' '}
                <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none focus:border-stone-400 transition-colors"
              />
            </div>

            {/* Adventures */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] tracking-[0.6px] uppercase text-[oklch(70.7%_0.022_261.3)] font-bold">
                Adventures
              </label>

              {/* Linked adventures list */}
              {hasAdventures && (
                <div className="flex flex-col rounded-lg border border-[oklch(92.8%_0.006_264.5)] overflow-clip">
                  <AnimatePresence initial={false}>
                    {linkedAdventures.map((adventure) => (
                      <motion.div
                        key={adventure._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 px-3 py-2 border-b border-[oklch(92.8%_0.006_264.5)] last:border-b-0"
                      >
                        <BookOpenIcon size={14} />
                        <span className="text-[14px] text-[oklch(66.6%_0.179_58.3)] font-medium flex-1">
                          {adventure.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAdventure(adventure._id)}
                          className="rounded p-0.5 text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 hover:bg-stone-100 transition-colors ml-1"
                          aria-label="Remove"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}

                    {/* Pending new adventures (not yet saved) */}
                    {toCreate.map((title, i) => (
                      <motion.div
                        key={`create-${i}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-50/60 border-b border-[oklch(92.8%_0.006_264.5)] last:border-b-0"
                      >
                        <BookOpenIcon size={14} />
                        <span className="text-[14px] text-[oklch(66.6%_0.179_58.3)] font-medium flex-1">
                          {title}
                        </span>
                        <span className="text-[12px] text-[oklch(70.7%_0.022_261.3)] shrink-0">
                          New
                        </span>
                        <button
                          type="button"
                          onClick={() => removePendingCreate(title)}
                          className="rounded p-0.5 text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 hover:bg-stone-100 transition-colors ml-1"
                          aria-label="Remove"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Combobox */}
              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <PopoverTrigger className="flex items-center justify-between w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(70.7%_0.022_261.3)] hover:bg-stone-50 transition-colors">
                  <span className="flex items-center gap-2">
                    <Plus size={14} />
                    Add adventure
                  </span>
                  <ChevronsUpDown size={14} className="opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search or create…"
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandList>
                      {availableAdventures.length > 0 && (
                        <CommandGroup heading="Existing adventures">
                          {availableAdventures.map((adventure) => (
                            <CommandItem
                              key={adventure._id}
                              value={adventure.title}
                              onSelect={() => selectExisting(adventure)}
                              className="flex items-center gap-2"
                            >
                              <BookOpenIcon size={14} />
                              <span className="flex-1">{adventure.title}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}

                      {canCreate && (
                        <>
                          {availableAdventures.length > 0 && <CommandSeparator />}
                          <CommandGroup heading="Create new">
                            <CommandItem
                              value={`create:${trimmedSearch}`}
                              onSelect={() => queueCreate(trimmedSearch)}
                              className="flex items-center gap-2"
                            >
                              <Plus size={14} className="text-[oklch(70.7%_0.022_261.3)]" />
                              <span>
                                Create{' '}
                                <span className="font-medium text-[oklch(21%_0.034_264.7)]">
                                  &ldquo;{trimmedSearch}&rdquo;
                                </span>
                              </span>
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}

                      {!canCreate && availableAdventures.length === 0 && (
                        <CommandEmpty>
                          {search.trim()
                            ? 'Already added.'
                            : 'No adventures yet.'}
                        </CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg py-2 px-4 text-[14px] font-medium text-[oklch(44.6%_0.030_256.8)] hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg py-2 px-4 bg-stone-950 text-white text-[14px] font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : campaign ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
