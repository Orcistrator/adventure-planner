'use client';

import { useState } from 'react';
import { Swords } from 'lucide-react';
import { ENTITIES } from '@/lib/data';
import Image from 'next/image';

interface EncounterTrackerProps {
  title: string;
  monsters: { id: string; count: number }[];
}

export default function EncounterTracker({ title, monsters }: EncounterTrackerProps) {
  const initialCombatants = monsters
    .flatMap((m) =>
      Array.from({ length: m.count }).map((_, i) => ({
        uid: `${m.id}-${i}`,
        entity: ENTITIES[m.id],
        currentHp: ENTITIES[m.id]?.stats?.hp ?? 0,
        maxHp: ENTITIES[m.id]?.stats?.hp ?? 0,
      }))
    )
    .filter((c) => c.entity);

  const [combatants, setCombatants] = useState(initialCombatants);

  const updateHp = (uid: string, delta: number) => {
    setCombatants((prev) =>
      prev.map((c) =>
        c.uid === uid
          ? { ...c, currentHp: Math.max(0, Math.min(c.maxHp, c.currentHp + delta)) }
          : c
      )
    );
  };

  return (
    <div className="my-6 border border-red-200 rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center gap-2">
        <Swords size={18} className="text-red-600" />
        <h4 className="font-heading font-bold text-red-900">Encounter: {title}</h4>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {combatants.map((combatant) => (
          <div
            key={combatant.uid}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100"
          >
            <div className="flex items-center gap-3">
              {combatant.entity.image ? (
                <Image
                  src={combatant.entity.image}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                  {combatant.entity.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {combatant.entity.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>AC {combatant.entity.stats?.ac}</span>
                  <span>•</span>
                  <span>{combatant.entity.stats?.speed}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  HP
                </span>
                <span
                  className={`font-mono font-bold ${
                    combatant.currentHp === 0 ? 'text-red-500' : 'text-gray-900'
                  }`}
                >
                  {combatant.currentHp} / {combatant.maxHp}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => updateHp(combatant.uid, -1)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:text-red-600"
                >
                  -
                </button>
                <button
                  onClick={() => updateHp(combatant.uid, 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:text-green-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
