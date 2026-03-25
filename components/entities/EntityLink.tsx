'use client';

import { useState } from 'react';
import { Shield, Heart } from 'lucide-react';
import Image from 'next/image';
import { ENTITIES } from '@/lib/data';

const typeColors = {
  monster: 'bg-red-100 text-red-800 border-red-200',
  character: 'bg-blue-100 text-blue-800 border-blue-200',
  item: 'bg-amber-100 text-amber-800 border-amber-200',
  location: 'bg-emerald-100 text-emerald-800 border-emerald-200',
} as const;

interface EntityLinkProps {
  id: string;
  children: React.ReactNode;
}

export default function EntityLink({ id, children }: EntityLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entity = ENTITIES[id];

  if (!entity) {
    return <span className="font-semibold text-indigo-700">{children}</span>;
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="font-semibold text-indigo-700 cursor-help border-b border-indigo-300 border-dashed hover:border-indigo-700 transition-colors">
        {children}
      </span>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {entity.image && (
            <div className="relative h-24 w-full overflow-hidden">
              <Image
                src={entity.image}
                alt={entity.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-heading font-bold text-lg text-gray-900">
                {entity.name}
              </h4>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColors[entity.type]}`}
              >
                {entity.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{entity.description}</p>

            {entity.stats && (
              <div className="flex gap-3 text-xs border-t border-gray-100 pt-3 mt-3">
                {entity.stats.ac && (
                  <div className="flex items-center gap-1 text-gray-700">
                    <Shield size={14} className="text-gray-400" /> AC{' '}
                    {entity.stats.ac}
                  </div>
                )}
                {entity.stats.hp && (
                  <div className="flex items-center gap-1 text-gray-700">
                    <Heart size={14} className="text-red-400" /> HP{' '}
                    {entity.stats.hp}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45" />
        </div>
      )}
    </span>
  );
}
