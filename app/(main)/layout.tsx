import Sidebar from '@/components/layout/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 relative">
        {children}
      </main>
    </div>
  );
}
