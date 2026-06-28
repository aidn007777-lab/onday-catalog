"use client";

import { useMemo, useState } from "react";
import { demoSuppliers } from "@/data/demoCatalog";
import { formatAdminPrice } from "./adminUtils";
import { parseWhatsappPriceList } from "./demoWhatsappParser";

const samplePriceList = `iPhone 15 128 Black 389000
iphone 15 128GB Black - 389.000
iPhone 17 Pro 256 orange - 635.000
Samsung S24 256 Gray 429000
Samsung Galaxy S24 256gb Gray - 429000
Poco X6 Pro 256 White цена уточняется
Redmi Note 14 8/256 black - 92000
Tab A11 4G 128gb silver - 67000`;

export function AdminImportPreview() {
  const [supplierId, setSupplierId] = useState(demoSuppliers[0].id);
  const [rawText, setRawText] = useState(samplePriceList);
  const [checked, setChecked] = useState(false);

  const selectedSupplier = demoSuppliers.find((supplier) => supplier.id === supplierId) ?? demoSuppliers[0];
  const parseResult = useMemo(
    () => (checked ? parseWhatsappPriceList(rawText, selectedSupplier.name) : null),
    [checked, rawText, selectedSupplier.name]
  );

  return (
    <div className="admin-stack">
      <section className="surface admin-form-surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Импорт WhatsApp-прайса</h2>
            <p className="panel-subtitle">Rule-based демо-парсер без сохранения в базу данных</p>
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

          <button
            className="ghost-button admin-submit"
            type="button"
            onClick={() => {
              setRawText("");
              setChecked(false);
            }}
          >
            Очистить
          </button>
        </div>
      </section>

      {parseResult ? (
        <section className="admin-metrics">
          <ImportMetric label="Всего строк" value={parseResult.summary.total} />
          <ImportMetric label="Распознано" value={parseResult.summary.parsed} />
          <ImportMetric label="Цена уточняется" value={parseResult.summary.pricePending} />
          <ImportMetric label="Ошибки" value={parseResult.summary.errors} />
        </section>
      ) : null}

      <section className="surface admin-table-surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Предварительный результат</h2>
            <p className="panel-subtitle">Поставщик: {selectedSupplier.name}</p>
          </div>
        </div>

        {parseResult && parseResult.rows.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table import-preview-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Статус распознавания</th>
                  <th>Бренд</th>
                  <th>Модель</th>
                  <th>Память</th>
                  <th>Цвет</th>
                  <th>Цена</th>
                  <th>Поставщик</th>
                  <th>Исходная строка</th>
                </tr>
              </thead>
              <tbody>
                {parseResult.rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      <span className={`admin-status ${row.status === "Распознано" ? "is-ok" : "is-warning"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.brand}</td>
                    <td>{row.model}</td>
                    <td>{row.memory}</td>
                    <td>{row.color}</td>
                    <td>{formatAdminPrice(row.price)}</td>
                    <td>{row.supplier}</td>
                    <td>{row.originalLine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            {parseResult ? "Распознанных строк нет. Проверьте блок ошибок ниже." : "Вставьте прайс и нажмите «Проверить»."}
          </div>
        )}
      </section>

      {parseResult && parseResult.errors.length > 0 ? (
        <section className="surface admin-errors-surface">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Ошибки распознавания</h2>
              <p className="panel-subtitle">Эти строки требуют ручной проверки</p>
            </div>
          </div>

          <div className="admin-errors-list">
            {parseResult.errors.map((row) => (
              <article className="admin-error-row" key={row.id}>
                <strong>{row.error}</strong>
                <p>{row.originalLine}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ImportMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="surface admin-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>После демо-проверки</p>
    </article>
  );
}
