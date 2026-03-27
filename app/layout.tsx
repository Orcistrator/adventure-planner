import type { Metadata } from "next";
import "./globals.css";
import { Figtree, Faculty_Glyphic } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { Agentation } from "agentation";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const facultyGlyphic = Faculty_Glyphic({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Orcistrator Adventurekit",
  description: "An enhanced fantasy adventure builder for dungeon masters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(figtree.variable, facultyGlyphic.variable)}>
      <body className="font-sans selection:bg-stone-100 selection:text-stone-950">
        <ConvexClientProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ConvexClientProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
