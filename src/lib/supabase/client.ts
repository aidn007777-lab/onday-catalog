"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export interface SupabaseRuntimeInfo {
  endpoint: string;
  hasAnonKey: boolean;
  hasUrl: boolean;
  keyType: "publishable" | "legacy anon JWT" | "unknown";
  url: string;
}

export function getSupabaseRuntimeInfo(operation = "unknown"): SupabaseRuntimeInfo {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  return {
    endpoint: url ? `${url.replace(/\/$/, "")}/rest/v1` : "не задан",
    hasAnonKey: anonKey.length > 0,
    hasUrl: url.length > 0,
    keyType: detectKeyType(anonKey),
    url: url || `не задано для операции ${operation}`
  };
}

export function getSupabaseConfigError() {
  const info = getSupabaseRuntimeInfo();
  const missingVariables = [
    info.hasUrl ? "" : "NEXT_PUBLIC_SUPABASE_URL",
    info.hasAnonKey ? "" : "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ].filter(Boolean);

  if (missingVariables.length === 0) {
    return "";
  }

  return `Supabase не настроен. Заполните ${missingVariables.join(" и ")} в .env.local.`;
}

export function formatSupabaseDiagnostic(operation: string, message: string, details?: string) {
  const info = getSupabaseRuntimeInfo(operation);
  const envStatus = `env: URL=${info.hasUrl ? "есть" : "нет"}, KEY=${info.hasAnonKey ? "есть" : "нет"} (${info.keyType})`;
  const detailsText = details ? `; details: ${details}` : "";

  return `Supabase ${operation}: ${message}. ${envStatus}; URL=${info.url}; endpoint=${info.endpoint}${detailsText}`;
}

export function getSupabaseBrowserClient() {
  const configError = getSupabaseConfigError();

  if (configError) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(getSupabaseRuntimeInfo().url.replace(/\/$/, ""), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim());
  }

  return browserClient;
}

function detectKeyType(key: string): SupabaseRuntimeInfo["keyType"] {
  if (key.startsWith("sb_publishable_")) {
    return "publishable";
  }

  if (key.startsWith("eyJ")) {
    return "legacy anon JWT";
  }

  return key ? "unknown" : "unknown";
}
