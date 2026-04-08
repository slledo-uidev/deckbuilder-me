/**
 * Shared utility functions for deck operations
 */

import { CardType } from '@core/models';
import { Deck, DeckArchetypeGroup, UNCLASSIFIED_ARCHETYPE } from '@core/models';

export interface DeckCard {
  card: any;
  quantity: number;
}

/**
 * Calculate total card count from an array of DeckCards
 */
export function getTotalCardCount(deckCards: DeckCard[]): number {
  return deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
}

/**
 * Sort deck cards following Digimon TCG deck construction order:
 * 1. Digimon (ordered by level: 3, 4, 5, 6, 7, 8)
 * 2. Tamers
 * 3. Options
 * Within each block, sort by set number (BT1-074, BT1-075, BT2-024)
 */
export function sortDeckCards(deckCards: DeckCard[]): DeckCard[] {
  return [...deckCards].sort((a, b) => {
    const cardA = a.card;
    const cardB = b.card;
    
    // Step 1: Sort by card type (Digimon, Tamer, Option)
    const typeOrderA = getTypeOrder(cardA.type);
    const typeOrderB = getTypeOrder(cardB.type);
    
    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB;
    }
    
    // Step 2: If both are Digimon, sort by level
    if (cardA.type === CardType.Digimon && cardB.type === CardType.Digimon) {
      const levelA = cardA.level || 0;
      const levelB = cardB.level || 0;
      
      if (levelA !== levelB) {
        return levelA - levelB;
      }
    }
    
    // Step 3: Within same type (and level for Digimon), sort by card ID
    return compareCardIds(cardA.id, cardB.id);
  });
}

/**
 * Get sort order for card type
 * Digimon = 1, Tamer = 2, Option = 3, Others = 4
 */
function getTypeOrder(type: string): number {
  const typeOrder: { [key: string]: number } = {
    [CardType.Digimon]: 1,
    [CardType.Tamer]: 2,
    [CardType.Option]: 3,
    [CardType.DigiEgg]: 0  // Digi-Eggs should come first if in main deck (edge case)
  };
  
  return typeOrder[type] || 99;
}

/**
 * Compare two card IDs for natural sorting (BT1-001, BT1-002, ..., BT1-114, BT2-001, etc.)
 * Example: BT1-074 < BT1-075 < BT2-024
 */
function compareCardIds(idA: string, idB: string): number {
  // Extract set prefix and number (e.g., "BT1-085" -> ["BT", 1, 85])
  const parseCardId = (id: string): [string, number, number] => {
    const match = id.match(/^([A-Z]+)(\d+)-(\d+)/i);
    if (!match) return ['', 0, 0];
    return [match[1].toUpperCase(), parseInt(match[2], 10), parseInt(match[3], 10)];
  };
  
  const [prefixA, setNumA, cardNumA] = parseCardId(idA);
  const [prefixB, setNumB, cardNumB] = parseCardId(idB);
  
  // Custom prefix order: AD, BT, EX, LM, P, ST
  const prefixOrder: { [key: string]: number } = {
    'AD': 1,
    'BT': 2,
    'EX': 3,
    'LM': 4,
    'P': 5,
    'ST': 6
  };
  
  // Compare prefix first with custom order
  if (prefixA !== prefixB) {
    const orderA = prefixOrder[prefixA] || 999;
    const orderB = prefixOrder[prefixB] || 999;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // If both have unknown prefixes, use alphabetical
    return prefixA.localeCompare(prefixB);
  }
  
  // Then compare set number
  if (setNumA !== setNumB) {
    return setNumA - setNumB;
  }
  
  // Finally compare card number
  return cardNumA - cardNumB;
}

/**
 * Get CSS class name from card color array
 */
export function getCardColorClass(colors: string | string[]): string {
  if (!colors) return 'default';
  
  const colorArray = Array.isArray(colors) ? colors : [colors];
  if (colorArray.length === 0) return 'default';
  
  return colorArray[0].toLowerCase();
}

/**
 * Format card count display (e.g., "5/50")
 */
export function formatCardCount(current: number, max?: number): string {
  return max !== undefined ? `${current}/${max}` : `${current}`;
}

/**
 * Check if a number is within a valid range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Group a flat list of decks by archetype for the Advanced Decklist view.
 *
 * - Decks without an archetype are grouped under UNCLASSIFIED_ARCHETYPE.
 * - Within each group, decks are sorted by updatedAt descending (newest first).
 * - Groups themselves are sorted by latestUpdatedAt descending.
 * - colors is the deduped union of all colors across decks in the group.
 * - thumbnailCardId comes from the most recently updated deck.
 */
export function groupDecksByArchetype(decks: Deck[]): DeckArchetypeGroup[] {
  // 1. Build a map archetype → Deck[]
  const map = new Map<string, Deck[]>();

  for (const deck of decks) {
    const key = deck.archetype?.trim() || UNCLASSIFIED_ARCHETYPE;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(deck);
  }

  // 2. Convert to DeckArchetypeGroup[], sort decks within each group
  const groups: DeckArchetypeGroup[] = [];

  map.forEach((groupDecks, archetype) => {
    // Sort decks newest-first
    const sorted = [...groupDecks].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Most recent deck drives the thumbnail
    const newest = sorted[0];

    // Deduped color union preserving insertion order
    const colorSet = new Set<string>();
    for (const d of sorted) {
      for (const c of d.colors ?? []) {
        colorSet.add(c);
      }
    }

    groups.push({
      archetype,
      decks: sorted,
      latestUpdatedAt: new Date(newest.updatedAt),
      colors: Array.from(colorSet) as any[],
      thumbnailCardId: newest.placeholderCardId
    });
  });

  // 3. Sort groups newest-first; UNCLASSIFIED always goes to the end
  groups.sort((a, b) => {
    if (a.archetype === UNCLASSIFIED_ARCHETYPE) return 1;
    if (b.archetype === UNCLASSIFIED_ARCHETYPE) return -1;
    return b.latestUpdatedAt.getTime() - a.latestUpdatedAt.getTime();
  });

  return groups;
}
