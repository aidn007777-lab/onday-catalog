import { demoSuppliers } from "@/data/demoCatalog";

export function AdminSuppliersList() {
  return (
    <section className="surface admin-table-surface">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Поставщики</h2>
          <p className="panel-subtitle">Стартовый список для демо-интерфейса</p>
        </div>
      </div>

      <div className="admin-suppliers-grid">
        {demoSuppliers.map((supplier) => (
          <article className="admin-supplier-card" key={supplier.id}>
            <span>#{supplier.priority}</span>
            <strong>{supplier.name}</strong>
            <p>{supplier.publicWarehouse}</p>
            <em>{supplier.status === "active" ? "Активен" : "Запланирован"}</em>
          </article>
        ))}
      </div>
    </section>
  );
}
