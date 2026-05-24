import { corsOptions, methodNotAllowed } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("alertas_climaticas")
      .select("id,titulo,mensaje,nivel,lat,lng,created_at")
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return json({ ok: true, data: data ?? [] });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function POST() {
  return methodNotAllowed();
}
