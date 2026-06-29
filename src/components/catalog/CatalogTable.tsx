import { Badge } from "@/components/ui/Badge";
import { getProductSimEac } from "@/features/catalog/demoCatalogStore";
import type { Locale, Product, Warehouse } from "@/types/catalog";
import type { Translation } from "@/lib/i18n/translations";
import { formatPrice, getWarehouseLabel } from "./catalogUtils";

interface CatalogTableProps {
  t: Translation;
  locale: Locale;
  products: Product[];
  warehouses: Warehouse[];
  selectedProductId: string;
  onSelect: (product: Product) => void;
}

export function CatalogTable({ t, locale, products, warehouses, selectedProductId, onSelect }: CatalogTableProps) {
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
    <div className="surface catalog-table-wrapper">
      <table className="catalog-table">
        <thead>
          <tr>
            <th>{t.product}</th>
            <th>{t.memory}</th>
            <th>{t.simEac}</th>
            <th>{t.color}</th>
            <th>{t.publicWarehouse}</th>
            <th>{t.stock}</th>
            <th>{t.cashPrice}</th>
            <th>{t.updatedAt}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr className={product.id === selectedProductId ? "is-selected" : ""} key={product.id}>
              <td>
                <button type="button" onClick={() => onSelect(product)}>
                  <span className="product-name">
                    <strong>
                      {product.brand} {product.model}
                    </strong>
                    <span>{t.categories[product.category]}</span>
                  </span>
                </button>
              </td>
              <td>{product.memory}</td>
              <td>
                <div className="badge-row">
                  <Badge>{getProductSimEac(product)}</Badge>
                </div>
              </td>
              <td>{locale === "ru" ? product.colorRu : product.colorKz}</td>
              <td>{getWarehouseLabel(product.warehouseId, warehouses, locale)}</td>
              <td>{getStatusLabel(product.status, t)}</td>
              <td>
                <span className={`price ${product.cashPrice === null ? "is-pending" : ""}`}>
                  {formatPrice(product.cashPrice, t)}
                </span>
              </td>
              <td className="muted">{product.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStatusLabel(status: Product["status"], t: Translation) {
  if (status === "available") {
    return t.stock;
  }

  if (status === "outOfStock") {
    return t.notAvailable;
  }

  return t.pricePending;
}
