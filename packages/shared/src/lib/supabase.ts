import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Vite environment type declaration
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Create a new Supabase client instance
 */
export function createClient(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// Singleton instance for client-side use
let supabaseInstance: SupabaseClient | null = null

/**
 * Get the singleton Supabase client instance
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    )
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}
