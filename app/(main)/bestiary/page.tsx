import { Skull } from 'lucide-react';
import { ENTITIES } from '@/lib/data';
import EntityCard from '@/components/entities/EntityCard';

export default function BestiaryPage() {
  const monsters = Object.values(ENTITIES).filter((e) => e.type === 'monster');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
          <Skull size={24} />
        </div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Bestiary</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monsters.map((monster) => (
          <EntityCard key={monster.id} entity={monster} />
        ))}
      </div>
    </div>
  );
}
