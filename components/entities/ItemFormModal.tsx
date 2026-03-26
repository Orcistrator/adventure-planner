'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { slugify } from '@/lib/utils';
import {
  ModalShell, SectionHeader, Field, RollTableEditor, RollTable,
  ImageField, inputCls, selectCls,
} from './form-utils';

const ITEM_TYPES = [
  'Weapon', 'Armor', 'Shield', 'Potion', 'Scroll', 'Ring', 'Rod',
  'Staff', 'Wand', 'Wondrous Item', 'Adventuring Gear', 'Tool', 'Mount', 'Other',
];
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'];

interface Props {
  entity?: Doc<'entities'>;
  onClose: () => void;
  onDelete?: () => void;
}

export function ItemFormModal({ entity, onClose, onDelete }: Props) {
  const [name, setName] = useState(entity?.name ?? '');
  const [image, setImage] = useState(entity?.image ?? '');
  const [description, setDescription] = useState(entity?.description ?? '');
  const [itemType, setItemType] = useState(entity?.itemType ?? '');
  const [rarity, setRarity] = useState(entity?.rarity ?? '');
  const [requiresAttunement, setRequiresAttunement] = useState(entity?.requiresAttunement ?? false);
  const [cost, setCost] = useState(entity?.cost ?? '');
  const [weight, setWeight] = useState(entity?.weight ?? '');
  const [itemProperties, setItemProperties] = useState(entity?.itemProperties ?? '');
  const [tables, setTables] = useState<RollTable[]>(entity?.tables ?? []);

  const [saving, setSaving] = useState(false);
  const createEntity = useMutation(api.entities.create);
  const updateEntity = useMutation(api.entities.update);

  const strOrUndef = (s: string) => s.trim() || undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: entity?.slug ?? slugify(name),
      name, type: 'item' as const, description,
      image: strOrUndef(image),
      itemType: strOrUndef(itemType),
      rarity: strOrUndef(rarity),
      requiresAttunement: requiresAttunement || undefined,
      cost: strOrUndef(cost),
      weight: strOrUndef(weight),
      itemProperties: strOrUndef(itemProperties),
      tables: tables.length > 0 ? tables : undefined,
    };
    try {
      if (entity) { await updateEntity({ id: entity._id, ...payload }); }
      else { await createEntity(payload); }
      onClose();
    } finally { setSaving(false); }
  }

  const subtitle = [rarity, itemType, requiresAttunement ? 'requires attunement' : ''].filter(Boolean).join(' · ');

  return (
    <ModalShell
      title={name || (entity ? entity.name : 'New Item')}
      subtitle={subtitle || undefined}
      image={strOrUndef(image)}
      headerBg="bg-[oklch(32%_0.08_60)]"
      onClose={onClose}
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={onDelete}
      submitLabel={entity ? 'Save Changes' : 'Create Item'}
    >
      <SectionHeader>Basic Info</SectionHeader>

      <Field label="Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="Item name" className={inputCls} /></Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Item Type" optional>
          <select value={itemType} onChange={(e) => setItemType(e.target.value)} className={selectCls}>
            <option value="">—</option>
            {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Rarity" optional>
          <select value={rarity} onChange={(e) => setRarity(e.target.value)} className={selectCls}>
            <option value="">—</option>
            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cost" optional><input type="text" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="500 gp" className={inputCls} /></Field>
        <Field label="Weight" optional><input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="1 lb." className={inputCls} /></Field>
      </div>

      <Field label="Properties" optional><input type="text" value={itemProperties} onChange={(e) => setItemProperties(e.target.value)} placeholder="Light, Finesse, Thrown (20/60)" className={inputCls} /></Field>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={requiresAttunement}
          onChange={(e) => setRequiresAttunement(e.target.checked)}
          className="w-4 h-4 rounded accent-stone-800"
        />
        <span className="text-[13px] text-[oklch(44.6%_0.030_256.8)]">Requires attunement</span>
      </label>

      <Field label="Description" optional><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the item and its effects…" className={inputCls + ' resize-none'} /></Field>
      <ImageField value={image} onChange={setImage} />

      <RollTableEditor tables={tables} onChange={setTables} />
    </ModalShell>
  );
}
