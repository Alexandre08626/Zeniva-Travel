import { createClient } from "@supabase/supabase-js";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !(anonKey || serviceKey)) {
    const message = "Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY)";
    console.error(message);
    throw new Error(message);
  }
  return { url, key: serviceKey || anonKey, usingServiceKey: Boolean(serviceKey) };
}

export function getSupabaseServerClient() {
  const { url, key, usingServiceKey } = getSupabaseEnv();
  return {
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
    usingServiceKey,
  };
}
