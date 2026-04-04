'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { GenerativeInput, GenerativeTextarea } from './GenerateField';
import { generateEntity } from './generateEntity';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { slugify } from '@/lib/utils';
import {
  ModalShell, SectionHeader, Field, RollTableEditor, RollTable,
  ImageField, inputCls, selectCls,
} from './form-utils';

const LOCATION_TYPES = [
  'Dungeon', 'Cave', 'Ruin', 'Town', 'City', 'Village', 'Outpost', 'Fortress',
  'Temple', 'Forest', 'Wilderness', 'Swamp', 'Mountain', 'Coast', 'Underdark',
  'Planar', 'Building', 'Other',
];

interface Props {
  entity?: Doc<'entities'>;
  onClose: () => void;
  onDelete?: () => void;
}

export function LocationFormModal({ entity, onClose, onDelete }: Props) {
  const [name, setName] = useState(entity?.name ?? '');
  const [image, setImage] = useState(entity?.image ?? '');
  const [description, setDescription] = useState(entity?.description ?? '');
  const [locationType, setLocationType] = useState(entity?.locationType ?? '');
  const [region, setRegion] = useState(entity?.region ?? '');
  const [notableFeatures, setNotableFeatures] = useState<string[]>(entity?.notableFeatures ?? []);
  const [tables, setTables] = useState<RollTable[]>(entity?.tables ?? []);

  const [saving, setSaving] = useState(false);
  const createEntity = useMutation(api.entities.create);
  const updateEntity = useMutation(api.entities.update);

  const strOrUndef = (s: string) => s.trim() || undefined;

  async function generateAll() {
    const data = await generateEntity(name, 'location');
    if (data.description) setDescription(data.description);
    if (data.locationType) setLocationType(data.locationType);
    if (data.region) setRegion(data.region);
    if (data.notableFeatures?.length) setNotableFeatures(data.notableFeatures);
  }

  function addFeature() { setNotableFeatures((f) => [...f, '']); }
  function removeFeature(i: number) { setNotableFeatures((f) => f.filter((_, idx) => idx !== i)); }
  function updateFeature(i: number, v: string) { setNotableFeatures((f) => f.map((x, idx) => idx === i ? v : x)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: entity?.slug ?? slugify(name),
      name, type: 'location' as const, description,
      image: strOrUndef(image),
      locationType: strOrUndef(locationType),
      region: strOrUndef(region),
      notableFeatures: notableFeatures.filter(Boolean).length > 0 ? notableFeatures.filter(Boolean) : undefined,
      tables: tables.length > 0 ? tables : undefined,
    };
    try {
      if (entity) { await updateEntity({ id: entity._id, ...payload }); }
      else { await createEntity(payload); }
      onClose();
    } finally { setSaving(false); }
  }

  const subtitle = [locationType, region].filter(Boolean).join(' · ');

  return (
    <ModalShell
      title={name || (entity ? entity.name : 'New Location')}
      subtitle={subtitle || undefined}
      image={strOrUndef(image)}
      headerBg="bg-[oklch(30%_0.07_155)]"
      onClose={onClose}
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={onDelete}
      submitLabel={entity ? 'Save Changes' : 'Create Location'}
    >
      <SectionHeader>Basic Info</SectionHeader>

      <Field label="Name">
        <GenerativeInput type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="Location name" className={inputCls} onGenerate={generateAll} generateDisabled={!name.trim()} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" optional>
          <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className={selectCls}>
            <option value="">—</option>
            {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Region" optional><input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="The Thornwood" className={inputCls} /></Field>
      </div>

      <Field label="Description" optional>
        <GenerativeTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the location — atmosphere, history, what makes it notable…" className={inputCls + ' resize-none'} onGenerate={async () => { const d = await generateEntity(name, 'location','description', { locationType, region }); if (d.value) setDescription(d.value); }} generateDisabled={!name.trim()} />
      </Field>
      <ImageField value={image} onChange={setImage} />

      {/* Notable features */}
      <div className="flex flex-col gap-2">
        <SectionHeader>Notable Features</SectionHeader>
        {notableFeatures.map((feature, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={feature}
              onChange={(e) => updateFeature(i, e.target.value)}
              placeholder="e.g. A crumbling stone altar"
              className={inputCls + ' flex-1'}
            />
            <button
              type="button"
              onClick={() => removeFeature(i)}
              className="p-1.5 rounded-lg text-[oklch(70.7%_0.022_261.3)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addFeature}
          className="flex items-center gap-1.5 text-[13px] text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 transition-colors self-start py-1"
        >
          <Plus size={14} />
          Add feature
        </button>
      </div>

      <RollTableEditor tables={tables} onChange={setTables} />
    </ModalShell>
  );
}
