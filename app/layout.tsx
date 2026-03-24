import type { Metadata } from 'next';
import './globals.css';
import { Figtree, Faculty_Glyphic } from 'next/font/google';
import { cn } from '@/lib/utils';

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const facultyGlyphic = Faculty_Glyphic({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

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
    <html lang="en" className={cn(figtree.variable, facultyGlyphic.variable)}>
      <body className="font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
