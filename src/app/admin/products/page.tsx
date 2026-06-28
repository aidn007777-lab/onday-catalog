import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { AdminShell } from "@/components/admin/AdminShell";
import { demoAdminProducts } from "@/data/demoCatalog";

export default function AdminProductsPage() {
  return (
    <AdminShell activeHref="/admin/products" title="Товары" subtitle="Административная таблица товаров из demoCatalog.ts">
      <AdminProductsTable products={demoAdminProducts} />
    </AdminShell>
  );
}
