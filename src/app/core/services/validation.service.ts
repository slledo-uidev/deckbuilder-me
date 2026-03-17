/**
 * Validation Service - Deck validation logic
 * Validates decks against official Digimon TCG rules
 */

import { Injectable } from '@angular/core';
import {
  Deck,
  DeckCard,
  DeckValidation,
  ValidationError,
  ValidationWarning,
  DEFAULT_VALIDATION_RULES,
  DeckValidationRules
} from '@models/deck.model';
import { CardType } from '@models/card.model';
import { CardService } from './card.service';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private rules: DeckValidationRules = DEFAULT_VALIDATION_RULES;
  
  constructor(private cardService: CardService) {}
  
  /**
   * Validate a deck against TCG rules
   * @param deck - Deck to validate
   * @returns Validation result with errors and warnings
   */
  public validateDeck(deck: Deck): DeckValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate Digi-Eggs zone
    this.validateDigiEggs(deck, errors, warnings);
    
    // Validate Main Deck zone
    this.validateMainDeck(deck, errors, warnings);
    
    // Validate Side Deck zone (optional)
    this.validateSideDeck(deck, errors, warnings);
    
    // Validate card copy limits across all zones
    this.validateCopyLimits(deck, errors);
    
    // Validate Digi-Eggs are only Digi-Egg type cards
    this.validateDigiEggTypes(deck, errors);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate Digi-Eggs zone
   */
  private validateDigiEggs(
    deck: Deck,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const eggCount = this.getTotalCards(deck.digiEggs);
    
    if (eggCount < this.rules.digiEggsMin) {
      errors.push({
        code: 'DIGI_EGGS_TOO_FEW',
        message: `Digi-Eggs must have exactly ${this.rules.digiEggsMin} cards (current: ${eggCount})`,
        field: 'digiEggs'
      });
    } else if (eggCount > this.rules.digiEggsMax) {
      errors.push({
        code: 'DIGI_EGGS_TOO_MANY',
        message: `Digi-Eggs cannot exceed ${this.rules.digiEggsMax} cards (current: ${eggCount})`,
        field: 'digiEggs'
      });
    }
    
    // Warning if less than 5 but not error yet
    if (eggCount < this.rules.digiEggsMin && eggCount > 0) {
      warnings.push({
        code: 'DIGI_EGGS_INCOMPLETE',
        message: `Digi-Eggs incomplete: ${eggCount}/${this.rules.digiEggsMin} cards`,
        field: 'digiEggs'
      });
    }
  }
  
  /**
   * Validate Main Deck zone
   */
  private validateMainDeck(
    deck: Deck,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const mainCount = this.getTotalCards(deck.mainDeck);
    
    if (mainCount < this.rules.mainDeckMin) {
      errors.push({
        code: 'MAIN_DECK_TOO_FEW',
        message: `Main Deck must have exactly ${this.rules.mainDeckMin} cards (current: ${mainCount})`,
        field: 'mainDeck'
      });
    } else if (mainCount > this.rules.mainDeckMax) {
      errors.push({
        code: 'MAIN_DECK_TOO_MANY',
        message: `Main Deck cannot exceed ${this.rules.mainDeckMax} cards (current: ${mainCount})`,
        field: 'mainDeck'
      });
    }
    
    // Warning if deck is being built
    if (mainCount < this.rules.mainDeckMin && mainCount > 0) {
      warnings.push({
        code: 'MAIN_DECK_INCOMPLETE',
        message: `Main Deck incomplete: ${mainCount}/${this.rules.mainDeckMin} cards`,
        field: 'mainDeck'
      });
    }
  }
  
  /**
   * Validate Side Deck zone
   */
  private validateSideDeck(
    deck: Deck,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const sideCount = this.getTotalCards(deck.sideDeck);
    
    // Note: No official limit for Side Deck in Digimon TCG
    // This is informational only
    if (sideCount > 0) {
      warnings.push({
        code: 'SIDE_DECK_INFO',
        message: `Side Deck contains ${sideCount} cards (no official limit)`,
        field: 'sideDeck'
      });
    }
  }
  
  /**
   * Validate card copy limits (max 4 per card name)
   */
  private validateCopyLimits(deck: Deck, errors: ValidationError[]): void {
    const cardCounts = new Map<string, number>();
    
    // Count cards across all zones (Main + Side)
    const allCards = [...deck.mainDeck, ...deck.sideDeck];
    
    allCards.forEach(deckCard => {
      const currentCount = cardCounts.get(deckCard.cardId) || 0;
      cardCounts.set(deckCard.cardId, currentCount + deckCard.quantity);
    });
    
    // Check for violations
    cardCounts.forEach((count, cardId) => {
      if (count > this.rules.maxCopiesPerCard) {
        errors.push({
          code: 'TOO_MANY_COPIES',
          message: `Card "${cardId}" exceeds limit: ${count}/${this.rules.maxCopiesPerCard} copies`,
          field: cardId
        });
      }
    });
  }
  
  /**
   * Validate Digi-Eggs only contain Digi-Egg type cards
   */
  private validateDigiEggTypes(deck: Deck, errors: ValidationError[]): void {
    // This would require checking card types from CardService
    // For now, we'll add a placeholder that can be implemented
    // when card data is available
    
    // TODO: Fetch cards and verify types
    // deck.digiEggs.forEach(deckCard => {
    //   const card = this.cardService.getCardById(deckCard.cardId);
    //   if (card && card.type !== CardType.DigiEgg) {
    //     errors.push({
    //       code: 'INVALID_DIGI_EGG_TYPE',
    //       message: `Card "${card.name}" is not a Digi-Egg type`,
    //       field: 'digiEggs'
    //     });
    //   }
    // });
  }
  
  /**
   * Get total number of cards in a zone
   */
  private getTotalCards(deckCards: DeckCard[]): number {
    return deckCards.reduce((sum, card) => sum + card.quantity, 0);
  }
  
  /**
   * Quick check if deck is ready to save (has critical errors)
   */
  public canSaveDeck(deck: Deck): boolean {
    const validation = this.validateDeck(deck);
    return validation.isValid;
  }
  
  /**
   * Get human-readable validation summary
   */
  public getValidationSummary(validation: DeckValidation): string {
    if (validation.isValid) {
      return 'Deck is valid and ready to save';
    }
    
    const errorCount = validation.errors.length;
    const warningCount = validation.warnings.length;
    
    let summary = '';
    if (errorCount > 0) {
      summary += `${errorCount} error${errorCount > 1 ? 's' : ''}`;
    }
    if (warningCount > 0) {
      if (summary) summary += ', ';
      summary += `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    }
    
    return summary;
  }
  
  /**
   * Update validation rules (for future format support)
   */
  public setValidationRules(rules: Partial<DeckValidationRules>): void {
    this.rules = { ...this.rules, ...rules };
  }
  
  /**
   * Reset to default validation rules
   */
  public resetValidationRules(): void {
    this.rules = DEFAULT_VALIDATION_RULES;
  }
}
