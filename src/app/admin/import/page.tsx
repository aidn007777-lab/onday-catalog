import { AdminImportPreview } from "@/components/admin/AdminImportPreview";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminImportPage() {
  return (
    <AdminShell
      activeHref="/admin/import"
      title="Импорт прайса"
      subtitle="Предварительная проверка WhatsApp-прайса в демо-режиме"
    >
      <AdminImportPreview />
    </AdminShell>
  );
}
