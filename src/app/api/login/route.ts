import bcrypt from "bcryptjs";
import { corsOptions, methodNotAllowed, readJsonBody } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const body = await readJsonBody<{ email?: string; password?: string }>(request);
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return json({ ok: false, error: "Email y contraseña requeridos" }, 400);
  }

  const db = getSupabaseAdmin();

  try {
    const { data: auth, error } = await db.auth.signInWithPassword({ email, password });
    if (!error && auth.session?.access_token) {
      let profile = null;
      if (auth.user?.id) {
        const { data } = await db.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
        profile = data;
      }
      return json({
        ok: true,
        source: "supabase",
        access_token: auth.session.access_token,
        refresh_token: auth.session.refresh_token,
        user: auth.user,
        profile
      });
    }
  } catch {
    // continuar con usuarios panel
  }

  try {
    const { data: user } = await db
      .from("usuarios")
      .select("id,nombre,email,password_hash,rol,activo")
      .eq("email", email)
      .maybeSingle();

    if (user?.activo && (await bcrypt.compare(password, user.password_hash))) {
      await db.from("usuarios").update({ ultimo_acceso: new Date().toISOString() }).eq("id", user.id);
      return json({
        ok: true,
        source: "usuarios",
        usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
      });
    }
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }

  return json({ ok: false, error: "Credenciales inválidas" }, 401);
}

export async function GET() {
  return methodNotAllowed();
}
