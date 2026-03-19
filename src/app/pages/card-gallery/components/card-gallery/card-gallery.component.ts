import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CardService } from '@core/services';
import { Card, CardFilter } from '@core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterPanelComponent } from '@shared/components/molecules/filter-panel/filter-panel.component';

@Component({
  selector: 'app-card-gallery',
  templateUrl: './card-gallery.component.html',
  styleUrls: ['./card-gallery.component.scss']
})
export class CardGalleryComponent implements OnInit, OnDestroy {
  @ViewChild(FilterPanelComponent) filterPanel!: FilterPanelComponent;
  
  cards: Card[] = [];
  filteredCards: Card[] = [];
  loading = false;
  error: string | null = null;
  
  searchText = '';
  currentFilter: CardFilter = {};
  filtersExpanded = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(private cardService: CardService) { }
  
  ngOnInit(): void {
    console.log('CardGalleryComponent initialized - Loading cards...');
    
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
    // Collapse filters panel after applying
    this.filtersExpanded = false;
  }
  
  onFilterClear(): void {
    // Reset filter state
    this.currentFilter = {
      searchText: this.searchText || undefined
    };
    
    // Clear filters in the filter panel component
    if (this.filterPanel) {
      // Reset the filter panel's internal state without triggering events
      this.filterPanel.selectedColors = [];
      this.filterPanel.selectedTypes = [];
      this.filterPanel.selectedRarities = [];
      this.filterPanel.selectedSets = [];
      this.filterPanel.selectedCost = undefined;
      this.filterPanel.selectedLevel = undefined;
    }
    
    this.applyFilters();
  }
  
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }
  
  getActiveFilterCount(): number {
    return this.filterPanel?.getActiveFilterCount() || 0;
  }
  
  onCardClick(card: Card): void {
    console.log('Card clicked:', card);
    // TODO: Open card detail modal
  }
  
  private applyFilters(): void {
    this.cardService.searchCards(this.currentFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(filtered => {
        this.filteredCards = filtered;
      });
  }
}
