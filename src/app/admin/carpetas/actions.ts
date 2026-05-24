"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { registrarHistorial } from "@/lib/utils";

async function guard() {
  return requireAdminSession();
}

function tabRedirect(tab: string) {
  redirect(`/admin/carpetas?tab=${encodeURIComponent(tab)}`);
}

export async function getDespachos(fiscaliaId: string) {
  await guard();
  if (!fiscaliaId) return [];
  const { data } = await getSupabaseAdmin()
    .from("despachos")
    .select("id,nombre")
    .eq("fiscalia_id", fiscaliaId)
    .eq("activo", true)
    .order("nombre");
  return data ?? [];
}

export async function ingresoCarpeta(formData: FormData) {
  const session = await guard();
  const db = getSupabaseAdmin();
  const fiscaliaId = String(formData.get("fiscalia_id") || "") || null;
  const despachoId = String(formData.get("despacho_id") || "") || null;

  const { data, error } = await db
    .from("carpetas")
    .insert({
      numero: String(formData.get("numero")).trim(),
      imputado: String(formData.get("imputado")).trim(),
      agraviado: String(formData.get("agraviado") || "").trim() || null,
      delito: String(formData.get("delito")).trim(),
      fiscalia_id: fiscaliaId,
      despacho_id: despachoId,
      fiscal_responsable: String(formData.get("fiscal_responsable") || "").trim() || null,
      folios: Number(formData.get("folios") || 0),
      correo: String(formData.get("correo") || "").trim() || null,
      estado: "Archivo Central"
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  if (data?.id) {
    await registrarHistorial(
      data.id,
      "Ingreso",
      "Carpeta registrada en archivo central",
      session.id
    );
  }
  revalidatePath("/admin/carpetas");
  tabRedirect("consulta");
}

export async function prestarCarpeta(formData: FormData) {
  const session = await guard();
  const carpetaId = String(formData.get("carpeta_id"));
  const solicitante = String(formData.get("solicitante")).trim();
  const fiscaliaSol = String(formData.get("fiscalia_solicitante")).trim();
  const db = getSupabaseAdmin();

  const { error: e1 } = await db.from("prestamos").insert({
    carpeta_id: carpetaId,
    fiscalia_solicitante: fiscaliaSol,
    solicitante,
    motivo: String(formData.get("motivo") || "").trim() || null,
    activo: true
  });
  if (e1) throw new Error(e1.message);

  await db.from("carpetas").update({ estado: "Prestada" }).eq("id", carpetaId);
  await registrarHistorial(
    carpetaId,
    "Préstamo",
    `Prestada a ${solicitante}`,
    session.id
  );
  revalidatePath("/admin/carpetas");
  tabRedirect("consulta");
}

export async function devolverCarpeta(formData: FormData) {
  const session = await guard();
  const carpetaId = String(formData.get("carpeta_id"));
  const db = getSupabaseAdmin();

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
  await registrarHistorial(
    carpetaId,
    "Devolución",
    "Carpeta devuelta al archivo",
    session.id
  );
  revalidatePath("/admin/carpetas");
  tabRedirect("consulta");
}

export async function desarchivarCarpeta(formData: FormData) {
  const session = await guard();
  const carpetaId = String(formData.get("carpeta_id"));
  const motivo = String(formData.get("motivo") || "Desarchivada").trim();
  const db = getSupabaseAdmin();
  await db.from("carpetas").update({ estado: "Desarchivada" }).eq("id", carpetaId);
  await registrarHistorial(carpetaId, "Desarchivo", motivo, session.id);
  revalidatePath("/admin/carpetas");
  tabRedirect("consulta");
}
