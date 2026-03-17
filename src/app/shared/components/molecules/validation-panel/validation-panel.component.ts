import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ValidationService } from '../../../../core/services/validation.service';
import { Deck, DeckValidation, ValidationError, ValidationWarning } from '../../../../core/models/deck.model';
import { getTotalCardCount } from '../../../utils/deck.utils';

export interface DeckCard {
  card: any;
  quantity: number;
}

@Component({
  selector: 'app-validation-panel',
  templateUrl: './validation-panel.component.html',
  styleUrls: ['./validation-panel.component.scss']
})
export class ValidationPanelComponent implements OnChanges {
  @Input() digiEggs: DeckCard[] = [];
  @Input() mainDeck: DeckCard[] = [];
  @Input() sideDeck: DeckCard[] = [];
  @Input() deckName: string = 'Untitled Deck';

  validation: DeckValidation | null = null;
  isExpanded = true;

  constructor(private validationService: ValidationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Re-validate whenever deck zones change
    if (changes['digiEggs'] || changes['mainDeck'] || changes['sideDeck']) {
      this.validateDeck();
    }
  }

  private validateDeck(): void {
    // Convert DeckCard[] to Deck format for validation
    const deck: Deck = {
      id: 'temp',
      name: this.deckName,
      digiEggs: this.digiEggs.map(dc => ({
        cardId: dc.card.id,
        quantity: dc.quantity
      })),
      mainDeck: this.mainDeck.map(dc => ({
        cardId: dc.card.id,
        quantity: dc.quantity
      })),
      sideDeck: this.sideDeck.map(dc => ({
        cardId: dc.card.id,
        quantity: dc.quantity
      })),
      colors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.validation = this.validationService.validateDeck(deck);
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get statusClass(): 'valid' | 'warning' | 'error' | 'unknown' {
    if (!this.validation) return 'unknown';
    if (this.validation.isValid) return 'valid';
    if (this.validation.errors.length > 0) return 'error';
    if (this.validation.warnings.length > 0) return 'warning';
    return 'unknown';
  }

  get statusText(): string {
    if (!this.validation) return 'Validating...';
    if (this.validation.isValid) return 'Deck is valid';
    if (this.validation.errors.length > 0) {
      return `${this.validation.errors.length} error${this.validation.errors.length > 1 ? 's' : ''}`;
    }
    if (this.validation.warnings.length > 0) {
      return `${this.validation.warnings.length} warning${this.validation.warnings.length > 1 ? 's' : ''}`;
    }
    return 'Status unknown';
  }

  get totalCards(): number {
    return getTotalCardCount(this.digiEggs) + 
           getTotalCardCount(this.mainDeck) + 
           getTotalCardCount(this.sideDeck);
  }

  get digiEggsCount(): number {
    return getTotalCardCount(this.digiEggs);
  }

  get mainDeckCount(): number {
    return getTotalCardCount(this.mainDeck);
  }

  get sideDeckCount(): number {
    return getTotalCardCount(this.sideDeck);
  }
}
