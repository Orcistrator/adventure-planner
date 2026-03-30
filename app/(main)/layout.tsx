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
        <div className="relative min-h-screen">
          <FloatingToolbar />
          {children}
        </div>
        <EntityDrawer />
        <GlobalCommandMenu />
      </EntityDrawerProvider>
    </CommandMenuProvider>
  );
}
