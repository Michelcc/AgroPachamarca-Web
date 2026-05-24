"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

async function guard() {
  await requireAdminSession();
}

export async function createTabla(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin().from("catalogo_tablas").insert({
    codigo: String(formData.get("codigo")).trim(),
    categoria: String(formData.get("categoria")).trim(),
    nombre_display: String(formData.get("nombre_display")).trim(),
    icono: String(formData.get("icono") || "📋").trim(),
    orden: Number(formData.get("orden") || 0),
    activo: formData.get("activo") === "on"
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tablas");
  redirect("/admin/tablas?ok=created");
}

export async function updateTabla(formData: FormData) {
  await guard();
  const codigo = String(formData.get("codigo"));
  const { error } = await getSupabaseAdmin()
    .from("catalogo_tablas")
    .update({
      categoria: String(formData.get("categoria")).trim(),
      nombre_display: String(formData.get("nombre_display")).trim(),
      icono: String(formData.get("icono") || "📋").trim(),
      orden: Number(formData.get("orden") || 0),
      activo: formData.get("activo") === "on"
    })
    .eq("codigo", codigo);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tablas");
  redirect("/admin/tablas?ok=updated");
}

export async function toggleTabla(formData: FormData) {
  await guard();
  const codigo = String(formData.get("codigo"));
  const db = getSupabaseAdmin();
  const { data } = await db.from("catalogo_tablas").select("activo").eq("codigo", codigo).single();
  if (data) {
    await db.from("catalogo_tablas").update({ activo: !data.activo }).eq("codigo", codigo);
  }
  revalidatePath("/admin/tablas");
  redirect("/admin/tablas");
}

export async function reorderTabla(formData: FormData) {
  await guard();
  const codigo = String(formData.get("codigo"));
  const dir = String(formData.get("dir"));
  const db = getSupabaseAdmin();
  const { data: tablas } = await db
    .from("catalogo_tablas")
    .select("codigo,orden")
    .order("orden")
    .order("codigo");
  if (!tablas) return;
  const idx = tablas.findIndex((t) => t.codigo === codigo);
  if (idx < 0) return;
  const swap =
    dir === "up" && idx > 0
      ? idx - 1
      : dir === "down" && idx < tablas.length - 1
        ? idx + 1
        : null;
  if (swap === null) return;
  const a = tablas[idx].orden;
  const b = tablas[swap].orden;
  await db.from("catalogo_tablas").update({ orden: b }).eq("codigo", tablas[idx].codigo);
  await db.from("catalogo_tablas").update({ orden: a }).eq("codigo", tablas[swap].codigo);
  revalidatePath("/admin/tablas");
  redirect("/admin/tablas");
}

export async function deleteTabla(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("catalogo_tablas")
    .delete()
    .eq("codigo", String(formData.get("codigo")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tablas");
  redirect("/admin/tablas?ok=deleted");
}
