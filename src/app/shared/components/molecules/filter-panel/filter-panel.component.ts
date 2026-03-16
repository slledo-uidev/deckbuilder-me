import { Component, EventEmitter, Output } from '@angular/core';
import { CardFilter, Color, CardType, Rarity } from '@models/index';
import { BadgeVariant } from '../../atoms/badge/badge.component';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent {
  @Output() filterChange = new EventEmitter<CardFilter>();
  @Output() filterClear = new EventEmitter<void>();
  
  // Enums for template
  readonly colors = Object.values(Color);
  readonly types = Object.values(CardType);
  readonly rarities = Object.values(Rarity);
  
  // Filter state
  selectedColors: Color[] = [];
  selectedTypes: CardType[] = [];
  selectedRarities: Rarity[] = [];
  costMin: number | undefined;
  costMax: number | undefined;
  levelMin: number | undefined;
  levelMax: number | undefined;
  
  isExpanded = true;
  
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  toggleColor(color: Color): void {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push(color);
    }
    this.emitFilter();
  }
  
  toggleType(type: CardType): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.emitFilter();
  }
  
  toggleRarity(rarity: Rarity): void {
    const index = this.selectedRarities.indexOf(rarity);
    if (index > -1) {
      this.selectedRarities.splice(index, 1);
    } else {
      this.selectedRarities.push(rarity);
    }
    this.emitFilter();
  }
  
  onCostChange(): void {
    this.emitFilter();
  }
  
  onLevelChange(): void {
    this.emitFilter();
  }
  
  clearFilters(): void {
    this.selectedColors = [];
    this.selectedTypes = [];
    this.selectedRarities = [];
    this.costMin = undefined;
    this.costMax = undefined;
    this.levelMin = undefined;
    this.levelMax = undefined;
    this.filterClear.emit();
    this.emitFilter();
  }
  
  private emitFilter(): void {
    const filter: CardFilter = {};
    
    if (this.selectedColors.length > 0) {
      filter.colors = this.selectedColors;
    }
    if (this.selectedTypes.length > 0) {
      filter.types = this.selectedTypes;
    }
    if (this.selectedRarities.length > 0) {
      filter.rarities = this.selectedRarities;
    }
    if (this.costMin !== undefined) {
      filter.costMin = this.costMin;
    }
    if (this.costMax !== undefined) {
      filter.costMax = this.costMax;
    }
    if (this.levelMin !== undefined) {
      filter.levelMin = this.levelMin;
    }
    if (this.levelMax !== undefined) {
      filter.levelMax = this.levelMax;
    }
    
    this.filterChange.emit(filter);
  }
  
  isColorSelected(color: Color): boolean {
    return this.selectedColors.includes(color);
  }
  
  isTypeSelected(type: CardType): boolean {
    return this.selectedTypes.includes(type);
  }
  
  isRaritySelected(rarity: Rarity): boolean {
    return this.selectedRarities.includes(rarity);
  }
  
  getColorBadgeVariant(color: Color): BadgeVariant {
    const colorMap: Record<Color, BadgeVariant> = {
      [Color.Red]: 'error',
      [Color.Blue]: 'info',
      [Color.Yellow]: 'warning',
      [Color.Green]: 'success',
      [Color.Black]: 'default',
      [Color.Purple]: 'secondary',
      [Color.White]: 'default'
    };
    return colorMap[color] || 'default';
  }
}
