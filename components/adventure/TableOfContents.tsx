"use client";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: TocEntry[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent, anchorId: string) => {
    e.preventDefault();
    document
      .getElementById(anchorId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const indentClass: Record<number, string> = {
    1: "pl-0 text-sm font-semibold text-gray-700 hover:text-indigo-600",
    2: "pl-0 text-sm font-semibold text-gray-700 hover:text-indigo-600",
    3: "pl-3 text-xs text-gray-500 hover:text-indigo-500",
  };

  return (
    <div className="flex flex-col gap-3">
      {headings.map((h) => {
        const anchorId = h.text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        return (
          <a
            key={h.id}
            href={`#${anchorId}`}
            onClick={(e) => handleClick(e, anchorId)}
            className={`block leading-snug py-0.5 transition-colors duration-100 truncate ${indentClass[h.level] ?? indentClass[3]}`}
          >
            {h.text}
          </a>
        );
      })}
    </div>
  );
}
