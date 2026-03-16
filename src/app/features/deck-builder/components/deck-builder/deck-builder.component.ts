import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService, ValidationService, CardService } from '@core/services';
import { Deck, Card, CardFilter, Color } from '@core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeckCard as StorageDeckCard } from '@core/models/deck.model';

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
  sideDeck: DeckCard[] = [];
  
  // Selected zone for adding cards
  selectedZone: 'digi-eggs' | 'main' | 'side' = 'main';

  // Deck persistence state
  currentDeckId: string | null = null;
  deckName = 'My Deck';
  savedDecks: Deck[] = [];
  showSaveModal = false;
  showDeckList = false;
  saveSuccessMessage = '';
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private storageService: StorageService,
    private validationService: ValidationService,
    private cardService: CardService
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
  }
  
  onFilterClear(): void {
    this.currentFilter = {
      searchText: this.searchText || undefined
    };
    this.applyFilters();
  }
  
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }
  
  onCardClick(card: Card): void {
    console.log('Card clicked:', card);
    // TODO: Open card detail modal
  }
  
  onCardAdd(card: Card): void {
    console.log('Add card to deck:', card, 'Zone:', this.selectedZone);
    
    // Validate card type for zone
    if (this.selectedZone === 'digi-eggs' && card.type !== 'Digi-Egg') {
      console.warn('Only Digi-Egg cards can be added to Digi-Eggs zone');
      return;
    }
    
    // Check maximum 5 copies across all zones
    const totalCopies = this.getTotalCopiesOfCard(card.id);
    if (totalCopies >= 5) {
      console.warn('Maximum 5 copies per card name reached');
      return;
    }
    
    // Add to selected zone
    this.addCardToZone(card, this.selectedZone);
  }
  
  selectZone(zone: 'digi-eggs' | 'main' | 'side'): void {
    this.selectedZone = zone;
  }
  
  addCardToZone(card: Card, zone: 'digi-eggs' | 'main' | 'side'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs :
                       zone === 'main' ? this.mainDeck :
                       this.sideDeck;
    
    const existingCard = targetZone.find(dc => dc.card.id === card.id);
    
    if (existingCard) {
      if (existingCard.quantity < 5 && this.getTotalCopiesOfCard(card.id) < 5) {
        existingCard.quantity++;
      }
    } else {
      targetZone.push({ card, quantity: 1 });
    }
  }
  
  removeCardFromZone(card: Card, zone: 'digi-eggs' | 'main' | 'side'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs :
                       zone === 'main' ? this.mainDeck :
                       this.sideDeck;
    
    const index = targetZone.findIndex(dc => dc.card.id === card.id);
    if (index !== -1) {
      targetZone.splice(index, 1);
    }
  }
  
  increaseCardQuantity(card: Card, zone: 'digi-eggs' | 'main' | 'side'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs :
                       zone === 'main' ? this.mainDeck :
                       this.sideDeck;
    
    const deckCard = targetZone.find(dc => dc.card.id === card.id);
    if (deckCard && deckCard.quantity < 5 && this.getTotalCopiesOfCard(card.id) < 5) {
      deckCard.quantity++;
    }
  }
  
  decreaseCardQuantity(card: Card, zone: 'digi-eggs' | 'main' | 'side'): void {
    const targetZone = zone === 'digi-eggs' ? this.digiEggs :
                       zone === 'main' ? this.mainDeck :
                       this.sideDeck;
    
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
    const inSide = this.sideDeck.find(dc => dc.card.id === cardId)?.quantity || 0;
    return inDigiEggs + inMain + inSide;
  }
  
  // ─── Persistence ────────────────────────────────────────────────────────────

  openSaveModal(): void {
    this.showSaveModal = true;
  }

  onSaveCancel(): void {
    this.showSaveModal = false;
  }

  onSaveConfirm(name: string): void {
    this.showSaveModal = false;
    this.deckName = name;

    const totalCards = this.getTotalCardCount();
    if (totalCards === 0) {
      return; // nothing to save
    }

    const colors = this.inferDeckColors();
    const deck: Deck = {
      id: this.currentDeckId || this.generateDeckId(),
      name,
      digiEggs: this.digiEggs.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      mainDeck: this.mainDeck.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      sideDeck: this.sideDeck.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
      colors,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const success = this.storageService.saveDeck(deck);
    if (success) {
      this.currentDeckId = deck.id;
      this.showSuccessMessage('Deck saved successfully!');
    }
  }

  onLoadDeck(deck: Deck): void {
    this.currentDeckId = deck.id;
    this.deckName = deck.name;

    this.digiEggs = this.hydrateDeckCards(deck.digiEggs);
    this.mainDeck = this.hydrateDeckCards(deck.mainDeck);
    this.sideDeck = this.hydrateDeckCards(deck.sideDeck);

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
    this.sideDeck = [];
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
      sideDeck: this.sideDeck.map(dc => ({ cardId: dc.card.id, quantity: dc.quantity })),
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
    return count(this.digiEggs) + count(this.mainDeck) + count(this.sideDeck);
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
    if (deck.sideDeck.length > 0) {
      format(deck.sideDeck, 'Side Deck');
    }
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
