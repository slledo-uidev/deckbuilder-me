/**
 * Card Service - Manages card data from DigimonCard.io API
 * Handles fetching, caching, and searching cards from the complete TCG catalog
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { catchError, map, tap, delay, mergeMap, toArray } from 'rxjs/operators';
import { Card, CardFilter, CardSort, CardSortField, SortDirection, CardType, Color, Rarity } from '@models/index';

interface DigimonCardIOResponse {
  name: string;
  type: string;
  id: string;
  level?: number;
  play_cost?: number;
  evolution_cost?: number;
  evolution_color?: string;
  color?: string;
  color2?: string | null;
  digi_type?: string;
  form?: string;
  dp?: number;
  attribute?: string;
  rarity?: string;
  stage?: string;
  main_effect?: string;
  source_effect?: string;
  alt_effect?: string;
  set_name?: string[];
  image_url?: string;  // Added: API provides image_url
  cardnumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  // DigimonCard.io Public API
  private readonly API_BASE_URL = 'https://digimoncard.io/api-public';
  private readonly IMAGE_BASE_URL = 'https://images.digimoncard.io/images/cards';
  
  // Cache for cards
  private cardsCache$ = new BehaviorSubject<Card[]>([]);
  private allCardsCache: Card[] = []; // Full catalog cache
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
   * Initialize card cache from DigimonCard.io API
   * Loads complete card catalog on service initialization
   */
  private initializeCache(): void {
    console.log('CardService initialized - Loading cards from DigimonCard.io API');
    this.getAllCards().subscribe();
  }
  
  /**
   * Fetch all cards from DigimonCard.io API
   * Makes sequential requests to get complete catalog (by card types)
   * @returns Observable of Card array
   */
  public getAllCards(): Observable<Card[]> {
    // Return cached cards if already loaded
    if (this.cardsCache$.value.length > 0) {
      console.log(`Using cached cards: ${this.cardsCache$.value.length} total`);
      return of(this.cardsCache$.value);
    }
    
    this.isLoading$.next(true);
    this.errorSubject$.next(null);
    
    console.log('Fetching cards from DigimonCard.io API...');
    
    // Convert async function to Observable
    return from(this.fetchAllCardsSequential()).pipe(
      tap(cards => {
        console.log(`✓ Loaded ${cards.length} cards total from DigimonCard.io API`);
        this.cardsCache$.next(cards);
        this.isLoading$.next(false);
      }),
      catchError(error => {
        const errorMsg = 'Failed to load cards from DigimonCard.io API';
        console.error(errorMsg, error);
        
        // Fallback to local JSON if API fails
        console.log('Attempting fallback to local JSON...');
        return this.loadFromLocalJSON();
      })
    );
  }
  
  /**
   * Fetch all cards sequentially by type  with rate limiting
   * This respects the API rate limit of 15 req/10s
   */
  private async fetchAllCardsSequential(): Promise<Card[]> {
    const types = ['Digimon', 'Tamer', 'Option', 'Digi-Egg'];
    const allApiCards: DigimonCardIOResponse[] = [];
    
    for (const type of types) {
      try {
        const params = new HttpParams()
          .set('type', type)
          .set('series', 'Digimon Card Game')
          .set('sort', 'card_number')
          .set('sortdirection', 'asc');
        
        const response = await this.http.get<DigimonCardIOResponse[]>(
          `${this.API_BASE_URL}/search`,
          { params }
        ).toPromise();
        
        if (response) {
          allApiCards.push(...response);
          console.log(`  ✓ Fetched ${response.length} ${type} cards`);
        }
        
        // Wait to respect rate limiting (15 req/10s = ~750ms between requests is safe)
        if (types.indexOf(type) < types.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
      } catch (error) {
        console.error(`  ✗ Failed to fetch ${type} cards:`, error);
      }
    }
    
    return this.mapApiCardsToCards(allApiCards);
  }
  
  /**
   * Fallback method to load from local JSON if API fails
   */
  private loadFromLocalJSON(): Observable<Card[]> {
    return this.http.get<Card[]>('/assets/data/cards.json').pipe(
      tap(cards => {
        console.log(`✓ Loaded ${cards.length} cards from local JSON (fallback)`);
        this.cardsCache$.next(cards);
        this.isLoading$.next(false);
      }),
      catchError(error => {
        const errorMsg = 'Failed to load cards from both API and local JSON';
        console.error(errorMsg, error);
        this.errorSubject$.next(errorMsg);
        this.isLoading$.next(false);
        return of([]);
      })
    );
  }
  
  /**
   * Map DigimonCard.io API response to our Card model
   */
  private mapApiCardsToCards(apiCards: DigimonCardIOResponse[]): Card[] {
    return apiCards.map(apiCard => this.mapApiCardToCard(apiCard));
  }
  
  /**
   * Map a single API card to our Card model
   */
  private mapApiCardToCard(apiCard: DigimonCardIOResponse): Card {
    // Map card type
    const type = this.mapApiType(apiCard.type);
    
    // Map colors (handle both single and dual colors)
    const colors: Color[] = [];
    if (apiCard.color) {
      const mappedColor = this.mapApiColor(apiCard.color);
      if (mappedColor) colors.push(mappedColor);
    }
    if (apiCard.color2) {
      const mappedColor2 = this.mapApiColor(apiCard.color2);
      if (mappedColor2) colors.push(mappedColor2);
    }
    
    // Map rarity
    const rarity = this.mapApiRarity(apiCard.rarity || 'common');
    
    // Extract card number from ID (e.g., "BT1-085" → "085")
    const cardNumber = apiCard.id.split('-')[1] || apiCard.id;
    
    // Construct image URL - try multiple patterns
    // Pattern 1: API provided image_url (if available)
    let imageUrl = apiCard.image_url || '';
    
    // Pattern 2: DigimonCard.io standard format
    if (!imageUrl) {
      const cardId = apiCard.id.toUpperCase();
      imageUrl = `https://images.digimoncard.io/images/cards/${cardId}.jpg`;
    }
    
    // Log first few cards for debugging
    if (this.cardsCache$.value.length < 3) {
      console.log(`Card ${apiCard.id} -> Image URL: ${imageUrl}`);
    }
    
    return {
      id: apiCard.id,
      name: apiCard.name,
      type: type,
      color: colors,
      cost: apiCard.play_cost || 0,
      digivolutionCost: apiCard.evolution_cost,
      level: apiCard.level,
      dp: apiCard.dp,
      form: apiCard.form,
      attribute: apiCard.attribute,
      rarity: rarity,
      set: apiCard.set_name?.[0] || 'Unknown',
      cardNumber: cardNumber,
      imageUrl: imageUrl,
      effect: apiCard.main_effect || '',
      inheritedEffect: apiCard.source_effect || '',
      securityEffect: apiCard.alt_effect || '',
      keywords: this.extractKeywords(apiCard.main_effect || '')
    };
  }
  
  /**
   * Map API card type to our CardType enum
   */
  private mapApiType(apiType: string): CardType {
    const typeMap: { [key: string]: CardType } = {
      'Digimon': CardType.Digimon,
      'Tamer': CardType.Tamer,
      'Option': CardType.Option,
      'Digi-Egg': CardType.DigiEgg
    };
    return typeMap[apiType] || CardType.Digimon;
  }
  
  /**
   * Map API color string to our Color enum
   */
  private mapApiColor(apiColor: string): Color | null {
    const colorMap: { [key: string]: Color } = {
      'Red': Color.Red,
      'Blue': Color.Blue,
      'Yellow': Color.Yellow,
      'Green': Color.Green,
      'Black': Color.Black,
      'Purple': Color.Purple,
      'White': Color.White
    };
    return colorMap[apiColor] || null;
  }
  
  /**
   * Map API rarity string to our Rarity enum
   */
  private mapApiRarity(apiRarity: string): Rarity {
    const rarityMap: { [key: string]: Rarity } = {
      'c': Rarity.Common,
      'common': Rarity.Common,
      'u': Rarity.Uncommon,
      'uncommon': Rarity.Uncommon,
      'r': Rarity.Rare,
      'rare': Rarity.Rare,
      'sr': Rarity.SuperRare,
      'super rare': Rarity.SuperRare,
      'sec': Rarity.SecretRare,
      'secret rare': Rarity.SecretRare
    };
    return rarityMap[apiRarity.toLowerCase()] || Rarity.Common;
  }
  
  /**
   * Extract keywords from effect text
   * Simple implementation - looks for common keywords in brackets
   */
  private extractKeywords(effectText: string): string[] {
    const keywords: string[] = [];
    const keywordPatterns = [
      'Reboot', 'Blocker', 'Jamming', 'Security Attack', 
      'Piercing', 'Armor Purge', 'Blast Digivolve', 'Digisorption',
      'Draw', 'Recovery', 'De-Digivolve', 'Delay', 'Blitz'
    ];
    
    keywordPatterns.forEach(keyword => {
      if (effectText.includes(`<${keyword}>`) || effectText.includes(`[${keyword}]`)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
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
