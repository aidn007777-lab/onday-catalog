import type { Locale, Warehouse } from "@/types/catalog";
import type { Translation } from "@/lib/i18n/translations";

export function formatPrice(value: number | null | undefined, t: Translation) {
  if (value === null || value === undefined) {
    return t.pricePending;
  }

  return new Intl.NumberFormat("ru-KZ", {
    maximumFractionDigits: 0
  }).format(value) + " ₸";
}

export function getWarehouseLabel(warehouseId: string, warehouses: Warehouse[], locale: Locale) {
  const warehouse = warehouses.find((item) => item.id === warehouseId);

  if (!warehouse) {
    return warehouseId;
  }

  return locale === "ru" ? warehouse.nameRu : warehouse.nameKz;
}
