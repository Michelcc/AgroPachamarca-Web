import { corsOptions, methodNotAllowed, readJsonBody } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { bearerUserId, json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const userId = await bearerUserId(request);
  if (!userId) {
    return json({ ok: false, error: "Token Bearer requerido" }, 401);
  }

  const body = await readJsonBody<{
    modelo?: string;
    severidad?: string;
    resumen?: string;
    titulo?: string;
    imagen_url?: string;
    lat?: number;
    lng?: number;
  }>(request);

  const resumen = String(body.resumen ?? "").trim();
  if (!resumen) {
    return json({ ok: false, error: "resumen requerido" }, 400);
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("diagnosticos_ia")
      .insert({
        user_id: userId,
        modelo: String(body.modelo ?? "gemini").trim(),
        severidad: String(body.severidad ?? "media").trim(),
        titulo: body.titulo ?? null,
        resumen,
        imagen_url: body.imagen_url ?? null,
        lat: body.lat != null ? Number(body.lat) : null,
        lng: body.lng != null ? Number(body.lng) : null
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
