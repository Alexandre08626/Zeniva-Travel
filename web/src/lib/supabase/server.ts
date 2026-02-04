import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseEnv = {
  url: string;
  anonKey: string;
  serviceKey: string | null;
};

function keyPrefix(value: string) {
  if (!value) return "";
  const idx = value.indexOf("_");
  return idx > 0 ? value.slice(0, idx + 1) : value.slice(0, 12);
}

function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  try {
    const withScheme = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const normalized = new URL(withScheme);
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

function getSupabaseEnv(): SupabaseEnv {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
  if (!url || !anonKey) {
    const message = "Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)";
    console.error(message);
    throw new Error(message);
  }
  if (anonKey && !anonKey.startsWith("sb_publishable_")) {
    console.warn("Supabase anon key prefix mismatch", { prefix: keyPrefix(anonKey), length: anonKey.length });
  }
  if (serviceKey && !serviceKey.startsWith("sb_secret_")) {
    console.warn("Supabase service key prefix mismatch", { prefix: keyPrefix(serviceKey), length: serviceKey.length });
  }
  return { url, anonKey, serviceKey };
}

export function getSupabaseServerClient(): { client: SupabaseClient } {
  const { url, serviceKey } = getSupabaseEnv();
  if (!serviceKey) {
    const message = "Missing Supabase env (SUPABASE_SERVICE_ROLE_KEY)";
    console.error(message);
    throw new Error(message);
  }
  return {
    client: createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
  };
}

export function getSupabaseAnonClient(): { client: SupabaseClient } {
  const { url, anonKey } = getSupabaseEnv();
  return {
    client: createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
  };
}

export function getSupabaseAdminClient(): { client: SupabaseClient } {
  const { url, serviceKey } = getSupabaseEnv();
  if (!serviceKey) {
    const message = "Missing Supabase env (SUPABASE_SERVICE_ROLE_KEY)";
    console.error(message);
    throw new Error(message);
  }
  return {
    client: createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
  };
}
