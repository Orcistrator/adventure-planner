import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'gemma4:latest';

const SYSTEM_PROMPT =
  'You are a Dungeons & Dragons 5e game master assistant. Generate realistic, flavourful entity data in JSON. Follow D&D 5e rules and conventions. Return only valid JSON with no explanation or markdown.';

type EntityType = 'monster' | 'character' | 'item' | 'location';
type EntityField = 'description' | 'personality' | 'ideals' | 'bonds' | 'flaws' | 'backstory' | 'itemProperties';

// ── Full entity generation ────────────────────────────────────────────────────

function buildFullPrompt(name: string, type: EntityType): string {
  switch (type) {
    case 'monster':
      return `Generate a complete D&D 5e monster stat block for: "${name}"

Return a JSON object with exactly these fields:
{
  "description": "2-3 sentence flavour text / lore",
  "size": "one of: Tiny, Small, Medium, Large, Huge, Gargantuan",
  "creatureType": "one of: Aberration, Beast, Celestial, Construct, Dragon, Elemental, Fey, Fiend, Giant, Humanoid, Monstrosity, Ooze, Plant, Undead",
  "alignment": "one of: Lawful Good, Neutral Good, Chaotic Good, Lawful Neutral, True Neutral, Chaotic Neutral, Lawful Evil, Neutral Evil, Chaotic Evil, Unaligned",
  "ac": 14,
  "acNote": "e.g. natural armor",
  "hp": 58,
  "hpFormula": "e.g. 9d8 + 18",
  "speed": "e.g. 30 ft., fly 60 ft.",
  "cr": "e.g. 4",
  "xp": 1100,
  "proficiencyBonus": 2,
  "str": 16, "dex": 12, "con": 14, "int": 8, "wis": 10, "cha": 6,
  "senses": "e.g. Darkvision 60 ft., Passive Perception 12",
  "languages": "e.g. Common, Goblin",
  "immunities": "",
  "resistances": "",
  "vulnerabilities": "",
  "conditionImmunities": "",
  "traits": [{"name": "string", "description": "string"}],
  "actions": [{"name": "string", "description": "string"}],
  "bonusActions": [],
  "reactions": []
}`;

    case 'character':
      return `Generate a complete D&D 5e NPC profile for: "${name}"

Return a JSON object with exactly these fields:
{
  "description": "Physical appearance in 2-3 sentences",
  "role": "e.g. Blacksmith, Innkeeper, Cult Leader",
  "race": "e.g. Human, Half-Elf, Dwarf",
  "alignment": "one of: Lawful Good, Neutral Good, Chaotic Good, Lawful Neutral, True Neutral, Chaotic Neutral, Lawful Evil, Neutral Evil, Chaotic Evil, Unaligned",
  "ac": 11,
  "acNote": "e.g. leather armor",
  "hp": 18,
  "hpFormula": "e.g. 4d8 + 4",
  "speed": "30 ft.",
  "cr": "1/4",
  "proficiencyBonus": 2,
  "str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 12,
  "senses": "Passive Perception 10",
  "languages": "Common",
  "personality": "1-2 sentences about mannerisms and how they speak",
  "ideals": "What drives or motivates this person",
  "bonds": "Who or what do they care most about",
  "flaws": "Their weakness, vice, or blind spot",
  "backstory": "2-3 sentences of background history",
  "traits": [],
  "actions": [{"name": "string", "description": "string"}],
  "reactions": []
}`;

    case 'item':
      return `Generate a D&D 5e magic item for: "${name}"

Return a JSON object with exactly these fields:
{
  "description": "3-4 sentences describing appearance, history, and magical effects",
  "itemType": "one of: Weapon, Armor, Shield, Potion, Scroll, Ring, Rod, Staff, Wand, Wondrous Item, Adventuring Gear, Tool, Other",
  "rarity": "one of: Common, Uncommon, Rare, Very Rare, Legendary, Artifact",
  "requiresAttunement": false,
  "cost": "e.g. 500 gp",
  "weight": "e.g. 1 lb.",
  "itemProperties": "Special properties, damage dice, bonuses, charges, and rules text"
}`;

    case 'location':
      return `Generate a D&D 5e location for: "${name}"

Return a JSON object with exactly these fields:
{
  "description": "3-4 sentences describing atmosphere, history, and what makes this place notable",
  "locationType": "one of: Dungeon, Cave, Ruin, Town, City, Village, Outpost, Fortress, Temple, Forest, Wilderness, Swamp, Mountain, Coast, Underdark, Planar, Building, Other",
  "region": "Name of the surrounding region or territory",
  "notableFeatures": ["feature 1", "feature 2", "feature 3", "feature 4"]
}`;
  }
}

// ── Single-field generation ───────────────────────────────────────────────────

function buildFieldPrompt(
  name: string,
  type: EntityType,
  field: EntityField,
  context: Record<string, string>
): string {
  const ctxParts = Object.entries(context)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`);
  const ctx = ctxParts.length ? ` (${ctxParts.join(', ')})` : '';

  switch (field) {
    case 'description':
      switch (type) {
        case 'monster':  return `Write a 2-3 sentence atmospheric flavour text / lore for a D&D 5e monster named "${name}"${ctx}. Return JSON: {"value": "the text"}`;
        case 'character': return `Write a 2-3 sentence physical description of D&D 5e NPC "${name}"${ctx}. Include appearance and bearing. Return JSON: {"value": "the text"}`;
        case 'item':     return `Write a 3-4 sentence description of the appearance, history, and magical qualities of D&D 5e item "${name}"${ctx}. Return JSON: {"value": "the text"}`;
        case 'location': return `Write a 3-4 sentence description of D&D 5e location "${name}"${ctx}. Cover atmosphere, history, and what makes it notable. Return JSON: {"value": "the text"}`;
      }
    case 'personality':
      return `Write 1-2 sentences about the personality, mannerisms, and speech patterns of D&D 5e NPC "${name}"${ctx}. Return JSON: {"value": "the text"}`;
    case 'ideals':
      return `Write what drives or motivates D&D 5e NPC "${name}"${ctx} — their core beliefs or ideals (1 sentence). Return JSON: {"value": "the text"}`;
    case 'bonds':
      return `Write who or what D&D 5e NPC "${name}"${ctx} cares most about (1 sentence). Return JSON: {"value": "the text"}`;
    case 'flaws':
      return `Write the weakness, vice, or blind spot of D&D 5e NPC "${name}"${ctx} (1 sentence). Return JSON: {"value": "the text"}`;
    case 'backstory':
      return `Write a 2-3 sentence background and history for D&D 5e NPC "${name}"${ctx}. Return JSON: {"value": "the text"}`;
    case 'itemProperties':
      return `Write the mechanical properties, charges, bonuses, and exact rules text for D&D 5e item "${name}"${ctx}. Be specific and rules-accurate. Return JSON: {"value": "the text"}`;
  }
  return `Generate content for the "${field}" field of a D&D 5e ${type} named "${name}"${ctx}. Return JSON: {"value": "the text"}`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    name: string;
    type: EntityType;
    field?: EntityField;
    context?: Record<string, string>;
  };

  const { name, type, field, context = {} } = body;

  if (!name?.trim() || !type) {
    return NextResponse.json({ error: 'name and type are required' }, { status: 400 });
  }

  const prompt = field
    ? buildFieldPrompt(name, type, field, context)
    : buildFullPrompt(name, type);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  let ollamaRes: Response;
  try {
    ollamaRes = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        format: 'json',
        stream: false,
      }),
    });
  } catch (e) {
    const isTimeout = e instanceof Error && e.name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? 'Ollama timed out after 120s' : 'Could not reach Ollama — is it running on port 11434?' },
      { status: isTimeout ? 504 : 503 }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!ollamaRes.ok) {
    return NextResponse.json({ error: 'Ollama request failed' }, { status: 502 });
  }

  const data = await ollamaRes.json();
  const content: string = data.message?.content ?? '';
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: content }, { status: 500 });
  }
}
