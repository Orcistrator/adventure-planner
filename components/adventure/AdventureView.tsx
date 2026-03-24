'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Pencil, Eye } from 'lucide-react';
import AdventureHeader from './AdventureHeader';
import BlockList from './BlockList';

interface AdventureViewProps {
  slug: string;
}

export default function AdventureView({ slug }: AdventureViewProps) {
  const adventure = useQuery(api.adventures.getBySlug, slug ? { slug } : 'skip');
  const blocks = useQuery(
    api.blocks.listByAdventure,
    adventure ? { adventureId: adventure._id } : 'skip'
  );
  const [isEditing, setIsEditing] = useState(false);

  // Still loading the adventure itself
  if (adventure === undefined) {
    return (
      <div className="min-h-full bg-white">
        <div className="h-[60vh] min-h-[400px] bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (adventure === null) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <p className="text-gray-500">No adventure found for &ldquo;{slug}&rdquo;.</p>
      </div>
    );
  }

  // Adventure loaded, waiting on blocks
  if (blocks === undefined) {
    return (
      <div className="min-h-full bg-white">
        <div className="h-[60vh] min-h-[400px] bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white pb-24">
      <AdventureHeader adventure={adventure} isEditing={isEditing} />

      <main className="bg-white pb-24">
        <BlockList adventureId={adventure._id} blocks={blocks ?? []} isEditing={isEditing} />
      </main>

      {/* Edit toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm shadow-lg transition-colors ${
            isEditing
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {isEditing ? (
            <>
              <Eye size={16} /> Preview
            </>
          ) : (
            <>
              <Pencil size={16} /> Edit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
