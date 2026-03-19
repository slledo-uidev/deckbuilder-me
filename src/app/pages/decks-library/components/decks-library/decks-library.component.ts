import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '@core/services';
import { Deck } from '@core/models';
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
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private storageService: StorageService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    console.log('DecksLibraryComponent initialized');
    
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
}
