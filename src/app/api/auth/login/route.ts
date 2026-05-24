import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json } from "@/lib/utils";
import { readJsonBody } from "@/lib/api";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let email = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await readJsonBody<{ email?: string; password?: string }>(request);
    email = String(body.email ?? "").trim();
    password = String(body.password ?? "");
  } else {
    const fd = await request.formData();
    email = String(fd.get("email") ?? "").trim();
    password = String(fd.get("password") ?? "");
  }

  if (!email || !password) {
    return json({ ok: false, error: "Email y contraseña requeridos" }, 400);
  }

  const db = getSupabaseAdmin();
  const { data: user, error } = await db
    .from("usuarios")
    .select("id,nombre,email,password_hash,rol,activo")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return json({ ok: false, error: error.message }, 500);
  }

  if (!user || !user.activo) {
    return json({ ok: false, error: "Credenciales incorrectas o usuario inactivo." }, 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return json({ ok: false, error: "Credenciales incorrectas." }, 401);
  }

  if (user.rol !== "admin") {
    return json({ ok: false, error: "Solo administradores pueden acceder al panel." }, 403);
  }

  await db.from("usuarios").update({ ultimo_acceso: new Date().toISOString() }).eq("id", user.id);

  await createSession({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol
  });

  const wantsJson =
    contentType.includes("application/json") ||
    request.headers.get("accept")?.includes("application/json");

  if (wantsJson) {
    return json({
      ok: true,
      usuario: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  }

  return Response.redirect(new URL("/dashboard", request.url), 303);
}
