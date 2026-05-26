"use client";

import { useState } from "react";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={compact ? "btn-logout-compact" : "btn-logout"}
      onClick={() => void handleLogout()}
      disabled={loading}
      title="Cerrar sesión"
    >
      <span className="btn-logout-icon" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </span>
      {!compact ? <span>{loading ? "Saliendo…" : "Cerrar sesión"}</span> : null}
    </button>
  );
}
