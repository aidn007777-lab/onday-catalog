import type { AdminProduct, DemoSupplier, Product, Warehouse } from "@/types/catalog";

export const demoWarehouses: Warehouse[] = [
  {
    id: "taraz-1",
    nameRu: "Тараз — склад 1",
    nameKz: "Тараз — қойма 1",
    deliveryRu: "Тараз: от 5 минут до 1 часа",
    deliveryKz: "Тараз: 5 минуттан 1 сағатқа дейін"
  },
  {
    id: "almaty-1",
    nameRu: "Алматы — склад 1",
    nameKz: "Алматы — қойма 1",
    deliveryRu: "Алматы: в течение суток",
    deliveryKz: "Алматы: бір тәулік ішінде"
  }
];

export const demoProducts: Product[] = [
  {
    id: "apple-iphone-15-128-black",
    category: "smartphones",
    brand: "Apple",
    model: "iPhone 15",
    memory: "128 GB",
    sim: "1 SIM + eSIM",
    eac: "да",
    colorRu: "Black",
    colorKz: "Қара",
    warehouseId: "taraz-1",
    cashPrice: 389000,
    bankPrices: {
      kaspi24: 460965,
      home24: 474580,
      halyk24: 497920
    },
    updatedAt: "2026-06-12 18:30",
    status: "available",
    hasActiveOrder: true
  },
  {
    id: "samsung-s24-256-gray",
    category: "smartphones",
    brand: "Samsung",
    model: "Galaxy S24",
    memory: "256 GB",
    sim: "2 SIM",
    eac: "да",
    colorRu: "Gray",
    colorKz: "Сұр",
    warehouseId: "almaty-1",
    cashPrice: 429000,
    bankPrices: {
      kaspi24: 508365,
      home24: 523380,
      halyk24: 549120
    },
    updatedAt: "2026-06-12 17:10",
    status: "available",
    hasActiveOrder: false
  },
  {
    id: "xiaomi-14t-512-blue",
    category: "smartphones",
    brand: "Xiaomi",
    model: "14T Pro",
    memory: "512 GB",
    sim: "2 SIM",
    eac: "не определено",
    colorRu: "Blue",
    colorKz: "Көк",
    warehouseId: "taraz-1",
    cashPrice: 319000,
    bankPrices: {
      kaspi24: 378015,
      home24: 389180,
      halyk24: 408320
    },
    updatedAt: "2026-06-12 15:42",
    status: "available",
    hasActiveOrder: false
  },
  {
    id: "poco-x6-256-white",
    category: "smartphones",
    brand: "Poco",
    model: "X6 Pro",
    memory: "256 GB",
    sim: "2 SIM",
    eac: "нет",
    colorRu: "White",
    colorKz: "Ақ",
    warehouseId: "almaty-1",
    cashPrice: null,
    bankPrices: {},
    updatedAt: "2026-06-12 12:05",
    status: "pricePending",
    hasActiveOrder: false
  },
  {
    id: "realme-12-128-green",
    category: "smartphones",
    brand: "Realme",
    model: "12 Pro",
    memory: "128 GB",
    sim: "1 SIM + eSIM",
    eac: "да",
    colorRu: "Green",
    colorKz: "Жасыл",
    warehouseId: "taraz-1",
    cashPrice: 199000,
    bankPrices: {
      kaspi24: 235815,
      home24: 242780,
      halyk24: 254720
    },
    updatedAt: "2026-06-11 19:25",
    status: "available",
    hasActiveOrder: false
  }
];

export const demoSuppliers: DemoSupplier[] = [
  {
    id: "darkhan",
    name: "Дархан",
    publicWarehouse: "Тараз — склад 1",
    priority: 1,
    status: "active"
  },
  {
    id: "talisman",
    name: "Талисман",
    publicWarehouse: "Тараз — склад 1",
    priority: 2,
    status: "active"
  },
  {
    id: "mobilagid",
    name: "Mobilagid",
    publicWarehouse: "Алматы — склад 1",
    priority: 3,
    status: "active"
  },
  {
    id: "almaty",
    name: "Алматы",
    publicWarehouse: "Алматы — склад 1",
    priority: 4,
    status: "planned"
  }
];

const demoAdminProductMeta: Record<string, Pick<AdminProduct, "supplierName" | "purchasePrice">> = {
  "apple-iphone-15-128-black": {
    supplierName: "Дархан",
    purchasePrice: 351000
  },
  "samsung-s24-256-gray": {
    supplierName: "Талисман",
    purchasePrice: 388000
  },
  "xiaomi-14t-512-blue": {
    supplierName: "Дархан",
    purchasePrice: 286000
  },
  "poco-x6-256-white": {
    supplierName: "Mobilagid",
    purchasePrice: 164000
  },
  "realme-12-128-green": {
    supplierName: "Алматы",
    purchasePrice: 176000
  }
};

export const demoAdminProducts: AdminProduct[] = demoProducts.map((product) => ({
  ...product,
  salePrice: product.cashPrice,
  ...demoAdminProductMeta[product.id]
}));
