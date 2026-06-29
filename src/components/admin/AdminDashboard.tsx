"use client";

import Link from "next/link";
import { demoSuppliers } from "@/data/demoCatalog";
import { useSupabaseAdminProducts } from "@/features/catalog/supabaseCatalogStore";
import { getLatestUpdate } from "./adminUtils";

const quickActions = [
  { label: "Добавить товар", href: "/admin/products/new" },
  { label: "Импорт прайса", href: "/admin/import" },
  { label: "Поставщики", href: "/admin/suppliers" }
];

export function AdminDashboard() {
  const { error, loading, products } = useSupabaseAdminProducts();
  const latestUpdate = getLatestUpdate(products);

  return (
    <div className="admin-stack">
      {error ? <div className="admin-notice">{error}</div> : null}

      <section className="admin-metrics">
        <MetricCard label="Товары" value={loading ? "..." : products.length.toString()} note="Supabase products" />
        <MetricCard label="Поставщики" value={demoSuppliers.length.toString()} note="Стартовый список" />
        <MetricCard label="Последнее обновление" value={loading ? "..." : latestUpdate} note="По товарам Supabase" />
      </section>

      <section className="surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Быстрые действия</h2>
            <p className="panel-subtitle">Каталог подключён к таблице products в Supabase</p>
          </div>
        </div>
        <div className="admin-actions">
          {quickActions.map((action) => (
            <Link className="admin-action-button" href={action.href} key={action.href}>
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="surface admin-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

