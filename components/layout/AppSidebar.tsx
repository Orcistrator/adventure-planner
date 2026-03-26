'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, Map, BookOpen } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Campaigns', icon: Map },
  { href: '/entities', label: 'Entities', icon: Library },
] as const;

// Placeholder — will be driven by Convex once wired up
const recentAdventures = [
  { href: '/adventure/cistern-of-echoed-names', label: 'The Cistern of Echoed Names' },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Library className="text-indigo-400 size-5 shrink-0" />
          <span className="font-heading font-bold text-lg group-data-[collapsible=icon]:hidden">
            D&amp;D Vault
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {recentAdventures.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Adventures</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/adventure/cistern-of-echoed-names" />}
                    isActive={pathname.startsWith('/adventure')}
                    tooltip="Adventures"
                  >
                    <BookOpen />
                    <span>Recent</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {recentAdventures.map((adventure) => (
                      <SidebarMenuSubItem key={adventure.href}>
                        <SidebarMenuSubButton
                          render={<Link href={adventure.href} />}
                          isActive={pathname === adventure.href}
                        >
                          <span>{adventure.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:justify-center">
          <span className="text-xs text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
            v0.1
          </span>
          <SidebarTrigger />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
