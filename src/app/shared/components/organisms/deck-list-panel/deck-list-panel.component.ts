import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Deck } from '@core/models/deck.model';

@Component({
  selector: 'app-deck-list-panel',
  templateUrl: './deck-list-panel.component.html',
  styleUrls: ['./deck-list-panel.component.scss']
})
export class DeckListPanelComponent {
  @Input() decks: Deck[] = [];
  @Input() activeDeckId: string | null = null;

  @Output() loadDeck = new EventEmitter<Deck>();
  @Output() deleteDeck = new EventEmitter<string>();
  @Output() duplicateDeck = new EventEmitter<string>();
  @Output() exportDeck = new EventEmitter<string>();

  confirmDeleteId: string | null = null;

  getMainCount(deck: Deck): number {
    return deck.mainDeck.reduce((sum, dc) => sum + dc.quantity, 0);
  }

  getDigiEggCount(deck: Deck): number {
    return deck.digiEggs.reduce((sum, dc) => sum + dc.quantity, 0);
  }

  getTotalCards(deck: Deck): number {
    return this.getMainCount(deck) + this.getDigiEggCount(deck) +
           deck.sideDeck.reduce((sum, dc) => sum + dc.quantity, 0);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onLoad(deck: Deck): void {
    this.loadDeck.emit(deck);
  }

  onRequestDelete(deckId: string): void {
    this.confirmDeleteId = deckId;
  }

  onConfirmDelete(deckId: string): void {
    this.deleteDeck.emit(deckId);
    this.confirmDeleteId = null;
  }

  onCancelDelete(): void {
    this.confirmDeleteId = null;
  }

  onDuplicate(deckId: string): void {
    this.duplicateDeck.emit(deckId);
  }

  onExport(deckId: string): void {
    this.exportDeck.emit(deckId);
  }

  getColorDots(deck: Deck): string[] {
    return deck.colors || [];
  }

  colorToClass(color: string): string {
    return `deck-list-panel__color-dot--${color.toLowerCase()}`;
  }
}
