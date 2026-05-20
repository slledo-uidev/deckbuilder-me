import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CardFilter, Color, CardType, Rarity } from '@models/index';
import { BadgeVariant } from '../../atoms/badge/badge.component';
import { CardService } from '@services/card.service';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent implements OnInit {
  @Output() filterChange = new EventEmitter<CardFilter>();
  @Output() filterClear = new EventEmitter<void>();
  
  constructor(private cardService: CardService) {}
  
  // Enums for template
  readonly colors = Object.values(Color);
  readonly types = Object.values(CardType);
  readonly rarities = Object.values(Rarity);
  readonly costs = Array.from({ length: 16 }, (_, i) => i); // 0-15
  readonly levels = [2, 3, 4, 5, 6, 7];
  
  // Sets list - will be populated dynamically
  availableSets: string[] = [];
  
  // Filter state
  selectedColors: Color[] = [];
  selectedTypes: CardType[] = [];
  selectedRarities: Rarity[] = [];
  selectedSets: string[] = [];
  selectedCost: number | undefined;
  selectedLevel: number | undefined;
  showPrerelease: boolean = false;
  
  isExpanded = true;
  
  ngOnInit(): void {
    // Get unique sets from loaded cards
    this.cardService.cards$.subscribe(cards => {
      if (cards.length > 0) {
        const uniqueSets = Array.from(new Set(cards.map(c => c.set)));
        this.availableSets = this.sortSets(uniqueSets);
      }
    });
  }
  
  private sortSets(sets: string[]): string[] {
    return sets.sort((a, b) => {
      const extractSetNumber = (set: string): number => {
        const match = set.match(/^(AD|BT|EX|LM|P|ST)-(\d+)/i);
        if (!match) return 9999; // Unknown sets go last
        return parseInt(match[2], 10);
      };

      const extractSetType = (set: string): string => {
        const match = set.match(/^(AD|BT|EX|LM|P|ST)-/i);
        return match ? match[1].toUpperCase() : 'ZZZ'; // Unknown goes last
      };

      const typeA = extractSetType(a);
      const typeB = extractSetType(b);
      
      // Custom prefix order: AD, BT, EX, LM, P, ST
      const prefixOrder: { [key: string]: number } = {
        'AD': 1,
        'BT': 2,
        'EX': 3,
        'LM': 4,
        'P': 5,
        'ST': 6
      };
      
      const orderA = prefixOrder[typeA] || 999;
      const orderB = prefixOrder[typeB] || 999;
      
      // Sort by type first
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Then sort by number
      return extractSetNumber(a) - extractSetNumber(b);
    });
  }
  
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  onColorChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const options = Array.from(select.selectedOptions);
    
    // Limit to 3 colors max
    if (options.length > 3) {
      // Prevent selection of more than 3
      event.preventDefault();
      // Keep only first 3
      this.selectedColors = options.slice(0, 3).map(opt => opt.value as Color);
      // Update select visual state
      setTimeout(() => {
        Array.from(select.options).forEach((opt, idx) => {
          opt.selected = this.selectedColors.includes(opt.value as Color);
        });
      }, 0);
      return;
    }
    
    this.selectedColors = options.map(opt => opt.value as Color);
  }
  
  onTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedTypes = select.value ? [select.value as CardType] : [];
  }
  
  onSetChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const options = Array.from(select.selectedOptions);
    this.selectedSets = options.map(opt => opt.value);
  }
  
  onRarityChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const options = Array.from(select.selectedOptions);
    this.selectedRarities = options.map(opt => opt.value as Rarity);
  }
  
  onCostChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCost = select.value ? Number(select.value) : undefined;
  }
  
  onLevelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedLevel = select.value ? Number(select.value) : undefined;
  }
  
  clearFilters(): void {
    this.selectedColors = [];
    this.selectedTypes = [];
    this.selectedRarities = [];
    this.selectedSets = [];
    this.selectedCost = undefined;
    this.selectedLevel = undefined;
    this.showPrerelease = false;
    
    this.filterClear.emit();
    // Don't call emitFilter() here - let the parent handle it
  }
  
  applyFilters(): void {
    this.emitFilter();
  }
  
  getActiveFilterCount(): number {
    let count = 0;
    if (this.selectedColors.length > 0) count++;
    if (this.selectedTypes.length > 0) count++;
    if (this.selectedRarities.length > 0) count++;
    if (this.selectedSets.length > 0) count++;
    if (this.selectedCost !== undefined) count++;
    if (this.selectedLevel !== undefined) count++;
    if (this.showPrerelease) count++;
    return count;
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
    if (this.selectedSets.length > 0) {
      filter.sets = this.selectedSets;
    }
    if (this.selectedCost !== undefined) {
      filter.costMin = this.selectedCost;
      filter.costMax = this.selectedCost;
    }
    if (this.selectedLevel !== undefined) {
      filter.levelMin = this.selectedLevel;
      filter.levelMax = this.selectedLevel;
    }
    if (this.showPrerelease) {
      filter.showPrerelease = true;
    }
    
    this.filterChange.emit(filter);
  }
}
