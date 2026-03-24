import { Backpack } from 'lucide-react';
import { ENTITIES } from '@/lib/data';
import EntityCard from '@/components/entities/EntityCard';

export default function ItemsPage() {
  const items = Object.values(ENTITIES).filter((e) => e.type === 'item');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
          <Backpack size={24} />
        </div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Items Library</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <EntityCard key={item.id} entity={item} />
        ))}
      </div>
    </div>
  );
}
