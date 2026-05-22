import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Card, CardType } from '@core/models';
import { BadgeVariant } from '../../../components/atoms/badge/badge.component';

@Component({
  selector: 'app-card-viewer-modal',
  templateUrl: './card-viewer-modal.component.html',
  styleUrls: ['./card-viewer-modal.component.scss']
})
export class CardViewerModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() card: Card | null = null;
  @Output() close = new EventEmitter<void>();

  imageLoaded = false;
  imageError = false;

  ngOnChanges(): void {
    if (this.card) {
      this.imageLoaded = false;
      this.imageError = false;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  onImageError(): void {
    this.imageError = true;
    this.imageLoaded = true;
  }

  getTypeBadgeVariant(type: string): BadgeVariant {
    switch (type) {
      case CardType.Digimon:  return 'primary';
      case CardType.Tamer:    return 'warning';
      case CardType.Option:   return 'info';
      case CardType.DigiEgg:  return 'success';
      default:                return 'default';
    }
  }

  getColorBadgeVariant(color: string): BadgeVariant {
    switch (color) {
      case 'Red':    return 'error';
      case 'Blue':   return 'info';
      case 'Yellow': return 'warning';
      case 'Green':  return 'success';
      case 'Purple': return 'primary';
      default:       return 'default';
    }
  }

  isDigimon(): boolean {
    return this.card?.type === CardType.Digimon || this.card?.type === CardType.DigiEgg;
  }
}
