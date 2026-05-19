/**
 * Deck Service - Manages deck persistence via Supabase
 *
 * Table mapping:
 *   deck_families  → one row per "archetype family" owned by a user
 *   deck_versions  → one row per concrete card list, FK → deck_families.id
 *
 * This service does NOT replace StorageService (localStorage) yet —
 * both coexist during the migration phase.
 */

import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { DeckCard, DeckFamily, DeckFamilyWithVersions, DeckVersion } from '@models/deck.model';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private supabase: SupabaseClient;

  constructor(private auth: AuthService) {
    // Reuse the single Supabase client created by AuthService
    this.supabase = this.auth.getClient();
  }

  // ─── Library ───────────────────────────────────────────────────────────────

  /**
   * Fetches all decks for the current user from Supabase as a flat Deck[] array,
   * ready to be stored in localStorage. Each row in `decks` becomes one Deck.
   * Called on page load to keep localStorage in sync with the remote source of truth.
   */
  async getDecksForSync(): Promise<import('@models/deck.model').Deck[]> {
    const userId = this.auth.currentUserId;
    if (!userId) throw new Error('No hay usuario autenticado.');

    const { data, error } = await this.supabase
      .from('deck_families')
      .select(`
        id,
        name,
        archetype,
        description,
        created_at,
        decks (
          id,
          version_name,
          card_list,
          notes,
          created_at,
          thumbnail_card_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result: import('@models/deck.model').Deck[] = [];

    for (const family of (data as any[])) {
      for (const version of (family.decks ?? [])) {
        const cardList: any[] = version.card_list ?? [];
        // If entries include isEgg flag, split into digiEggs and mainDeck accordingly.
        // Fallback: if no isEgg info, keep all in mainDeck (backwards compatibility).
        const digiEggsStored = cardList.filter(c => c.isEgg === true).map(c => ({ cardId: c.cardId, quantity: c.quantity }));
        const mainDeckStored = cardList.filter(c => c.isEgg !== true).map(c => ({ cardId: c.cardId, quantity: c.quantity }));

        result.push({
          id: version.id,
          name: version.version_name ?? family.name,
          description: family.description,
          supabaseFamilyId: family.id,
          supabaseVersionId: version.id,
          digiEggs: digiEggsStored,
          mainDeck: mainDeckStored,
          sideDeck: [],
          colors: [],
          archetype: family.archetype ?? family.name,
          placeholderCardId: (version as any).thumbnail_card_id ?? undefined,
          createdAt: new Date(version.created_at ?? family.created_at),
          updatedAt: new Date(version.created_at ?? family.created_at)
        });
      }
    }

    return result;
  }

  /**
   * Fetches all DeckFamilies for the current user, including a lightweight
   * summary of their versions (no card_list to keep the payload small).
   * Used to populate the Decks Library view.
   */
  async getUserLibrary(): Promise<DeckFamilyWithVersions[]> {
    const userId = this.auth.currentUserId;
    if (!userId) throw new Error('No hay usuario autenticado.');

    const { data, error } = await this.supabase
      .from('deck_families')
      .select(`
        id,
        name,
        archetype,
        description,
        created_at,
        decks (
          id,
          version_name,
          created_at,
          notes,
          thumbnail_card_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar la librería:', error);
      throw error;
    }
    // Type: Supabase returns fields including user_id which DeckFamilyWithVersions expects.
    return data as unknown as DeckFamilyWithVersions[];
  }

  /**
   * Fetches the full detail of a single version including card_list.
   * Only called when the user explicitly loads a deck to edit/view.
   */
  async getDeckDetails(deckId: string): Promise<DeckVersion> {
    const { data, error } = await this.supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();

    if (error) throw error;
    return data as DeckVersion;
  }

  // ─── Families ──────────────────────────────────────────────────────────────

  /**
   * Creates a DeckFamily row without any version.
   * Use this when the user creates a new archetype/tipología from the library.
   */
  async createFamily(
    name: string,
    options: { archetype?: string; description?: string } = {}
  ): Promise<DeckFamily> {
    const userId = this.auth.currentUserId;
    if (!userId) throw new Error('No hay usuario autenticado.');

    const insertPayload = {
      name,
      user_id: userId,
      archetype: options.archetype ?? name,
      description: options.description
    };
    const { data, error } = await this.supabase
      .from('deck_families')
      .insert([insertPayload])
      .select()
      .single();
    

    if (error) throw error;
    return data as DeckFamily;
  }

  /**
   * Creates a new DeckFamily + its first DeckVersion in a single operation.
   * Use this when the user saves a brand-new deck.
   */
  async createNewFamilyWithVersion(
    familyName: string,
    cards: DeckCard[],
    versionName: string = 'v1.0',
  options: { archetype?: string; description?: string; notes?: string; thumbnailCardId?: string } = {}
  ): Promise<DeckVersion> {
    const userId = this.auth.currentUserId;
    if (!userId) throw new Error('No hay usuario autenticado.');

    // 1. Determine family: if familyName is the default placeholder ('Untitled family'),
    //    try to reuse an existing row for this user; otherwise create a new family.
    let family: any = null;

  const DEFAULT_FAMILY_NAME = 'no-family';

    if (familyName === DEFAULT_FAMILY_NAME) {
      // Try to find an existing default family for this user
      const { data: existing, error: fetchErr } = await this.supabase
        .from('deck_families')
        .select('*')
        .eq('user_id', userId)
        .eq('name', DEFAULT_FAMILY_NAME)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (existing) {
        family = existing;
      } else {
        // Create the default family with archetype set to the sentinel 'no-family'
        const { data, error } = await this.supabase
          .from('deck_families')
          .insert([{
            name: DEFAULT_FAMILY_NAME,
            user_id: userId,
            archetype: DEFAULT_FAMILY_NAME,
            description: options.description
          }])
          .select()
          .single();

        if (error) throw error;
        family = data;
      }
    } else {
      // Normal flow: create a new family with provided archetype (if any)
      const { data, error } = await this.supabase
        .from('deck_families')
        .insert([{
          name: familyName,
          user_id: userId,
          archetype: options.archetype,
          description: options.description
        }])
        .select()
        .single();

      if (error) throw error;
      family = data;
    }

    // 2. Insert the first version linked to the determined family
    return this.saveNewVersion(family.id, cards, versionName, { notes: options.notes, archetype: options.archetype, thumbnailCardId: options.thumbnailCardId });
  }

  /**
   * Fetch all DeckFamilies belonging to the current user.
   */
  async getFamilies(): Promise<DeckFamily[]> {
    const userId = this.auth.currentUserId;
    if (!userId) throw new Error('No hay usuario autenticado.');

    const { data, error } = await this.supabase
      .from('deck_families')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DeckFamily[];
  }

  /**
   * Delete a DeckFamily (and all its versions via DB cascade).
   */
  async deleteFamily(familyId: string): Promise<void> {
    const { error } = await this.supabase
      .from('deck_families')
      .delete()
      .eq('id', familyId);

    if (error) throw error;
  }

  // ─── Versions ──────────────────────────────────────────────────────────────

  /**
   * Saves a new DeckVersion inside an existing DeckFamily.
   * Use this when the user forks/creates a new variant of an existing deck.
   */
  async saveNewVersion(
    familyId: string,
    cards: DeckCard[],
    versionName: string,
    options: { notes?: string; archetype?: string; thumbnailCardId?: string } = {}
  ): Promise<DeckVersion> {
    // Build insert payload and ensure archetype is never null: default to 'no-family'
    const payload: any = {
      family_id: familyId,
      version_name: versionName,
      card_list: cards
    };
    if (options.notes !== undefined) payload.notes = options.notes;
    // If archetype is explicitly provided use it; otherwise default to 'no-family'
    payload.archetype = options.archetype !== undefined && options.archetype !== null
      ? options.archetype
      : 'no-family';
    // Support thumbnail card id persistence in DB
    if ((options as any).thumbnailCardId !== undefined) {
      payload.thumbnail_card_id = (options as any).thumbnailCardId;
    }

    const { data, error } = await this.supabase
      .from('decks')
      .insert([payload])
      .select()
      .single();
    

    if (error) throw error;

    // Normalize and return the inserted version
    const result = data as DeckVersion & { archetype?: string | null; thumbnail_card_id?: string | null };
    // Ensure archetype is not null
    if (!Object.prototype.hasOwnProperty.call(result, 'archetype') || result.archetype === null) {
      (result as any).archetype = 'no-family';
    }
    // Normalize DB null to undefined for thumbnail
    if (!Object.prototype.hasOwnProperty.call(result, 'thumbnail_card_id') || (result as any).thumbnail_card_id === null) {
      (result as any).thumbnail_card_id = undefined;
    }
    return result as DeckVersion;
  }

  /**
   * Fetch all DeckVersions for a given DeckFamily.
   */
  async getVersionsByFamily(familyId: string): Promise<DeckVersion[]> {
    const { data, error } = await this.supabase
      .from('decks')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DeckVersion[];
  }

  /**
   * Update the card list and/or notes of an existing DeckVersion.
   */
  async updateVersion(
    versionId: string,
    changes: { card_list?: DeckCard[]; version_name?: string; notes?: string; stats?: Record<string, unknown>; thumbnailCardId?: string }
  ): Promise<DeckVersion> {
    // Map JS-friendly change keys to DB column names (thumbnailCardId -> thumbnail_card_id)
    const payload: any = { ...changes };
    if ((changes as any).thumbnailCardId !== undefined) {
      payload.thumbnail_card_id = (changes as any).thumbnailCardId;
      delete payload.thumbnailCardId;
    }

    const { data, error } = await this.supabase
      .from('decks')
      .update(payload)
      .eq('id', versionId)
      .select()
      .single();

    if (error) throw error;
    const result = data as DeckVersion & { thumbnail_card_id?: string | null };
    if (!Object.prototype.hasOwnProperty.call(result, 'thumbnail_card_id') || result.thumbnail_card_id === null) {
      (result as any).thumbnail_card_id = undefined;
    }
    return result as DeckVersion;
  }

  /**
   * Delete a single DeckVersion.
   */
  async deleteVersion(versionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('decks')
      .delete()
      .eq('id', versionId);

    if (error) throw error;
  }
}
