/**
 * Storage Service - Manages localStorage operations
 * Handles deck persistence and localStorage operations
 * Now supports multi-user storage with isolated decks per user
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Deck, Archetype } from '@models/deck.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // localStorage keys (base keys, actual keys will include username)
  private readonly DECKS_KEY_BASE = 'deckbuilder.decks';
  private readonly LEGACY_DECKS_KEY = 'deckbuilder.decks'; // Old key for migration
  private readonly COLLECTION_KEY = 'deckbuilder.collection';
  private readonly SETTINGS_KEY = 'deckbuilder.settings';
  private readonly ARCHETYPES_KEY_BASE = 'deckbuilder.archetypes';

  // Decks cache
  private decksCache$ = new BehaviorSubject<Deck[]>([]);
  public readonly decks$ = this.decksCache$.asObservable();

  // Archetypes cache
  private archetypesCache$ = new BehaviorSubject<Archetype[]>([]);
  public readonly archetypes$ = this.archetypesCache$.asObservable();
  
  constructor(private authService: AuthService) {
    // Subscribe to auth changes to reload decks when user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadDecksFromStorage();
        this.loadArchetypesFromStorage();
      } else {
        // User logged out, clear cache
        this.decksCache$.next([]);
        this.archetypesCache$.next([]);
      }
    });
  }
  
  /**
   * Get the localStorage key for the current user's decks
   */
  private getUserDecksKey(): string {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user. Cannot access storage.');
    }
    return `${this.DECKS_KEY_BASE}.${currentUser.id}`;
  }
  
  /**
   * Migrate legacy decks to current user's storage (if they exist)
   * This ensures existing decks are not lost on first login
   */
  private migrateLegacyDecks(): void {
    try {
      const legacyDecksJson = localStorage.getItem(this.LEGACY_DECKS_KEY);
      if (legacyDecksJson) {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;
        
        const userKey = this.getUserDecksKey();
        const existingUserDecks = localStorage.getItem(userKey);
        
        // Only migrate if user has no decks yet
        if (!existingUserDecks) {
          console.log(`Migrating legacy decks to user: ${currentUser.id}`);
          localStorage.setItem(userKey, legacyDecksJson);
        }
        
        // Remove legacy key after first migration attempt
        localStorage.removeItem(this.LEGACY_DECKS_KEY);
      }
    } catch (error) {
      console.error('Failed to migrate legacy decks', error);
    }
  }
  
  /**
   * Load all decks from localStorage for current user
   */
  private loadDecksFromStorage(): void {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.decksCache$.next([]);
        return;
      }
      
      // Migrate legacy decks on first load
      this.migrateLegacyDecks();
      
      const userDecksKey = this.getUserDecksKey();
      const decksJson = localStorage.getItem(userDecksKey);
      
      if (decksJson) {
        const decks = JSON.parse(decksJson) as Deck[];
        // Convert date strings back to Date objects
        decks.forEach(deck => {
          deck.createdAt = new Date(deck.createdAt);
          deck.updatedAt = new Date(deck.updatedAt);
        });
        this.decksCache$.next(decks);
      } else {
        this.decksCache$.next([]);
      }
    } catch (error) {
      console.error('Failed to load decks from localStorage', error);
      this.decksCache$.next([]);
    }
  }
  
  /**
   * Save all decks to localStorage for current user
   */
  private saveDecksToStorage(decks: Deck[]): boolean {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('Cannot save decks: no authenticated user');
        return false;
      }
      
      const userDecksKey = this.getUserDecksKey();
      const decksJson = JSON.stringify(decks);
      localStorage.setItem(userDecksKey, decksJson);
      return true;
    } catch (error) {
      console.error('Failed to save decks to localStorage', error);
      // Check if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Consider removing old decks.');
      }
      return false;
    }
  }
  
  /**
   * Get all decks
   */
  public getAllDecks(): Deck[] {
    return this.decksCache$.value;
  }
  
  /**
   * Get deck by ID
   */
  public getDeckById(deckId: string): Deck | null {
    const decks = this.decksCache$.value;
    return decks.find(d => d.id === deckId) || null;
  }
  
  /**
   * Save a new deck or update existing one
   */
  public saveDeck(deck: Deck): boolean {
    const decks = this.decksCache$.value;
    const existingIndex = decks.findIndex(d => d.id === deck.id);
    
    // Update timestamp
    deck.updatedAt = new Date();
    
    if (existingIndex >= 0) {
      // Update existing deck
      decks[existingIndex] = deck;
    } else {
      // Add new deck
      deck.createdAt = new Date();
      decks.push(deck);
    }
    
    const success = this.saveDecksToStorage(decks);
    if (success) {
      this.decksCache$.next([...decks]);
    }
    return success;
  }
  
  /**
   * Replace ALL decks in localStorage and cache with the provided array.
   * Used to sync from Supabase on page load.
   */
  public replaceAllDecks(decks: Deck[]): void {
    // Preserve local-only fields (like placeholderCardId, isFavorite, tags)
    const existingDecks = this.decksCache$.value;

    const merged = decks.map(incoming => {
      // Normalize dates
      incoming.createdAt = new Date(incoming.createdAt as any);
      incoming.updatedAt = new Date(incoming.updatedAt as any);

      // Try to find a corresponding local deck by id or supabaseVersionId only.
      // Matching by family_id can incorrectly map multiple versions to the same
      // local deck (and copy the same placeholder to all of them), so avoid it.
      const local = existingDecks.find(d =>
        d.id === incoming.id ||
        (d.supabaseVersionId && d.supabaseVersionId === (incoming as any).supabaseVersionId)
      );

      if (local) {
        // Copy local-only fields if present
        if (local.placeholderCardId) incoming.placeholderCardId = local.placeholderCardId;
        if (local.isFavorite !== undefined) incoming.isFavorite = local.isFavorite;
        if (local.tags) incoming.tags = local.tags;
        if (local.author) incoming.author = local.author;
        // Keep any local supabase IDs if present (don't overwrite)
        if (local.supabaseFamilyId) incoming.supabaseFamilyId = local.supabaseFamilyId;
        if (local.supabaseVersionId) incoming.supabaseVersionId = local.supabaseVersionId;
      }
      return incoming;
    });

    this.saveDecksToStorage(merged);
    this.decksCache$.next([...merged]);
  }

  /**
   * Delete deck by ID
   */
  public deleteDeck(deckId: string): boolean {
    const decks = this.decksCache$.value;
    const filteredDecks = decks.filter(d => d.id !== deckId);
    
    if (filteredDecks.length === decks.length) {
      // Deck not found
      return false;
    }
    
    const success = this.saveDecksToStorage(filteredDecks);
    if (success) {
      this.decksCache$.next(filteredDecks);
    }
    return success;
  }
  
  /**
   * Duplicate a deck with new ID
   */
  public duplicateDeck(deckId: string): Deck | null {
    const originalDeck = this.getDeckById(deckId);
    if (!originalDeck) {
      return null;
    }
    
    const duplicatedDeck: Deck = {
      ...originalDeck,
      id: this.generateId(),
      name: `${originalDeck.name} (copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const success = this.saveDeck(duplicatedDeck);
    return success ? duplicatedDeck : null;
  }
  
  /**
   * Export deck to JSON string
   */
  public exportDeck(deckId: string): string | null {
    const deck = this.getDeckById(deckId);
    if (!deck) {
      return null;
    }
    
    try {
      return JSON.stringify(deck, null, 2);
    } catch (error) {
      console.error('Failed to export deck', error);
      return null;
    }
  }
  
  /**
   * Import deck from JSON string
   */
  public importDeck(deckJson: string): Deck | null {
    try {
      const deck = JSON.parse(deckJson) as Deck;
      
      // Generate new ID for imported deck
      deck.id = this.generateId();
      deck.createdAt = new Date();
      deck.updatedAt = new Date();
      
      const success = this.saveDeck(deck);
      return success ? deck : null;
    } catch (error) {
      console.error('Failed to import deck', error);
      return null;
    }
  }
  
  /**
   * Clear all decks (with confirmation in UI)
   */
  public clearAllDecks(): boolean {
    const success = this.saveDecksToStorage([]);
    if (success) {
      this.decksCache$.next([]);
    }
    return success;
  }
  
  /**
   * Get collection data
   */
  public getCollection(): any {
    try {
      const collectionJson = localStorage.getItem(this.COLLECTION_KEY);
      return collectionJson ? JSON.parse(collectionJson) : {};
    } catch (error) {
      console.error('Failed to load collection from localStorage', error);
      return {};
    }
  }
  
  /**
   * Save collection data
   */
  public saveCollection(collection: any): boolean {
    try {
      const collectionJson = JSON.stringify(collection);
      localStorage.setItem(this.COLLECTION_KEY, collectionJson);
      return true;
    } catch (error) {
      console.error('Failed to save collection to localStorage', error);
      return false;
    }
  }
  
  /**
   * Get app settings
   */
  public getSettings(): any {
    try {
      const settingsJson = localStorage.getItem(this.SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {};
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      return {};
    }
  }
  
  /**
   * Save app settings
   */
  public saveSettings(settings: any): boolean {
    try {
      const settingsJson = JSON.stringify(settings);
      localStorage.setItem(this.SETTINGS_KEY, settingsJson);
      return true;
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
      return false;
    }
  }
  
  /**
   * Generate unique ID for decks
   */
  private generateId(): string {
    return `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ─── Archetypes ─────────────────────────────────────────────────────────────

  private getUserArchetypesKey(): string {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('No authenticated user.');
    return `${this.ARCHETYPES_KEY_BASE}.${currentUser.id}`;
  }

  private loadArchetypesFromStorage(): void {
    try {
      const key = this.getUserArchetypesKey();
      const json = localStorage.getItem(key);
      if (json) {
        const archetypes = JSON.parse(json) as Archetype[];
        archetypes.forEach(a => { a.createdAt = new Date(a.createdAt); });
        this.archetypesCache$.next(archetypes);
      } else {
        this.archetypesCache$.next([]);
      }
    } catch (error) {
      console.error('Failed to load archetypes from localStorage', error);
      this.archetypesCache$.next([]);
    }
  }

  private saveArchetypesToStorage(archetypes: Archetype[]): boolean {
    try {
      const key = this.getUserArchetypesKey();
      localStorage.setItem(key, JSON.stringify(archetypes));
      return true;
    } catch (error) {
      console.error('Failed to save archetypes to localStorage', error);
      return false;
    }
  }

  public getAllArchetypes(): Archetype[] {
    return this.archetypesCache$.value;
  }

  public saveArchetype(archetype: Archetype): boolean {
    const archetypes = [...this.archetypesCache$.value];
    const idx = archetypes.findIndex(a => a.id === archetype.id);
    if (idx >= 0) {
      archetypes[idx] = archetype;
    } else {
      archetype.createdAt = new Date();
      archetypes.push(archetype);
    }
    const success = this.saveArchetypesToStorage(archetypes);
    if (success) this.archetypesCache$.next(archetypes);
    return success;
  }

  public deleteArchetype(id: string): boolean {
    const archetypes = this.archetypesCache$.value.filter(a => a.id !== id);
    const success = this.saveArchetypesToStorage(archetypes);
    if (success) this.archetypesCache$.next(archetypes);
    return success;
  }
  
  /**
   * Check localStorage availability
   */
  public isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get localStorage usage info
   */
  public getStorageInfo(): { used: number; available: number; usagePercent: number } {
    if (!this.isLocalStorageAvailable()) {
      return { used: 0, available: 0, usagePercent: 0 };
    }
    
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Most browsers have 5-10MB limit, use 5MB as conservative estimate
    const availableBytes = 5 * 1024 * 1024;
    const usagePercent = (used / availableBytes) * 100;
    
    return {
      used: Math.round(used / 1024), // KB
      available: Math.round((availableBytes - used) / 1024), // KB
      usagePercent: Math.round(usagePercent * 100) / 100
    };
  }
}
