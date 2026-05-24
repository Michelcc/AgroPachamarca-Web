import { corsOptions, methodNotAllowed, readJsonBody } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { bearerUserId, json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

async function authUser(request: Request) {
  const uid = await bearerUserId(request);
  if (!uid) return { error: json({ ok: false, error: "No autorizado" }, 401) };
  return { uid };
}

export async function GET(request: Request) {
  const auth = await authUser(request);
  if ("error" in auth) return auth.error;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("*")
      .eq("id", auth.uid)
      .maybeSingle();
    if (error) throw error;
    if (!data) return json({ ok: false, error: "Perfil no encontrado" }, 404);
    return json({ ok: true, data });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function PUT(request: Request) {
  return patchProfile(request);
}

export async function PATCH(request: Request) {
  return patchProfile(request);
}

async function patchProfile(request: Request) {
  const auth = await authUser(request);
  if ("error" in auth) return auth.error;

  const body = await readJsonBody<Record<string, unknown>>(request);
  const allowed = ["nombre", "username", "rol", "activo"] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  if (Object.keys(data).length === 0) {
    return json({ ok: false, error: "Sin campos para actualizar" }, 400);
  }

  try {
    const { data: row, error } = await getSupabaseAdmin()
      .from("profiles")
      .update(data)
      .eq("id", auth.uid)
      .select()
      .single();
    if (error) throw error;
    return json({ ok: true, data: row });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function POST() {
  return methodNotAllowed();
}
