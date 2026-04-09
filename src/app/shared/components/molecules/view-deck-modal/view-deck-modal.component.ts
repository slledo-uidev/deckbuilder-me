import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Deck, Card } from '@core/models';

@Component({
  selector: 'app-view-deck-modal',
  templateUrl: './view-deck-modal.component.html',
  styleUrls: ['./view-deck-modal.component.scss']
})
export class ViewDeckModalComponent {
  @Input() isVisible = false;
  @Input() deck: Deck | null = null;
  @Input() allCards: Card[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() openInEditor = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onOpenInEditor(): void {
    this.openInEditor.emit();
  }

  getCombinedCardList() {
    if (!this.deck) return [];
    return [...this.deck.digiEggs, ...this.deck.mainDeck];
  }

  getCardName(cardId: string): string {
    const card = this.allCards.find(c => c.id === cardId);
    return card ? card.name : cardId;
  }

  getPlaceholderUrl(cardId?: string): string {
    if (!cardId) return 'https://via.placeholder.com/150x210?text=No+Cards';
    const card = this.allCards.find(c => c.id === cardId);
    if (card && (card as any).imageUrl) return (card as any).imageUrl;
    return `https://images.digimoncard.io/images/cards/${cardId}.jpg`;
  }

  getMainCount(deck?: Deck | null): number {
    if (!deck) return 0;
    return deck.mainDeck.reduce((sum, dc) => sum + (dc.quantity || 0), 0);
  }

  getDigiEggCount(deck?: Deck | null): number {
    if (!deck) return 0;
    return deck.digiEggs.reduce((sum, dc) => sum + (dc.quantity || 0), 0);
  }
}
