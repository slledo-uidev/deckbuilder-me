/**
 * Profile Service - Manages user profile data from the `profiles` table in Supabase.
 * Exposes reactive observables for profile fields used across the app.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type DefaultLibraryView = 'decklist' | 'advanced';

export interface UserProfile {
  id: string;
  display_name: string | null;
  default_library_view: DefaultLibraryView;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private defaultLibraryViewSubject$ = new BehaviorSubject<DefaultLibraryView>('decklist');

  /** Stream of the user's preferred library view. Emits 'decklist' by default. */
  public readonly defaultLibraryView$: Observable<DefaultLibraryView> =
    this.defaultLibraryViewSubject$.asObservable();

  constructor(private auth: AuthService) {
    // Reload the profile whenever the authenticated user changes
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.loadProfile(user.id);
      } else {
        this.defaultLibraryViewSubject$.next('decklist');
      }
    });
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Synchronous snapshot of the current preferred library view.
   */
  public get defaultLibraryView(): DefaultLibraryView {
    return this.defaultLibraryViewSubject$.value;
  }

  /**
   * Updates `default_library_view` in Supabase and refreshes the local subject.
   */
  public async setDefaultLibraryView(view: DefaultLibraryView): Promise<void> {
    const userId = this.auth.currentUserId;
    if (!userId) return;

    // Upsert crea la fila si no existe; update si ya existe
    const { error } = await this.auth.getClient()
      .from('profiles')
      .upsert({ id: userId, default_library_view: view }, { onConflict: 'id' });

    if (error) {
      console.error('[ProfileService] Failed to upsert default_library_view:', error.message);
      return;
    }

    this.defaultLibraryViewSubject$.next(view);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.auth.getClient()
      .from('profiles')
      .select('default_library_view')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[ProfileService] Failed to load profile:', error.message);
      return;
    }

    const view: DefaultLibraryView =
      (data as any)?.default_library_view === 'advanced' ? 'advanced' : 'decklist';

    this.defaultLibraryViewSubject$.next(view);
  }
}
