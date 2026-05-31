"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIMENSION_NAV } from "@/lib/dimensionModulos";

const TOP_MENU = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "◎" }
];

const TABLAS_PADRE = {
  href: "/admin/tablas",
  label: "Tablas de datos",
  icon: "▤"
};

const TABLAS_HIJOS = [
  { href: "/admin/tablas/productos", label: "Productos", icon: "▣" },
  { href: "/admin/tablas/sensores", label: "Sensores", icon: "◉" }
];

const FOOTER_MENU = [{ href: "/admin/diagnosticos", label: "Diagnósticos IA", icon: "◉" }];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

export function AdminNav() {
  const pathname = usePathname();
  const tablasOpen =
    isActive(pathname, TABLAS_PADRE.href) ||
    TABLAS_HIJOS.some((c) => isActive(pathname, c.href)) ||
    pathname.startsWith("/admin/productos");

  return (
    <nav className="sidebar-nav">
      {TOP_MENU.map((m) => {
        const active = isActive(pathname, m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`nav-link${active ? " nav-link-active" : ""}`}
          >
            <span className="nav-icon">{m.icon}</span>
            {m.label}
          </Link>
        );
      })}

      <Link
        href={TABLAS_PADRE.href}
        className={`nav-link${isActive(pathname, TABLAS_PADRE.href) && pathname === TABLAS_PADRE.href ? " nav-link-active" : tablasOpen ? " nav-link-active" : ""}`}
      >
        <span className="nav-icon">{TABLAS_PADRE.icon}</span>
        {TABLAS_PADRE.label}
      </Link>

      {tablasOpen ? (
        <div className="nav-children">
          {TABLAS_HIJOS.map((c) => {
            const active =
              isActive(pathname, c.href) ||
              (c.href.includes("productos") && pathname.startsWith("/admin/productos"));
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`nav-link nav-link-child${active ? " nav-link-active" : ""}`}
              >
                <span className="nav-icon">{c.icon}</span>
                {c.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {DIMENSION_NAV.map((d) => {
        const active = isActive(pathname, d.href);
        return (
          <Link
            key={d.href}
            href={d.href}
            className={`nav-link${active ? " nav-link-active" : ""}`}
          >
            <span className="nav-icon">◆</span>
            {d.label}
          </Link>
        );
      })}

      {FOOTER_MENU.map((m) => {
        const active = isActive(pathname, m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`nav-link${active ? " nav-link-active" : ""}`}
          >
            <span className="nav-icon">{m.icon}</span>
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}
