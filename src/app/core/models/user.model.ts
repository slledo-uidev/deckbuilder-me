/**
 * User Model - Represents a user in the system
 * AppUser wraps Supabase User with app-specific display data
 */
import { User as SupabaseUser } from '@supabase/supabase-js';

export type { SupabaseUser };

/**
 * App-level user representation for UI components.
 * Built from the Supabase User object.
 */
export interface AppUser {
  id: string;           // Supabase UUID
  email: string;        // User email (used as username)
  displayName: string;  // Display name (from user_metadata or email prefix)
}

/**
 * @deprecated Use AppUser instead. Kept for backward compatibility during migration.
 */
export interface User {
  username: string;
  password: string;
  displayName: string;
}
