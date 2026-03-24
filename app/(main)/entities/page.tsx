import { ENTITIES } from '@/lib/data';

const TYPE_LABELS: Record<string, string> = {
  monster: 'Monster',
  item: 'Item',
  character: 'NPC',
  location: 'Location',
};

export default function EntitiesPage() {
  const entities = Object.values(ENTITIES);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Entities</h1>

      <ul className="flex flex-col gap-2">
        {entities.map((entity) => (
          <li key={entity.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-[background-color] duration-150">
            <span className="text-xs border border-gray-200 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold w-20 text-center shrink-0">
              {TYPE_LABELS[entity.type] ?? entity.type}
            </span>
            <span className="font-medium text-gray-900">{entity.name}</span>
            <p className="text-sm text-gray-400 truncate ml-auto max-w-xs">{entity.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
