"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

async function guard() {
  await requireAdminSession();
}

function productPayload(formData: FormData) {
  return {
    nombre: String(formData.get("nombre")).trim(),
    categoria: String(formData.get("categoria")).trim(),
    precio: Number(formData.get("precio") || 0),
    unidad: String(formData.get("unidad") || "kg").trim(),
    stock: Number(formData.get("stock") || 0),
    disponible: formData.get("disponible") === "on",
    destacado: formData.get("destacado") === "on",
    imagen_url: String(formData.get("imagen_url") || "").trim() || null
  };
}

export async function createProducto(formData: FormData) {
  await guard();
  const userId = String(formData.get("user_id") || "");
  if (!userId) throw new Error("Seleccione un usuario de la app.");
  const { error } = await getSupabaseAdmin()
    .from("productos")
    .insert({ ...productPayload(formData), user_id: userId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/productos");
  redirect("/admin/productos?ok=created");
}

export async function updateProducto(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("productos")
    .update(productPayload(formData))
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/productos");
  redirect("/admin/productos?ok=updated");
}

export async function deleteProducto(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("productos")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/productos");
  redirect("/admin/productos?ok=deleted");
}
