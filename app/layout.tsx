import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'D&D Vault',
  description: 'An enhanced D&D 5E adventure viewer for dungeon masters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
