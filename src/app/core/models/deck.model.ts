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
