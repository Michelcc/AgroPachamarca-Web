export function diasTranscurridos(fecha: string): number {
  const inicio = new Date(fecha);
  const hoy = new Date();
  inicio.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  return Math.floor((hoy.getTime() - inicio.getTime()) / 86400000);
}

export function colorPrestamo(dias: number): string {
  if (dias <= 3) return "success";
  if (dias <= 5) return "warning";
  return "danger";
}

export const ESTADOS_CARPETA = [
  "Archivo Central",
  "Prestada",
  "Devuelta",
  "Desarchivada"
] as const;

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
    }
  });
}

export async function bearerUserId(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/Bearer\s+(\S+)/i);
  if (!m) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${m[1]}` }
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string };
  return user.id ?? null;
}

export async function registrarHistorial(
  carpetaId: string,
  tipo: string,
  descripcion: string,
  usuarioId?: string | null
) {
  const { getSupabaseAdmin } = await import("./supabase");
  await getSupabaseAdmin().from("historial_movimientos").insert({
    carpeta_id: carpetaId,
    tipo,
    descripcion,
    usuario_id: usuarioId ?? null
  });
}
