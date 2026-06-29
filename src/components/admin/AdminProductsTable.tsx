"use client";

import { useMemo, useState } from "react";
import {
  getProductSimEac,
  sortAdminProducts,
  useDemoAdminProducts
} from "@/features/catalog/demoCatalogStore";
import type { CategoryKey, ProductStatus } from "@/types/catalog";
import { categoryLabels, formatAdminPrice, statusLabels } from "./adminUtils";

const allOption = "all";

export function AdminProductsTable() {
  const products = useDemoAdminProducts();
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState(allOption);
  const [category, setCategory] = useState<CategoryKey | typeof allOption>(allOption);
  const [brand, setBrand] = useState(allOption);
  const [memory, setMemory] = useState(allOption);
  const [color, setColor] = useState(allOption);
  const [simEac, setSimEac] = useState(allOption);
  const [status, setStatus] = useState<ProductStatus | typeof allOption>(allOption);

  const filterOptions = useMemo(
    () => ({
      suppliers: getSortedOptions(products.map((product) => product.supplierName)),
      categories: Array.from(new Set(products.map((product) => product.category))).sort(),
      brands: getSortedOptions(products.map((product) => product.brand)),
      memories: getSortedOptions(products.map((product) => product.memory)),
      colors: getSortedOptions(products.map((product) => product.colorRu)),
      simEacOptions: getSortedOptions(products.map(getProductSimEac))
    }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortAdminProducts(products).filter((product) => {
      const productSimEac = getProductSimEac(product);
      const haystack = [
        product.supplierName,
        categoryLabels[product.category],
        product.brand,
        product.model,
        product.memory,
        product.colorRu,
        productSimEac,
        statusLabels[product.status],
        product.updatedAt
      ]
        .join(" ")
        .toLowerCase();

      return (
        (supplier === allOption || product.supplierName === supplier) &&
        (category === allOption || product.category === category) &&
        (brand === allOption || product.brand === brand) &&
        (memory === allOption || product.memory === memory) &&
        (color === allOption || product.colorRu === color) &&
        (simEac === allOption || productSimEac === simEac) &&
        (status === allOption || product.status === status) &&
        (normalizedSearch.length === 0 || haystack.includes(normalizedSearch))
      );
    });
  }, [brand, category, color, memory, products, search, simEac, status, supplier]);

  return (
    <div className="admin-stack">
      <section className="surface admin-form-surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Фильтры каталога</h2>
            <p className="panel-subtitle">Поиск по всем локальным позициям без подключения базы данных</p>
          </div>
        </div>

        <div className="admin-product-filters">
          <label className="admin-field admin-field-wide">
            <span>Поиск</span>
            <input
              value={search}
              placeholder="Поставщик, бренд, модель, память, цвет или SIM/EAC"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <FilterSelect label="Поставщик" value={supplier} options={filterOptions.suppliers} onChange={setSupplier} />
          <FilterSelect
            label="Категория"
            value={category}
            options={filterOptions.categories}
            getLabel={(value) => categoryLabels[value as CategoryKey]}
            onChange={(value) => setCategory(value as CategoryKey | typeof allOption)}
          />
          <FilterSelect label="Бренд" value={brand} options={filterOptions.brands} onChange={setBrand} />
          <FilterSelect label="Память" value={memory} options={filterOptions.memories} onChange={setMemory} />
          <FilterSelect label="Цвет" value={color} options={filterOptions.colors} onChange={setColor} />
          <FilterSelect label="SIM/EAC" value={simEac} options={filterOptions.simEacOptions} onChange={setSimEac} />
          <FilterSelect
            label="Статус"
            value={status}
            options={Object.keys(statusLabels)}
            getLabel={(value) => statusLabels[value as ProductStatus]}
            onChange={(value) => setStatus(value as ProductStatus | typeof allOption)}
          />
        </div>
      </section>

      <section className="surface admin-table-surface">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Таблица товаров</h2>
            <p className="panel-subtitle">
              Показано {filteredProducts.length} из {products.length}. Админка видит все предложения поставщиков.
            </p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Поставщик</th>
                <th>Категория</th>
                <th>Бренд</th>
                <th>Модель</th>
                <th>Память</th>
                <th>Цвет</th>
                <th>SIM/EAC</th>
                <th>Цена прихода</th>
                <th>Статус</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.supplierName}</td>
                  <td>{categoryLabels[product.category]}</td>
                  <td>{product.brand}</td>
                  <td>{product.model}</td>
                  <td>{product.memory}</td>
                  <td>{product.colorRu}</td>
                  <td>{getProductSimEac(product)}</td>
                  <td>{formatAdminPrice(product.purchasePrice)}</td>
                  <td>
                    <span className={`admin-status ${product.status === "available" ? "is-ok" : "is-warning"}`}>
                      {statusLabels[product.status]}
                    </span>
                  </td>
                  <td>{product.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 ? <div className="admin-empty-state">По этим фильтрам товаров нет.</div> : null}
      </section>
    </div>
  );
}

function FilterSelect({
  getLabel,
  label,
  onChange,
  options,
  value
}: {
  getLabel?: (value: string) => string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value={allOption}>Все</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel ? getLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function getSortedOptions(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right, "ru"));
}
