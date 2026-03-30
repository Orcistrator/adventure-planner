'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CommandMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMenu: () => void;
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openMenu = useCallback(() => setOpen(true), []);

  return (
    <CommandMenuContext.Provider value={{ open, setOpen, openMenu }}>
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenu() {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) throw new Error('useCommandMenu must be used within CommandMenuProvider');
  return ctx;
}
