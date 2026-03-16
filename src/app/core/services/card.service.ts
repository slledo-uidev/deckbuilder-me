/**
 * Card Service - Manages card data from DigimonCard.dev API
 * Handles fetching, caching, and searching cards
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Card, CardFilter, CardSort, CardSortField, SortDirection } from '@models/index';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  // DigimonCard.dev API base URL (to be confirmed in Phase 0 investigation)
  private readonly API_BASE_URL = 'https://digimoncard.dev/api-public';
  
  // Cache for cards
  private cardsCache$ = new BehaviorSubject<Card[]>([]);
  private isLoading$ = new BehaviorSubject<boolean>(false);
  private errorSubject$ = new BehaviorSubject<string | null>(null);
  
  // Public observables
  public readonly cards$ = this.cardsCache$.asObservable();
  public readonly loading$ = this.isLoading$.asObservable();
  public readonly error$ = this.errorSubject$.asObservable();
  
  constructor(private http: HttpClient) {
    this.initializeCache();
  }
  
  /**
   * Initialize card cache from IndexedDB or API
   */
  private initializeCache(): void {
    // TODO: Check IndexedDB first, then fetch from API if not cached
    // For now, this will be implemented in Phase 0 after API investigation
    console.log('CardService initialized - API integration pending Phase 0 investigation');
  }
  
  /**
   * Fetch all cards from API
   * @returns Observable of Card array
   */
  public getAllCards(): Observable<Card[]> {
    this.isLoading$.next(true);
    this.errorSubject$.next(null);
    
    // TODO: Replace with actual API endpoint after Phase 0 investigation
    // For now, return empty array - will be populated after API research
    return of([]).pipe(
      tap(cards => {
        this.cardsCache$.next(cards);
        this.isLoading$.next(false);
      }),
      catchError(error => {
        const errorMsg = 'Failed to fetch cards from API';
        console.error(errorMsg, error);
        this.errorSubject$.next(errorMsg);
        this.isLoading$.next(false);
        return of([]);
      })
    );
  }
  
  /**
   * Search cards with filters
   * @param filter - Card filter criteria
   * @returns Observable of filtered Card array
   */
  public searchCards(filter: CardFilter): Observable<Card[]> {
    const allCards = this.cardsCache$.value;
    
    if (allCards.length === 0) {
      return this.getAllCards().pipe(
        map(cards => this.applyFilters(cards, filter))
      );
    }
    
    return of(this.applyFilters(allCards, filter));
  }
  
  /**
   * Get a single card by ID
   * @param cardId - Card unique identifier
   * @returns Observable of Card or null
   */
  public getCardById(cardId: string): Observable<Card | null> {
    const allCards = this.cardsCache$.value;
    const card = allCards.find(c => c.id === cardId);
    
    if (card) {
      return of(card);
    }
    
    // If not in cache, try to fetch from API
    return this.getAllCards().pipe(
      map(cards => cards.find(c => c.id === cardId) || null)
    );
  }
  
  /**
   * Get multiple cards by IDs
   * @param cardIds - Array of card IDs
   * @returns Observable of Card array
   */
  public getCardsByIds(cardIds: string[]): Observable<Card[]> {
    const allCards = this.cardsCache$.value;
    const cards = allCards.filter(c => cardIds.includes(c.id));
    
    if (cards.length === cardIds.length) {
      return of(cards);
    }
    
    // If some cards not in cache, fetch all
    return this.getAllCards().pipe(
      map(allCards => allCards.filter(c => cardIds.includes(c.id)))
    );
  }
  
  /**
   * Apply filters to card array
   * @param cards - Cards to filter
   * @param filter - Filter criteria
   * @returns Filtered card array
   */
  private applyFilters(cards: Card[], filter: CardFilter): Card[] {
    let filtered = [...cards];
    
    // Text search in name
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by colors
    if (filter.colors && filter.colors.length > 0) {
      filtered = filtered.filter(card =>
        card.color.some(c => filter.colors!.includes(c))
      );
    }
    
    // Filter by types
    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter(card =>
        filter.types!.includes(card.type)
      );
    }
    
    // Filter by cost range
    if (filter.costMin !== undefined) {
      filtered = filtered.filter(card => card.cost >= filter.costMin!);
    }
    if (filter.costMax !== undefined) {
      filtered = filtered.filter(card => card.cost <= filter.costMax!);
    }
    
    // Filter by level range (Digimon only)
    if (filter.levelMin !== undefined) {
      filtered = filtered.filter(card => 
        card.level !== undefined && card.level >= filter.levelMin!
      );
    }
    if (filter.levelMax !== undefined) {
      filtered = filtered.filter(card =>
        card.level !== undefined && card.level <= filter.levelMax!
      );
    }
    
    // Filter by sets
    if (filter.sets && filter.sets.length > 0) {
      filtered = filtered.filter(card =>
        filter.sets!.includes(card.set)
      );
    }
    
    // Filter by rarities
    if (filter.rarities && filter.rarities.length > 0) {
      filtered = filtered.filter(card =>
        filter.rarities!.includes(card.rarity)
      );
    }
    
    // Filter by keywords
    if (filter.keywords && filter.keywords.length > 0) {
      filtered = filtered.filter(card =>
        filter.keywords!.some(keyword => 
          card.keywords.includes(keyword)
        )
      );
    }
    
    // Search in effect text
    if (filter.effectText) {
      const effectLower = filter.effectText.toLowerCase();
      filtered = filtered.filter(card =>
        card.effect.toLowerCase().includes(effectLower) ||
        (card.inheritedEffect && card.inheritedEffect.toLowerCase().includes(effectLower)) ||
        (card.securityEffect && card.securityEffect.toLowerCase().includes(effectLower))
      );
    }
    
    return filtered;
  }
  
  /**
   * Sort cards by specified field
   * @param cards - Cards to sort
   * @param sort - Sort criteria
   * @returns Sorted card array
   */
  public sortCards(cards: Card[], sort: CardSort): Card[] {
    const sorted = [...cards];
    const direction = sort.direction === SortDirection.Ascending ? 1 : -1;
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case CardSortField.Name:
          comparison = a.name.localeCompare(b.name);
          break;
        case CardSortField.Cost:
          comparison = a.cost - b.cost;
          break;
        case CardSortField.Level:
          comparison = (a.level || 0) - (b.level || 0);
          break;
        case CardSortField.Type:
          comparison = a.type.localeCompare(b.type);
          break;
        case CardSortField.Rarity:
          comparison = a.rarity.localeCompare(b.rarity);
          break;
        case CardSortField.Set:
          comparison = a.set.localeCompare(b.set);
          break;
        default:
          comparison = 0;
      }
      
      return comparison * direction;
    });
    
    return sorted;
  }
  
  /**
   * Get unique values for filter dropdowns
   */
  public getUniqueSets(): string[] {
    const cards = this.cardsCache$.value;
    return Array.from(new Set(cards.map(c => c.set))).sort();
  }
  
  public getUniqueKeywords(): string[] {
    const cards = this.cardsCache$.value;
    const keywords = cards.flatMap(c => c.keywords);
    return Array.from(new Set(keywords)).sort();
  }
  
  public getUniqueForms(): string[] {
    const cards = this.cardsCache$.value;
    const forms = cards.filter(c => c.form).map(c => c.form!);
    return Array.from(new Set(forms)).sort();
  }
  
  public getUniqueAttributes(): string[] {
    const cards = this.cardsCache$.value;
    const attributes = cards.filter(c => c.attribute).map(c => c.attribute!);
    return Array.from(new Set(attributes)).sort();
  }
}
