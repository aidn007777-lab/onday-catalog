import Link from "next/link";
import { demoAdminProducts, demoSuppliers } from "@/data/demoCatalog";
import { getLatestUpdate } from "./adminUtils";

const quickActions = [
  { label: "Добавить товар", href: "/admin/products/new" },
  { label: "Импорт прайса", href: "/admin/import" },
  { label: "Поставщики", href: "/admin/suppliers" }
];

export function AdminDashboard() {
  const latestUpdate = getLatestUpdate(demoAdminProducts);

  return (
    <div className="admin-stack">
      <section className="admin-metrics">
        <MetricCard label="Товары" value={demoAdminProducts.length.toString()} note="Демо-каталог" />
        <MetricCard label="Поставщики" value={demoSuppliers.length.toString()} note="Стартовый список" />
        <MetricCard label="Последнее обновление" value={latestUpdate} note="По демо-товарам" />
      </section>

      <section className="surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Быстрые действия</h2>
            <p className="panel-subtitle">Интерфейс подготовлен без сохранения в базу данных</p>
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
