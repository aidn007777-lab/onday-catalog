"use client";

import { useEffect, useState } from "react";
import { demoAdminProducts, demoSuppliers } from "@/data/demoCatalog";
import type { AdminProduct, CategoryKey, Product } from "@/types/catalog";
import type { ParsedPriceLine } from "@/components/admin/demoWhatsappParser";

const STORAGE_KEY = "onday-demo-admin-catalog-v1";
const CATALOG_UPDATED_EVENT = "onday-demo-catalog-updated";

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

export function readDemoAdminProducts(): AdminProduct[] {
  if (typeof window === "undefined") {
    return sortAdminProducts(demoAdminProducts);
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    saveDemoAdminProducts(demoAdminProducts);
    return sortAdminProducts(demoAdminProducts);
  }

  try {
    const parsed = JSON.parse(rawValue) as AdminProduct[];
    return sortAdminProducts(parsed);
  } catch {
    saveDemoAdminProducts(demoAdminProducts);
    return sortAdminProducts(demoAdminProducts);
  }
}

export function saveDemoAdminProducts(products: AdminProduct[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortAdminProducts(products)));
  window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
}

export function subscribeDemoCatalog(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener(CATALOG_UPDATED_EVENT, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CATALOG_UPDATED_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useDemoAdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>(() => sortAdminProducts(demoAdminProducts));

  useEffect(() => {
    const updateProducts = () => setProducts(readDemoAdminProducts());

    updateProducts();

    return subscribeDemoCatalog(updateProducts);
  }, []);

  return products;
}

export function upsertParsedCatalogRows(rows: ParsedPriceLine[], supplierName: string): CatalogUpsertResult {
  const currentProducts = readDemoAdminProducts();
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const updatedAt = formatLocalDateTime(new Date());

  for (const row of rows) {
    if (row.status === "Ошибка") {
      skipped += 1;
      continue;
    }

    const nextProduct = createProductFromParsedRow(row, supplierName, updatedAt);
    const existingIndex = currentProducts.findIndex(
      (product) => getAdminProductDuplicateKey(product) === getAdminProductDuplicateKey(nextProduct)
    );

    if (existingIndex >= 0) {
      currentProducts[existingIndex] = {
        ...currentProducts[existingIndex],
        category: nextProduct.category,
        brand: nextProduct.brand,
        model: nextProduct.model,
        memory: nextProduct.memory,
        sim: nextProduct.sim,
        simEac: nextProduct.simEac,
        eac: nextProduct.eac,
        colorRu: nextProduct.colorRu,
        colorKz: nextProduct.colorKz,
        warehouseId: nextProduct.warehouseId,
        purchasePrice: nextProduct.purchasePrice,
        status: nextProduct.status,
        updatedAt: nextProduct.updatedAt
      };
      updated += 1;
    } else {
      currentProducts.push(nextProduct);
      added += 1;
    }
  }

  saveDemoAdminProducts(currentProducts);

  return {
    added,
    updated,
    skipped,
    total: rows.length
  };
}

export function getPublicCatalogProducts(products: AdminProduct[]): Product[] {
  const bestProducts = new Map<string, AdminProduct>();

  for (const product of sortAdminProducts(products)) {
    const publicKey = getPublicProductDuplicateKey(product);
    const current = bestProducts.get(publicKey);

    if (!current || getSupplierPriority(product.supplierName) < getSupplierPriority(current.supplierName)) {
      bestProducts.set(publicKey, product);
    }
  }

  return Array.from(bestProducts.values()).map(stripAdminFields);
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

function createProductFromParsedRow(row: ParsedPriceLine, supplierName: string, updatedAt: string): AdminProduct {
  const simEac = normalizeSimEac(row.simEac);
  const simParts = splitSimEac(simEac);
  const category = categoryByLabel[row.category] ?? "other";
  const colorRu = row.color;
  const productKey = [row.brand, row.model, row.memory, colorRu, simEac, supplierName].join("|");

  return {
    id: `import-${hashString(productKey)}`,
    category,
    brand: row.brand,
    model: row.model,
    memory: row.memory,
    sim: simParts.sim,
    simEac,
    eac: simParts.eac,
    colorRu,
    colorKz: colorKzByRu[colorRu.toLowerCase()] ?? colorRu,
    warehouseId: getWarehouseIdBySupplier(supplierName),
    cashPrice: null,
    bankPrices: {},
    updatedAt,
    status: row.price === null ? "pricePending" : "available",
    hasActiveOrder: false,
    supplierName,
    purchasePrice: row.price
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

function getWarehouseIdBySupplier(supplierName: string) {
  const supplier = demoSuppliers.find((item) => normalizeValue(item.name) === normalizeValue(supplierName));

  return supplier?.publicWarehouse.includes("Алматы") ? "almaty-1" : "taraz-1";
}

function getAdminProductDuplicateKey(product: AdminProduct) {
  return [
    product.brand,
    product.model,
    product.memory,
    product.colorRu,
    getProductSimEac(product),
    product.supplierName
  ]
    .map(normalizeValue)
    .join("|");
}

function getPublicProductDuplicateKey(product: AdminProduct) {
  return [product.brand, product.model, product.memory, product.colorRu, getProductSimEac(product)]
    .map(normalizeValue)
    .join("|");
}

function stripAdminFields(product: AdminProduct): Product {
  return {
    id: product.id,
    category: product.category,
    brand: product.brand,
    model: product.model,
    memory: product.memory,
    sim: product.sim,
    simEac: product.simEac,
    eac: product.eac,
    colorRu: product.colorRu,
    colorKz: product.colorKz,
    warehouseId: product.warehouseId,
    cashPrice: product.cashPrice,
    bankPrices: product.bankPrices,
    updatedAt: product.updatedAt,
    status: product.status,
    hasActiveOrder: product.hasActiveOrder
  };
}

function normalizeValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

function formatLocalDateTime(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}
