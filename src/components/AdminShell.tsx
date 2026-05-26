import { AdminFooter } from "./AdminFooter";
import { AdminNav } from "./AdminNav";
import { LogoutButton } from "./LogoutButton";
import type { SessionUser } from "@/lib/session";

export function AdminShell({
  user,
  title,
  subtitle,
  children
}: {
  user: SessionUser;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const initial = (user.nombre || user.email || "A").charAt(0).toUpperCase();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">🌿</div>
          <div>
            <strong>Agro System</strong>
            <small>Gestión Empresarial</small>
          </div>
        </div>
        <AdminNav />
        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div>
              <div className="sidebar-user-name">{user.nombre}</div>
              <small>{user.rol === "admin" ? "Super Administrador" : user.rol}</small>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{title}</h1>
            {subtitle ? <p className="topbar-subtitle">{subtitle}</p> : null}
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <span className="search-icon">⌕</span>
              <input type="search" placeholder="Buscar en el panel…" aria-label="Buscar" />
            </div>
            <div className="topbar-user">
              <div className="topbar-avatar">{initial}</div>
              <div className="topbar-user-text">
                <span className="topbar-user-name">{user.nombre}</span>
                <span className="topbar-user-role">Admin Agrónomo</span>
              </div>
              <LogoutButton compact />
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
