"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "◎" },
  { href: "/admin/tablas", label: "Tablas de datos", icon: "▤" },
  { href: "/admin/productos", label: "Productos", icon: "▣" },
  { href: "/admin/recomendaciones", label: "Recomendaciones", icon: "◈" },
  { href: "/admin/alertas", label: "Alertas clima", icon: "☁" },
  { href: "/admin/diagnosticos", label: "Diagnósticos IA", icon: "◉" }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      {MENU.map((m) => {
        const active =
          pathname === m.href || (m.href !== "/dashboard" && pathname.startsWith(m.href));
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
