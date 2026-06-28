import type { AdminProduct, CategoryKey, ProductStatus } from "@/types/catalog";

export const categoryLabels: Record<CategoryKey, string> = {
  smartphones: "Смартфоны",
  tablets: "Планшеты",
  laptops: "Ноутбуки",
  smartwatches: "Смарт-часы",
  headphones: "Наушники",
  speakers: "Колонки",
  accessories: "Аксессуары",
  other: "Прочее"
};

export const statusLabels: Record<ProductStatus, string> = {
  available: "В наличии",
  pricePending: "Цена уточняется"
};

export function formatAdminPrice(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Цена уточняется";
  }

  return `${new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(value)} ₸`;
}

export function getLatestUpdate(products: AdminProduct[]) {
  return products
    .map((product) => product.updatedAt)
    .sort((left, right) => right.localeCompare(left))[0] ?? "Нет данных";
}
