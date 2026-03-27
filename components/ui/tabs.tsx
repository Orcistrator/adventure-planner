"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={className} {...props} />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={`flex h-9 items-center rounded-lg bg-[oklch(97%_0.001_106.4)] p-0.5 ${className ?? ""}`}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={`[border:0.667px_solid_transparent] flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-[14px] font-medium text-stone-400 transition-all duration-150 data-[state=active]:bg-white data-[state=active]:text-stone-950 data-[state=active]:shadow-[0_1px_2px_0_oklch(0%_0_0/8%)] ${className ?? ""}`}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={className}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
