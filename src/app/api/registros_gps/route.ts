import { corsOptions, methodNotAllowed, readJsonBody } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { bearerUserId, json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const userId = await bearerUserId(request);
  if (!userId) {
    return json({ ok: false, error: "No autorizado" }, 401);
  }

  const body = await readJsonBody<{
    lat?: number;
    lng?: number;
    tabla_origen?: string;
    altitud_msnm?: number;
    titulo?: string;
    notas?: string;
  }>(request);

  const lat = body.lat != null ? Number(body.lat) : null;
  const lng = body.lng != null ? Number(body.lng) : null;
  if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return json({ ok: false, error: "lat y lng requeridos" }, 400);
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("registros_gps")
      .insert({
        user_id: userId,
        tabla_origen: body.tabla_origen ?? null,
        lat,
        lng,
        altitud_msnm: body.altitud_msnm != null ? Number(body.altitud_msnm) : null,
        titulo: body.titulo ?? null,
        notas: body.notas ?? null
      })
      .select()
      .single();
    if (error) throw error;
    return json({ ok: true, data }, 201);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function GET() {
  return methodNotAllowed();
}
