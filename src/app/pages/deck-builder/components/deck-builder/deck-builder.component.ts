import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService, ValidationService, CardService, AuthService } from '@core/services';
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
  deckName = 'My Deck';
  currentArchetype = '';
  currentPlaceholderId?: string;
  savedDecks: Deck[] = [];
  archetypes: Archetype[] = [];
  showSaveModal = false;
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
    private route: ActivatedRoute
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
        const deckId = params['deckId'];
        if (deckId) {
          this.loadDeckById(deckId);
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
    this.showSaveModal = true;
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
        const card = this.cards.find(c => 
          c.id === item.cardId || 
          c.id === item.cardId.replace(/_P\d+$/, '') // Handle parallel versions
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
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Expected format: "4 Wanyamon BT24-004" or "2 Gomamon BT24-020_P1"
      // Regex: quantity (number) + name (any text) + cardId (alphanumeric with - and _)
      const match = trimmedLine.match(/^(\d+)\s+(.+?)\s+([A-Z0-9]+[-_][A-Z0-9_]+)$/i);
      
      if (match) {
        const quantity = parseInt(match[1], 10);
        const name = match[2].trim();
        const cardId = match[3].trim();
        
        cards.push({ quantity, name, cardId });
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

  onSaveConfirm(data: SaveDeckData): void {
    this.showSaveModal = false;
    this.deckName = data.name;
    this.currentArchetype = data.archetype;

    const totalCards = this.getTotalCardCount();
    if (totalCards === 0) {
      return; // nothing to save
    }

    const colors = this.inferDeckColors();
    const currentUser = this.authService.getCurrentUser();
    
    const deck: Deck = {
      id: this.currentDeckId || this.generateDeckId(),
      name: data.name,
      digiEggs: this.digiEggs.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      mainDeck: this.mainDeck.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      sideDeck: [], // Empty - Digimon TCG doesn't use side deck
      colors,
      placeholderCardId: data.placeholderCardId,
      archetype: data.archetype || undefined,
      author: currentUser?.username,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const success = this.storageService.saveDeck(deck);
    if (success) {
      this.currentDeckId = deck.id;
      this.currentPlaceholderId = data.placeholderCardId;
      this.showSuccessMessage('Deck saved successfully!');
    }
  }

  onLoadDeck(deck: Deck): void {
    this.currentDeckId = deck.id;
    this.deckName = deck.name;
    this.currentArchetype = deck.archetype || '';
    this.currentPlaceholderId = deck.placeholderCardId;

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
   * Load a specific deck by ID
   */
  private loadDeckById(deckId: string): void {
    const deck = this.savedDecks.find(d => d.id === deckId);
    if (!deck) {
      console.error('Deck not found:', deckId);
      return;
    }

    console.log('Loading deck:', deck.name);
    this.currentDeckId = deck.id;
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
