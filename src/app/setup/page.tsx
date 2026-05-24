import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";

type Props = {
  searchParams: Promise<{ key?: string; email?: string; password?: string; nombre?: string }>;
};

export default async function SetupPage({ searchParams }: Props) {
  const { key, email: emailParam, password, nombre: nombreParam } = await searchParams;
  const cronSecret = process.env.CRON_SECRET ?? "";

  if (!key || key !== cronSecret) {
    return (
      <div className="login-page">
        <div className="login-card card">
          <div className="card-body">
            <h1 className="h4 text-agro">Forbidden</h1>
            <p className="text-muted">Clave CRON_SECRET inválida.</p>
          </div>
        </div>
      </div>
    );
  }

  const plain = password ?? "admin123";
  const hash = await bcrypt.hash(plain, 10);
  const db = getSupabaseAdmin();
  const email = (emailParam ?? "admin@agro.local").trim().toLowerCase();
  const nombre = (nombreParam ?? "Administrador").trim() || "Administrador";

  const { data: existing } = await db
    .from("usuarios")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let message: string;
  if (existing) {
    const { error } = await db
      .from("usuarios")
      .update({ nombre, password_hash: hash, rol: "admin", activo: true })
      .eq("id", existing.id);
    message = error
      ? `Error: ${error.message}`
      : `Admin actualizado. Email: ${email} Password: ${plain}`;
  } else {
    const { error } = await db.from("usuarios").insert({
      nombre,
      email,
      password_hash: hash,
      rol: "admin",
      activo: true
    });
    message = error
      ? `Error: ${error.message}`
      : `Admin creado. Email: ${email} Password: ${plain}`;
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="card-body">
          <h1 className="h4 text-agro">Setup administrador</h1>
          <p>{message}</p>
          <p className="text-muted small">
            Elimina o protege esta ruta en producción después de usarla.
          </p>
        </div>
      </div>
    </div>
  );
}
