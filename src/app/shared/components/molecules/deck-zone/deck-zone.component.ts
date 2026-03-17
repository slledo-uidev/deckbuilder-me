import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../../../core/models/card.model';

export interface DeckCard {
  card: Card;
  quantity: number;
}

@Component({
  selector: 'app-deck-zone',
  templateUrl: './deck-zone.component.html',
  styleUrls: ['./deck-zone.component.scss']
})
export class DeckZoneComponent {
  @Input() title: string = '';
  @Input() deckCards: DeckCard[] = [];
  @Input() maxCards: number = 50;
  @Input() zoneType: 'digi-eggs' | 'main' | 'side' = 'main';
  @Input() isEmpty: boolean = true;
  @Input() isCardAtMaxCopies?: (cardId: string) => boolean;
  
  @Output() removeCard = new EventEmitter<Card>();
  @Output() decreaseQuantity = new EventEmitter<Card>();
  @Output() increaseQuantity = new EventEmitter<Card>();

  get totalCards(): number {
    return this.deckCards.reduce((sum, dc) => sum + dc.quantity, 0);
  }

  get isValid(): boolean {
    if (this.zoneType === 'digi-eggs') {
      return this.totalCards === 5;
    }
    if (this.zoneType === 'main') {
      return this.totalCards === 50;
    }
    return true; // Side deck has no fixed limit
  }

  get statusClass(): string {
    if (this.isEmpty) return 'empty';
    if (this.zoneType === 'side') return 'valid';
    
    if (this.zoneType === 'digi-eggs') {
      if (this.totalCards === 5) return 'valid';
      if (this.totalCards < 5) return 'warning';
      return 'error';
    }
    
    if (this.zoneType === 'main') {
      if (this.totalCards === 50) return 'valid';
      if (this.totalCards < 50) return 'warning';
      return 'error';
    }
    
    return 'empty';
  }

  onRemoveCard(card: Card): void {
    this.removeCard.emit(card);
  }

  onDecreaseQuantity(card: Card): void {
    this.decreaseQuantity.emit(card);
  }

  onIncreaseQuantity(card: Card): void {
    this.increaseQuantity.emit(card);
  }

  getCardColorClass(colors: string[]): string {
    if (!colors || colors.length === 0) return 'default';
    return colors[0].toLowerCase();
  }

  isIncreaseDisabled(deckCard: DeckCard): boolean {
    // Check if card has reached maximum copies across all zones
    if (this.isCardAtMaxCopies) {
      return this.isCardAtMaxCopies(deckCard.card.id);
    }
    // Fallback: just check local quantity (shouldn't happen in practice)
    return deckCard.quantity >= 4;
  }
}
