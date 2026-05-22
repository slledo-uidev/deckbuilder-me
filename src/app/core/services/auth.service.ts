/**
 * Auth Service - Manages user authentication via Supabase
 * Handles login, logout, and session management
 */

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUser } from '@models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;

  // Raw Supabase user observable (for internal / Supabase-level use)
  private userSubject$ = new BehaviorSubject<User | null>(null);

  // App-level user observable (for UI components)
  private appUserSubject$ = new BehaviorSubject<AppUser | null>(null);
  public readonly currentUser$: Observable<AppUser | null> = this.appUserSubject$.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        // Evita NavigatorLockAcquireTimeoutError cuando varias operaciones
        // de auth compiten por el lock (carga de sesión + signup/login simultáneos)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lock: ((_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => fn()) as any
      }
    });

    // Restore session on app load
    this.supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      this.userSubject$.next(user);
      this.appUserSubject$.next(this.toAppUser(user));
    });

    // Listen for auth state changes (login / logout / token refresh)
    this.supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      this.userSubject$.next(user);
      this.appUserSubject$.next(this.toAppUser(user));
    });
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Login with email and password via Supabase.
   * Returns an error string on failure, null on success.
   */
  public async login(email: string, password: string): Promise<string | null> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }

  /**
   * Register a new user with email, password and display name via Supabase.
   * Returns an error string on failure, null on success.
   */
  public async register(email: string, password: string, displayName: string): Promise<string | null> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { displayName } }
    });
    return error ? error.message : null;
    // Profile insertion is handled server-side by the DB trigger
    // handle_new_user() on auth.users INSERT (security definer → bypasses RLS)
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  /**
   * Get current logged-in AppUser (synchronous snapshot)
   */
  public getCurrentUser(): AppUser | null {
    return this.appUserSubject$.value;
  }

  /**
   * Get current Supabase user ID (UUID)
   */
  public get currentUserId(): string | undefined {
    return this.userSubject$.value?.id;
  }

  /**
   * Check if user is authenticated (synchronous)
   */
  public isAuthenticated(): boolean {
    return this.userSubject$.value !== null;
  }

  /**
   * Expose the raw Supabase client for services that need direct DB access
   */
  public getClient(): SupabaseClient {
    return this.supabase;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Map a Supabase User to an AppUser for the UI layer
   */
  private toAppUser(user: User | null): AppUser | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? '',
      displayName: user.user_metadata?.['displayName'] ?? user.email?.split('@')[0] ?? 'User'
    };
  }
}

