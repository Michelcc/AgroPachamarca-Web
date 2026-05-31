import { getSupabaseAdmin } from "@/lib/supabase";

export type ProfileRow = { id: string; nombre: string | null; username: string | null };

export type ProductoRow = {
  id: string;
  user_id: string;
  nombre: string;
  categoria: string;
  precio: number;
  unidad: string;
  stock: number;
  disponible: boolean;
  destacado?: boolean;
  imagen_url: string | null;
  created_at: string;
  profile?: ProfileRow | null;
};

export async function fetchProfiles(limit = 200) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("profiles")
    .select("id,nombre,username")
    .order("nombre")
    .limit(limit);
  return { data: data ?? [], error: error?.message ?? null };
}

export async function fetchProductos(): Promise<{
  data: ProductoRow[];
  error: string | null;
}> {
  const db = getSupabaseAdmin();
  const { data: rows, error } = await db
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return { data: [], error: error.message };
  }

  const { data: profiles } = await db.from("profiles").select("id,nombre,username").limit(500);
  const map = new Map((profiles ?? []).map((p) => [p.id, p]));

  const data = (rows ?? []).map((r) => ({
    ...r,
    profile: map.get(r.user_id) ?? null
  })) as ProductoRow[];

  return { data, error: null };
}

export async function fetchAlertasClimaticas() {
  const { data, error } = await getSupabaseAdmin()
    .from("alertas_climaticas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return { data: data ?? [], error: error?.message ?? null };
}

export async function fetchRecomendaciones() {
  const { data, error } = await getSupabaseAdmin()
    .from("recomendaciones_cultivo")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return { data: data ?? [], error: error?.message ?? null };
}

export type IndicadorOpRow = {
  id: string;
  user_id: string;
  variable_dependiente: string;
  dimension_id: string;
  dimension_label: string;
  indicador_id: string;
  indicador_label: string;
  instrumento: string;
  tipo_instrumento: string;
  valor_numerico: number | null;
  valor_texto: string | null;
  unidad: string | null;
  created_at: string;
  profile?: ProfileRow | null;
};

export async function fetchIndicadoresOperacionales(): Promise<{
  data: IndicadorOpRow[];
  error: string | null;
}> {
  const db = getSupabaseAdmin();
  const { data: rows, error } = await db
    .from("indicadores_operacionalizacion")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return { data: [], error: error.message };
  const { data: profiles } = await db.from("profiles").select("id,nombre,username").limit(500);
  const map = new Map((profiles ?? []).map((p) => [p.id, p]));
  return {
    data: (rows ?? []).map((r) => ({
      ...r,
      profile: map.get(r.user_id) ?? null
    })) as IndicadorOpRow[],
    error: null
  };
}

export async function resolveAppUserId(formUserId: string): Promise<string> {
  const trimmed = formUserId.trim();
  if (trimmed) return trimmed;
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id) {
    throw new Error(
      "No hay usuarios de la app móvil. Crea uno en Usuarios → + Usuario app, o sincroniza profiles en Supabase."
    );
  }
  return data.id;
}

export type LecturaSensorRow = {
  id: string;
  user_id: string;
  sensor_codigo: string | null;
  humedad_pct: number | null;
  ph: number | null;
  temperatura_c: number | null;
  conductividad_ms_cm: number | null;
  profundidad_cm: number | null;
  estado_suelo: string | null;
  created_at: string;
  profile?: ProfileRow | null;
};

export async function fetchLecturasSensorSuelo(): Promise<{
  data: LecturaSensorRow[];
  error: string | null;
}> {
  const db = getSupabaseAdmin();
  const { data: rows, error } = await db
    .from("lecturas_sensor_suelo")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return { data: [], error: error.message };
  const { data: profiles } = await db.from("profiles").select("id,nombre,username").limit(500);
  const map = new Map((profiles ?? []).map((p) => [p.id, p]));
  return {
    data: (rows ?? []).map((r) => ({
      ...r,
      profile: map.get(r.user_id) ?? null
    })) as LecturaSensorRow[],
    error: null
  };
}
