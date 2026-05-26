import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.rol === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="login-split">
      <section className="login-hero">
        <div className="login-hero-inner">
          <p className="login-hero-tag">Agro Modern Analytics</p>
          <h2>Enterprise Edition 2026</h2>
          <blockquote>
            &ldquo;Tecnología avanzada para un futuro sostenible en el campo.&rdquo;
          </blockquote>
          <div className="login-hero-badges">
            <span>SECURE CONNECTION</span>
            <span>LIVE ANALYSIS</span>
          </div>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-head">
            <span className="login-logo-mark">🌿</span>
            <h1>Acceso Administrativo</h1>
            <p>
              Bienvenido de nuevo. Ingresa a la plataforma de gestión empresarial de{" "}
              <strong>Agro Modern</strong>.
            </p>
          </div>
          <LoginForm />
          <p className="login-foot-note">
            <span className="secure-dot" /> Conexión segura · Contact IT Support
          </p>
        </div>
      </section>
    </div>
  );
}
