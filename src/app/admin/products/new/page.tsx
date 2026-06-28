import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { AdminShell } from "@/components/admin/AdminShell";

export default function NewAdminProductPage() {
  return (
    <AdminShell activeHref="/admin/products/new" title="Добавить товар" subtitle="Демо-форма без сохранения в базу данных">
      <AdminProductForm />
    </AdminShell>
  );
}
