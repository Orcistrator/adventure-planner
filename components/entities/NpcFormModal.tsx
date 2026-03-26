'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { slugify } from '@/lib/utils';
import {
  ModalShell, SectionHeader, Field, AbilityList, AbilityEntry,
  ImageField, inputCls, selectCls,
} from './form-utils';
const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
  'Unaligned', 'Any Alignment',
];
const ABILITY_SCORES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

function abilityMod(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

interface Props {
  entity?: Doc<'entities'>;
  onClose: () => void;
  onDelete?: () => void;
}

export function NpcFormModal({ entity, onClose, onDelete }: Props) {
  const [name, setName] = useState(entity?.name ?? '');
  const [image, setImage] = useState(entity?.image ?? '');
  const [description, setDescription] = useState(entity?.description ?? '');
  const [role, setRole] = useState(entity?.role ?? '');
  const [race, setRace] = useState(entity?.race ?? '');
  const [alignment, setAlignment] = useState(entity?.alignment ?? '');

  // Combat
  const [ac, setAc] = useState(entity?.stats?.ac?.toString() ?? '');
  const [acNote, setAcNote] = useState(entity?.stats?.acNote ?? '');
  const [hp, setHp] = useState(entity?.stats?.hp?.toString() ?? '');
  const [hpFormula, setHpFormula] = useState(entity?.stats?.hpFormula ?? '');
  const [speed, setSpeed] = useState(entity?.stats?.speed ?? '');
  const [cr, setCr] = useState(entity?.stats?.cr ?? '');
  const [xp] = useState(entity?.stats?.xp?.toString() ?? '');
  const [profBonus, setProfBonus] = useState(entity?.stats?.proficiencyBonus?.toString() ?? '');

  // Ability scores
  const [str, setStr] = useState(entity?.stats?.str?.toString() ?? '');
  const [dex, setDex] = useState(entity?.stats?.dex?.toString() ?? '');
  const [con, setCon] = useState(entity?.stats?.con?.toString() ?? '');
  const [int, setInt] = useState(entity?.stats?.int?.toString() ?? '');
  const [wis, setWis] = useState(entity?.stats?.wis?.toString() ?? '');
  const [cha, setCha] = useState(entity?.stats?.cha?.toString() ?? '');

  // Proficiencies
  const [senses, setSenses] = useState(entity?.senses ?? '');
  const [languages, setLanguages] = useState(entity?.languages ?? '');

  // Personality
  const [personality, setPersonality] = useState(entity?.personality ?? '');
  const [ideals, setIdeals] = useState(entity?.ideals ?? '');
  const [bonds, setBonds] = useState(entity?.bonds ?? '');
  const [flaws, setFlaws] = useState(entity?.flaws ?? '');
  const [backstory, setBackstory] = useState(entity?.backstory ?? '');

  // Abilities
  const [traits, setTraits] = useState<AbilityEntry[]>(entity?.traits ?? []);
  const [actions, setActions] = useState<AbilityEntry[]>(entity?.actions ?? []);
  const [reactions, setReactions] = useState<AbilityEntry[]>(entity?.reactions ?? []);

  const [saving, setSaving] = useState(false);
  const createEntity = useMutation(api.entities.create);
  const updateEntity = useMutation(api.entities.update);

  const numOrUndef = (s: string) => { const n = parseInt(s, 10); return isNaN(n) ? undefined : n; };
  const strOrUndef = (s: string) => s.trim() || undefined;

  const abilityScores = { str, dex, con, int, wis, cha };
  const setters = { str: setStr, dex: setDex, con: setCon, int: setInt, wis: setWis, cha: setCha };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: entity?.slug ?? slugify(name),
      name, type: 'character' as const, description,
      image: strOrUndef(image),
      role: strOrUndef(role), race: strOrUndef(race), alignment: strOrUndef(alignment),
      stats: {
        ac: numOrUndef(ac), acNote: strOrUndef(acNote),
        hp: numOrUndef(hp), hpFormula: strOrUndef(hpFormula),
        speed: strOrUndef(speed),
        str: numOrUndef(str), dex: numOrUndef(dex), con: numOrUndef(con),
        int: numOrUndef(int), wis: numOrUndef(wis), cha: numOrUndef(cha),
        proficiencyBonus: numOrUndef(profBonus), cr: strOrUndef(cr), xp: numOrUndef(xp),
      },
      senses: strOrUndef(senses), languages: strOrUndef(languages),
      personality: strOrUndef(personality), ideals: strOrUndef(ideals),
      bonds: strOrUndef(bonds), flaws: strOrUndef(flaws), backstory: strOrUndef(backstory),
      traits: traits.length > 0 ? traits : undefined,
      actions: actions.length > 0 ? actions : undefined,
      reactions: reactions.length > 0 ? reactions : undefined,
    };
    try {
      if (entity) { await updateEntity({ id: entity._id, ...payload }); }
      else { await createEntity(payload); }
      onClose();
    } finally { setSaving(false); }
  }

  const title = name || (entity ? entity.name : 'New NPC');
  const subtitle = [role, race, alignment].filter(Boolean).join(' · ');

  return (
    <ModalShell
      title={title}
      subtitle={subtitle || undefined}
      image={strOrUndef(image)}
      headerBg="bg-[oklch(28%_0.06_240)]"
      onClose={onClose}
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={onDelete}
      submitLabel={entity ? 'Save Changes' : 'Create NPC'}
    >
      <SectionHeader>Basic Info</SectionHeader>

      <Field label="Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="NPC name" className={inputCls} /></Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Role" optional><input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Town Guard" className={inputCls} /></Field>
        <Field label="Race" optional><input type="text" value={race} onChange={(e) => setRace(e.target.value)} placeholder="Human" className={inputCls} /></Field>
        <Field label="Alignment" optional>
          <select value={alignment} onChange={(e) => setAlignment(e.target.value)} className={selectCls}>
            <option value="">—</option>
            {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Description / Appearance" optional><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this NPC look like?" className={inputCls + ' resize-none'} /></Field>
      <ImageField value={image} onChange={setImage} />

      <SectionHeader>Combat Stats</SectionHeader>

      <div className="grid grid-cols-2 gap-3">
        <Field label="AC" optional>
          <div className="flex gap-2">
            <input type="number" value={ac} onChange={(e) => setAc(e.target.value)} placeholder="—" min={0} className={inputCls + ' w-20 shrink-0'} />
            <input type="text" value={acNote} onChange={(e) => setAcNote(e.target.value)} placeholder="leather armor" className={inputCls} />
          </div>
        </Field>
        <Field label="HP" optional>
          <div className="flex gap-2">
            <input type="number" value={hp} onChange={(e) => setHp(e.target.value)} placeholder="—" min={0} className={inputCls + ' w-20 shrink-0'} />
            <input type="text" value={hpFormula} onChange={(e) => setHpFormula(e.target.value)} placeholder="4d8 + 4" className={inputCls} />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Speed" optional><input type="text" value={speed} onChange={(e) => setSpeed(e.target.value)} placeholder="30 ft." className={inputCls} /></Field>
        <Field label="CR" optional><input type="text" value={cr} onChange={(e) => setCr(e.target.value)} placeholder="1/2" className={inputCls} /></Field>
        <Field label="Prof. Bonus" optional><input type="number" value={profBonus} onChange={(e) => setProfBonus(e.target.value)} placeholder="+2" className={inputCls} /></Field>
      </div>

      <SectionHeader>Ability Scores</SectionHeader>
      <div className="grid grid-cols-6 gap-2">
        {ABILITY_SCORES.map((key) => {
          const val = abilityScores[key];
          const score = parseInt(val);
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-bold tracking-wider text-[oklch(70.7%_0.022_261.3)] uppercase">{ABILITY_LABELS[key]}</span>
              <input type="number" value={val} onChange={(e) => setters[key](e.target.value)} placeholder="10" min={1} max={30} className="w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-2 py-2 text-[14px] text-center text-[oklch(21%_0.034_264.7)] outline-none focus:border-stone-400 transition-colors" />
              {val && !isNaN(score) && <span className="text-[11px] text-[oklch(70.7%_0.022_261.3)]">{abilityMod(score)}</span>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Senses" optional><input type="text" value={senses} onChange={(e) => setSenses(e.target.value)} placeholder="Passive Perception 11" className={inputCls} /></Field>
        <Field label="Languages" optional><input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Common" className={inputCls} /></Field>
      </div>

      <SectionHeader>Personality</SectionHeader>
      <Field label="Personality Traits" optional><textarea value={personality} onChange={(e) => setPersonality(e.target.value)} rows={2} placeholder="How does this NPC act and speak?" className={inputCls + ' resize-none'} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Ideals" optional><textarea value={ideals} onChange={(e) => setIdeals(e.target.value)} rows={2} placeholder="What drives them?" className={inputCls + ' resize-none'} /></Field>
        <Field label="Bonds" optional><textarea value={bonds} onChange={(e) => setBonds(e.target.value)} rows={2} placeholder="Who or what do they care about?" className={inputCls + ' resize-none'} /></Field>
        <Field label="Flaws" optional><textarea value={flaws} onChange={(e) => setFlaws(e.target.value)} rows={2} placeholder="What are their weaknesses?" className={inputCls + ' resize-none'} /></Field>
      </div>
      <Field label="Backstory" optional><textarea value={backstory} onChange={(e) => setBackstory(e.target.value)} rows={3} placeholder="Background and history…" className={inputCls + ' resize-none'} /></Field>

      <AbilityList label="Traits" entries={traits} onChange={setTraits} />
      <AbilityList label="Actions" entries={actions} onChange={setActions} />
      <AbilityList label="Reactions" entries={reactions} onChange={setReactions} />
    </ModalShell>
  );
}
