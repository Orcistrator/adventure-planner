export type EntityType = 'monster' | 'character' | 'item' | 'location';

export type EntityField =
  | 'description'
  | 'personality'
  | 'ideals'
  | 'bonds'
  | 'flaws'
  | 'backstory'
  | 'itemProperties';

export async function generateEntity(
  name: string,
  type: EntityType,
  field?: EntityField,
  context: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any>> {
  const res = await fetch('/api/generate-entity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, ...(field ? { field, context } : {}) }),
  });
  return res.json();
}
