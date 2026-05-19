import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Card } from '@core/models';
import { Archetype } from '@core/models';

export interface SaveDeckData {
  name: string;
  placeholderCardId: string;
  // familyId is the authoritative selection from the dropdown. If undefined
  // or empty, no family was selected and the backend should use the default
  // 'no-family' handling.
  familyId?: string;
}

@Component({
  selector: 'app-save-deck-modal',
  templateUrl: './save-deck-modal.component.html',
  styleUrls: ['./save-deck-modal.component.scss']
})
export class SaveDeckModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() currentName = '';
  @Input() currentArchetype = '';
  @Input() currentFamilyId?: string;
  @Input() availableArchetypes: Archetype[] = [];
  @Input() deckCards: Card[] = [];
  @Input() currentPlaceholderId?: string;
  @Input() showSaveAsNew: boolean = false; // whether to render the "Save as new" CTA

  @Output() save = new EventEmitter<SaveDeckData>();
  @Output() saveAsNew = new EventEmitter<SaveDeckData>();
  @Output() cancel = new EventEmitter<void>();

  deckName = '';
  // Selected family id (supabaseFamilyId or local id)
  selectedFamilyId = '';
  nameError = '';
  selectedCardId = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Only reset selection when modal opens (isVisible changes from false to true)
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
  this.deckName = this.currentName || '';
      // If the parent passed a currentFamilyId prefer it; otherwise, if a
      // currentArchetype string is provided (legacy), try to use that as
      // initial selection.
      this.selectedFamilyId = this.currentFamilyId ? this.currentFamilyId : (this.currentArchetype || '');
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
    this.save.emit({ name: trimmed, placeholderCardId: this.selectedCardId, familyId: this.selectedFamilyId || undefined });
  }

  onConfirmSaveAsNew(): void {
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
    this.saveAsNew.emit({ name: trimmed, placeholderCardId: this.selectedCardId, familyId: this.selectedFamilyId || undefined });
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
