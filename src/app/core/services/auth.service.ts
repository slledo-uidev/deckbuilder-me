/**
 * Auth Service - Manages user authentication
 * Handles login, logout, and session management with hardcoded users
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '@models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Hardcoded users
  private readonly USERS: User[] = [
    { username: 'me-sergiolll', password: 'K7m#pQ9$xL2w', displayName: 'MrRedV' },
    { username: 'me-picha', password: 'R5n@vB8!yT4s', displayName: 'Picha' },
    { username: 'me-lan', password: 'W3j&zC6*hN1q', displayName: 'Agumongallego' },
    { username: 'me-sergiom', password: 'F9d%mP7^kX5r', displayName: 'S-man' }
  ];

  // sessionStorage key for session persistence
  private readonly SESSION_KEY = 'deckbuilder.session';

  // Current user observable
  private currentUserSubject$ = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject$.asObservable();

  constructor() {
    this.loadSessionFromStorage();
  }

  /**
   * Load session from sessionStorage (if exists)
   */
  private loadSessionFromStorage(): void {
    try {
      const sessionJson = sessionStorage.getItem(this.SESSION_KEY);
      if (sessionJson) {
        const user = JSON.parse(sessionJson) as User;
        // Verify user still exists in hardcoded list (prevent session hijacking)
        const validUser = this.USERS.find(u => u.username === user.username);
        if (validUser) {
          this.currentUserSubject$.next(validUser);
        } else {
          // Invalid user, clear session
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load session from sessionStorage', error);
      this.clearSession();
    }
  }

  /**
   * Save session to sessionStorage
   */
  private saveSessionToStorage(user: User): void {
    try {
      const sessionJson = JSON.stringify(user);
      sessionStorage.setItem(this.SESSION_KEY, sessionJson);
    } catch (error) {
      console.error('Failed to save session to sessionStorage', error);
    }
  }

  /**
   * Clear session from sessionStorage
   */
  private clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject$.next(null);
  }

  /**
   * Attempt login with username and password
   * Returns true if successful, false otherwise
   */
  public login(username: string, password: string): boolean {
    const user = this.USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      this.currentUserSubject$.next(user);
      this.saveSessionToStorage(user);
      return true;
    }
    
    return false;
  }

  /**
   * Logout current user
   */
  public logout(): void {
    this.clearSession();
  }

  /**
   * Get current logged-in user (synchronous)
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject$.value;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUserSubject$.value !== null;
  }
}
