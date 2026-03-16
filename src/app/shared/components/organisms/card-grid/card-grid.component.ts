import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '@models/card.model';

@Component({
  selector: 'app-card-grid',
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss']
})
export class CardGridComponent {
  @Input() cards: Card[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No cards found';
  @Output() cardClick = new EventEmitter<Card>();
  @Output() cardAdd = new EventEmitter<Card>();
  
  private imageAttempts = new Map<string, number>();
  
  onCardClick(card: Card): void {
    this.cardClick.emit(card);
  }
  
  onAddCard(card: Card, event: Event): void {
    event.stopPropagation();
    this.cardAdd.emit(card);
  }
  
  getCardColorClass(card: Card): string {
    if (card.color.length === 0) return '';
    return `card-grid__item--${card.color[0].toLowerCase()}`;
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
