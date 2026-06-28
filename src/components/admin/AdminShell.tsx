import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const adminNav = [
  { label: "Главная", href: "/admin" },
  { label: "Товары", href: "/admin/products" },
  { label: "Добавить товар", href: "/admin/products/new" },
  { label: "Импорт прайса", href: "/admin/import" },
  { label: "Поставщики", href: "/admin/suppliers" },
  { label: "Каталог", href: "/" }
];

interface AdminShellProps {
  activeHref: string;
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AdminShell({ activeHref, children, title, subtitle }: AdminShellProps) {
  return (
    <main className="app-shell theme-dark">
      <aside className="sidebar">
        <Link className="brand-wrap" href="/">
          <Image
            className="brand-logo"
            src="/brand/onday-logo-white.png"
            alt="ONDAY Store"
            width={320}
            height={91}
            priority
          />
        </Link>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link className={`nav-item ${item.href === activeHref ? "is-active" : ""}`} href={item.href} key={item.href}>
              <span>{item.label}</span>
              {item.href === activeHref ? <span className="nav-mark" aria-hidden="true" /> : null}
            </Link>
          ))}
        </nav>

        <div className="sidebar-meta">
          <p className="meta-label">Режим</p>
          <p className="meta-value">Демо без базы</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Админка ONDAY</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span className="admin-mode-badge">Demo</span>
        </header>

        <div className="content">{children}</div>
      </section>
    </main>
  );
}
