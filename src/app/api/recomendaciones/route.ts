import { corsOptions, methodNotAllowed } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const altitud = url.searchParams.has("altitud") ? Number(url.searchParams.get("altitud")) : null;
  const mes = url.searchParams.has("mes") ? Number(url.searchParams.get("mes")) : null;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("recomendaciones_cultivo")
      .select("*")
      .eq("activo", true)
      .order("probabilidad", { ascending: false });
    if (error) throw error;

    let rows = data ?? [];
    if (altitud !== null && !Number.isNaN(altitud)) {
      rows = rows.filter(
        (r) => altitud >= r.altitud_min_m && altitud <= r.altitud_max_m
      );
    }
    if (mes !== null && mes >= 1 && mes <= 12) {
      rows = rows.filter((r) => {
        const ini = r.mes_inicio;
        const fin = r.mes_fin;
        if (ini <= fin) return mes >= ini && mes <= fin;
        return mes >= ini || mes <= fin;
      });
    }

    return json({ ok: true, data: rows, filtros: { altitud, mes } });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function POST() {
  return methodNotAllowed();
}
