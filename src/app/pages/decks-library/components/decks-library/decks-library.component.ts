import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService, CardService, DeckService } from '@core/services';
import { Deck, Card, DeckArchetypeGroup, Archetype, DeckFamilyWithVersions, DeckFamily } from '@core/models';
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
  showAdvanced: boolean = false ;

  // ─── Supabase library ───────────────────────────────────────────────────────
  cloudFamilies: DeckFamilyWithVersions[] = [];
  dbFamilies: DeckFamily[] = [];
  cloudLoading = false;
  cloudError: string | null = null;
  expandedFamilyId: string | null = null;

  // ─── Advanced view state ────────────────────────────────────────────────────
  archetypeGroups: DeckArchetypeGroup[] = [];
  archetypes: Archetype[] = [];
  selectedArchetypeName: string | null = null;
  isModalOpen: boolean = false;
  isCreateArchetypeModalOpen: boolean = false;
  // Server-side error message to show in the Create Archetype modal
  createArchetypeError: string | undefined = undefined;
  // View-only deck modal
  isViewModalOpen: boolean = false;
  viewingDeck: Deck | null = null;

  // Confirm delete modal
  isConfirmDeleteOpen: boolean = false;
  deckToDeleteId: string | null = null;
  get deckToDeleteName(): string {
    return this.decks.find(d => d.id === this.deckToDeleteId)?.name ?? 'este deck';
  }

  // Manage archetypes modal
  isManageArchetypesOpen: boolean = false;
  archetypeToDeleteName: string | null = null;

  /**
   * Unified list for the manage-archetypes modal.
   * Merges DB families (source of truth) with local archetypeGroups so that
   * families with no deck versions are still shown.
   */
  get allArchetypeEntries(): { name: string; familyId?: string; deckCount: number }[] {
    const entries = new Map<string, { name: string; familyId?: string; deckCount: number }>();

    // Start from DB families (all 4 from Supabase)
    for (const f of this.dbFamilies) {
      const name = (f.archetype ?? f.name).trim();
      entries.set(name.toLowerCase(), { name, familyId: f.id, deckCount: 0 });
    }

    // Overlay deck counts from local groups
    for (const g of this.archetypeGroups) {
      const key = g.archetype.toLowerCase();
      const existing = entries.get(key);
      if (existing) {
        existing.deckCount = g.decks.length;
        if (!existing.familyId) {
          existing.familyId = g.decks.find(d => d.supabaseFamilyId)?.supabaseFamilyId;
        }
      } else {
        // Local-only group (not yet in DB)
        entries.set(key, {
          name: g.archetype,
          familyId: g.decks.find(d => d.supabaseFamilyId)?.supabaseFamilyId,
          deckCount: g.decks.length
        });
      }
    }

    return Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

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
    // Set initial tab based on user preference
    const settings = this.storageService.getSettings();
    this.showAdvanced = settings?.libraryMode === 'advanced';

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
      this.dbFamilies = await this.deckService.getFamilies();
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
  this.createArchetypeError = undefined;
    this.isCreateArchetypeModalOpen = true;
  }

  onCreateArchetypeModalClose(): void {
    this.isCreateArchetypeModalOpen = false;
  }

  async onArchetypeSaved(data: CreateArchetypeData): Promise<void> {
    // Verify uniqueness using the database (authoritative). If a family with
    // the same name/archetype already exists, show an error in the modal and
    // do NOT persist anything locally.
    try {
      const families = await this.deckService.getFamilies();
      const exists = families.some(f => (f.archetype ?? f.name).toLowerCase() === data.name.toLowerCase());
      if (exists) {
        this.createArchetypeError = `An archetype named "${data.name}" already exists`;
        // Keep modal open so the user can change the name
        return;
      }

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
        this.createArchetypeError = 'Error creating archetype in the cloud. Try again later.';
        return;
      }

      this.storageService.saveArchetype(archetype);
  this.isCreateArchetypeModalOpen = false;
  this.createArchetypeError = undefined;
      return;
    } catch (err) {
      console.error('Error checking existing families on Supabase:', err);
      this.createArchetypeError = 'Unable to validate archetype uniqueness right now.';
      return;
    }
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
    // Send cards via sessionStorage so the builder's loadOpenInEditor() flow is
    // triggered (openEditor=true). supabaseVersionId is intentionally omitted so
    // the builder creates a NEW version instead of overwriting the original.
    // supabaseFamilyId is kept so the new version is grouped in the same family.
    const cardList = [
      ...baseDeck.digiEggs,
      ...baseDeck.mainDeck
    ];
    sessionStorage.setItem('open_in_editor', JSON.stringify({
      name: `${baseDeck.name} (New version)`,
      cardList,
      supabaseFamilyId: baseDeck.supabaseFamilyId,
      isNewVersion: true
    }));
    this.onModalClose();
    this.router.navigate(['/builder'], { queryParams: { openEditor: true } });
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
    // Open the view-only modal for this deck
    this.viewingDeck = deck;
    this.isViewModalOpen = true;
  }

  onOpenInEditor(deck: Deck): void {
    const cardList = [
      ...deck.digiEggs,
      ...deck.mainDeck
    ];

    // Include Supabase IDs and local deck id so the builder can decide whether
    // to treat this as an existing version (editable) or as a fresh import.
    sessionStorage.setItem('open_in_editor', JSON.stringify({
      id: deck.id,
      name: deck.name,
      cardList,
      supabaseFamilyId: deck.supabaseFamilyId,
      supabaseVersionId: deck.supabaseVersionId
    }));
    this.router.navigate(['/builder'], { queryParams: { openEditor: true } });
  }

  onViewModalClose(): void {
    this.isViewModalOpen = false;
    this.viewingDeck = null;
  }
  
  onDeleteDeck(deckId: string): void {
    this.deckToDeleteId = deckId;
    this.isConfirmDeleteOpen = true;
  }

  onConfirmDelete(): void {
    if (!this.deckToDeleteId) return;
    const deck = this.decks.find(d => d.id === this.deckToDeleteId);
    this.storageService.deleteDeck(this.deckToDeleteId);
    if (deck?.supabaseFamilyId) {
      this.deckService.deleteFamily(deck.supabaseFamilyId).catch(err =>
        console.error('Error deleting family from Supabase:', err)
      );
    }
    this.isConfirmDeleteOpen = false;
    this.deckToDeleteId = null;
  }

  onCancelDelete(): void {
    this.isConfirmDeleteOpen = false;
    this.deckToDeleteId = null;
  }
  
  onDuplicateDeck(deckId: string): void {
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
  
  onOpenManageArchetypes(): void {
    this.archetypeToDeleteName = null;
    this.isManageArchetypesOpen = true;
  }

  onCloseManageArchetypes(): void {
    this.isManageArchetypesOpen = false;
    this.archetypeToDeleteName = null;
  }

  onRequestDeleteArchetype(name: string): void {
    this.archetypeToDeleteName = name;
  }

  onCancelDeleteArchetype(): void {
    this.archetypeToDeleteName = null;
  }

  async onConfirmDeleteArchetype(entry: { name: string; familyId?: string; deckCount: number }): Promise<void> {
    if (!this.archetypeToDeleteName) return;

    // Delete local archetype entity (if it exists in localStorage)
    const localArchetype = this.archetypes.find(a => a.name === this.archetypeToDeleteName);
    if (localArchetype) {
      this.storageService.deleteArchetype(localArchetype.id);
    }

    // Delete the Supabase family
    const familyId = entry.familyId;
    if (familyId) {
      this.deckService.deleteFamily(familyId).catch(err =>
        console.error('Error deleting archetype family from Supabase:', err)
      );
      // Refresh dbFamilies after deletion
      this.deckService.getFamilies().then(f => this.dbFamilies = f).catch(() => {});
    }

    this.archetypeToDeleteName = null;
  }

  onExportDeck(deckId: string): void {
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
