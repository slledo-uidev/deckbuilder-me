/**
 * Card Utilities — Strategic analysis helpers for the Digimon TCG deck builder.
 *
 * Provides pure, side-effect-free functions that derive strategic metadata from
 * raw DigimonCard.io API payloads and from our own Card/EnhancedCard models.
 *
 * Design goals
 * ────────────
 * • All functions are pure (no class state, no DI needed).
 * • Regex patterns are compiled once at module load and reused across calls —
 *   critical when processing full 5 000+ card catalogs.
 * • `mapApiCardToEnhanced` is the single entry point for turning raw API data
 *   into strategically enriched cards; it delegates to the helpers below.
 */

import { Card, EnhancedCard } from '@models/index';

// ─────────────────────────────────────────────────────────────────────────────
// Pre-compiled regex patterns (module-level singletons — compiled once)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects cards that search/reveal from the deck.
 * Matches: "Reveal the top", "Reveal cards", "look at the top", "search your deck".
 */
const SEARCHER_RE =
  /\b(?:reveal\s+(?:the\s+top|cards?)|look\s+at\s+the\s+top|search\s+your\s+deck)\b/i;

/**
 * Detects Tamer cards that set memory to exactly 3.
 * The API uses curly-quote variants in some prints — both are covered.
 */
const MEMORY_SETTER_RE = /\byour\s+memory\s+becomes\s+3\b/i;

/**
 * Detects Counter / Blast Digivolve interrupt mechanics.
 * Matches: "[Counter]", "Counter", "Blast Digivolve" (with or without brackets).
 */
const BLAST_DIGIVOLVE_RE = /(?:\[counter\]|\bcounter\b|\bblast\s+digivolve\b)/i;

/**
 * Extracts all bracket-enclosed tokens from an arbitrary text string.
 * Matches tokens like [Royal Knight], [X-Antibody], [Twilight], [TS].
 * The capture group returns the inner label (without the brackets themselves).
 *
 * ⚠ The global flag is intentional — `extractBracketTokens` resets lastIndex
 *   manually so the regex can be safely reused across calls.
 */
const BRACKET_TOKEN_RE = /\[([^\]]{1,64})\]/g;

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when `text` describes a card that searches / reveals cards from
 * the deck (standard searcher role in Digimon TCG).
 */
export function isSearcherCard(effect: string): boolean {
  return SEARCHER_RE.test(effect);
}


/**
 * Returns true if the card is a Tamer that provides a memory guarantee (classic setter, mitigator, or passive engine).
 * Triggers for:
 * - "Your memory becomes 3"
 * - "If you have 4 or less memory, gain 1 memory"
 * - "Start of Your Main Phase] ... gain 1 memory"
 */
const MEMORY_GUARANTEE_RE = /your memory becomes 3|if you have 4 or less memory, gain 1 memory|start of your main phase[^\]]*\]?[\s\S]*gain 1 memory/i;
export function providesMemoryGuarantee(cardType: string, effect: string): boolean {
  return cardType === 'Tamer' && MEMORY_GUARANTEE_RE.test(effect);
}

/**
 * Returns true when the effect text contains a Counter or Blast Digivolve
 * interrupt mechanic keyword.
 */
export function isBlastDigivolveCard(effect: string): boolean {
  return BLAST_DIGIVOLVE_RE.test(effect);
}

/**
 * Extracts and deduplicates all bracket-enclosed archetype/trait tokens from
 * one or more text sources (typically main_effect and attribute).
 *
 * Examples:
 *   "[Royal Knight] [X-Antibody]"  →  ["Royal Knight", "X-Antibody"]
 *   "[Twilight] [Twilight]"         →  ["Twilight"]      (deduplicated)
 *
 * Tokens are trimmed but their original casing is preserved so that names like
 * "X-Antibody" display correctly in the UI.
 *
 * Performance: uses a single global regex with manual `lastIndex` reset instead
 * of creating a new RegExp instance per call.
 */
export function extractArchetypes(...sources: (string | undefined | null)[]): string[] {
  const seen = new Set<string>();

  for (const source of sources) {
    if (!source) continue;

    // Reset the global regex before each use (required when reusing /g regexes).
    BRACKET_TOKEN_RE.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = BRACKET_TOKEN_RE.exec(source)) !== null) {
      const token = match[1].trim();

      // Skip empty tokens and generic mechanic keywords that are not archetypes.
      // These keywords appear as [keyword] in effect text but represent game
      // mechanics rather than card groupings (archetype / trait).
      if (token && !MECHANIC_KEYWORDS.has(token.toLowerCase())) {
        seen.add(token);
      }
    }
  }

  return Array.from(seen);
}

/**
 * Set of bracket-enclosed tokens that are Digimon TCG game mechanics, NOT
 * archetype/trait labels.  Extend this list as new mechanic keywords appear
 * in future sets (all lowercase for case-insensitive comparison).
 */
const MECHANIC_KEYWORDS = new Set([
  // Timing / trigger keywords
  'on play',
  'when digivolving',
  'when attacking',
  'end of attack',
  'your turn',
  'opponent\'s turn',
  'all turns',
  'once per turn',
  'start of your turn',
  'end of your turn',
  'start of opponent\'s turn',
  // Effect delivery
  'counter',
  'security attack',
  'security',
  // Digivolve variants
  'digivolve',
  'blast digivolve',
  'dna digivolve',
  'armor purge',
  // Common mechanics
  'reboot',
  'blocker',
  'jamming',
  'de-digivolve',
  'draw',
  'trash',
  'suspend',
  'rush',
  'piercing',
  'evade',
  'barrier',
  'blitz',
  // Source / inherited indicator
  'inherited effect',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Primary mapper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Receives a raw card object from the DigimonCard.io API (or our own Card
 * model) and returns an EnhancedCard with all strategic analysis fields
 * computed.
 *
 * Accepts `any` as input type so it can be used both:
 *  • directly on raw API responses (`main_effect` field name), and
 *  • on already-mapped `Card` objects (`effect` field name).
 *
 * Field resolution order for the effect text:
 *   apiCard.main_effect  →  apiCard.effect  →  empty string
 *
 * @param apiCard  Raw API card payload or an existing Card object.
 * @returns        A fully populated EnhancedCard.
 *
 * @example
 * // Map a raw API response
 * const enhanced = mapApiCardToEnhanced(rawApiCard);
 *
 * // Map an already-converted Card
 * const enhanced = mapApiCardToEnhanced(card);
 *
 * // Map a full list efficiently
 * const enhancedCards = rawApiCards.map(mapApiCardToEnhanced);
 */
export function mapApiCardToEnhanced(apiCard: any): EnhancedCard {
  // ── Resolve raw field variants ──────────────────────────────────────────
  // The API uses `main_effect`; our internal Card model uses `effect`.
  const effectText: string  = apiCard.main_effect ?? apiCard.effect ?? '';
  const cardType: string    = apiCard.type ?? '';
  const attributeText: string = apiCard.attribute ?? '';

  // ── Derive strategic boolean flags ──────────────────────────────────────
  const isSearcher        = isSearcherCard(effectText);
  const providesMemoryGuaranteeFlag = providesMemoryGuarantee(cardType, effectText);
  const isBlastDigivolve  = isBlastDigivolveCard(effectText);

  // ── Extract archetype tokens from all relevant text fields ───────────────
  // We also scan source_effect (inherited) and alt_effect (security/digivolve)
  // because some archetype traits appear there (e.g. [X-Antibody] on inherited).
  const inheritedText: string = apiCard.source_effect ?? apiCard.inheritedEffect ?? '';
  const archetypes = extractArchetypes(effectText, inheritedText, attributeText);

  // ── Spread all existing Card fields, then override/add EnhancedCard fields
  return {
    ...apiCard as Card,
    isSearcher,
    providesMemoryGuarantee: providesMemoryGuaranteeFlag,
    isBlastDigivolve,
    archetypes,
  };
}

/**
 * Convenience wrapper to map an entire list of raw API cards in one pass.
 * Prefer this over `.map(mapApiCardToEnhanced)` on large arrays to keep the
 * call site readable.
 *
 * @param apiCards  Array of raw API card payloads or Card objects.
 * @returns         Array of EnhancedCards in the same order as the input.
 */
export function mapApiCardsToEnhanced(apiCards: any[]): EnhancedCard[] {
  return apiCards.map(mapApiCardToEnhanced);
}
