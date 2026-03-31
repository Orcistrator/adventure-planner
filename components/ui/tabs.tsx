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
      className={`flex h-9 items-center gap-1 overflow-clip rounded-sm bg-olive-900/5 ${className ?? ""}`}
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
      className={`flex h-full cursor-pointer items-center justify-center gap-2 px-4 text-sm font-medium text-olive-500 transition-all duration-150 data-[state=active]:bg-olive-900/10 data-[state=active]:text-olive-700 ${className ?? ""}`}
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
