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
    if (this.group.thumbnailCardId) {
      return `https://images.digimoncard.io/images/cards/${this.group.thumbnailCardId}.jpg`;
    }
    // Fallback: use first card of the most recent deck
    const firstDeck = this.group.decks[0];
    const firstCard = [...(firstDeck?.mainDeck ?? []), ...(firstDeck?.digiEggs ?? [])][0];
    if (firstCard?.cardId) {
      return `https://images.digimoncard.io/images/cards/${firstCard.cardId}.jpg`;
    }
    return '';
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  colorToClass(color: string): string {
    return `archetype-card__color-dot--${color.toLowerCase()}`;
  }
}
