import { verifyCron } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { diasTranscurridos, json } from "@/lib/utils";

export async function GET(request: Request) {
  if (!verifyCron(request)) {
    return json({ ok: false, error: "Clave inválida" }, 403);
  }

  const resultado: Record<string, unknown> = {
    ok: true,
    fecha: new Date().toISOString(),
    revisados: 0,
    alertas_creadas: 0,
    correos_simulados: 0,
    detalle: [] as Record<string, unknown>[]
  };

  try {
    const { data: prestamos, error } = await getSupabaseAdmin()
      .from("prestamos")
      .select("*,carpetas(numero,imputado)")
      .eq("activo", true)
      .order("fecha_prestamo");

    if (error) throw error;

    const detalle = resultado.detalle as Record<string, unknown>[];

    for (const p of prestamos ?? []) {
      resultado.revisados = Number(resultado.revisados) + 1;
      const dias = diasTranscurridos(String(p.fecha_prestamo));
      let nivel: string | null = null;
      let correoSim = false;

      if (dias >= 10) {
        nivel = "critico";
        correoSim = true;
      } else if (dias >= 5) {
        nivel = "advertencia";
      } else {
        continue;
      }

      const car = p.carpetas as { numero?: string } | null;
      const desc = `Carpeta ${car?.numero ?? p.carpeta_id} — ${dias} días prestada`;

      await getSupabaseAdmin().from("alertas_prestamos").insert({
        prestamo_id: p.id,
        dias_transcurridos: dias,
        nivel,
        correo_simulado: correoSim
      });
      resultado.alertas_creadas = Number(resultado.alertas_creadas) + 1;

      if (correoSim) {
        resultado.correos_simulados = Number(resultado.correos_simulados) + 1;
        if (!p.recordatorio_enviado) {
          await getSupabaseAdmin()
            .from("prestamos")
            .update({ recordatorio_enviado: true })
            .eq("id", p.id);
        }
      }

      detalle.push({
        prestamo_id: p.id,
        carpeta: car?.numero ?? null,
        dias,
        nivel,
        correo_simulado: correoSim,
        mensaje: desc
      });
    }
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }

  return json(resultado);
}

export async function POST(request: Request) {
  return GET(request);
}
