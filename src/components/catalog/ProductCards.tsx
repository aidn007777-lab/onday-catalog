import { Badge } from "@/components/ui/Badge";
import type { Locale, Product, Warehouse } from "@/types/catalog";
import type { Translation } from "@/lib/i18n/translations";
import { formatPrice, getWarehouseLabel } from "./catalogUtils";

interface ProductCardsProps {
  t: Translation;
  locale: Locale;
  products: Product[];
  warehouses: Warehouse[];
  selectedProductId: string;
  onSelect: (product: Product) => void;
}

export function ProductCards({ t, locale, products, warehouses, selectedProductId, onSelect }: ProductCardsProps) {
  if (products.length === 0) {
    return (
      <div className="surface">
        <div className="panel-header">
          <p className="panel-title">{t.noResults}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface">
      <div className="cards-grid">
        {products.map((product) => (
          <button
            className={`product-card ${product.id === selectedProductId ? "is-selected" : ""}`}
            key={product.id}
            type="button"
            onClick={() => onSelect(product)}
          >
            <span className="product-visual" aria-hidden="true">
              <span className="phone-shape" />
            </span>

            <span className="product-name">
              <strong>
                {product.brand} {product.model}
              </strong>
              <span>{t.categories[product.category]}</span>
            </span>

            <span className="badge-row">
              <Badge tone="lime">{product.memory}</Badge>
              <Badge>{locale === "ru" ? product.colorRu : product.colorKz}</Badge>
            </span>

            <span className="muted">{getWarehouseLabel(product.warehouseId, warehouses, locale)}</span>

            <span className={`price ${product.cashPrice === null ? "is-pending" : ""}`}>
              {formatPrice(product.cashPrice, t)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
