'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { Home, BookOpen, Box } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { useEntityDrawer } from '@/components/entities/EntityDrawerContext';
import { useCommandMenu } from './CommandMenuContext';

const NAV_PAGES = [
  { label: 'Campaigns', href: '/', icon: Home },
  { label: 'Adventures', href: '/adventures', icon: BookOpen },
  { label: 'Entities', href: '/entities', icon: Box },
];

function entityShortcut(entity: Doc<'entities'>): string | null {
  switch (entity.type) {
    case 'monster':  return entity.stats?.cr ? `CR ${entity.stats.cr}` : null;
    case 'item':     return entity.rarity ?? null;
    case 'character': return entity.alignment ?? null;
    case 'location': return entity.locationType ?? null;
  }
}

export function GlobalCommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const router = useRouter();
  const pathname = usePathname();
  const { open: openDrawer } = useEntityDrawer();

  const navPages = NAV_PAGES.filter((p) => p.href !== pathname);

  const skip = open ? {} : 'skip';
  const adventures = useQuery(api.adventures.list, skip);
  const entities = useQuery(api.entities.list, skip);
  const campaigns = useQuery(api.campaigns.list, skip);
  const campaignLinks = useQuery(api.campaignAdventures.listAll, skip);

  const adventureCountByCampaign = campaignLinks?.reduce<Record<string, number>>(
    (acc, link) => {
      acc[link.campaignId] = (acc[link.campaignId] ?? 0) + 1;
      return acc;
    },
    {}
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setOpen]);

  function select(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search adventures, entities, campaigns…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {navPages.length > 0 && (
            <CommandGroup heading="Pages">
              {navPages.map(({ label, href, icon: Icon }) => (
                <CommandItem
                  key={href}
                  value={label}
                  onSelect={() => select(() => router.push(href))}
                >
                  <Icon size={14} className="text-stone-400" />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {adventures && adventures.length > 0 && (
            <CommandGroup heading="Adventures">
              {adventures.map((a) => (
                <CommandItem
                  key={a._id}
                  value={a.title}
                  onSelect={() => select(() => router.push(`/adventure/${a.slug}`))}
                >
                  {a.title}
                  {a.type && <CommandShortcut>{a.type}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {entities && entities.length > 0 && (
            <CommandGroup heading="Entities">
              {entities.map((e) => {
                const shortcut = entityShortcut(e);
                return (
                  <CommandItem
                    key={e._id}
                    value={e.name}
                    onSelect={() => select(() => openDrawer(e))}
                  >
                    {e.name}
                    {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {campaigns && campaigns.length > 0 && (
            <CommandGroup heading="Campaigns">
              {campaigns.map((c) => {
                const count = adventureCountByCampaign?.[c._id];
                return (
                  <CommandItem
                    key={c._id}
                    value={c.name}
                    onSelect={() => select(() => router.push('/'))}
                  >
                    {c.name}
                    {count != null && (
                      <CommandShortcut>
                        {count} {count === 1 ? 'adventure' : 'adventures'}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
