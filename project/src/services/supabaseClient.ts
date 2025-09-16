import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  try {
    if (!client && supabaseUrl && supabaseAnonKey) {
      client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
      try { console.debug('[Supabase] Configurado. URL=', supabaseUrl, 'Anon presente=', !!supabaseAnonKey); } catch {}
    } else if (!client) {
      try { console.warn('[Supabase] Variáveis ausentes. URL presente=', !!supabaseUrl, 'Anon presente=', !!supabaseAnonKey); } catch {}
    }
  } catch {}
  return client;
};

export const hasSupabaseConfig = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};


