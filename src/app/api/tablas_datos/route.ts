import { corsOptions, methodNotAllowed } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("catalogo_tablas")
      .select("codigo,categoria,nombre_display,icono,orden,activo")
      .eq("activo", true)
      .order("orden")
      .order("codigo");
    if (error) throw error;
    return json({ ok: true, data: data ?? [] });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function POST() {
  return methodNotAllowed();
}
