import { Shield, Heart } from 'lucide-react';
import type { Entity } from '@/lib/types';

const typeColors = {
  monster: 'bg-red-100 text-red-800 border-red-200',
  character: 'bg-blue-100 text-blue-800 border-blue-200',
  item: 'bg-amber-100 text-amber-800 border-amber-200',
  location: 'bg-emerald-100 text-emerald-800 border-emerald-200',
} as const;

interface EntityCardProps {
  entity: Entity;
}

export default function EntityCard({ entity }: EntityCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {entity.image && (
        <div className="h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={entity.image}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-heading font-bold text-xl text-gray-900">
            {entity.name}
          </h3>
          <span
            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColors[entity.type]}`}
          >
            {entity.type}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 flex-1">{entity.description}</p>

        {entity.stats && (
          <div className="flex gap-4 text-sm border-t border-gray-100 pt-4 mt-auto">
            {entity.stats.ac && (
              <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                <Shield size={16} className="text-gray-400" /> AC {entity.stats.ac}
              </div>
            )}
            {entity.stats.hp && (
              <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                <Heart size={16} className="text-red-400" /> HP {entity.stats.hp}
              </div>
            )}
            {entity.stats.speed && (
              <div className="flex items-center gap-1.5 text-gray-700 font-medium ml-auto text-xs">
                {entity.stats.speed}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
