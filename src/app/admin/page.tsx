import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      activeHref="/admin"
      title="Главная панель"
      subtitle="Быстрый обзор демо-каталога без подключения Supabase"
    >
      <AdminDashboard />
    </AdminShell>
  );
}
