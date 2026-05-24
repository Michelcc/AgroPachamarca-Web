import { corsOptions, methodNotAllowed, readJsonBody } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { json, registrarHistorial } from "@/lib/utils";

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const numero = url.searchParams.get("numero");
  const estado = url.searchParams.get("estado");

  try {
    let q = getSupabaseAdmin()
      .from("carpetas")
      .select("id,numero,imputado,agraviado,delito,estado,fecha_registro,fiscalias(nombre),despachos(nombre)")
      .order("numero")
      .limit(200);

    if (estado) q = q.eq("estado", estado);

    const { data, error } = await q;
    if (error) throw error;

    let carpetas = data ?? [];
    if (numero) {
      const qn = numero.toLowerCase();
      carpetas = carpetas.filter(
        (c) =>
          c.numero.toLowerCase().includes(qn) ||
          c.imputado.toLowerCase().includes(qn)
      );
    }

    return json({ ok: true, data: carpetas });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let action = url.searchParams.get("action") ?? "";
  const body = await readJsonBody<Record<string, unknown>>(request);
  if (!action) action = String(body.action ?? "");

  if (!action) {
    return json(
      { ok: false, error: "action requerida: prestamo, devolucion, desarchivar" },
      400
    );
  }

  const carpetaId = String(body.carpeta_id ?? "");
  if (!carpetaId) {
    return json({ ok: false, error: "carpeta_id requerido" }, 400);
  }

  const db = getSupabaseAdmin();
  const usuarioId = body.usuario_id ? String(body.usuario_id) : null;

  try {
    if (action === "prestamo" || action === "prestar") {
      const solicitante = String(body.solicitante ?? "").trim();
      const fiscaliaSol = String(body.fiscalia_solicitante ?? "").trim();
      if (!solicitante || !fiscaliaSol) {
        return json({ ok: false, error: "solicitante y fiscalia_solicitante requeridos" }, 400);
      }
      const { data, error } = await db
        .from("prestamos")
        .insert({
          carpeta_id: carpetaId,
          fiscalia_solicitante: fiscaliaSol,
          solicitante,
          motivo: body.motivo ? String(body.motivo) : null,
          activo: true
        })
        .select()
        .single();
      if (error) throw error;
      await db.from("carpetas").update({ estado: "Prestada" }).eq("id", carpetaId);
      await registrarHistorial(
        carpetaId,
        "Préstamo API",
        `Prestada a ${solicitante}`,
        usuarioId
      );
      return json({ ok: true, data });
    }

    if (action === "devolucion" || action === "devolver") {
      const { data: prestamo } = await db
        .from("prestamos")
        .select("id")
        .eq("carpeta_id", carpetaId)
        .eq("activo", true)
        .maybeSingle();

      if (prestamo) {
        await db
          .from("prestamos")
          .update({ activo: false, fecha_devolucion: new Date().toISOString() })
          .eq("id", prestamo.id);
      }
      await db.from("carpetas").update({ estado: "Devuelta" }).eq("id", carpetaId);
      await registrarHistorial(carpetaId, "Devolución API", "Devuelta vía API", usuarioId);
      return json({ ok: true, message: "Devolución registrada" });
    }

    if (action === "desarchivar") {
      const motivo = String(body.motivo ?? "Desarchivada vía API").trim();
      await db.from("carpetas").update({ estado: "Desarchivada" }).eq("id", carpetaId);
      await registrarHistorial(carpetaId, "Desarchivo API", motivo, usuarioId);
      return json({ ok: true, message: "Carpeta desarchivada" });
    }

    return json({ ok: false, error: "Acción no reconocida" }, 400);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 500);
  }
}
