import { Component, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Card } from '@models/card.model';
import { BadgeVariant } from '../../atoms/badge/badge.component';

@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss']
})
export class CardGridComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() cards: Card[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No cards found';
  @Output() cardClick = new EventEmitter<Card>();
  @Output() cardAdd = new EventEmitter<Card>();
  
  @ViewChild('loadMoreTrigger', { static: false }) loadMoreTrigger?: ElementRef;
  
  // Pagination for performance
  private readonly CARDS_PER_PAGE = 50;
  displayedCardsCount = this.CARDS_PER_PAGE;
  isLoadingMore = false;
  
  private imageAttempts = new Map<string, number>();
  private intersectionObserver?: IntersectionObserver;
  private observerInitialized = false;
  
  get displayedCards(): Card[] {
    return this.cards.slice(0, this.displayedCardsCount);
  }
  
  get hasMoreCards(): boolean {
    return this.displayedCardsCount < this.cards.length;
  }
  
  get remainingCardsCount(): number {
    return this.cards.length - this.displayedCardsCount;
  }
  
  loadMore(): void {
    if (this.isLoadingMore || !this.hasMoreCards) return;
    
    this.isLoadingMore = true;
    
    // Load more cards immediately
    setTimeout(() => {
      this.displayedCardsCount += this.CARDS_PER_PAGE;
      this.isLoadingMore = false;
    }, 200);
  }
  
  resetPagination(): void {
    this.displayedCardsCount = this.CARDS_PER_PAGE;
    this.isLoadingMore = false;
    this.observerInitialized = false;
  }
  
  onCardClick(card: Card): void {
    this.cardClick.emit(card);
  }
  
  onAddCard(card: Card): void {
    this.cardAdd.emit(card);
  }
  
  ngOnChanges(): void {
    // Reset pagination when cards change
    this.resetPagination();
    // Re-setup observer after a short delay to ensure DOM is updated
    setTimeout(() => this.setupIntersectionObserver(), 100);
  }
  
  ngAfterViewInit(): void {
    // Initial setup with delay to ensure DOM is ready
    setTimeout(() => this.setupIntersectionObserver(), 100);
  }
  
  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
  
  private setupIntersectionObserver(): void {
    // Disconnect existing observer if any
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    // Don't setup if already initialized or no trigger element
    if (!this.loadMoreTrigger?.nativeElement || !this.hasMoreCards) {
      return;
    }
    
    const options = {
      root: null,
      rootMargin: '400px', // Start loading 400px before reaching the trigger
      threshold: 0
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.hasMoreCards && !this.isLoadingMore) {
          console.log('Loading more cards...');
          this.loadMore();
        }
      });
    }, options);
    
    // Observe the trigger element
    this.intersectionObserver.observe(this.loadMoreTrigger.nativeElement);
    this.observerInitialized = true;
  }
  
  getCardColorClass(card: Card): string {
    if (card.color.length === 0) return '';
    return `card-grid__item--${card.color[0].toLowerCase()}`;
  }
  
  getColorBadgeVariant(color: string): BadgeVariant {
    const colorMap: { [key: string]: BadgeVariant } = {
      'Red': 'error',
      'Blue': 'info',
      'Yellow': 'warning',
      'Green': 'success',
      'Black': 'default',
      'Purple': 'primary',
      'White': 'secondary'
    };
    return colorMap[color] || 'default';
  }
  
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const currentSrc = imgElement.src;
    const attempts = this.imageAttempts.get(currentSrc) || 0;
    
    // Try different URL patterns before giving up
    if (attempts === 0) {
      // Extract card ID from current URL and try lowercase
      const match = currentSrc.match(/\/([A-Z0-9-]+)\.jpg$/i);
      if (match) {
        const cardId = match[1];
        imgElement.src = `https://images.digimoncard.io/images/cards/${cardId.toLowerCase()}.jpg`;
        this.imageAttempts.set(currentSrc, 1);
        return;
      }
    } else if (attempts === 1) {
      // Try alternative CDN pattern (some sites use different paths)
      const match = currentSrc.match(/\/([A-Z0-9-]+)\.jpg$/i);
      if (match) {
        const cardId = match[1];
        // Try digimoncard.io pattern
        imgElement.src = `https://digimoncard.io/images/cards/${cardId.toUpperCase()}.jpg`;
        this.imageAttempts.set(currentSrc, 2);
        return;
      }
    }
    
    // All attempts failed, show placeholder
    imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280"%3E%3Crect fill="%23f0f0f0" width="200" height="280"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    imgElement.alt = 'Card image not available';
  }
}
