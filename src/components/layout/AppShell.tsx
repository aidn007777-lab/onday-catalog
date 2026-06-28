"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogTable } from "@/components/catalog/CatalogTable";
import { ProductCards } from "@/components/catalog/ProductCards";
import { ProductDetails } from "@/components/catalog/ProductDetails";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { demoProducts, demoWarehouses } from "@/data/demoCatalog";
import { getTranslation } from "@/lib/i18n/translations";
import type { CategoryKey, Locale, Product, ThemeMode, ViewMode } from "@/types/catalog";
import { getWarehouseLabel } from "@/components/catalog/catalogUtils";

export function AppShell() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryKey | "all">("all");
  const [brand, setBrand] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [priceStatus, setPriceStatus] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState(demoProducts[0].id);
  const [repeatWarningProductId, setRepeatWarningProductId] = useState<string | null>(null);

  const t = getTranslation(locale);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return demoProducts.filter((product) => {
      const warehouseLabel = getWarehouseLabel(product.warehouseId, demoWarehouses, locale);
      const haystack = [
        product.brand,
        product.model,
        product.memory,
        product.sim,
        product.eac,
        product.colorRu,
        product.colorKz,
        warehouseLabel
      ]
        .join(" ")
        .toLowerCase();

      return (
        (category === "all" || product.category === category) &&
        (brand === "all" || product.brand === brand) &&
        (warehouse === "all" || product.warehouseId === warehouse) &&
        (priceStatus === "all" || product.status === priceStatus) &&
        (normalizedSearch.length === 0 || haystack.includes(normalizedSearch))
      );
    });
  }, [brand, category, locale, priceStatus, search, warehouse]);

  const selectedProduct =
    filteredProducts.find((product) => product.id === selectedProductId) ??
    demoProducts.find((product) => product.id === selectedProductId) ??
    demoProducts[0];

  const sidebarItems = [
    { label: t.catalog, href: "/" },
    { label: t.admin, href: "/admin" },
    { label: t.orders, href: "#" },
    { label: t.imports, href: "#" },
    { label: t.suppliers, href: "#" },
    { label: t.settings, href: "#" }
  ];

  const logoSrc = theme === "dark" ? "/brand/onday-logo-white.png" : "/brand/onday-logo-black.png";

  function handleSelect(product: Product) {
    setSelectedProductId(product.id);
    setRepeatWarningProductId(null);
  }

  function handleOrderClick() {
    if (selectedProduct.hasActiveOrder) {
      setRepeatWarningProductId(selectedProduct.id);
    }
  }

  return (
    <main className={`app-shell theme-${theme}`}>
      <aside className="sidebar">
        <div className="brand-wrap">
          <Image
            className="brand-logo"
            src={logoSrc}
            alt="ONDAY Store"
            width={320}
            height={91}
            priority
          />
        </div>

        <nav className="sidebar-nav" aria-label="Navigation">
          {sidebarItems.map((item, index) => (
            <Link className={`nav-item ${index === 0 ? "is-active" : ""}`} href={item.href} key={item.label}>
              <span>{item.label}</span>
              {index === 0 ? <span className="nav-mark" aria-hidden="true" /> : null}
            </Link>
          ))}
        </nav>

        <div className="sidebar-meta">
          <p className="meta-label">{t.publicWarehouse}</p>
          <p className="meta-value">Тараз / Алматы</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <label className="search-field">
            <span className="search-mark" aria-hidden="true" />
            <input
              value={search}
              placeholder={t.searchPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="topbar-actions">
            <LanguageToggle locale={locale} onChange={setLocale} />
            <ThemeToggle theme={theme} label={theme === "dark" ? t.lightTheme : t.darkTheme} onChange={setTheme} />
          </div>
        </header>

        <div className="content">
          <CatalogFilters
            t={t}
            locale={locale}
            products={demoProducts}
            warehouses={demoWarehouses}
            category={category}
            brand={brand}
            warehouse={warehouse}
            priceStatus={priceStatus}
            onCategoryChange={setCategory}
            onBrandChange={setBrand}
            onWarehouseChange={setWarehouse}
            onPriceStatusChange={setPriceStatus}
          />

          <div className="catalog-layout">
            <section className="catalog-main">
              <div className="surface">
                <div className="panel-header">
                  <div>
                    <h1 className="panel-title">{t.catalog}</h1>
                    <p className="panel-subtitle">
                      {filteredProducts.length} · {t.publicWarehouse}: Тараз / Алматы
                    </p>
                  </div>

                  <SegmentedControl
                    ariaLabel={t.view}
                    value={viewMode}
                    options={[
                      { value: "table", label: t.table },
                      { value: "cards", label: t.cards }
                    ]}
                    onChange={setViewMode}
                  />
                </div>
              </div>

              {viewMode === "table" ? (
                <>
                  <CatalogTable
                    t={t}
                    locale={locale}
                    products={filteredProducts}
                    warehouses={demoWarehouses}
                    selectedProductId={selectedProduct.id}
                    onSelect={handleSelect}
                  />
                  <div className="table-mobile-fallback">
                    <ProductCards
                      t={t}
                      locale={locale}
                      products={filteredProducts}
                      warehouses={demoWarehouses}
                      selectedProductId={selectedProduct.id}
                      onSelect={handleSelect}
                    />
                  </div>
                </>
              ) : (
                <ProductCards
                  t={t}
                  locale={locale}
                  products={filteredProducts}
                  warehouses={demoWarehouses}
                  selectedProductId={selectedProduct.id}
                  onSelect={handleSelect}
                />
              )}
            </section>

            <ProductDetails
              t={t}
              locale={locale}
              product={selectedProduct}
              warehouses={demoWarehouses}
              showRepeatWarning={repeatWarningProductId === selectedProduct.id}
              onOrderClick={handleOrderClick}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
