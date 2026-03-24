import FloatingToolbar from '@/components/layout/FloatingToolbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <FloatingToolbar />
      {children}
    </div>
  );
}
