import FloatingToolbar from '@/components/layout/FloatingToolbar';
import { EntityDrawerProvider } from '@/components/entities/EntityDrawerContext';
import { EntityDrawer } from '@/components/entities/EntityDrawer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntityDrawerProvider>
      <div className="relative min-h-screen">
        <FloatingToolbar />
        {children}
      </div>
      <EntityDrawer />
    </EntityDrawerProvider>
  );
}
