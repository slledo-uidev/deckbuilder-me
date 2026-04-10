import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, ValidationService, CardService, AuthService, DeckService } from '@core/services';
import { Deck, Card, CardFilter, Color, Archetype } from '@core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeckCard as StorageDeckCard } from '@core/models/deck.model';
import { FilterPanelComponent } from '@shared/components/molecules/filter-panel/filter-panel.component';
import { SaveDeckData } from '@shared/components/molecules/save-deck-modal/save-deck-modal.component';

export interface DeckCard {
  card: Card;
  quantity: number;
}

@Component({
  selector: 'app-deck-builder',
  templateUrl: './deck-builder.component.html',
  styleUrls: ['./deck-builder.component.scss']
})
export class DeckBuilderComponent implements OnInit, OnDestroy {
  @ViewChild(FilterPanelComponent) filterPanel!: FilterPanelComponent;
  
  cards: Card[] = [];
  filteredCards: Card[] = [];
  loading = false;
  error: string | null = null;
  
  searchText = '';
  currentFilter: CardFilter = {};
  filtersExpanded = false;
  
  // Deck zones
  digiEggs: DeckCard[] = [];
  mainDeck: DeckCard[] = [];
  // Note: Side deck removed - Digimon TCG doesn't use side decks

  // Deck persistence state
  currentDeckId: string | null = null;
  currentFamilyId: string | undefined = undefined;   // Supabase deck_families.id
  currentVersionId: string | null = null;  // Supabase deck_versions.id
  isSavingToCloud = false;
  cloudSaveError: string | null = null;
  deckName = 'My Deck';
  currentArchetype = '';
  currentPlaceholderId?: string;
  savedDecks: Deck[] = [];
  archetypes: Archetype[] = [];
  // Archetypes loaded from the remote DB — used specifically by the Save modal
  dbArchetypes: Archetype[] = [];
  showSaveModal = false;
  // Whether the current deck was opened via the 'Open Deck' flow from the library.
  openedViaOpenDeck = false;
  showImportModal = false;
  showDeckList = false;
  saveSuccessMessage = '';
  
  // Modal states
  showValidationModal = false;
  showStatsModal = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private storageService: StorageService,
    private validationService: ValidationService,
    private cardService: CardService,
    private authService: AuthService,
    private deckService: DeckService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    console.log('DeckBuilderComponent initialized - Loading cards...');
    
    // Subscribe to cards
    this.cardService.cards$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cards => {
        this.cards = cards;
        this.applyFilters();
        console.log(`Loaded ${cards.length} cards`);
      });
    
    // Subscribe to loading state
    this.cardService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);
    
    // Subscribe to errors
    this.cardService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    // Subscribe to saved decks
    this.storageService.decks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(decks => this.savedDecks = decks);

    // Subscribe to archetypes
    this.storageService.archetypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(archetypes => this.archetypes = archetypes);

    // Check for deckId in query params and load deck if present
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['cloudImport']) {
          this.loadCloudImport();
        } else if (params['openEditor']) {
          this.loadOpenInEditor();
        } else if (params['deckId']) {
          this.loadDeckById(params['deckId']);
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onSearchChange(searchText: string): void {
    this.searchText = searchText;
    this.currentFilter = {
      ...this.currentFilter,
      searchText: searchText || undefined
    };
    this.applyFilters();
  }
  
  onFilterChange(filter: CardFilter): void {
    this.currentFilter = {
      ...filter,
      searchText: this.searchText || undefined
    };
    this.applyFilters();
    // Collapse filters panel after applying
    this.filtersExpanded = false;
  }
  
  onFilterClear(): void {
    this.currentFilter = {
      searchText: this.searchText || undefined
    };
    // Clear filters in the filter panel component
    if (this.filterPanel) {
      this.filterPanel.clearFilters();
    }
    this.applyFilters();
  }
  
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }
  
  getActiveFilterCount(): number {
    return this.filterPanel?.getActiveFilterCount() || 0;
  }
  
  onCardClick(card: Card): void {
    console.log('Card clicked:', card);
    // TODO: Open card detail modal
  }
  
  onCardAdd(card: Card): void {
    console.log('Add card to deck:', card);
    
    // Automatically determine zone based on card level
    // Level 2 cards go to Digi-Eggs, all others to Main Deck
    const targetZone = card.level === 2 ? 'digi-eggs' : 'main';
    
    // Check maximum 4 copies across all zones
    const totalCopies = this.getTotalCopiesOfCard(card.id);
    if (totalCopies >= 4) {
      console.warn('Maximum 4 copies per card name reached');
      return;
    }
    
    // Add to appropriate zone
    this.addCardToZone(card, targetZone);
  }
  
  addCardToZone(card: Card, zone: 'digi-eggs' | 'main'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs : this.mainDeck;
    
    const existingCard = targetZone.find(dc => dc.card.id === card.id);
    
    if (existingCard) {
      if (existingCard.quantity < 4 && this.getTotalCopiesOfCard(card.id) < 4) {
        existingCard.quantity++;
      }
    } else {
      targetZone.push({ card, quantity: 1 });
    }
  }
  
  removeCardFromZone(card: Card, zone: 'digi-eggs' | 'main'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs : this.mainDeck;
    
    const index = targetZone.findIndex(dc => dc.card.id === card.id);
    if (index !== -1) {
      targetZone.splice(index, 1);
    }
  }
  
  increaseCardQuantity(card: Card, zone: 'digi-eggs' | 'main'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs : this.mainDeck;
    
    const deckCard = targetZone.find(dc => dc.card.id === card.id);
    if (deckCard && deckCard.quantity < 4 && this.getTotalCopiesOfCard(card.id) < 4) {
      deckCard.quantity++;
    }
  }
  
  decreaseCardQuantity(card: Card, zone: 'digi-eggs' | 'main'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs : this.mainDeck;
    
    const deckCard = targetZone.find(dc => dc.card.id === card.id);
    if (deckCard) {
      if (deckCard.quantity > 1) {
        deckCard.quantity--;
      } else {
        this.removeCardFromZone(card, zone);
      }
    }
  }
  
  getTotalCopiesOfCard(cardId: string): number {
    const inDigiEggs = this.digiEggs.find(dc => dc.card.id === cardId)?.quantity || 0;
    const inMain = this.mainDeck.find(dc => dc.card.id === cardId)?.quantity || 0;
    return inDigiEggs + inMain;
  }

  isCardAtMaxCopies = (cardId: string): boolean => {
    return this.getTotalCopiesOfCard(cardId) >= 4;
  };
  
  // ─── Persistence ────────────────────────────────────────────────────────────

  openSaveModal(): void {
    // Initialize as empty (authoritative source) so we don't fall back to
    // local archetypes when the DB is empty. Then fetch remote families.
    this.dbArchetypes = [];
    this.deckService.getUserLibrary()
      .then(families => {
        this.dbArchetypes = families.map(f => ({
          id: f.id ?? `fam_${f.name}`,
          name: f.archetype ?? f.name,
          description: f.description,
          createdAt: f.created_at ? new Date(f.created_at) : new Date(),
          supabaseFamilyId: f.id
        } as Archetype));
      })
      .catch(err => {
        // If remote fetch fails keep dbArchetypes empty — modal will show no DB
        // families. We still log the error for debugging.
        console.warn('Could not load remote families for Save modal', err);
        this.dbArchetypes = [];
      })
      .finally(() => {
        this.showSaveModal = true;
      });
  }

  onSaveCancel(): void {
    this.showSaveModal = false;
  }

  openImportModal(): void {
    this.showImportModal = true;
  }

  onImportCancel(): void {
    this.showImportModal = false;
  }

  onImportDeck(decklistText: string): void {
    this.showImportModal = false;
    
    try {
      const importedDeck = this.parseDecklistText(decklistText);
      
      // Clear current deck
      this.digiEggs = [];
      this.mainDeck = [];
      this.currentDeckId = null;
      this.deckName = 'Imported Deck';
      
      // Add cards to deck
      importedDeck.forEach(item => {
        const normalizedId = item.cardId.toUpperCase();
        const card = this.cards.find(c =>
          c.id.toUpperCase() === normalizedId ||
          c.id.toUpperCase() === normalizedId.replace(/_P\d+$/i, '') ||
          c.cardNumber?.toUpperCase() === normalizedId
        );
        
        if (card) {
          const deckCard: DeckCard = { card, quantity: item.quantity };
          
          // Add to appropriate zone based on card level
          if (card.level === 2) {
            this.digiEggs.push(deckCard);
          } else {
            this.mainDeck.push(deckCard);
          }
        } else {
          console.warn(`Card not found: ${item.cardId} (${item.name})`);
        }
      });
      
      this.saveSuccessMessage = 'Deck imported successfully!';
      setTimeout(() => this.saveSuccessMessage = '', 3000);
      
    } catch (error) {
      console.error('Error parsing decklist:', error);
      this.saveSuccessMessage = 'Error importing deck. Please check the format.';
      setTimeout(() => this.saveSuccessMessage = '', 3000);
    }
  }

  private parseDecklistText(text: string): { quantity: number; name: string; cardId: string }[] {
    const lines = text.split('\n');
    const cards: { quantity: number; name: string; cardId: string }[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and section headers (// Main Deck, # Digi-Eggs, etc.)
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        continue;
      }

      let quantity: number | null = null;
      let cardId: string | null = null;
      let name = '';

      // ── Format A: "4x BT24-004 Wanyamon"  (qty x cardId name)
      const matchA = trimmedLine.match(/^(\d+)x\s+([A-Z0-9]+-[A-Z0-9]+(?:_P\d+)?)\s*(.*)/i);
      if (matchA) {
        quantity = parseInt(matchA[1], 10);
        cardId   = matchA[2].trim();
        name     = matchA[3].trim();
      }

      // ── Format B: "4 Wanyamon BT24-004"  (qty name cardId)
      if (!cardId) {
        const matchB = trimmedLine.match(/^(\d+)\s+(.+?)\s+([A-Z0-9]+-[A-Z0-9]+(?:_P\d+)?)$/i);
        if (matchB) {
          quantity = parseInt(matchB[1], 10);
          name     = matchB[2].trim();
          cardId   = matchB[3].trim();
        }
      }

      if (quantity !== null && cardId) {
        cards.push({ quantity, name, cardId });
      } else {
        console.warn(`Import: could not parse line → "${trimmedLine}"`);
      }
    }

    return cards;
  }

  // ─── Modal Controls ─────────────────────────────────────────────────────────

  openValidationModal(): void {
    this.showValidationModal = true;
  }

  closeValidationModal(): void {
    this.showValidationModal = false;
  }

  openStatsModal(): void {
    this.showStatsModal = true;
  }

  closeStatsModal(): void {
    this.showStatsModal = false;
  }

  async onSaveConfirm(data: SaveDeckData, mode: 'save' | 'saveAsNew' = 'save'): Promise<void> {
    this.showSaveModal = false;
    this.deckName = data.name;
    // Determine selected family name from passed familyId (if any) so we can
    // show the archetype label in the UI. This must NOT be used to create a
    // family on the server — the server-side familyId is authoritative.
  const selectedFamilyId = data.familyId;
    let selectedFamilyName: string | undefined;
    if (selectedFamilyId) {
      const found = this.dbArchetypes.find(a => a.supabaseFamilyId === selectedFamilyId || a.id === selectedFamilyId)
        || this.archetypes.find(a => a.supabaseFamilyId === selectedFamilyId || a.id === selectedFamilyId);
      if (found) selectedFamilyName = found.name;
    }
    this.currentArchetype = selectedFamilyName ?? '';

    const totalCards = this.getTotalCardCount();
    if (totalCards === 0) {
      return; // nothing to save
    }

    const colors = this.inferDeckColors();
    const currentUser = this.authService.getCurrentUser();

    // ── 1. Save to localStorage (always, as local backup) ───────────────────
    // If user selected "Save as new", force a new local deck id so we don't
    // overwrite the currently loaded local deck. Otherwise reuse currentDeckId
    // (to update the existing local deck).
    const deckId = mode === 'saveAsNew' ? this.generateDeckId() : (this.currentDeckId || this.generateDeckId());

    const deck: Deck = {
      id: deckId,
      name: data.name,
      digiEggs: this.digiEggs.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      mainDeck: this.mainDeck.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      sideDeck: [],
      colors,
      placeholderCardId: data.placeholderCardId,
  archetype: selectedFamilyName || undefined,
      author: currentUser?.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If saving as new, snapshot the original deck so we can restore it if
    // any accidental mutation happens during the cloud save flow.
    let originalDeckSnapshot: Deck | null = null;
    if (mode === 'saveAsNew' && this.currentDeckId) {
      const orig = this.storageService.getDeckById(this.currentDeckId);
      if (orig) originalDeckSnapshot = JSON.parse(JSON.stringify(orig));
    }

    const localSuccess = this.storageService.saveDeck(deck);
    if (localSuccess) {
      this.currentDeckId = deck.id;
      this.currentPlaceholderId = data.placeholderCardId;
    }

  // ── 2. Save to Supabase (await so we can restore original if needed) ───
  const cloudSaved = await this.saveToSupabase(deck, data, mode);

    // If we saved as new but the original deck got mutated (thumbnail changed),
    // restore the original snapshot to keep it untouched.
    if (originalDeckSnapshot) {
      const currentOrig = this.storageService.getDeckById(originalDeckSnapshot.id);
      if (currentOrig && currentOrig.placeholderCardId !== originalDeckSnapshot.placeholderCardId) {
        this.storageService.saveDeck({ ...currentOrig, placeholderCardId: originalDeckSnapshot.placeholderCardId });
      }
    }

    // After saving, navigate back to the Decks Library only if cloud save
    // completed successfully. If cloud save failed, keep the user in the
    // builder so they can retry or see the error message.
    if (cloudSaved) {
      try {
        this.router.navigate(['/decks']);
      } catch (err) {
        // ignore navigation errors; not critical
      }
    }
  }

  /**
   * Saves the current deck to Supabase.
   * - No familyId        → crea familia + versión con el nombre del deck
   * - familyId pero no versionId → nueva versión en familia existente
   * - familyId + versionId → actualiza la versión existente (overwrite)
   */
  private async saveToSupabase(deck: Deck, data: SaveDeckData, mode: 'save' | 'saveAsNew' = 'save'): Promise<boolean> {
    this.isSavingToCloud = true;
    this.cloudSaveError = null;

    // Preserve zone information by marking digi-eggs entries with isEgg=true
    const cardList = [
      ...deck.digiEggs.map((c: any) => ({ ...(c as any), isEgg: true })),
      ...deck.mainDeck.map((c: any) => ({ ...(c as any), isEgg: false }))
    ];

    try {
      // Prefer the family explicitly selected in the Save modal (data.familyId).
      // If a local id was passed (from local archetypes), try to resolve it to
      // the authoritative Supabase family id. If none provided, fall back to
      // the currently-loaded family in the builder (this.currentFamilyId).
      // Only if neither exists do we create a new family using the 'no-family'
      // sentinel.
      const rawSelected = data.familyId ?? undefined;

      const resolveToSupabaseId = (rawId?: string): string | undefined => {
        if (!rawId) return undefined;
        // If it already looks like a Supabase id (UUID/v4-ish), prefer it.
        // A simple heuristic: contains a '-' and length > 8
        if (rawId.includes('-') && rawId.length > 8) return rawId;
        // Search dbArchetypes first (remote authoritative list)
        const fromDb = this.dbArchetypes.find(a => a.id === rawId || a.supabaseFamilyId === rawId);
        if (fromDb && fromDb.supabaseFamilyId) return fromDb.supabaseFamilyId;
        // Fall back to local archetypes stored in localStorage cache
        const fromLocal = this.archetypes.find(a => a.id === rawId || a.supabaseFamilyId === rawId);
        if (fromLocal && fromLocal.supabaseFamilyId) return fromLocal.supabaseFamilyId;
        // If nothing found, return the raw id — the API will either accept or reject it.
        return rawId;
      };

      const selectedFamilyId = resolveToSupabaseId(rawSelected);
      const targetFamilyId = selectedFamilyId ?? (this.currentFamilyId ?? undefined);

      if (targetFamilyId) {
        console.log('[Save] targetFamilyId (resolved):', targetFamilyId);
        console.log('[Save] cardList payload:', cardList);
        // We have a family id to target - create or update versions inside it.
        // 'saveAsNew' => always create a new version. 'save' => update existing
        // version if available, otherwise create.
        if (mode === 'saveAsNew') {
          const version = await this.deckService.saveNewVersion(
            targetFamilyId,
            cardList,
            data.name,
            { archetype: deck.archetype, thumbnailCardId: deck.placeholderCardId }
          );
          console.log('[Save] saveNewVersion response:', version);
          this.currentFamilyId = targetFamilyId;
          this.currentVersionId = version.id ?? null;
        } else {
          // mode === 'save'
          if (this.currentVersionId) {
            const updated = await this.deckService.updateVersion(this.currentVersionId, {
              card_list: cardList,
              version_name: data.name,
              thumbnailCardId: deck.placeholderCardId
            });
            console.log('[Save] updateVersion response:', updated);
          } else {
            const version = await this.deckService.saveNewVersion(
              targetFamilyId,
              cardList,
              data.name,
              { archetype: deck.archetype, thumbnailCardId: deck.placeholderCardId }
            );
            console.log('[Save] saveNewVersion response:', version);
            this.currentFamilyId = targetFamilyId;
            this.currentVersionId = version.id ?? null;
          }
        }
      } else {
        // No family selected anywhere: create a new default family + version.
        console.log('[Save] No family selected, creating new default family');
        const version = await this.deckService.createNewFamilyWithVersion(
          'no-family',
          cardList,
          data.name,
          { archetype: 'no-family', description: deck.description, thumbnailCardId: deck.placeholderCardId }
        );
        console.log('[Save] createNewFamilyWithVersion response:', version);
        this.currentFamilyId = version.family_id;
        this.currentVersionId = version.id ?? null;
      }

      // Persist Supabase IDs locally.
      // - If we're doing a regular save (overwrite), update the existing local deck.
      // - If we're doing "save as new", create a new local deck entry that points
      //   to the newly created Supabase version so the original stays intact.
      // Persist Supabase IDs into the local deck entry that represents the
      // current saved deck in the builder. For 'saveAsNew' we previously
      // created a new local deck before calling this function, so the
      // appropriate local deck id is in this.currentDeckId. Update that
      // entry with the supabase ids so it references the new remote version.
      if (this.currentDeckId) {
        const savedDeck = this.storageService.getDeckById(this.currentDeckId);
        if (savedDeck) {
          this.storageService.saveDeck({
            ...savedDeck,
            supabaseFamilyId: this.currentFamilyId ?? savedDeck.supabaseFamilyId,
            supabaseVersionId: this.currentVersionId ?? savedDeck.supabaseVersionId
          });
        }
      } else if (this.currentFamilyId) {
        // No local deck exists (edge-case): create a new local deck that
        // references the new supabase version.
        const createdLocal: Deck = {
          ...deck,
          id: this.generateDeckId(),
          supabaseFamilyId: this.currentFamilyId,
          supabaseVersionId: this.currentVersionId ?? undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.storageService.saveDeck(createdLocal);
        this.currentDeckId = createdLocal.id;
      }

      this.showSuccessMessage('Deck saved!');
      return true;
    } catch (error) {
      console.error('Error saving deck to Supabase:', error);
      this.cloudSaveError = 'Cloud save failed — deck saved locally only.';
      this.showSuccessMessage('Deck saved locally (cloud error).');
      return false;
    } finally {
      this.isSavingToCloud = false;
    }
  }

  onLoadDeck(deck: Deck): void {
    this.currentDeckId = deck.id;
    this.deckName = deck.name;
    this.currentArchetype = deck.archetype || '';
    this.currentPlaceholderId = deck.placeholderCardId;

  // Loaded directly from local library (not via Open Deck flow)
  this.openedViaOpenDeck = false;

    this.digiEggs = this.hydrateDeckCards(deck.digiEggs);
    this.mainDeck = this.hydrateDeckCards(deck.mainDeck);
    // Side deck not used in Digimon TCG

    this.showDeckList = false;
    this.showSuccessMessage(`"${deck.name}" loaded!`);
  }

  onDeleteDeck(deckId: string): void {
    this.storageService.deleteDeck(deckId);
    if (this.currentDeckId === deckId) {
      this.currentDeckId = null;
    }
  }

  onDuplicateDeck(deckId: string): void {
    const copy = this.storageService.duplicateDeck(deckId);
    if (copy) {
      this.showSuccessMessage(`"${copy.name}" created!`);
    }
  }

  onExportDeck(deckId: string): void {
    const deck = this.storageService.getDeckById(deckId);
    if (!deck) return;
    const text = this.buildTCGOneText(deck);
    this.copyToClipboard(text);
    this.showSuccessMessage('Deck list copied to clipboard!');
  }

  newDeck(): void {
    this.currentDeckId = null;
    this.currentFamilyId = undefined;
    this.currentVersionId = null;
    this.cloudSaveError = null;
    this.deckName = 'My Deck';
    this.digiEggs = [];
    this.mainDeck = [];
  }

  toggleDeckList(): void {
    this.showDeckList = !this.showDeckList;
  }

  exportCurrentDeck(): void {
    if (this.getTotalCardCount() === 0) return;
    const fakeDeck: Deck = {
      id: '',
      name: this.deckName,
      digiEggs: this.digiEggs.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      mainDeck: this.mainDeck.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      sideDeck: [], // Empty - Digimon TCG doesn't use side deck
      colors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const text = this.buildTCGOneText(fakeDeck);
    this.copyToClipboard(text);
    this.showSuccessMessage('Deck list copied to clipboard!');
  }

  getTotalCardCount(): number {
    const count = (arr: DeckCard[]) => arr.reduce((s, dc) => s + dc.quantity, 0);
    return count(this.digiEggs) + count(this.mainDeck);
  }

  getUniqueCards(): Card[] {
    const uniqueCardMap = new Map<string, Card>();
    
    [...this.digiEggs, ...this.mainDeck].forEach(dc => {
      if (!uniqueCardMap.has(dc.card.id)) {
        uniqueCardMap.set(dc.card.id, dc.card);
      }
    });
    
    return Array.from(uniqueCardMap.values());
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private hydrateDeckCards(storedCards: StorageDeckCard[]): DeckCard[] {
    const result: DeckCard[] = [];
    for (const sc of storedCards) {
      const card = this.cards.find(c => c.id === sc.cardId);
      if (card) {
        result.push({ card, quantity: sc.quantity });
      }
    }
    return result;
  }

  private inferDeckColors(): Color[] {
    const colorSet = new Set<Color>();
    [...this.digiEggs, ...this.mainDeck].forEach(dc => {
      if (dc.card.color) {
        dc.card.color.forEach((c: Color) => colorSet.add(c));
      }
    });
    return Array.from(colorSet);
  }

  private buildTCGOneText(deck: Deck): string {
    const lines: string[] = [];
    const format = (cards: StorageDeckCard[], label: string) => {
      const total = cards.reduce((s, c) => s + c.quantity, 0);
      lines.push(`// ${label} (${total})`);
      for (const sc of cards) {
        const card = this.cards.find(c => c.id === sc.cardId);
        const name = card ? card.name : sc.cardId;
        lines.push(`${sc.quantity}x ${sc.cardId} ${name}`);
      }
      lines.push('');
    };
    format(deck.digiEggs, 'Digi-Eggs');
    format(deck.mainDeck, 'Main Deck');
    // Side deck not included - Digimon TCG doesn't use side decks
    return lines.join('\n').trim();
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
  }

  private showSuccessMessage(msg: string): void {
    this.saveSuccessMessage = msg;
    setTimeout(() => this.saveSuccessMessage = '', 3000);
  }

  private generateDeckId(): string {
    return `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Load a deck version imported from Supabase (stored temporarily in sessionStorage).
   * Called when the builder receives queryParam cloudImport=true.
   */
  private loadCloudImport(): void {
    try {
      const raw = sessionStorage.getItem('import_cloud_deck');
      if (!raw) return;
      sessionStorage.removeItem('import_cloud_deck');

      const version = JSON.parse(raw);
      const cardList: any[] = version.card_list ?? [];

      this.digiEggs = [];
      this.mainDeck = [];
      this.currentDeckId = null;
  this.currentFamilyId = version.family_id ?? undefined;
  this.currentVersionId = version.id ?? null;
      this.deckName = version.version_name ?? 'Cloud Deck';
  // Cloud import should not show Save as new by default
  this.openedViaOpenDeck = false;

      cardList.forEach(item => {
        const card = this.cards.find(c => c.id === item.cardId);
        if (!card) {
          console.warn(`Cloud import: card not found → ${item.cardId}`);
          return;
        }
        const deckCard: DeckCard = { card, quantity: item.quantity };
        // If the remote payload includes isEgg flag use it; otherwise fall back to level check
        if (item.isEgg === true || (item.isEgg === undefined && card.level === 2)) {
          this.digiEggs.push(deckCard);
        } else {
          this.mainDeck.push(deckCard);
        }
      });

      this.showSuccessMessage(`"${this.deckName}" loaded from cloud!`);
    } catch (error) {
      console.error('Error loading cloud import:', error);
    }
  }

  /**
   * Open a deck from the library as a brand-new deck (no ID, no Supabase link).
   * Card list is passed via sessionStorage key 'open_in_editor'.
   * Called when the builder receives queryParam openEditor=true.
   */
  private loadOpenInEditor(): void {
    try {
      const raw = sessionStorage.getItem('open_in_editor');
      if (!raw) return;
      sessionStorage.removeItem('open_in_editor');
      const payload: { id?: string; name: string; cardList: { cardId: string; quantity: number }[]; supabaseFamilyId?: string; supabaseVersionId?: string } = JSON.parse(raw);

      this.digiEggs = [];
      this.mainDeck = [];
      // If the payload includes Supabase IDs, preserve them so Save will update
      // the existing version. Otherwise treat as a fresh deck.
  this.currentDeckId = payload.id ?? null;
  this.currentFamilyId = payload.supabaseFamilyId ?? undefined;
  this.currentVersionId = payload.supabaseVersionId ?? null;
      this.cloudSaveError = null;
      this.deckName = payload.name;
  // Mark that this builder instance was opened via the library's Open Deck flow.
  this.openedViaOpenDeck = true;

      payload.cardList.forEach(item => {
        const card = this.cards.find(c => c.id === item.cardId);
        if (!card) {
          console.warn(`Open in editor: card not found → ${item.cardId}`);
          return;
        }
        const deckCard: DeckCard = { card, quantity: item.quantity };
        if (card.level === 2) {
          this.digiEggs.push(deckCard);
        } else {
          this.mainDeck.push(deckCard);
        }
      });

      this.showSuccessMessage(`"${this.deckName}" opened in editor${this.currentVersionId ? ' (editable)' : ''}!`);
    } catch (error) {
      console.error('Error loading deck in editor:', error);
    }
  }

  /**
   * Load a specific deck by ID
   */
  private loadDeckById(deckId: string): void {
    const deck = this.savedDecks.find(d => d.id === deckId);
    if (!deck) {
      console.error('Deck not found:', deckId);
      return;
    }

  this.currentDeckId = deck.id;
  // Restore Supabase IDs if this deck was previously synced
  this.currentFamilyId = deck.supabaseFamilyId ?? undefined;
    this.currentVersionId = deck.supabaseVersionId ?? null;
    this.cloudSaveError = null;
    this.deckName = deck.name;
    this.currentPlaceholderId = deck.placeholderCardId;

    // Clear current deck
    this.digiEggs = [];
    this.mainDeck = [];

    // Load cards from deck
    const allCardIds = [
      ...deck.digiEggs.map(dc => dc.cardId),
      ...deck.mainDeck.map(dc => dc.cardId)
    ];

    this.cardService.getCardsByIds(allCardIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe(cards => {
        // Create a map for quick lookup
        const cardMap = new Map(cards.map(c => [c.id, c]));

        // Populate digi-eggs
        deck.digiEggs.forEach(dc => {
          const card = cardMap.get(dc.cardId);
          if (card) {
            this.digiEggs.push({ card, quantity: dc.quantity });
          }
        });

        // Populate main deck
        deck.mainDeck.forEach(dc => {
          const card = cardMap.get(dc.cardId);
          if (card) {
            this.mainDeck.push({ card, quantity: dc.quantity });
          }
        });

        console.log(`Deck loaded: ${this.digiEggs.length} digi-eggs, ${this.mainDeck.length} main deck cards`);
      });
  }
  // ─── Existing methods ────────────────────────────────────────────────────────

  private applyFilters(): void {
    if (Object.keys(this.currentFilter).length === 0 || (Object.keys(this.currentFilter).length === 1 && !this.currentFilter.searchText)) {
      this.filteredCards = this.cards;
      return;
    }
    
    this.cardService.searchCards(this.currentFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(filtered => {
        this.filteredCards = filtered;
        console.log(`Filtered to ${filtered.length} cards`);
      });
  }
  
}
