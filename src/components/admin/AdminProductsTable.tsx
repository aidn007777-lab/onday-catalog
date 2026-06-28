import type { AdminProduct } from "@/types/catalog";
import { categoryLabels, formatAdminPrice, statusLabels } from "./adminUtils";

interface AdminProductsTableProps {
  products: AdminProduct[];
}

export function AdminProductsTable({ products }: AdminProductsTableProps) {
  return (
    <section className="surface admin-table-surface">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Таблица товаров</h2>
          <p className="panel-subtitle">Данные загружены из локального demoCatalog.ts</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Категория</th>
              <th>Бренд</th>
              <th>Модель</th>
              <th>Память</th>
              <th>Цвет</th>
              <th>SIM/EAC</th>
              <th>Поставщик</th>
              <th>Приходная цена</th>
              <th>Цена наличными</th>
              <th>Статус</th>
              <th>Дата обновления</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{categoryLabels[product.category]}</td>
                <td>{product.brand}</td>
                <td>{product.model}</td>
                <td>{product.memory}</td>
                <td>{product.colorRu}</td>
                <td>
                  {product.sim} / {product.eac}
                </td>
                <td>{product.supplierName}</td>
                <td>{formatAdminPrice(product.purchasePrice)}</td>
                <td>{formatAdminPrice(product.cashPrice)}</td>
                <td>
                  <span className={`admin-status ${product.status === "available" ? "is-ok" : "is-warning"}`}>
                    {statusLabels[product.status]}
                  </span>
                </td>
                <td>{product.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
