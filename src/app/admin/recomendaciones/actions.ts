"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

async function guard() {
  await requireAdminSession();
}

function payload(formData: FormData) {
  return {
    cultivo: String(formData.get("cultivo")).trim(),
    altitud_min_m: Number(formData.get("altitud_min_m") || 0),
    altitud_max_m: Number(formData.get("altitud_max_m") || 5000),
    mes_inicio: Number(formData.get("mes_inicio")),
    mes_fin: Number(formData.get("mes_fin")),
    probabilidad: Number(formData.get("probabilidad") || 80),
    notas: String(formData.get("notas") || "").trim(),
    activo: formData.get("activo") === "on"
  };
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createRecomendacion(formData: FormData) {
  await guard();
  const p = payload(formData);
  if (!p.cultivo) fail("/admin/recomendaciones", "Seleccione un cultivo.");
  const { error } = await getSupabaseAdmin().from("recomendaciones_cultivo").insert(p);
  if (error) fail("/admin/recomendaciones", error.message);
  revalidatePath("/admin/recomendaciones");
  redirect("/admin/recomendaciones?ok=created");
}

export async function updateRecomendacion(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("recomendaciones_cultivo")
    .update(payload(formData))
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/recomendaciones");
  redirect("/admin/recomendaciones?ok=updated");
}

export async function deleteRecomendacion(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("recomendaciones_cultivo")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/recomendaciones");
  redirect("/admin/recomendaciones?ok=deleted");
}
