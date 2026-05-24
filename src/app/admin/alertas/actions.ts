"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

async function guard() {
  await requireAdminSession();
}

function payload(formData: FormData) {
  const lat = String(formData.get("lat") || "");
  const lng = String(formData.get("lng") || "");
  return {
    titulo: String(formData.get("titulo")).trim(),
    mensaje: String(formData.get("mensaje")).trim(),
    nivel: String(formData.get("nivel") || "info"),
    activo: formData.get("activo") === "on",
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null
  };
}

export async function createAlerta(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin().from("alertas_climaticas").insert(payload(formData));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/alertas");
  redirect("/admin/alertas?ok=created");
}

export async function updateAlerta(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("alertas_climaticas")
    .update(payload(formData))
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/alertas");
  redirect("/admin/alertas?ok=updated");
}

export async function toggleAlerta(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const db = getSupabaseAdmin();
  const { data } = await db.from("alertas_climaticas").select("activo").eq("id", id).single();
  if (data) {
    await db.from("alertas_climaticas").update({ activo: !data.activo }).eq("id", id);
  }
  revalidatePath("/admin/alertas");
  redirect("/admin/alertas");
}

export async function deleteAlerta(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("alertas_climaticas")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/alertas");
  redirect("/admin/alertas?ok=deleted");
}
