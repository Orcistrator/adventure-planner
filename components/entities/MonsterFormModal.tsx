'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { X, Plus, Trash2 } from 'lucide-react';
import { GenerativeInput, GenerativeTextarea } from './GenerateField';
import { generateEntity } from './generateEntity';
import { slugify } from '@/lib/utils';
import { ImageField } from './form-utils';

// ── Types ────────────────────────────────────────────────────────────────────

type AbilityEntry = { name: string; description: string };
type SkillEntry = { name: string; bonus: number };

// ── Constants ────────────────────────────────────────────────────────────────

const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const CREATURE_TYPES = [
  'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental',
  'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead',
];
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

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[11px] tracking-[0.8px] uppercase font-bold text-[oklch(70.7%_0.022_261.3)]">
        {children}
      </span>
      <div className="flex-1 h-px bg-[oklch(92.8%_0.006_264.5)]" />
    </div>
  );
}

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-[12px] tracking-[0.6px] uppercase text-[oklch(70.7%_0.022_261.3)] font-bold">
      {children}
      {optional && <span className="normal-case font-normal ml-1">(optional)</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none focus:border-stone-400 transition-colors';

const selectCls =
  'w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(21%_0.034_264.7)] outline-none focus:border-stone-400 transition-colors bg-white';

function AbilityList({
  label,
  entries,
  onChange,
}: {
  label: string;
  entries: AbilityEntry[];
  onChange: (entries: AbilityEntry[]) => void;
}) {
  function add() {
    onChange([...entries, { name: '', description: '' }]);
  }
  function remove(i: number) {
    onChange(entries.filter((_, idx) => idx !== i));
  }
  function update(i: number, field: 'name' | 'description', value: string) {
    const next = entries.map((e, idx) => (idx === i ? { ...e, [field]: value } : e));
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionHeader>{label}</SectionHeader>
      {entries.map((entry, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-[oklch(92.8%_0.006_264.5)] p-3">
          <div className="flex items-center gap-2">
            <input
              value={entry.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="Name"
              className={inputCls + ' flex-1'}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1.5 rounded-lg text-[oklch(70.7%_0.022_261.3)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <textarea
            value={entry.description}
            onChange={(e) => update(i, 'description', e.target.value)}
            placeholder="Description"
            rows={2}
            className={inputCls + ' resize-none'}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-[13px] text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 transition-colors self-start py-1"
      >
        <Plus size={14} />
        Add {label.toLowerCase()}
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  entity?: Doc<'entities'>;
  onClose: () => void;
  onDelete?: () => void;
}

export function MonsterFormModal({ entity, onClose, onDelete }: Props) {
  // Basic
  const [name, setName] = useState(entity?.name ?? '');
  const [image, setImage] = useState(entity?.image ?? '');
  const [description, setDescription] = useState(entity?.description ?? '');
  const [size, setSize] = useState(entity?.size ?? '');
  const [creatureType, setCreatureType] = useState(entity?.creatureType ?? '');
  const [alignment, setAlignment] = useState(entity?.alignment ?? '');

  // Combat stats
  const [ac, setAc] = useState(entity?.stats?.ac?.toString() ?? '');
  const [acNote, setAcNote] = useState(entity?.stats?.acNote ?? '');
  const [hp, setHp] = useState(entity?.stats?.hp?.toString() ?? '');
  const [hpFormula, setHpFormula] = useState(entity?.stats?.hpFormula ?? '');
  const [speed, setSpeed] = useState(entity?.stats?.speed ?? '');
  const [initiative, setInitiative] = useState(entity?.stats?.initiative?.toString() ?? '');
  const [cr, setCr] = useState(entity?.stats?.cr ?? '');
  const [xp, setXp] = useState(entity?.stats?.xp?.toString() ?? '');
  const [profBonus, setProfBonus] = useState(entity?.stats?.proficiencyBonus?.toString() ?? '');

  // Ability scores
  const [str, setStr] = useState(entity?.stats?.str?.toString() ?? '');
  const [dex, setDex] = useState(entity?.stats?.dex?.toString() ?? '');
  const [con, setCon] = useState(entity?.stats?.con?.toString() ?? '');
  const [int, setInt] = useState(entity?.stats?.int?.toString() ?? '');
  const [wis, setWis] = useState(entity?.stats?.wis?.toString() ?? '');
  const [cha, setCha] = useState(entity?.stats?.cha?.toString() ?? '');

  // Saving throw overrides
  const [strSave, setStrSave] = useState(entity?.stats?.strSave?.toString() ?? '');
  const [dexSave, setDexSave] = useState(entity?.stats?.dexSave?.toString() ?? '');
  const [conSave, setConSave] = useState(entity?.stats?.conSave?.toString() ?? '');
  const [intSave, setIntSave] = useState(entity?.stats?.intSave?.toString() ?? '');
  const [wisSave, setWisSave] = useState(entity?.stats?.wisSave?.toString() ?? '');
  const [chaSave, setChaSave] = useState(entity?.stats?.chaSave?.toString() ?? '');

  // Proficiencies
  const [skills, setSkills] = useState<SkillEntry[]>(entity?.skills ?? []);
  const [senses, setSenses] = useState(entity?.senses ?? '');
  const [languages, setLanguages] = useState(entity?.languages ?? '');
  const [immunities, setImmunities] = useState(entity?.immunities ?? '');
  const [resistances, setResistances] = useState(entity?.resistances ?? '');
  const [vulnerabilities, setVulnerabilities] = useState(entity?.vulnerabilities ?? '');
  const [conditionImmunities, setConditionImmunities] = useState(entity?.conditionImmunities ?? '');

  // Abilities
  const [traits, setTraits] = useState<AbilityEntry[]>(entity?.traits ?? []);
  const [actions, setActions] = useState<AbilityEntry[]>(entity?.actions ?? []);
  const [bonusActions, setBonusActions] = useState<AbilityEntry[]>(entity?.bonusActions ?? []);
  const [reactions, setReactions] = useState<AbilityEntry[]>(entity?.reactions ?? []);
  const [legendaryActionsDescription, setLegendaryActionsDescription] = useState(
    entity?.legendaryActionsDescription ?? ''
  );
  const [legendaryActions, setLegendaryActions] = useState<AbilityEntry[]>(
    entity?.legendaryActions ?? []
  );

  const [saving, setSaving] = useState(false);

  const createEntity = useMutation(api.entities.create);
  const updateEntity = useMutation(api.entities.update);

  async function generateAll() {
    const data = await generateEntity(name, 'monster');
    if (data.description) setDescription(data.description);
    if (data.size) setSize(data.size);
    if (data.creatureType) setCreatureType(data.creatureType);
    if (data.alignment) setAlignment(data.alignment);
    if (data.ac) setAc(String(data.ac));
    if (data.acNote) setAcNote(data.acNote);
    if (data.hp) setHp(String(data.hp));
    if (data.hpFormula) setHpFormula(data.hpFormula);
    if (data.speed) setSpeed(data.speed);
    if (data.cr) setCr(String(data.cr));
    if (data.xp) setXp(String(data.xp));
    if (data.proficiencyBonus) setProfBonus(String(data.proficiencyBonus));
    if (data.str) setStr(String(data.str));
    if (data.dex) setDex(String(data.dex));
    if (data.con) setCon(String(data.con));
    if (data.int) setInt(String(data.int));
    if (data.wis) setWis(String(data.wis));
    if (data.cha) setCha(String(data.cha));
    if (data.senses) setSenses(data.senses);
    if (data.languages) setLanguages(data.languages);
    if (data.immunities) setImmunities(data.immunities);
    if (data.resistances) setResistances(data.resistances);
    if (data.vulnerabilities) setVulnerabilities(data.vulnerabilities);
    if (data.conditionImmunities) setConditionImmunities(data.conditionImmunities);
    if (data.traits?.length) setTraits(data.traits);
    if (data.actions?.length) setActions(data.actions);
    if (data.bonusActions?.length) setBonusActions(data.bonusActions);
    if (data.reactions?.length) setReactions(data.reactions);
  }

  function numOrUndef(s: string) {
    const n = parseInt(s, 10);
    return isNaN(n) ? undefined : n;
  }
  function strOrUndef(s: string) {
    return s.trim() || undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const stats = {
      ac: numOrUndef(ac),
      acNote: strOrUndef(acNote),
      hp: numOrUndef(hp),
      hpFormula: strOrUndef(hpFormula),
      speed: strOrUndef(speed),
      initiative: numOrUndef(initiative),
      str: numOrUndef(str),
      dex: numOrUndef(dex),
      con: numOrUndef(con),
      int: numOrUndef(int),
      wis: numOrUndef(wis),
      cha: numOrUndef(cha),
      strSave: numOrUndef(strSave),
      dexSave: numOrUndef(dexSave),
      conSave: numOrUndef(conSave),
      intSave: numOrUndef(intSave),
      wisSave: numOrUndef(wisSave),
      chaSave: numOrUndef(chaSave),
      proficiencyBonus: numOrUndef(profBonus),
      cr: strOrUndef(cr),
      xp: numOrUndef(xp),
    };

    const payload = {
      slug: entity?.slug ?? slugify(name),
      name,
      type: 'monster' as const,
      description,
      image: strOrUndef(image),
      size: strOrUndef(size),
      creatureType: strOrUndef(creatureType),
      alignment: strOrUndef(alignment),
      stats,
      skills: skills.length > 0 ? skills : undefined,
      senses: strOrUndef(senses),
      languages: strOrUndef(languages),
      immunities: strOrUndef(immunities),
      resistances: strOrUndef(resistances),
      vulnerabilities: strOrUndef(vulnerabilities),
      conditionImmunities: strOrUndef(conditionImmunities),
      traits: traits.length > 0 ? traits : undefined,
      actions: actions.length > 0 ? actions : undefined,
      bonusActions: bonusActions.length > 0 ? bonusActions : undefined,
      reactions: reactions.length > 0 ? reactions : undefined,
      legendaryActionsDescription: strOrUndef(legendaryActionsDescription),
      legendaryActions: legendaryActions.length > 0 ? legendaryActions : undefined,
    };

    try {
      if (entity) {
        await updateEntity({ id: entity._id, ...payload });
      } else {
        await createEntity(payload);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  // Skill row helpers
  function addSkill() {
    setSkills((prev) => [...prev, { name: '', bonus: 0 }]);
  }
  function removeSkill(i: number) {
    setSkills((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateSkill(i: number, field: 'name' | 'bonus', value: string) {
    setSkills((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, [field]: field === 'bonus' ? parseInt(value) || 0 : value } : s
      )
    );
  }

  const abilityScores = { str, dex, con, int, wis, cha };
  const setters = { str: setStr, dex: setDex, con: setCon, int: setInt, wis: setWis, cha: setCha };
  const saveValues = { str: strSave, dex: dexSave, con: conSave, int: intSave, wis: wisSave, cha: chaSave };
  const saveSetters = {
    str: setStrSave, dex: setDexSave, con: setConSave,
    int: setIntSave, wis: setWisSave, cha: setChaSave,
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
          className="rounded-[14px] overflow-clip flex flex-col bg-white [border-width:0.666667px] border-solid border-[oklch(92.8%_0.006_264.5)] [box-shadow:0px_8px_32px_#00000033,0px_1px_3px_#0000001A] w-full max-w-2xl pointer-events-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="relative h-36 shrink-0 bg-[oklch(21%_0.034_264.7)]">
            <div className="flex flex-col justify-end h-full overflow-clip relative p-6">
              {image && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(in oklab 0deg, oklab(0% 0 0 / 90%) 0%, oklab(0% 0 0 / 40%) 50%, oklab(0% 0 0 / 0%) 100%)',
                }}
              />
              <div className="relative">
                <h2 className="text-2xl leading-tight text-white font-heading">
                  {name || (entity ? entity.name : 'New Monster')}
                </h2>
                {(size || creatureType || alignment) && (
                  <p className="text-sm text-white/60 mt-0.5 italic">
                    {[size, creatureType, alignment && `· ${alignment}`].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="content-center rounded-lg top-1.5 right-[14px] absolute bg-[oklab(0%_0_0/30%)] p-1.5 hover:bg-[oklab(0%_0_0/50%)] transition-colors"
              aria-label="Close"
            >
              <X size={14} color="white" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 overflow-y-auto">

            {/* ── Basic Info ── */}
            <SectionHeader>Basic Info</SectionHeader>

            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <GenerativeInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="Monster name"
                className={inputCls}
                onGenerate={generateAll}
                generateDisabled={!name.trim()}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Size</Label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <select value={creatureType} onChange={(e) => setCreatureType(e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {CREATURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Alignment</Label>
                <select value={alignment} onChange={(e) => setAlignment(e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label optional>Description / Lore</Label>
              <GenerativeTextarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Flavor text or DM notes"
                className={inputCls + ' resize-none'}
                onGenerate={async () => {
                  const data = await generateEntity(name, 'monster', 'description', { size, creatureType, alignment });
                  if (data.value) setDescription(data.value);
                }}
                generateDisabled={!name.trim()}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <ImageField value={image} onChange={setImage} />
            </div>

            {/* ── Combat Stats ── */}
            <SectionHeader>Combat</SectionHeader>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label optional>AC</Label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ac}
                    onChange={(e) => setAc(e.target.value)}
                    placeholder="17"
                    min={0}
                    className={inputCls + ' w-20 shrink-0'}
                  />
                  <input
                    type="text"
                    value={acNote}
                    onChange={(e) => setAcNote(e.target.value)}
                    placeholder="natural armor"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label optional>HP</Label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    placeholder="150"
                    min={0}
                    className={inputCls + ' w-20 shrink-0'}
                  />
                  <input
                    type="text"
                    value={hpFormula}
                    onChange={(e) => setHpFormula(e.target.value)}
                    placeholder="20d10 + 40"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label optional>Speed</Label>
                <input
                  type="text"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  placeholder="10 ft., swim 40 ft."
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label optional>Initiative</Label>
                <input
                  type="number"
                  value={initiative}
                  onChange={(e) => setInitiative(e.target.value)}
                  placeholder="+7"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label optional>Prof. Bonus</Label>
                <input
                  type="number"
                  value={profBonus}
                  onChange={(e) => setProfBonus(e.target.value)}
                  placeholder="+4"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label optional>CR</Label>
                <input
                  type="text"
                  value={cr}
                  onChange={(e) => setCr(e.target.value)}
                  placeholder="10"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label optional>XP</Label>
                <input
                  type="number"
                  value={xp}
                  onChange={(e) => setXp(e.target.value)}
                  placeholder="5900"
                  className={inputCls}
                />
              </div>
            </div>

            {/* ── Ability Scores ── */}
            <SectionHeader>Ability Scores</SectionHeader>

            <div className="grid grid-cols-6 gap-2">
              {ABILITY_SCORES.map((key) => {
                const val = abilityScores[key];
                const score = parseInt(val);
                return (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-bold tracking-wider text-[oklch(70.7%_0.022_261.3)] uppercase">
                      {ABILITY_LABELS[key]}
                    </span>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => setters[key](e.target.value)}
                      placeholder="10"
                      min={1}
                      max={30}
                      className="w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-2 py-2 text-[14px] text-center text-[oklch(21%_0.034_264.7)] outline-none focus:border-stone-400 transition-colors"
                    />
                    {val && !isNaN(score) && (
                      <span className="text-[11px] text-[oklch(70.7%_0.022_261.3)]">
                        {abilityMod(score)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Saving throws */}
            <div className="flex flex-col gap-1.5">
              <Label optional>Saving Throw Bonuses <span className="normal-case font-normal">(only if proficient)</span></Label>
              <div className="grid grid-cols-6 gap-2">
                {ABILITY_SCORES.map((key) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-bold tracking-wider text-[oklch(70.7%_0.022_261.3)] uppercase">
                      {ABILITY_LABELS[key]}
                    </span>
                    <input
                      type="number"
                      value={saveValues[key]}
                      onChange={(e) => saveSetters[key](e.target.value)}
                      placeholder="—"
                      className="w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-2 py-2 text-[14px] text-center text-[oklch(21%_0.034_264.7)] outline-none focus:border-stone-400 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Proficiencies & Senses ── */}
            <SectionHeader>Proficiencies & Senses</SectionHeader>

            {/* Skills */}
            <div className="flex flex-col gap-2">
              <Label optional>Skills</Label>
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={skill.name}
                    onChange={(e) => updateSkill(i, 'name', e.target.value)}
                    placeholder="Perception"
                    className={inputCls + ' flex-1'}
                  />
                  <input
                    type="number"
                    value={skill.bonus}
                    onChange={(e) => updateSkill(i, 'bonus', e.target.value)}
                    placeholder="+10"
                    className="w-20 rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-center text-[oklch(21%_0.034_264.7)] outline-none focus:border-stone-400 transition-colors shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="p-1.5 rounded-lg text-[oklch(70.7%_0.022_261.3)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1.5 text-[13px] text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 transition-colors self-start py-1"
              >
                <Plus size={14} />
                Add skill
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label optional>Senses</Label>
                <input
                  type="text"
                  value={senses}
                  onChange={(e) => setSenses(e.target.value)}
                  placeholder="Darkvision 120 ft., Passive Perception 20"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label optional>Languages</Label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="Deep Speech, Telepathy 120 ft."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label optional>Damage Immunities</Label>
                <input
                  type="text"
                  value={immunities}
                  onChange={(e) => setImmunities(e.target.value)}
                  placeholder="Fire, Poison"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label optional>Damage Resistances</Label>
                <input
                  type="text"
                  value={resistances}
                  onChange={(e) => setResistances(e.target.value)}
                  placeholder="Cold, Lightning"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label optional>Damage Vulnerabilities</Label>
                <input
                  type="text"
                  value={vulnerabilities}
                  onChange={(e) => setVulnerabilities(e.target.value)}
                  placeholder="Radiant"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label optional>Condition Immunities</Label>
                <input
                  type="text"
                  value={conditionImmunities}
                  onChange={(e) => setConditionImmunities(e.target.value)}
                  placeholder="Charmed, Frightened"
                  className={inputCls}
                />
              </div>
            </div>

            {/* ── Abilities ── */}
            <AbilityList label="Traits" entries={traits} onChange={setTraits} />
            <AbilityList label="Actions" entries={actions} onChange={setActions} />
            <AbilityList label="Bonus Actions" entries={bonusActions} onChange={setBonusActions} />
            <AbilityList label="Reactions" entries={reactions} onChange={setReactions} />

            {/* Legendary Actions */}
            <SectionHeader>Legendary Actions</SectionHeader>
            <div className="flex flex-col gap-1.5">
              <Label optional>Preamble text</Label>
              <textarea
                value={legendaryActionsDescription}
                onChange={(e) => setLegendaryActionsDescription(e.target.value)}
                rows={2}
                placeholder="Legendary Action Uses: 3. Immediately after another creature's turn…"
                className={inputCls + ' resize-none'}
              />
            </div>
            <AbilityList label="Legendary Actions" entries={legendaryActions} onChange={setLegendaryActions} />

            {/* ── Footer ── */}
            <div className="flex items-center justify-between pt-2">
              {onDelete ? (
                <button type="button" onClick={onDelete} className="rounded-lg py-2 px-3 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                  Delete
                </button>
              ) : <span />}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg py-2 px-4 text-[14px] font-medium text-[oklch(44.6%_0.030_256.8)] hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="rounded-lg py-2 px-4 bg-stone-950 text-white text-[14px] font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : entity ? 'Save Changes' : 'Create Monster'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
