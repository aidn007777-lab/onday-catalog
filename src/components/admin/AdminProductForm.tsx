"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { demoSuppliers } from "@/data/demoCatalog";
import type { CategoryKey, ProductStatus } from "@/types/catalog";
import { categoryLabels, statusLabels } from "./adminUtils";

const categories = Object.entries(categoryLabels) as Array<[CategoryKey, string]>;
const statuses = Object.entries(statusLabels) as Array<[ProductStatus, string]>;

export function AdminProductForm() {
  const [noticeVisible, setNoticeVisible] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoticeVisible(true);
  }

  return (
    <section className="surface admin-form-surface">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Новый товар</h2>
          <p className="panel-subtitle">Форма работает в демо-режиме, без сохранения в базу</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <AdminField label="Категория">
          <select defaultValue="smartphones" name="category">
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Бренд">
          <input name="brand" placeholder="Apple" />
        </AdminField>

        <AdminField label="Модель">
          <input name="model" placeholder="iPhone 15" />
        </AdminField>

        <AdminField label="Память">
          <select defaultValue="128 GB" name="memory">
            {["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"].map((memory) => (
              <option key={memory} value={memory}>
                {memory}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Цвет">
          <input name="color" placeholder="Black" />
        </AdminField>

        <AdminField label="SIM/EAC">
          <div className="admin-inline-fields">
            <select defaultValue="1 SIM + eSIM" name="sim">
              <option value="1 SIM + eSIM">1 SIM + eSIM</option>
              <option value="2 SIM">2 SIM</option>
              <option value="eSIM">eSIM</option>
              <option value="Уточните у администратора">Уточните у администратора</option>
            </select>
            <select defaultValue="не определено" name="eac">
              <option value="да">EAC: да</option>
              <option value="нет">EAC: нет</option>
              <option value="не определено">EAC: не определено</option>
            </select>
          </div>
        </AdminField>

        <AdminField label="Поставщик">
          <select defaultValue="Дархан" name="supplier">
            {demoSuppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Приходная цена">
          <input min="0" name="purchasePrice" placeholder="350000" type="number" />
        </AdminField>

        <AdminField label="Цена наличными">
          <input min="0" name="cashPrice" placeholder="389000" type="number" />
        </AdminField>

        <AdminField label="Статус">
          <select defaultValue="available" name="status">
            {statuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </AdminField>

        {noticeVisible ? (
          <div className="admin-notice" role="status">
            Демо-режим: база данных пока не подключена
          </div>
        ) : null}

        <button className="primary-button admin-submit" type="submit">
          Сохранить
        </button>
      </form>
    </section>
  );
}

function AdminField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
