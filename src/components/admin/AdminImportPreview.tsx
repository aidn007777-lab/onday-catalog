"use client";

import { useMemo, useState } from "react";
import { demoSuppliers } from "@/data/demoCatalog";
import { formatAdminPrice } from "./adminUtils";

interface PreviewRow {
  id: string;
  raw: string;
  price: number | null;
  status: string;
}

const samplePriceList = `iPhone 15 128 Black 389000
Samsung S24 256 Gray 429000
Poco X6 Pro 256 White цена уточняется`;

export function AdminImportPreview() {
  const [supplierId, setSupplierId] = useState(demoSuppliers[0].id);
  const [rawText, setRawText] = useState(samplePriceList);
  const [checked, setChecked] = useState(false);

  const previewRows = useMemo<PreviewRow[]>(() => {
    if (!checked) {
      return [];
    }

    return rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const priceMatch = line.match(/(\d[\d\s]{3,})\s*$/);
        const price = priceMatch ? Number(priceMatch[1].replace(/\s/g, "")) : null;

        return {
          id: `${index}-${line}`,
          raw: line,
          price,
          status: price ? "Готово к предварительной проверке" : "Нужна ручная проверка"
        };
      });
  }, [checked, rawText]);

  const selectedSupplier = demoSuppliers.find((supplier) => supplier.id === supplierId) ?? demoSuppliers[0];

  return (
    <div className="admin-stack">
      <section className="surface admin-form-surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Импорт WhatsApp-прайса</h2>
            <p className="panel-subtitle">Демо-проверка без сохранения и без реального парсера</p>
          </div>
        </div>

        <div className="admin-form">
          <label className="admin-field">
            <span>Поставщик</span>
            <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
              {demoSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field admin-field-wide">
            <span>WhatsApp-прайс</span>
            <textarea
              value={rawText}
              onChange={(event) => {
                setRawText(event.target.value);
                setChecked(false);
              }}
            />
          </label>

          <button className="primary-button admin-submit" type="button" onClick={() => setChecked(true)}>
            Проверить
          </button>
        </div>
      </section>

      <section className="surface admin-table-surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Предварительный результат</h2>
            <p className="panel-subtitle">Поставщик: {selectedSupplier.name}</p>
          </div>
        </div>

        {previewRows.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Строка</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.raw}</td>
                    <td>{formatAdminPrice(row.price)}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">Вставьте прайс и нажмите «Проверить».</div>
        )}
      </section>
    </div>
  );
}
