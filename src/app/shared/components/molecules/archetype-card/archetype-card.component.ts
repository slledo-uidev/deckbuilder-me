import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DeckArchetypeGroup } from '@core/models';

@Component({
  selector: 'app-archetype-card',
  templateUrl: './archetype-card.component.html',
  styleUrls: ['./archetype-card.component.scss']
})
export class ArchetypeCardComponent {
  @Input() group!: DeckArchetypeGroup;

  @Output() selected = new EventEmitter<DeckArchetypeGroup>();

  onSelect(): void {
    this.selected.emit(this.group);
  }

  get versionLabel(): string {
    const n = this.group.decks.length;
    return n === 1 ? '1 version' : `${n} versions`;
  }

  get thumbnailUrl(): string {
    const img = (cardId?: string) =>
      cardId ? `https://images.digimoncard.io/images/cards/${cardId}.jpg` : '';

    // 1. Favorite deck thumbnail
    const favorite = this.group.decks.find(d => d.isFavorite);
    if (favorite?.placeholderCardId) return img(favorite.placeholderCardId);

    // 2. Most recently created deck thumbnail
    const latest = [...this.group.decks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    if (latest?.placeholderCardId) return img(latest.placeholderCardId);

    // 3. Fallback: first card of that deck
    const firstCard = [...(latest?.mainDeck ?? []), ...(latest?.digiEggs ?? [])][0];
    return img(firstCard?.cardId);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  colorToClass(color: string): string {
    return `archetype-card__color-dot--${color.toLowerCase()}`;
  }
}
