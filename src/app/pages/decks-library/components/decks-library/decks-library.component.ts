import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService, CardService } from '@core/services';
import { Deck, Card } from '@core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-decks-library',
  templateUrl: './decks-library.component.html',
  styleUrls: ['./decks-library.component.scss']
})
export class DecksLibraryComponent implements OnInit, OnDestroy {
  decks: Deck[] = [];
  loading = false;
  allCards: Card[] = [];
  
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
        console.log(`Loaded ${decks.length} saved decks`);
      });
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
