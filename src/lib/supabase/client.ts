"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseConfigError() {
  const missingVariables = [
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "" : "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ].filter(Boolean);

  if (missingVariables.length === 0) {
    return "";
  }

  return `Supabase не настроен. Заполните ${missingVariables.join(" и ")} в .env.local.`;
}

export function getSupabaseBrowserClient() {
  const configError = getSupabaseConfigError();

  if (configError) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
  }

  return browserClient;
}
