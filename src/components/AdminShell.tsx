import Link from "next/link";
import type { SessionUser } from "@/lib/session";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
  { href: "/admin/tablas", label: "Tablas de datos", icon: "📋" },
  { href: "/admin/productos", label: "Productos", icon: "📦" },
  { href: "/admin/recomendaciones", label: "Recomendaciones", icon: "🌾" },
  { href: "/admin/alertas", label: "Alertas clima", icon: "☁️" },
  { href: "/admin/diagnosticos", label: "Diagnósticos IA", icon: "🔬" },
  { href: "/admin/registros-gps", label: "Registros GPS", icon: "📍" }
];

export function AdminShell({
  user,
  title,
  children
}: {
  user: SessionUser;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>🌿 Agro</span>
          <small>Admin Panel</small>
        </div>
        <nav>
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="nav-link">
              {m.icon} {m.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div>{user.nombre}</div>
          <small>{user.rol}</small>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="link-btn">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <h1>{title}</h1>
          <span className="badge">v1.0</span>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
