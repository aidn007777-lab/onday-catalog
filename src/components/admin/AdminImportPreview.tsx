"use client";

import { useMemo, useState } from "react";
import { demoSuppliers } from "@/data/demoCatalog";
import { formatAdminPrice } from "./adminUtils";
import { parseWhatsappPriceList } from "./demoWhatsappParser";

const samplePriceList = `*MOBILAGID.KZ*
*Оптовый прайс для партнеров*
———————————————
*Товар в наличии*
🔳 Samsung Tab A11 4G 64gb EAC/KCT -56.000 silver, gray
🔘 Y04s (6/256)-69.500 gold, green
▪️ X9d 5G (8/256)-150.000 red
iPhone 17 Pro 256 orange/silver/blue - 635.000
Samsung A57 256 black, white, gray - 185.000
iPhone 15 128 Black 389000
Samsung Galaxy S24 256gb Gray - 429000
Poco X6 Pro 256 White цена уточняется`;

export function AdminImportPreview() {
  const [supplierId, setSupplierId] = useState(demoSuppliers[0].id);
  const [rawText, setRawText] = useState(samplePriceList);
  const [checked, setChecked] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");

  const selectedSupplier = demoSuppliers.find((supplier) => supplier.id === supplierId) ?? demoSuppliers[0];
  const parseResult = useMemo(
    () => (checked ? parseWhatsappPriceList(rawText, selectedSupplier.name) : null),
    [checked, rawText, selectedSupplier.name]
  );

  async function handleCopyResult() {
    if (!parseResult || parseResult.rows.length === 0) {
      return;
    }

    const headers = [
      "Категория",
      "Статус",
      "Бренд",
      "Модель",
      "Память",
      "Цвет",
      "SIM/EAC",
      "Цена",
      "Поставщик",
      "Исходная строка"
    ];
    const rows = parseResult.rows.map((row) =>
      [
        row.category,
        row.status,
        row.brand,
        row.model,
        row.memory,
        row.color,
        row.simEac,
        formatAdminPrice(row.price),
        row.supplier,
        row.originalLine
      ].join("\t")
    );

    try {
      await navigator.clipboard.writeText([headers.join("\t"), ...rows].join("\n"));
      setCopyNotice("Распознанный результат скопирован в буфер обмена");
    } catch {
      setCopyNotice("Не удалось скопировать результат. Проверьте разрешения браузера.");
    }
  }

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
            <select
              value={supplierId}
              onChange={(event) => {
                setSupplierId(event.target.value);
                setCopyNotice("");
              }}
            >
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
                setCopyNotice("");
              }}
            />
          </label>

          <button
            className="primary-button admin-submit"
            type="button"
            onClick={() => {
              setChecked(true);
              setCopyNotice("");
            }}
          >
            Проверить
          </button>

          <button
            className="ghost-button admin-submit"
            type="button"
            onClick={() => {
              setRawText("");
              setChecked(false);
              setCopyNotice("");
            }}
          >
            Очистить
          </button>

          {parseResult && parseResult.rows.length > 0 ? (
            <button className="ghost-button admin-submit" type="button" onClick={handleCopyResult}>
              Скопировать распознанный результат
            </button>
          ) : null}

          {copyNotice ? <div className="admin-notice">{copyNotice}</div> : null}
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
                  <th>Категория</th>
                  <th>Бренд</th>
                  <th>Модель</th>
                  <th>Память</th>
                  <th>Цвет</th>
                  <th>SIM/EAC</th>
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
                    <td>{row.category}</td>
                    <td>{row.brand}</td>
                    <td>{row.model}</td>
                    <td>{row.memory}</td>
                    <td>{row.color}</td>
                    <td>{row.simEac}</td>
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
              <h2 className="panel-title">Нераспознанные строки</h2>
              <p className="panel-subtitle">Заголовки, разделители и строки, которым нужна ручная проверка</p>
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
