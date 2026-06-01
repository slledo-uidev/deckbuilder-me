/**
 * Deck Analysis Utilities — Strategic deck classification for Digimon TCG.
 *
 * Provides the `detectDeckEngine` function that accepts a flat array of
 * EnhancedCard objects (duplicates included, one entry per physical copy) and
 * returns a `DeckEngine` strategy identifier.
 *
 * Detection pipeline — runs top-to-bottom, returns on the first match:
 *  1. ROYAL_KNIGHTS_ZOO  — RK-trait concentration or high-level Zoo structure.
 *  2. ARCHETYPE_<TRAIT>  — one non-generic trait covers >55 % of Digimon.
 *  3. CLASSIC_EVOLUTION  — healthy Lv3 > Lv4 > Lv5 > Lv6 pyramid.
 *  4. UNCLASSIFIED       — fallback when no pattern matches.
 *
 * Design goals
 * ────────────
 * • Pure functions — no class state, safe for unit tests.
 * • All lookup sets are module-level singletons — no per-call allocations.
 * • Easily extendable: add new Zoo variants by inserting a rule block before
 *   the archetype check; add new generic filters by updating GENERIC_ARCHETYPES.
 */

import { CardType, EnhancedCard } from '@models/index';

// ─────────────────────────────────────────────────────────────────────────────
// Public type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All possible return values of `detectDeckEngine`.
 * `ARCHETYPE_*` variants are generated at runtime from the dominant trait name.
 *
 * @example
 * 'ARCHETYPE_TWILIGHT'       // trait "Twilight" covers >55 % of Digimon
 * 'ARCHETYPE_X_ANTIBODY'     // trait "X-Antibody" covers >55 % of Digimon
 * 'ARCHETYPE_ROYAL_KNIGHT'   // trait "Royal Knight" covers >55 % without Zoo threshold
 */
export type DeckEngine =
  | 'ROYAL_KNIGHTS_ZOO'
  | 'CLASSIC_EVOLUTION'
  | 'UNCLASSIFIED'
  | `ARCHETYPE_${string}`;

// ─────────────────────────────────────────────────────────────────────────────
// Tunable thresholds — centralised so future balance changes are one-liners
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  /**
   * Minimum number of Royal Knight-affiliated cards (by trait OR key-card name)
   * before the deck is flagged as a Royal Knights Zoo regardless of level spread.
   */
  rkCardCount: 8,
  /**
   * Fraction of the TOTAL deck that must be Lv6/Lv7 Digimon to trigger the
   * Zoo flag when the evolution line is unbalanced (e.g. 0.30 = 30 %).
   */
  highLevelRatio: 0.30,
  /**
   * Fraction of Digimon in the deck that must share a single non-generic trait
   * to classify the deck as an archetype deck (e.g. 0.55 = 55 %).
   */
  archetypeDominance: 0.55,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Static lookup data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Card names that are strong signals of a Royal Knights strategy even without
 * carrying the [Royal Knight] trait (e.g. god-tier support cards).
 * Stored normalised to lowercase for case-insensitive matching.
 */
const RK_KEY_CARD_NAMES = new Set<string>([
  'yggdrasil',
  'yggdrasil_7d6',
  'zeedmillenniummon',
  'holy sword excalibur',
]);

/**
 * Archetype tokens too broad or too mechanical to meaningfully classify a deck.
 * Extend this list whenever a new set introduces a common but non-grouping token.
 * All values must be lowercase — comparison always uses `.toLowerCase()`.
 */
const GENERIC_ARCHETYPES = new Set<string>([
  // Core Digimon attributes (these are stats, not deck archetypes)
  'vaccine', 'virus', 'data', 'free', 'unknown',
  // Very wide type families
  'dragon', 'beast', 'reptile', 'bird', 'insect',
  'nature spirits', 'earth', 'aquan', 'plant', 'sea animal',
  'machine', 'android', 'demon', 'ghost', 'fairy',
  'wizard', 'holy beast', 'dinosaur',
  // Baby / In-Training stages — too universal
  'baby', 'in-training',
  // Mechanic tokens that occasionally slip into the archetype array
  'digivolve', 'option', 'counter', 'security',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Filters the deck down to Digimon-type cards only. */
function filterDigimon(cards: EnhancedCard[]): EnhancedCard[] {
  return cards.filter(c => c.type === CardType.Digimon);
}

/**
 * Counts how many cards in the deck have Royal Knight affiliation:
 *  • carry 'Royal Knight' (case-insensitive) in their `archetypes` array, OR
 *  • have a name matching one of the known RK key-card identifiers.
 */
function countRoyalKnightsCards(cards: EnhancedCard[]): number {
  return cards.filter(c =>
    c.archetypes.some(a => a.toLowerCase() === 'royal knight') ||
    RK_KEY_CARD_NAMES.has(c.name.toLowerCase())
  ).length;
}

/**
 * Returns `true` when the deck has a healthy "pyramid" evolution line:
 * the number of Lv3 Digimon is ≥ the combined count of Lv6 + Lv7 Digimon.
 *
 * A Zoo deck inverts this: few starters, many finishers → returns `false`.
 */
function hasProportionalEvolutionLine(digimon: EnhancedCard[]): boolean {
  const lv3  = digimon.filter(c => c.level === 3).length;
  const lv67 = digimon.filter(c => c.level === 6 || c.level === 7).length;
  return lv3 >= lv67;
}

/**
 * Builds a frequency map of archetype tokens present across the given cards.
 *
 * Each entry tracks:
 *  • `count`  — how many cards in the array carry this archetype.
 *  • `label`  — the original-cased token (first occurrence wins) for display.
 *
 * Generic tokens (GENERIC_ARCHETYPES set) are silently skipped.
 * The map key is the token normalised to lowercase for deduplication.
 */
function buildArchetypeFrequency(
  cards: EnhancedCard[]
): Map<string, { count: number; label: string }> {
  const freq = new Map<string, { count: number; label: string }>();

  for (const card of cards) {
    for (const archetype of card.archetypes) {
      const key = archetype.toLowerCase().trim();
      if (!key || GENERIC_ARCHETYPES.has(key)) continue;

      const existing = freq.get(key);
      if (existing) {
        existing.count++;
      } else {
        freq.set(key, { count: 1, label: archetype.trim() });
      }
    }
  }

  return freq;
}

/**
 * Returns `true` when the Digimon counts form a strict descending pyramid:
 *   Lv3 > Lv4 > Lv5 > Lv6
 *
 * All four levels must be present (count > 0) to qualify — a mono-level deck
 * is not considered a "classic" evolution deck.
 */
function isClassicPyramid(digimon: EnhancedCard[]): boolean {
  const count = (lv: number) => digimon.filter(c => c.level === lv).length;
  const [lv3, lv4, lv5, lv6] = [3, 4, 5, 6].map(count);
  return lv3 > 0 && lv3 > lv4 && lv4 > lv5 && lv5 > lv6;
}

/**
 * Converts a raw archetype label into SCREAMING_SNAKE_CASE suitable for use
 * as the tail of a `DeckEngine` identifier.
 *
 * @example
 * sanitiseLabel('Royal Knight')  // → 'ROYAL_KNIGHT'
 * sanitiseLabel('X-Antibody')    // → 'X_ANTIBODY'
 * sanitiseLabel('Blue  Flare')   // → 'BLUE_FLARE'
 */
function sanitiseLabel(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/[\s\-]+/g, '_')   // spaces and hyphens → underscore
    .replace(/[^A-Z0-9_]/g, ''); // remove any other non-alphanumeric chars
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyses a Digimon TCG deck and returns a `DeckEngine` strategy identifier.
 *
 * Pass a **flat array** where each copy of a card appears as a separate entry
 * (i.e. a 4x card contributes 4 elements). Standard deck size is 50 cards.
 * Digi-Egg cards are ignored during analysis.
 *
 * ---
 *
 * **Detection pipeline** (priority order — returns on first match):
 *
 * ### 1 — ROYAL_KNIGHTS_ZOO
 * Triggered when **either** condition holds:
 * - More than `THRESHOLDS.rkCardCount` (8) cards carry the [Royal Knight]
 *   trait or match a known RK key-card name (e.g. "Yggdrasil").
 * - Lv6 + Lv7 Digimon exceed `THRESHOLDS.highLevelRatio` (30 %) of the total
 *   deck **and** the deck lacks a proportional evolution line (Lv3 < Lv6+7).
 *
 * ### 2 — ARCHETYPE_<TRAIT>
 * Triggered when a single non-generic archetype token appears in more than
 * `THRESHOLDS.archetypeDominance` (55 %) of the Digimon cards in the deck.
 * The returned string is `'ARCHETYPE_' + SCREAMING_SNAKE_CASE(trait)`.
 * If multiple traits tie at the threshold, the one with the highest count wins.
 *
 * ### 3 — CLASSIC_EVOLUTION
 * Triggered when Digimon counts form a strict pyramid: Lv3 > Lv4 > Lv5 > Lv6,
 * with at least one Digimon at each of those four levels.
 *
 * ### 4 — UNCLASSIFIED
 * Fallback when no pattern matches (hybrid / rogue / pure-Tamer decks, etc.).
 *
 * ---
 *
 * @param cards  Flat array of EnhancedCard objects representing the deck.
 * @returns      A `DeckEngine` strategy identifier string.
 *
 * @example
 * const engine = detectDeckEngine(deckCards);
 * // → 'ARCHETYPE_TWILIGHT' | 'ROYAL_KNIGHTS_ZOO' | 'CLASSIC_EVOLUTION' | …
 */
export function detectDeckEngine(cards: EnhancedCard[]): DeckEngine {
  if (cards.length === 0) return 'UNCLASSIFIED';

  const digimon    = filterDigimon(cards);
  const totalCards = cards.length;

  // ── Rule 1: Royal Knights Zoo ─────────────────────────────────────────────

  const rkCount    = countRoyalKnightsCards(cards);
  const lv67Count  = digimon.filter(c => c.level === 6 || c.level === 7).length;
  const lv67Ratio  = lv67Count / totalCards;

  const triggeredByRkCount = rkCount > THRESHOLDS.rkCardCount;
  const triggeredByZoo     = lv67Ratio > THRESHOLDS.highLevelRatio
                          && !hasProportionalEvolutionLine(digimon);

  if (triggeredByRkCount || triggeredByZoo) {
    return 'ROYAL_KNIGHTS_ZOO';
  }

  // ── Rule 2: Archetype / Trait dominant deck ───────────────────────────────
  //    Denominator is Digimon count — archetypes live primarily on Digimon cards.

  const digimonCount = digimon.length;
  if (digimonCount > 0) {
    const freq = buildArchetypeFrequency(digimon);

    let dominantLabel  = '';
    let dominantCount  = 0;

    for (const [, { count, label }] of freq) {
      const ratio = count / digimonCount;
      if (ratio > THRESHOLDS.archetypeDominance && count > dominantCount) {
        dominantLabel = label;
        dominantCount = count;
      }
    }

    if (dominantLabel) {
      return `ARCHETYPE_${sanitiseLabel(dominantLabel)}`;
    }
  }

  // ── Rule 3: Classic Evolution ─────────────────────────────────────────────

  if (isClassicPyramid(digimon)) {
    return 'CLASSIC_EVOLUTION';
  }

  // ── Rule 4: Fallback ──────────────────────────────────────────────────────

  return 'UNCLASSIFIED';
}
