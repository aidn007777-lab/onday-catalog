import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminProductsPage() {
  return (
    <AdminShell activeHref="/admin/products" title="Товары" subtitle="Административная таблица локального демо-каталога">
      <AdminProductsTable />
    </AdminShell>
  );
}
