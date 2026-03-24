'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BookOpen } from 'lucide-react';

export default function AdventuresPage() {
  const adventures = useQuery(api.adventures.list);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Adventures</h1>

      {adventures === undefined ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : adventures.length === 0 ? (
        <p className="text-gray-400 text-sm">No adventures yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {adventures.map((adventure) => (
            <li key={adventure._id}>
              <Link
                href={`/adventure/${adventure.slug}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-[background-color,transform] duration-150 active:scale-[0.99] group"
              >
                <BookOpen size={16} className="text-gray-400 shrink-0" />
                <span className="font-medium text-gray-900">{adventure.title}</span>
                {adventure.level && (
                  <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase ml-1">
                    Lv {adventure.level}
                  </span>
                )}
                {adventure.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs border border-gray-200 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold"
                  >
                    {tag}
                  </span>
                ))}
                <span className="ml-auto text-xs text-gray-300 capitalize">{adventure.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
