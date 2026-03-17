/**
 * Shared utility functions for deck operations
 */

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
