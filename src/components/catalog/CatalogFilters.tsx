import type { CategoryKey, Locale, Product, Warehouse } from "@/types/catalog";
import type { Translation } from "@/lib/i18n/translations";

interface CatalogFiltersProps {
  t: Translation;
  locale: Locale;
  products: Product[];
  warehouses: Warehouse[];
  category: CategoryKey | "all";
  brand: string;
  warehouse: string;
  priceStatus: string;
  onCategoryChange: (value: CategoryKey | "all") => void;
  onBrandChange: (value: string) => void;
  onWarehouseChange: (value: string) => void;
  onPriceStatusChange: (value: string) => void;
}

const categoryKeys: CategoryKey[] = [
  "smartphones",
  "tablets",
  "laptops",
  "smartwatches",
  "headphones",
  "speakers",
  "accessories",
  "other"
];

export function CatalogFilters({
  t,
  locale,
  products,
  warehouses,
  category,
  brand,
  warehouse,
  priceStatus,
  onCategoryChange,
  onBrandChange,
  onWarehouseChange,
  onPriceStatusChange
}: CatalogFiltersProps) {
  const brands = Array.from(new Set(products.map((product) => product.brand))).sort();

  return (
    <section className="surface" aria-label={t.filters}>
      <div className="filters">
        <div className="field">
          <label htmlFor="category-filter">{t.category}</label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as CategoryKey | "all")}
          >
            <option value="all">{t.all}</option>
            {categoryKeys.map((key) => (
              <option key={key} value={key}>
                {t.categories[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="brand-filter">{t.brand}</label>
          <select id="brand-filter" value={brand} onChange={(event) => onBrandChange(event.target.value)}>
            <option value="all">{t.all}</option>
            {brands.map((brandName) => (
              <option key={brandName} value={brandName}>
                {brandName}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="warehouse-filter">{t.publicWarehouse}</label>
          <select id="warehouse-filter" value={warehouse} onChange={(event) => onWarehouseChange(event.target.value)}>
            <option value="all">{t.all}</option>
            {warehouses.map((item) => (
              <option key={item.id} value={item.id}>
                {locale === "ru" ? item.nameRu : item.nameKz}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="price-filter">{t.priceStatus}</label>
          <select id="price-filter" value={priceStatus} onChange={(event) => onPriceStatusChange(event.target.value)}>
            <option value="all">{t.all}</option>
            <option value="available">{t.cashPrice}</option>
            <option value="pricePending">{t.pricePending}</option>
          </select>
        </div>
      </div>
    </section>
  );
}
