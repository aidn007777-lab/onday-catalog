"use client";

import { useCallback, useEffect, useState } from "react";
import { demoSuppliers } from "@/data/demoCatalog";
import { getSupabaseBrowserClient, getSupabaseConfigError } from "@/lib/supabase/client";
import type { AdminProduct, CategoryKey, Product, ProductStatus } from "@/types/catalog";
import type { ParsedPriceLine } from "@/components/admin/demoWhatsappParser";

const CATALOG_UPDATED_EVENT = "onday-supabase-catalog-updated";

const productsSelect =
  "id,supplier,category,brand,model,memory,color,simType,purchasePrice,status,createdAt,updatedAt";
const publicProductsSelect = "id,category,brand,model,memory,color,simType,warehouseId,status,createdAt,updatedAt";

const categoryByLabel: Record<string, CategoryKey> = {
  Смартфоны: "smartphones",
  Планшеты: "tablets",
  Ноутбуки: "laptops",
  "Смарт-часы": "smartwatches",
  Наушники: "headphones",
  Колонки: "speakers",
  Аксессуары: "accessories",
  Прочее: "other"
};

const categoryKeys = new Set<CategoryKey>([
  "smartphones",
  "tablets",
  "laptops",
  "smartwatches",
  "headphones",
  "speakers",
  "accessories",
  "other"
]);

const supplierPriorityOrder = ["Дархан", "Талисман", "Mobilagid", "Алматы"];

const colorKzByRu: Record<string, string> = {
  black: "Қара",
  white: "Ақ",
  gray: "Сұр",
  grey: "Сұр",
  silver: "Күміс",
  blue: "Көк",
  green: "Жасыл",
  gold: "Алтын",
  red: "Қызыл",
  pink: "Қызғылт",
  purple: "Күлгін",
  orange: "Қызғылт сары",
  yellow: "Сары",
  natural: "Natural",
  titanium: "Titanium"
};

export interface CatalogUpsertResult {
  added: number;
  updated: number;
  skipped: number;
  total: number;
}

interface CatalogQueryState<TProduct> {
  error: string;
  loading: boolean;
  products: TProduct[];
}

interface SupabaseProductRow {
  id: string;
  supplier: string;
  category: string;
  brand: string;
  model: string;
  memory: string;
  color: string;
  simType: string;
  purchasePrice: number | string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SupabasePublicProductRow {
  id: string;
  category: string;
  brand: string;
  model: string;
  memory: string;
  color: string;
  simType: string;
  warehouseId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useSupabaseAdminProducts() {
  const [state, setState] = useState<CatalogQueryState<AdminProduct>>({
    error: "",
    loading: true,
    products: []
  });

  const refresh = useCallback(async () => {
    const configError = getSupabaseConfigError();

    if (configError) {
      setState({ error: configError, loading: false, products: [] });
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setState({ error: "Supabase client не создан.", loading: false, products: [] });
      return;
    }

    setState((current) => ({ ...current, error: "", loading: true }));

    const { data, error } = await supabase.from("products").select(productsSelect);

    if (error) {
      setState({ error: `Не удалось загрузить товары из Supabase: ${error.message}`, loading: false, products: [] });
      return;
    }

    setState({
      error: "",
      loading: false,
      products: sortAdminProducts((data ?? []).map(mapSupabaseProductToAdminProduct))
    });
  }, []);

  useCatalogRefresh(refresh);

  return {
    ...state,
    refresh
  };
}

export function useSupabasePublicProducts() {
  const [state, setState] = useState<CatalogQueryState<Product>>({
    error: "",
    loading: true,
    products: []
  });

  const refresh = useCallback(async () => {
    const configError = getSupabaseConfigError();

    if (configError) {
      setState({ error: configError, loading: false, products: [] });
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setState({ error: "Supabase client не создан.", loading: false, products: [] });
      return;
    }

    setState((current) => ({ ...current, error: "", loading: true }));

    const { data, error } = await supabase.from("public_catalog_products").select(publicProductsSelect);

    if (error) {
      setState({ error: `Не удалось загрузить витрину из Supabase: ${error.message}`, loading: false, products: [] });
      return;
    }

    setState({
      error: "",
      loading: false,
      products: (data ?? []).map(mapSupabasePublicProductToProduct)
    });
  }, []);

  useCatalogRefresh(refresh);

  return {
    ...state,
    refresh
  };
}

export async function upsertParsedCatalogRows(
  rows: ParsedPriceLine[],
  supplierName: string
): Promise<CatalogUpsertResult> {
  const configError = getSupabaseConfigError();

  if (configError) {
    throw new Error(configError);
  }

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase client не создан.");
  }

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const row of rows) {
    if (row.status === "Ошибка") {
      skipped += 1;
      continue;
    }

    const product = createSupabaseProductPayload(row, supplierName, now);
    const { data: existingProduct, error: selectError } = await supabase
      .from("products")
      .select("id")
      .eq("supplier", product.supplier)
      .eq("model", product.model)
      .eq("memory", product.memory)
      .eq("color", product.color)
      .eq("simType", product.simType)
      .maybeSingle();

    if (selectError) {
      throw new Error(`Не удалось проверить дубль в Supabase: ${selectError.message}`);
    }

    if (existingProduct?.id) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          category: product.category,
          brand: product.brand,
          purchasePrice: product.purchasePrice,
          status: product.status,
          updatedAt: now
        })
        .eq("id", existingProduct.id);

      if (updateError) {
        throw new Error(`Не удалось обновить товар в Supabase: ${updateError.message}`);
      }

      updated += 1;
    } else {
      const { error: insertError } = await supabase.from("products").insert(product);

      if (insertError) {
        throw new Error(`Не удалось добавить товар в Supabase: ${insertError.message}`);
      }

      added += 1;
    }
  }

  dispatchCatalogUpdated();

  return {
    added,
    updated,
    skipped,
    total: rows.length
  };
}

export function sortAdminProducts(products: AdminProduct[]) {
  return [...products].sort((left, right) => {
    const priorityDiff = getSupplierPriority(left.supplierName) - getSupplierPriority(right.supplierName);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return [left.brand, left.model, left.memory, left.colorRu]
      .join(" ")
      .localeCompare([right.brand, right.model, right.memory, right.colorRu].join(" "), "ru");
  });
}

export function getSupplierPriority(supplierName: string) {
  const index = supplierPriorityOrder.findIndex((item) => normalizeValue(item) === normalizeValue(supplierName));

  return index >= 0 ? index + 1 : supplierPriorityOrder.length + 1;
}

export function getProductSimEac(product: Pick<Product, "sim" | "eac" | "simEac">) {
  return product.simEac?.trim() || `${product.sim} / ${product.eac}`;
}

function useCatalogRefresh(refresh: () => Promise<void>) {
  useEffect(() => {
    void refresh();

    const handleCatalogUpdated = () => {
      void refresh();
    };

    window.addEventListener(CATALOG_UPDATED_EVENT, handleCatalogUpdated);

    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, handleCatalogUpdated);
  }, [refresh]);
}

function createSupabaseProductPayload(row: ParsedPriceLine, supplierName: string, updatedAt: string) {
  const simType = normalizeSimEac(row.simEac);

  return {
    supplier: supplierName,
    category: categoryByLabel[row.category] ?? "other",
    brand: row.brand,
    model: row.model,
    memory: row.memory,
    color: row.color,
    simType,
    purchasePrice: row.price,
    status: row.price === null ? "pricePending" : "available",
    updatedAt
  };
}

function mapSupabaseProductToAdminProduct(row: SupabaseProductRow): AdminProduct {
  const simParts = splitSimEac(row.simType);

  return {
    id: row.id,
    category: normalizeCategory(row.category),
    brand: row.brand,
    model: row.model,
    memory: row.memory,
    sim: simParts.sim,
    simEac: row.simType,
    eac: simParts.eac,
    colorRu: row.color,
    colorKz: colorKzByRu[row.color.toLowerCase()] ?? row.color,
    warehouseId: getWarehouseIdBySupplier(row.supplier),
    cashPrice: null,
    bankPrices: {},
    updatedAt: formatTimestamp(row.updatedAt),
    status: normalizeStatus(row.status),
    hasActiveOrder: false,
    supplierName: row.supplier,
    purchasePrice: normalizePrice(row.purchasePrice)
  };
}

function mapSupabasePublicProductToProduct(row: SupabasePublicProductRow): Product {
  const simParts = splitSimEac(row.simType);

  return {
    id: row.id,
    category: normalizeCategory(row.category),
    brand: row.brand,
    model: row.model,
    memory: row.memory,
    sim: simParts.sim,
    simEac: row.simType,
    eac: simParts.eac,
    colorRu: row.color,
    colorKz: colorKzByRu[row.color.toLowerCase()] ?? row.color,
    warehouseId: row.warehouseId,
    cashPrice: null,
    bankPrices: {},
    updatedAt: formatTimestamp(row.updatedAt),
    status: normalizeStatus(row.status),
    hasActiveOrder: false
  };
}

function splitSimEac(value: string): Pick<Product, "sim" | "eac"> {
  const hasEac = /\b(?:eac|kct)\b/i.test(value);
  const sim = value
    .replace(/\beac\s*\/\s*kct\b/gi, "")
    .replace(/\beac\b/gi, "")
    .replace(/\bkct\b/gi, "")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/^\/|\/$/g, "")
    .trim();

  return {
    sim: sim || "Уточните у администратора",
    eac: hasEac ? "да" : "не определено"
  };
}

function normalizeSimEac(value: string) {
  const normalized = value.trim();

  return normalized && normalized !== "—" ? normalized : "Уточните у администратора";
}

function normalizeCategory(value: string): CategoryKey {
  return categoryKeys.has(value as CategoryKey) ? (value as CategoryKey) : "other";
}

function normalizeStatus(value: string): ProductStatus {
  if (value === "available" || value === "outOfStock" || value === "pricePending") {
    return value;
  }

  return "available";
}

function normalizePrice(value: number | string | null) {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function getWarehouseIdBySupplier(supplierName: string) {
  const supplier = demoSuppliers.find((item) => normalizeValue(item.name) === normalizeValue(supplierName));

  return supplier?.publicWarehouse.includes("Алматы") ? "almaty-1" : "taraz-1";
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (part: number) => part.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function dispatchCatalogUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
  }
}

function normalizeValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
