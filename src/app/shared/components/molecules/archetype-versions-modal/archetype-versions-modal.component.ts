import { Component, Input, Output, EventEmitter, OnChanges, HostBinding } from '@angular/core';
import { Deck, DeckArchetypeGroup, Archetype } from '@core/models';

export type DeckActionType = 'load' | 'export' | 'delete';

export interface DeckAction {
  action: DeckActionType;
  deck: Deck;
}

export interface ArchetypeUpdateData {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-archetype-versions-modal',
  templateUrl: './archetype-versions-modal.component.html',
  styleUrls: ['./archetype-versions-modal.component.scss']
})
export class ArchetypeVersionsModalComponent implements OnChanges {
  @Input() group: DeckArchetypeGroup | null = null;
  @Input() archetype: Archetype | null = null;
  @Input() isOpen: boolean = false;

  @Output() closed = new EventEmitter<void>();
  @Output() deckAction = new EventEmitter<DeckAction>();
  @Output() openInEditor = new EventEmitter<Deck>();
  @Output() archetypeUpdated = new EventEmitter<ArchetypeUpdateData>();
  @Output() newVersion = new EventEmitter<Deck>();
  @Output() favoriteToggled = new EventEmitter<{ deck: Deck; isFavorite: boolean }>();

  @HostBinding('class.is-closing') isClosingAnim = false;

  /** Id del deck que tiene el confirm de borrado abierto */
  pendingDeleteId: string | null = null;

  /** Estado de edición del sidebar */
  isEditingSidebar = false;
  editName = '';
  editDescription = '';

  /** Deck marcado como favorito (base version) dentro del grupo actual */
  get favoriteDeck(): Deck | null {
    return this.group?.decks.find(d => d.isFavorite) ?? null;
  }

  ngOnChanges(): void {
    if (!this.isOpen) {
      this.pendingDeleteId = null;
      this.isEditingSidebar = false;
    }
  }

  onClose(): void {
    if (this.isClosingAnim) return;
    this.isClosingAnim = true;
    setTimeout(() => {
      this.isClosingAnim = false;
      this.pendingDeleteId = null;
      this.isEditingSidebar = false;
      this.closed.emit();
    }, 420);
  }

  onLoad(deck: Deck): void {
    this.deckAction.emit({ action: 'load', deck });
    // No cerramos el modal — el view-deck se abre encima
  }

  onOpenEditor(deck: Deck): void {
    this.openInEditor.emit(deck);
    this.onClose();
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

  // ─── Edición del sidebar ─────────────────────────────────────────────────────

  onStartEditSidebar(): void {
    this.editName = this.archetype?.name ?? this.group?.archetype ?? '';
    this.editDescription = this.archetype?.description ?? '';
    this.isEditingSidebar = true;
  }

  onSaveEditSidebar(): void {
    const trimmedName = this.editName.trim();
    if (!trimmedName || !this.archetype) return;
    this.archetypeUpdated.emit({
      id: this.archetype.id,
      name: trimmedName,
      description: this.editDescription.trim() || undefined
    });
    this.isEditingSidebar = false;
  }

  onCancelEditSidebar(): void {
    this.isEditingSidebar = false;
  }

  onSidebarKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancelEditSidebar();
    }
  }

  // ─── Favorito y nueva versión ────────────────────────────────────────────────

  onToggleFavorite(deck: Deck): void {
    // Si ya es favorito, lo desfavorita; si no, lo marca como favorito (y quita al anterior)
    const isFavorite = !deck.isFavorite;
    this.favoriteToggled.emit({ deck, isFavorite });
  }

  onNewVersion(): void {
    const base = this.favoriteDeck ?? this.group?.decks[0] ?? null;
    if (base) {
      this.newVersion.emit(base);
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
