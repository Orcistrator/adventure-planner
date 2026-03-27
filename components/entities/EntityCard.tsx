import { Shield, Heart } from "lucide-react";
import Image from "next/image";
import type { Entity } from "@/lib/types";

const typeColors = {
  monster: "bg-red-100 text-red-800 border-red-200",
  character: "bg-blue-100 text-blue-800 border-blue-200",
  item: "bg-amber-100 text-amber-800 border-amber-200",
  location: "bg-emerald-100 text-emerald-800 border-emerald-200",
} as const;

interface EntityCardProps {
  entity: Entity;
}

export default function EntityCard({ entity }: EntityCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {entity.image && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-heading text-xl font-bold text-gray-900">
            {entity.name}
          </h3>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] tracking-wider uppercase ${typeColors[entity.type]}`}
          >
            {entity.type}
          </span>
        </div>
        <p className="mb-4 flex-1 text-sm text-gray-600">
          {entity.description}
        </p>

        {entity.stats && (
          <div className="mt-auto flex gap-4 border-t border-gray-100 pt-4 text-sm">
            {entity.stats.ac && (
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <Shield size={16} className="text-gray-400" /> AC{" "}
                {entity.stats.ac}
              </div>
            )}
            {entity.stats.hp && (
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <Heart size={16} className="text-red-400" /> HP{" "}
                {entity.stats.hp}
              </div>
            )}
            {entity.stats.speed && (
              <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-700">
                {entity.stats.speed}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
