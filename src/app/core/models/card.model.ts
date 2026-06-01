/**
 * Card Model - Digimon TCG Card Interface
 * Based on DigimonCard.dev API structure
 */

export enum CardType {
  Digimon = 'Digimon',
  Tamer = 'Tamer',
  Option = 'Option',
  DigiEgg = 'Digi-Egg'
}

export enum Color {
  Red = 'Red',
  Blue = 'Blue',
  Yellow = 'Yellow',
  Green = 'Green',
  Black = 'Black',
  Purple = 'Purple',
  White = 'White'
}

export enum Rarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  SuperRare = 'Super Rare',
  SecretRare = 'Secret Rare'
}

export interface CardVariant {
  variantId: string;          // e.g., "P1", "P2", "P3"
  variantName: string;        // e.g., "Alternate Art 1"
  imageUrl: string;           // URL to variant image
}

export interface VariantInfo {
  variantNumber: number;      // Which variant this is (0 = original, 1+ = alternates)
  variantName?: string;       // Name of the variant
  totalVariants: number;      // Total number of variants including original
}

export interface Card {
  // Core identification
  id: string;                 // Unique card ID (e.g., "BT1-085")
  name: string;               // Card name (e.g., "Greymon")
  type: CardType;             // Card type
  
  // Colors and costs
  color: Color[];             // One or more colors
  cost: number;               // Play cost (0-15+)
  digivolutionCost?: number;  // Digi evolution cost (Digimon only)
  
  // Digimon-specific attributes
  level?: number;             // Level (2-7 for Digimon)
  dp?: number;                // Digi Power (Digimon only)
  form?: string;              // Form (Rookie, Champion, etc.)
  attribute?: string;         // Attribute (Vaccine, Virus, Data, etc.)
  
  // Card details
  rarity: Rarity;             // Card rarity
  set: string;                // Set name (e.g., "BT-01 New Evolution")
  cardNumber: string;         // Card number in set (e.g., "085")
  
  // Images
  imageUrl: string;           // Primary card image URL
  variants?: CardVariant[];   // Alternate art variants
  variantInfo?: VariantInfo;  // Info about which variant this card represents
  
  // Effects and text
  effect: string;             // Main effect text
  inheritedEffect?: string;   // Inherited effect (Digimon only)
  securityEffect?: string;    // Security effect
  
  // Keywords and search
  keywords: string[];         // Keywords (e.g., ["Reboot", "Blocker"])

  // Release info
  releaseDate?: string;       // ISO-like date from API (e.g. "2025-11-25 10:12:18")
}

/**
 * EnhancedCard extends Card with strategic TCG analysis fields.
 * These fields are derived at mapping time from the raw API effect text
 * and are never stored in the API — they exist only in the client layer.
 */
export interface EnhancedCard extends Card {
  /** True when the card's effect searches cards from the deck (e.g. "Reveal the top X" / "Reveal cards"). */
  isSearcher: boolean;

  /** True when the card is a Tamer that provides a memory guarantee (setter, mitigator, o motor pasivo). */
  providesMemoryGuarantee: boolean;

  /**
   * Archetype / trait tokens extracted from bracket notation in the effect text
   * (e.g. [Royal Knight], [X-Antibody], [Twilight]) plus
   * any bracket-enclosed tokens found in the `attribute` field.
   * Each entry is the bare label without brackets, deduplicated.
   */
  archetypes: string[];

  /** True when the card has Counter/Blast-Digivolve interrupt mechanics. */
  isBlastDigivolve: boolean;
}
