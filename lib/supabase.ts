import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "[supabase] SUPABASE_URL is not set.\n" +
      "Add it to .env.local — find it in Supabase Dashboard → Project Settings → API → Project URL",
  );
}
if (!supabaseServiceKey) {
  throw new Error(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
      "Add it to .env.local — find it in Supabase Dashboard → Project Settings → API → service_role (secret key).\n" +
      "Do NOT use the anon/public key here.",
  );
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _client;
}

// Convenience export for direct use
export const supabase = getSupabase();
