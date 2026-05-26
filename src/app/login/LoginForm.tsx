"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd
      });
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(`Error del servidor (${res.status}). Revisa variables en Vercel.`);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Credenciales incorrectas.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión. Comprueba tu red o el deploy en Vercel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="login-form">
      {error ? <div className="alert alert-danger">{error}</div> : null}
      <div className="mb-3">
        <label className="form-label">Corporate Email</label>
        <input
          type="email"
          name="email"
          className="form-control"
          placeholder="nombre@agroempresa.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          name="password"
          className="form-control"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="login-form-row mb-4">
        <label className="form-check">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>
        <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
          Forgot password?
        </a>
      </div>
      <button type="submit" className="btn btn-agro btn-login w-100" disabled={loading}>
        {loading ? "Accediendo…" : "Acceder al Panel"}
      </button>
    </form>
  );
}
