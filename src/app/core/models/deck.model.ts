/**
 * Deck Model - Deck structure and interfaces
 */

import { Color } from './card.model';

export enum GameFormat {
  Standard = 'Standard',       // Only recent sets
  Unlimited = 'Unlimited'      // All cards allowed
}

export interface DeckCard {
  cardId: string;              // Reference to Card.id
  quantity: number;            // Number of copies (1-5)
  variantId?: string;          // Preferred variant (optional)
}

export interface Deck {
  // Identification
  id: string;                  // UUID
  name: string;                // Deck name
  description?: string;        // Optional description
  
  // Deck composition (three zones)
  digiEggs: DeckCard[];        // Digi-Eggs zone (max 5 exact)
  mainDeck: DeckCard[];        // Main Deck zone (max 50 exact)
  sideDeck: DeckCard[];        // Side Deck zone (no official limit)
  
  // Metadata
  colors: Color[];             // Primary colors (auto-calculated)
  placeholderCardId?: string;  // Card to display as deck thumbnail
  format?: GameFormat;         // Game format
  archetype?: string;          // Archetype name (e.g., "Medusamon")
  tags?: string[];             // Custom tags
  
  // Timestamps
  createdAt: Date;             // Creation date
  updatedAt: Date;             // Last modification date
  
  // Community features (for shared decks)
  isPublic?: boolean;          // Is deck shared publicly
  author?: string;             // Author name/userId
  likes?: number;              // Number of likes (public decks)
  views?: number;              // Number of views (public decks)
}

/**
 * Deck validation rules
 */
export interface DeckValidationRules {
  digiEggsMin: number;         // Minimum Digi-Eggs (5)
  digiEggsMax: number;         // Maximum Digi-Eggs (5)
  mainDeckMin: number;         // Minimum Main Deck (50)
  mainDeckMax: number;         // Maximum Main Deck (50)
  maxCopiesPerCard: number;    // Max copies of same card (4)
  sideDeckMax?: number;        // Max Side Deck (no official limit)
}

/**
 * Deck validation result
 */
export interface DeckValidation {
  isValid: boolean;            // Overall validity
  errors: ValidationError[];   // Critical errors that prevent saving
  warnings: ValidationWarning[]; // Non-critical warnings
}

export interface ValidationError {
  code: string;                // Error code (e.g., "MAIN_DECK_SIZE")
  message: string;             // Human-readable error message
  field?: string;              // Field causing error
}

export interface ValidationWarning {
  code: string;                // Warning code
  message: string;             // Human-readable warning
  field?: string;              // Field causing warning
}

/**
 * Default validation rules
 */
export const DEFAULT_VALIDATION_RULES: DeckValidationRules = {
  digiEggsMin: 5,
  digiEggsMax: 5,
  mainDeckMin: 50,
  mainDeckMax: 50,
  maxCopiesPerCard: 4,
  sideDeckMax: undefined  // No official limit
};

/**
 * Archetype — a named grouping entity managed independently of decks.
 * Decks reference an archetype by name (Deck.archetype).
 */
export interface Archetype {
  id: string;             // UUID
  name: string;           // Display name (unique per user)
  description?: string;   // Optional description
  createdAt: Date;
}

/**
 * Archetype group — used by the Advanced Decklist view.
 * Groups all decks that share the same archetype name.
 */
export const UNCLASSIFIED_ARCHETYPE = 'Unclassified';

export interface DeckArchetypeGroup {
  /** Archetype name (Deck.archetype) or UNCLASSIFIED_ARCHETYPE if not set */
  archetype: string;
  /** All decks belonging to this archetype, sorted by updatedAt desc */
  decks: Deck[];
  /** Date of the most recently updated deck in the group */
  latestUpdatedAt: Date;
  /** Union of all colors across decks in the group (deduped) */
  colors: Color[];
  /** Thumbnail URL: uses the most recently updated deck's placeholderCardId */
  thumbnailCardId?: string;
}
