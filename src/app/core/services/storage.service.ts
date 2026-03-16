/**
 * Storage Service - Manages localStorage operations
 * Handles deck persistence and localStorage operations
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Deck } from '@models/deck.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // localStorage keys
  private readonly DECKS_KEY = 'deckbuilder.decks';
  private readonly COLLECTION_KEY = 'deckbuilder.collection';
  private readonly SETTINGS_KEY = 'deckbuilder.settings';
  
  // Decks cache
  private decksCache$ = new BehaviorSubject<Deck[]>([]);
  public readonly decks$ = this.decksCache$.asObservable();
  
  constructor() {
    this.loadDecksFromStorage();
  }
  
  /**
   * Load all decks from localStorage
   */
  private loadDecksFromStorage(): void {
    try {
      const decksJson = localStorage.getItem(this.DECKS_KEY);
      if (decksJson) {
        const decks = JSON.parse(decksJson) as Deck[];
        // Convert date strings back to Date objects
        decks.forEach(deck => {
          deck.createdAt = new Date(deck.createdAt);
          deck.updatedAt = new Date(deck.updatedAt);
        });
        this.decksCache$.next(decks);
      }
    } catch (error) {
      console.error('Failed to load decks from localStorage', error);
      this.decksCache$.next([]);
    }
  }
  
  /**
   * Save all decks to localStorage
   */
  private saveDecksToStorage(decks: Deck[]): boolean {
    try {
      const decksJson = JSON.stringify(decks);
      localStorage.setItem(this.DECKS_KEY, decksJson);
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
