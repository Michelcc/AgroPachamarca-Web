import { corsOptions, methodNotAllowed, readJsonBody } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const body = await readJsonBody<{
    email?: string;
    password?: string;
    nombre?: string;
    username?: string;
  }>(request);

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const nombre = String(body.nombre ?? "").trim();
  const username = String(body.username ?? "").trim();

  if (!email || !password || !nombre || !username) {
    return json({ ok: false, error: "email, password, nombre y username requeridos" }, 400);
  }

  const db = getSupabaseAdmin();
  const { data: auth, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, username }
  });

  if (error) {
    return json({ ok: false, error: error.message }, 400);
  }

  const userId = auth.user?.id;
  if (userId) {
    await db.from("profiles").upsert({
      id: userId,
      nombre,
      username,
      rol: "agricultor",
      activo: true
    });
  }

  return json(
    {
      ok: true,
      user: auth.user,
      message: "Registro exitoso. Verifique su correo si la confirmación está activa."
    },
    201
  );
}

export async function GET() {
  return methodNotAllowed();
}
