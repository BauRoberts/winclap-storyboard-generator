// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing Supabase env variables: SUPABASE_URL or SUPABASE_ANON_KEY');
}

export const supabaseServer = createClient(url, key);
