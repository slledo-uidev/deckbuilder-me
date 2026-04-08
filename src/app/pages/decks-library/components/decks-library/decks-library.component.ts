import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService, CardService } from '@core/services';
import { Deck, Card, DeckArchetypeGroup, Archetype } from '@core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { groupDecksByArchetype } from '@shared/utils/deck.utils';
import { DeckAction, ArchetypeUpdateData } from '@shared/components/molecules/archetype-versions-modal/archetype-versions-modal.component';
import { CreateArchetypeData } from '@shared/components/molecules/create-archetype-modal/create-archetype-modal.component';

@Component({
  selector: 'app-decks-library',
  templateUrl: './decks-library.component.html',
  styleUrls: ['./decks-library.component.scss']
})
export class DecksLibraryComponent implements OnInit, OnDestroy {
  decks: Deck[] = [];
  loading = false;
  allCards: Card[] = [];
  showAdvanced: boolean = true;

  // ─── Advanced view state ────────────────────────────────────────────────────
  archetypeGroups: DeckArchetypeGroup[] = [];
  archetypes: Archetype[] = [];
  selectedArchetypeName: string | null = null;  // nombre del grupo abierto en el modal
  isModalOpen: boolean = false;
  isCreateArchetypeModalOpen: boolean = false;

  /** Siempre devuelve el grupo actualizado desde archetypeGroups */
  get selectedGroup(): DeckArchetypeGroup | null {
    if (!this.selectedArchetypeName) return null;
    return this.archetypeGroups.find(g => g.archetype === this.selectedArchetypeName) ?? null;
  }

  private destroy$ = new Subject<void>();
  
  constructor(
    private storageService: StorageService,
    private router: Router,
    private cardService: CardService
  ) { }
  
  ngOnInit(): void {
    console.log('DecksLibraryComponent initialized');
    
    // Load all cards
    this.cardService.cards$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cards => {
        this.allCards = cards;
      });
    
    // Subscribe to saved decks
    this.storageService.decks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(decks => {
        this.decks = decks;
        this.archetypeGroups = groupDecksByArchetype(decks);
        console.log(`Loaded ${decks.length} saved decks, ${this.archetypeGroups.length} archetypes`);
      });

    // Subscribe to archetypes
    this.storageService.archetypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(archetypes => {
        this.archetypes = archetypes;
      });
  }
  
  onToggleAdvanced(value: boolean): void {
    this.showAdvanced = value;
  }

  // ─── Advanced view handlers ─────────────────────────────────────────────────

  get selectedArchetype(): Archetype | null {
    if (!this.selectedGroup) return null;
    return this.archetypes.find(a => a.name === this.selectedGroup!.archetype) ?? null;
  }

  onArchetypeSelected(group: DeckArchetypeGroup): void {
    this.selectedArchetypeName = group.archetype;
    this.isModalOpen = true;
  }

  onModalClose(): void {
    this.isModalOpen = false;
    this.selectedArchetypeName = null;
  }

  onOpenCreateArchetypeModal(): void {
    this.isCreateArchetypeModalOpen = true;
  }

  onCreateArchetypeModalClose(): void {
    this.isCreateArchetypeModalOpen = false;
  }

  onArchetypeSaved(data: CreateArchetypeData): void {
    const archetype: Archetype = {
      id: `archetype_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      description: data.description || undefined,
      createdAt: new Date()
    };
    this.storageService.saveArchetype(archetype);
    this.isCreateArchetypeModalOpen = false;
  }

  get existingArchetypeNames(): string[] {
    return this.archetypes.map(a => a.name);
  }

  onFavoriteToggled(event: { deck: Deck; isFavorite: boolean }): void {
    const { deck, isFavorite } = event;
    // Si se marca como favorito, quitar el favorito anterior del mismo arquetipo
    if (isFavorite) {
      this.decks
        .filter(d => d.archetype === deck.archetype && d.id !== deck.id && d.isFavorite)
        .forEach(d => this.storageService.saveDeck({ ...d, isFavorite: false }));
    }
    this.storageService.saveDeck({ ...deck, isFavorite });
  }

  onNewVersion(baseDeck: Deck): void {
    // Duplicar el deck base y navegar al builder con el nuevo id
    const newDeck: Deck = {
      ...baseDeck,
      id: this.generateId(),
      name: `${baseDeck.name} (New version)`,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.storageService.saveDeck(newDeck);
    this.onModalClose();
    this.router.navigate(['/builder'], { queryParams: { deckId: newDeck.id } });
  }

  onDeckAction(event: DeckAction): void {
    const { action, deck } = event;
    switch (action) {
      case 'load':   this.onLoadDeck(deck);        break;
      case 'export': this.onExportDeck(deck.id);    break;
      case 'delete': this.onDeleteDeck(deck.id);    break;
    }
  }

  onArchetypeUpdated(data: ArchetypeUpdateData): void {
    const existing = this.archetypes.find(a => a.id === data.id);
    if (!existing) return;
    const updated: Archetype = {
      ...existing,
      name: data.name,
      description: data.description
    };
    this.storageService.saveArchetype(updated);
    // Si el nombre cambió, actualizar todos los decks que referenciaban el nombre anterior
    if (existing.name !== data.name) {
      const affectedDecks = this.decks.filter(d => d.archetype === existing.name);
      affectedDecks.forEach(deck => {
        this.storageService.saveDeck({ ...deck, archetype: data.name, updatedAt: new Date() });
      });
    }
  }

  onUpdateDeckArchetype(deck: Deck, newArchetype: string): void {
    const updated: Deck = {
      ...deck,
      archetype: newArchetype.trim() || undefined,
      updatedAt: new Date()
    };
    this.storageService.saveDeck(updated);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onLoadDeck(deck: Deck): void {
    console.log('Loading deck:', deck.name);
    // Navigate to deck builder with deck ID as query parameter
    this.router.navigate(['/builder'], { 
      queryParams: { deckId: deck.id } 
    });
  }
  
  onDeleteDeck(deckId: string): void {
    console.log('Deleting deck:', deckId);
    this.storageService.deleteDeck(deckId);
  }
  
  onDuplicateDeck(deckId: string): void {
    console.log('Duplicating deck:', deckId);
    const deck = this.decks.find(d => d.id === deckId);
    if (deck) {
      const duplicatedDeck: Deck = {
        ...deck,
        id: this.generateId(),
        name: `${deck.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.storageService.saveDeck(duplicatedDeck);
    }
  }
  
  onExportDeck(deckId: string): void {
    console.log('Exporting deck:', deckId);
    const deck = this.decks.find(d => d.id === deckId);
    if (deck) {
      this.storageService.exportDeck(deckId);
    }
  }
  
  onCreateNewDeck(): void {
    // Navigate to empty deck builder
    this.router.navigate(['/builder']);
  }
  
  private generateId(): string {
    return `deck-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // ─── Utils ──────────────────────────────────────────────────────────────────
  
  getPlaceholderImage(deck: Deck): string {
    // Use placeholderCardId if available
    if (deck.placeholderCardId) {
      const card = this.allCards.find(c => c.id === deck.placeholderCardId);
      if (card && card.imageUrl) {
        return card.imageUrl;
      }
      // Fallback: construct URL
      return `https://images.digimoncard.io/images/cards/${deck.placeholderCardId}.jpg`;
    }
    
    // For legacy decks without placeholder: use first card
    const allCardIds = [...deck.mainDeck, ...deck.digiEggs]
      .map(dc => dc.cardId)
      .filter(id => id);
    
    if (allCardIds.length === 0) {
      return 'https://via.placeholder.com/150x210?text=No+Cards';
    }
    
    const firstCardId = allCardIds[0];
    const card = this.allCards.find(c => c.id === firstCardId);
    
    if (card && card.imageUrl) {
      return card.imageUrl;
    }
    
    return `https://images.digimoncard.io/images/cards/${firstCardId}.jpg`;
  }
  
  getMainCount(deck: Deck): number {
    return deck.mainDeck.reduce((sum, dc) => sum + dc.quantity, 0);
  }
  
  getDigiEggCount(deck: Deck): number {
    return deck.digiEggs.reduce((sum, dc) => sum + dc.quantity, 0);
  }
  
  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  getColorDots(deck: Deck): string[] {
    return deck.colors || [];
  }
  
  colorToClass(color: string): string {
    return `deck-card__color-dot--${color.toLowerCase()}`;
  }
}
