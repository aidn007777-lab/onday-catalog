import { Badge } from "@/components/ui/Badge";
import { getProductSimEac } from "@/features/catalog/supabaseCatalogStore";
import type { Locale, Product, Warehouse } from "@/types/catalog";
import type { Translation } from "@/lib/i18n/translations";
import { formatPrice, getWarehouseLabel } from "./catalogUtils";

interface ProductDetailsProps {
  t: Translation;
  locale: Locale;
  product: Product;
  warehouses: Warehouse[];
  showRepeatWarning: boolean;
  onOrderClick: () => void;
}

export function ProductDetails({
  t,
  locale,
  product,
  warehouses,
  showRepeatWarning,
  onOrderClick
}: ProductDetailsProps) {
  const productColor = locale === "ru" ? product.colorRu : product.colorKz;
  const statusLabel =
    product.status === "available" ? t.stock : product.status === "outOfStock" ? t.notAvailable : t.pricePending;

  return (
    <aside className="surface details-panel" aria-label={t.fullInfo}>
      <div className="details-hero">
        <div className="details-identity">
          <div className="details-visual" aria-hidden="true">
            <span className="phone-shape" />
          </div>
          <div className="details-title">
            <h2>
              {product.brand} {product.model}
            </h2>
            <p>
              {product.memory} · {productColor}
            </p>
          </div>
        </div>

        <div className="badge-row">
          <Badge tone={product.status === "available" ? "lime" : "default"}>{statusLabel}</Badge>
          {product.hasActiveOrder ? <Badge>{t.activeOrder}</Badge> : null}
        </div>
      </div>

      <div className="details-section">
        <p className="section-label">{t.cashPrice}</p>
        <span className={`price ${product.salePrice == null ? "is-pending" : ""}`}>
          {formatPrice(product.salePrice ?? null, t)}
        </span>
      </div>

      <div className="details-section">
        <p className="section-label">{t.bankOffers}</p>
        <div className="bank-list">
          <BankRow label={t.kaspi24} price={product.bankPrices.kaspi24 ?? null} t={t} />
          <BankRow label={t.home24} price={product.bankPrices.home24 ?? null} t={t} />
          <BankRow label={t.halyk24} price={product.bankPrices.halyk24 ?? null} t={t} />
        </div>
      </div>

      <div className="details-section">
        <p className="section-label">{t.fullInfo}</p>
        <div className="detail-list">
          <DetailRow label={t.category} value={t.categories[product.category]} />
          <DetailRow label={t.brand} value={product.brand} />
          <DetailRow label={t.model} value={product.model} />
          <DetailRow label={t.memory} value={product.memory} />
          <DetailRow label={t.simEac} value={getProductSimEac(product)} />
          <DetailRow label={t.eac} value={product.eac} />
          <DetailRow label={t.color} value={productColor} />
          <DetailRow label={t.publicWarehouse} value={getWarehouseLabel(product.warehouseId, warehouses, locale)} />
          <DetailRow label={t.updatedAt} value={product.updatedAt} />
        </div>
      </div>

      <div className="details-section">
        <p className="section-label">{t.delivery}</p>
        <div className="detail-list">
          {warehouses.map((warehouse) => (
            <DetailRow
              key={warehouse.id}
              label={locale === "ru" ? warehouse.nameRu : warehouse.nameKz}
              value={locale === "ru" ? warehouse.deliveryRu : warehouse.deliveryKz}
            />
          ))}
        </div>
      </div>

      <div className="details-section order-actions">
        {product.hasActiveOrder || showRepeatWarning ? (
          <div className="warning-box" role="alert">
            <strong>{t.repeatWarningTitle}</strong>
            <p>{t.repeatWarningText}</p>
          </div>
        ) : null}

        <button className="primary-button" type="button" onClick={onOrderClick}>
          {t.orderSupplier}
        </button>
      </div>
    </aside>
  );
}

function BankRow({ label, price, t }: { label: string; price: number | null; t: Translation }) {
  return (
    <div className="bank-item">
      <span>{label}</span>
      <strong className={`price ${price === null ? "is-pending" : ""}`}>{formatPrice(price, t)}</strong>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

