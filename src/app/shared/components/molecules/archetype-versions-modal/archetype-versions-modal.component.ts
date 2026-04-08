import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Deck, DeckArchetypeGroup } from '@core/models';

export type DeckActionType = 'load' | 'copy' | 'export' | 'delete' | 'update-archetype';

export interface DeckAction {
  action: DeckActionType;
  deck: Deck;
  newArchetype?: string;   // Solo para 'update-archetype'
}

@Component({
  selector: 'app-archetype-versions-modal',
  templateUrl: './archetype-versions-modal.component.html',
  styleUrls: ['./archetype-versions-modal.component.scss']
})
export class ArchetypeVersionsModalComponent implements OnChanges {
  @Input() group: DeckArchetypeGroup | null = null;
  @Input() isOpen: boolean = false;

  @Output() closed = new EventEmitter<void>();
  @Output() deckAction = new EventEmitter<DeckAction>();

  /** Id del deck que tiene el confirm de borrado abierto */
  pendingDeleteId: string | null = null;

  /** Id del deck cuyo arquetipo se está editando inline */
  editingArchetypeId: string | null = null;
  editingArchetypeValue: string = '';

  ngOnChanges(): void {
    // Resetear estados si se cierra o cambia el grupo
    if (!this.isOpen) {
      this.pendingDeleteId = null;
      this.editingArchetypeId = null;
      this.editingArchetypeValue = '';
    }
  }

  onClose(): void {
    this.pendingDeleteId = null;
    this.editingArchetypeId = null;
    this.editingArchetypeValue = '';
    this.closed.emit();
  }

  onLoad(deck: Deck): void {
    this.deckAction.emit({ action: 'load', deck });
    this.onClose();
  }

  onCopy(deck: Deck): void {
    this.deckAction.emit({ action: 'copy', deck });
  }

  onExport(deck: Deck): void {
    this.deckAction.emit({ action: 'export', deck });
  }

  onDeleteRequest(deckId: string): void {
    this.pendingDeleteId = deckId;
  }

  onDeleteConfirm(deck: Deck): void {
    this.deckAction.emit({ action: 'delete', deck });
    this.pendingDeleteId = null;
  }

  onDeleteCancel(): void {
    this.pendingDeleteId = null;
  }

  // ─── Edición inline de arquetipo ────────────────────────────────────────────

  onEditArchetype(deck: Deck): void {
    this.editingArchetypeId = deck.id;
    this.editingArchetypeValue = deck.archetype ?? '';
    // Cerrar confirm de borrado si estaba abierto en este deck
    if (this.pendingDeleteId === deck.id) {
      this.pendingDeleteId = null;
    }
  }

  onArchetypeSave(deck: Deck): void {
    const newArchetype = this.editingArchetypeValue.trim();
    this.deckAction.emit({ action: 'update-archetype', deck, newArchetype });
    this.editingArchetypeId = null;
    this.editingArchetypeValue = '';
  }

  onArchetypeCancel(): void {
    this.editingArchetypeId = null;
    this.editingArchetypeValue = '';
  }

  onArchetypeKeydown(event: KeyboardEvent, deck: Deck): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onArchetypeSave(deck);
    } else if (event.key === 'Escape') {
      this.onArchetypeCancel();
    }
  }

  // ─── Utils ─────────────────────────────────────────────────────────────────

  getThumbnailUrl(deck: Deck): string {
    if (deck.placeholderCardId) {
      return `https://images.digimoncard.io/images/cards/${deck.placeholderCardId}.jpg`;
    }
    const firstCard = [...(deck.mainDeck ?? []), ...(deck.digiEggs ?? [])][0];
    if (firstCard?.cardId) {
      return `https://images.digimoncard.io/images/cards/${firstCard.cardId}.jpg`;
    }
    return '';
  }

  getMainCount(deck: Deck): number {
    return deck.mainDeck.reduce((sum, dc) => sum + dc.quantity, 0);
  }

  getDigiEggCount(deck: Deck): number {
    return deck.digiEggs.reduce((sum, dc) => sum + dc.quantity, 0);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  colorToClass(color: string): string {
    return `version-row__color-dot--${color.toLowerCase()}`;
  }
}
