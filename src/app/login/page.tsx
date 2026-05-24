import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.rol === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-card card shadow-lg border-0">
        <div className="card-body">
          <div className="text-center mb-4">
            <span className="login-logo">🌿</span>
            <h1 className="h4 fw-bold text-agro">AGRO ADMIN</h1>
            <p className="text-muted small">Panel web · Supabase</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
