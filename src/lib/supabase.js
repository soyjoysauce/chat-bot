import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Copy .env.example to .env.local and fill in your project credentials.\n' +
    'Find them at: https://app.supabase.com → Project Settings → API'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
