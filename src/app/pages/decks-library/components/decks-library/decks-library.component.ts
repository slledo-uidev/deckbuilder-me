import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService, CardService, DeckService } from '@core/services';
import { Deck, Card, DeckArchetypeGroup, Archetype, DeckFamilyWithVersions } from '@core/models';
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
  showAdvanced: boolean = true ;

  // ─── Supabase library ───────────────────────────────────────────────────────
  cloudFamilies: DeckFamilyWithVersions[] = [];
  cloudLoading = false;
  cloudError: string | null = null;
  expandedFamilyId: string | null = null;

  // ─── Advanced view state ────────────────────────────────────────────────────
  archetypeGroups: DeckArchetypeGroup[] = [];
  archetypes: Archetype[] = [];
  selectedArchetypeName: string | null = null;
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
    private cardService: CardService,
    private deckService: DeckService
  ) { }

  ngOnInit(): void {
    // Load all cards
    this.cardService.cards$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cards => {
        this.allCards = cards;
      });

    // Subscribe to saved decks (localStorage)
    this.storageService.decks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(decks => {
        this.decks = decks;
        this.archetypeGroups = groupDecksByArchetype(decks);
      });

    // Subscribe to archetypes
    this.storageService.archetypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(archetypes => {
        this.archetypes = archetypes;
      });

    // Load cloud library from Supabase
    this.loadCloudLibrary();
  }

  // ─── Supabase library ───────────────────────────────────────────────────────

  async loadCloudLibrary(): Promise<void> {
    this.cloudLoading = true;
    this.cloudError = null;
    try {
      // Sync localStorage from Supabase (source of truth)
      const remoteDecks = await this.deckService.getDecksForSync();
      this.storageService.replaceAllDecks(remoteDecks);

      this.cloudFamilies = await this.deckService.getUserLibrary();
    } catch (error) {
      console.error('Error loading cloud library:', error);
      this.cloudError = 'No se pudo cargar la librería en la nube.';
    } finally {
      this.cloudLoading = false;
    }
  }

  /**
   * Loads a full deck version from Supabase and opens it in the builder.
   */
  async onLoadCloudDeck(versionId: string): Promise<void> {
    try {
      const version = await this.deckService.getDeckDetails(versionId);
      // Navigate to builder — the card_list will be stored in state via query param
      // For now we store it temporarily in sessionStorage
      sessionStorage.setItem('import_cloud_deck', JSON.stringify(version));
      this.router.navigate(['/builder'], { queryParams: { cloudImport: true } });
    } catch (error) {
      console.error('Error loading deck version:', error);
    }
  }

  getVersionCount(family: DeckFamilyWithVersions): number {
    return family.decks?.length ?? 0;
  }

  toggleFamily(familyId: string): void {
    this.expandedFamilyId = this.expandedFamilyId === familyId ? null : familyId;
  }

  formatCloudDate(isoString?: string): string {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
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

  async onArchetypeSaved(data: CreateArchetypeData): Promise<void> {
    const archetype: Archetype = {
      id: `archetype_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      description: data.description || undefined,
      createdAt: new Date()
    };

    // Save to Supabase and persist the family ID locally
    try {
      const family = await this.deckService.createFamily(data.name, {
        archetype: data.name,
        description: data.description || undefined
      });
      archetype.supabaseFamilyId = family.id;
    } catch (err) {
      console.error('Error al crear la familia en Supabase:', err);
      // Continue saving locally even if Supabase fails
    }

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

  onOpenInEditor(deck: Deck): void {
    const cardList = [
      ...deck.digiEggs,
      ...deck.mainDeck
    ];
    sessionStorage.setItem('open_in_editor', JSON.stringify({
      name: deck.name,
      cardList
    }));
    this.router.navigate(['/builder'], { queryParams: { openEditor: true } });
  }
  
  onDeleteDeck(deckId: string): void {
    console.log('Deleting deck:', deckId);
    const deck = this.decks.find(d => d.id === deckId);
    this.storageService.deleteDeck(deckId);
    // Also delete from Supabase if the deck was synced
    if (deck?.supabaseFamilyId) {
      this.deckService.deleteFamily(deck.supabaseFamilyId).catch(err =>
        console.error('Error deleting family from Supabase:', err)
      );
    }
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
