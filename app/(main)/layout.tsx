import FloatingToolbar from '@/components/layout/FloatingToolbar';
import { EntityDrawerProvider } from '@/components/entities/EntityDrawerContext';
import { EntityDrawer } from '@/components/entities/EntityDrawer';
import { CommandMenuProvider } from '@/components/layout/CommandMenuContext';
import { GlobalCommandMenu } from '@/components/layout/GlobalCommandMenu';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommandMenuProvider>
      <EntityDrawerProvider>
        <FloatingToolbar />
        <GlobalCommandMenu />
        <div className="flex h-screen flex-col gap-2 bg-stone-200 p-2">
          <div className="min-h-0 flex-1 overflow-hidden">
            {children}
          </div>
          <EntityDrawer />
        </div>
      </EntityDrawerProvider>
    </CommandMenuProvider>
  );
}
