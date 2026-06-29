export type Locale = "ru" | "kz";

export type ThemeMode = "dark" | "light";

export type ViewMode = "table" | "cards";

export type CategoryKey =
  | "smartphones"
  | "tablets"
  | "laptops"
  | "smartwatches"
  | "headphones"
  | "speakers"
  | "accessories"
  | "other";

export type ProductStatus = "available" | "outOfStock" | "pricePending";

export type BankCode = "kaspi24" | "home24" | "halyk24";

export interface Warehouse {
  id: string;
  nameRu: string;
  nameKz: string;
  deliveryRu: string;
  deliveryKz: string;
}

export interface Product {
  id: string;
  category: CategoryKey;
  brand: string;
  model: string;
  memory: string;
  sim: string;
  simEac?: string;
  eac: "да" | "нет" | "не определено";
  colorRu: string;
  colorKz: string;
  warehouseId: string;
  cashPrice: number | null;
  bankPrices: Partial<Record<BankCode, number>>;
  updatedAt: string;
  status: ProductStatus;
  hasActiveOrder: boolean;
}

export interface DemoSupplier {
  id: string;
  name: string;
  publicWarehouse: string;
  priority: number;
  status: "active" | "planned";
}

export interface AdminProduct extends Product {
  supplierName: string;
  purchasePrice: number | null;
}
