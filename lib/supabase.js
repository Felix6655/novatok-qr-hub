import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🚨 Hard fail early if misconfigured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase env vars missing');
}

// ✅ Client-side Supabase (auth, queries)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// ✅ Server-side admin client ONLY (never import in client components)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;
