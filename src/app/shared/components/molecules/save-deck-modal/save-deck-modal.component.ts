import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Card } from '@core/models';

export interface SaveDeckData {
  name: string;
  placeholderCardId: string;
}

@Component({
  selector: 'app-save-deck-modal',
  templateUrl: './save-deck-modal.component.html',
  styleUrls: ['./save-deck-modal.component.scss']
})
export class SaveDeckModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() currentName = '';
  @Input() deckCards: Card[] = [];
  @Input() currentPlaceholderId?: string;

  @Output() save = new EventEmitter<SaveDeckData>();
  @Output() cancel = new EventEmitter<void>();

  deckName = '';
  nameError = '';
  selectedCardId = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Only reset selection when modal opens (isVisible changes from false to true)
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      this.deckName = this.currentName || '';
      this.nameError = '';
      
      // Auto-select current placeholder if it exists in current deck cards
      if (this.currentPlaceholderId && this.deckCards.find(c => c.id === this.currentPlaceholderId)) {
        this.selectedCardId = this.currentPlaceholderId;
      } else if (this.deckCards.length > 0) {
        // If no valid placeholder or placeholder card removed, select first card
        this.selectedCardId = this.deckCards[0].id;
      } else {
        this.selectedCardId = '';
      }
      
      console.log('Modal opened. Selected card:', this.selectedCardId);
    }
  }

  onConfirm(): void {
    const trimmed = this.deckName.trim();
    if (!trimmed) {
      this.nameError = 'Deck name is required';
      return;
    }
    if (trimmed.length > 60) {
      this.nameError = 'Name must be 60 characters or less';
      return;
    }
    if (!this.selectedCardId) {
      this.nameError = 'Please select a placeholder card';
      return;
    }
    this.save.emit({ name: trimmed, placeholderCardId: this.selectedCardId });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('save-deck-modal__backdrop')) {
      this.cancel.emit();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onConfirm();
    } else if (event.key === 'Escape') {
      this.cancel.emit();
    }
  }
  
  selectCard(cardId: string): void {
    console.log('Card selected:', cardId);
    this.selectedCardId = cardId;
    this.nameError = ''; // Clear any errors when selecting
  }
  
  getCardImageUrl(card: Card): string {
    if (card.imageUrl) {
      return card.imageUrl;
    }
    return `https://images.digimoncard.io/images/cards/${card.id}.jpg`;
  }
}
