export type EntityType = 'monster' | 'character' | 'item' | 'location';

export interface EntityStats {
  ac?: number;
  hp?: number;
  speed?: string;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  stats?: EntityStats;
  image?: string;
}

export interface TreasureTableItem {
  roll: string;
  result: string;
  entityId?: string; // optional reference to an entity
}
