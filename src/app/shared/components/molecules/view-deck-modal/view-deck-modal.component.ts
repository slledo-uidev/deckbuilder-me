import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Deck, Card } from '@core/models';

export type ViewDeckTab = 'preview' | 'decklist';

@Component({
  selector: 'app-view-deck-modal',
  templateUrl: './view-deck-modal.component.html',
  styleUrls: ['./view-deck-modal.component.scss'],
  animations: [
    trigger('slidePanel', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('520ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('520ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class ViewDeckModalComponent implements OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Input() deck: Deck | null = null;
  @Input() allCards: Card[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() openInEditor = new EventEmitter<void>();
  @Output() exportDeck = new EventEmitter<void>();
  @Output() deleteDeck = new EventEmitter<void>();

  activeTab: ViewDeckTab = 'preview';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      document.body.style.overflow = changes['isVisible'].currentValue ? 'hidden' : '';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  setTab(tab: ViewDeckTab): void {
    this.activeTab = tab;
  }

  onClose(): void {
    this.activeTab = 'preview';
    this.close.emit();
  }

  onOpenInEditor(): void {
    this.openInEditor.emit();
  }

  onExportDeck(): void {
    this.exportDeck.emit();
  }

  onDeleteDeck(): void {
    this.deleteDeck.emit();
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
