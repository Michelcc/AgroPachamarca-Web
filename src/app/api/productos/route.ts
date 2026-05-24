import { corsOptions, methodNotAllowed } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");
  const disponible = url.searchParams.get("disponible");

  try {
    let q = getSupabaseAdmin()
      .from("productos")
      .select("id,nombre,categoria,precio,unidad,stock,disponible,destacado,imagen_url,created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (userId) q = q.eq("user_id", userId);
    if (disponible) q = q.eq("disponible", true);

    const { data, error } = await q;
    if (error) throw error;
    return json({ ok: true, data: data ?? [] });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function POST() {
  return methodNotAllowed();
}
