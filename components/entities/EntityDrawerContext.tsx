'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Doc } from '@/convex/_generated/dataModel';

interface EntityDrawerContextValue {
  entity: Doc<'entities'> | null;
  open: (entity: Doc<'entities'>) => void;
  close: () => void;
}

const EntityDrawerContext = createContext<EntityDrawerContextValue | null>(null);

export function EntityDrawerProvider({ children }: { children: ReactNode }) {
  const [entity, setEntity] = useState<Doc<'entities'> | null>(null);

  const open = useCallback((e: Doc<'entities'>) => setEntity(e), []);
  const close = useCallback(() => setEntity(null), []);

  return (
    <EntityDrawerContext.Provider value={{ entity, open, close }}>
      {children}
    </EntityDrawerContext.Provider>
  );
}

/** Returns the drawer controller. Safe to call outside the provider — returns a no-op. */
export function useEntityDrawer() {
  const ctx = useContext(EntityDrawerContext);
  if (!ctx) {
    return {
      entity: null as Doc<'entities'> | null,
      open: (_entity: Doc<'entities'>) => {},
      close: () => {},
    };
  }
  return ctx;
}
