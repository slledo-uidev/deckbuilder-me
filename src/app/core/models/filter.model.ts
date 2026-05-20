/**
 * Filter Model - Card search and filter interfaces
 */

import { CardType, Color, Rarity } from './card.model';

export interface CardFilter {
  // Text search
  searchText?: string;         // Search in card name
  
  // Type and colors
  colors?: Color[];            // Filter by colors (multi-select)
  types?: CardType[];          // Filter by card types
  
  // Cost range
  costMin?: number;            // Minimum play cost
  costMax?: number;            // Maximum play cost
  
  // Level range (Digimon only)
  levelMin?: number;           // Minimum level (2-7)
  levelMax?: number;           // Maximum level (2-7)
  
  // Set and rarity
  sets?: string[];             // Filter by specific sets
  rarities?: Rarity[];         // Filter by rarities
  
  // Keywords and effects
  keywords?: string[];         // Filter by keywords
  effectText?: string;         // Search in effect text
  
  // Attributes (Digimon only)
  attributes?: string[];       // Filter by attribute (Vaccine, Virus, Data)
  forms?: string[];            // Filter by form (Rookie, Champion, etc.)
  
  // Alternate arts
  showAlternateArts?: boolean; // Show alternate art variants (default: false)

  // Prerelease / announced-only cards
  showPrerelease?: boolean;    // Show cards not yet legally available (default: false)
}

/**
 * Sort options for card lists
 */
export enum CardSortField {
  Name = 'name',
  Cost = 'cost',
  Level = 'level',
  Type = 'type',
  Color = 'color',
  Rarity = 'rarity',
  Set = 'set'
}

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc'
}

export interface CardSort {
  field: CardSortField;
  direction: SortDirection;
}

/**
 * Pagination for card results
 */
export interface CardPagination {
  page: number;                // Current page (1-based)
  pageSize: number;            // Items per page
  totalItems: number;          // Total items available
  totalPages: number;          // Total pages
}
