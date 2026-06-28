import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSuppliersList } from "@/components/admin/AdminSuppliersList";

export default function AdminSuppliersPage() {
  return (
    <AdminShell activeHref="/admin/suppliers" title="Поставщики" subtitle="Список стартовых поставщиков без подключения базы данных">
      <AdminSuppliersList />
    </AdminShell>
  );
}
