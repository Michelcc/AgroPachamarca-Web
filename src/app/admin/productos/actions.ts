"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAppUserId } from "@/lib/admin-queries";
import { normalizeImageUrl } from "@/lib/imageUrl";
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
    imagen_url: normalizeImageUrl(String(formData.get("imagen_url") || ""))
  };
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createProducto(formData: FormData) {
  await guard();
  let userId: string;
  try {
    userId = await resolveAppUserId(String(formData.get("user_id") || ""));
  } catch (e) {
    fail(
      "/admin/tablas/productos",
      e instanceof Error ? e.message : "No hay usuario de app para asignar el producto"
    );
  }

  const { error } = await getSupabaseAdmin()
    .from("productos")
    .insert({ ...productPayload(formData), user_id: userId });
  if (error) fail("/admin/tablas/productos", error.message);

  revalidatePath("/admin/tablas/productos");
  redirect("/admin/tablas/productos?ok=created");
}

export async function updateProducto(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("productos")
    .update(productPayload(formData))
    .eq("id", String(formData.get("id")));
  if (error) fail("/admin/tablas/productos", error.message);
  revalidatePath("/admin/tablas/productos");
  redirect("/admin/tablas/productos?ok=updated");
}

export async function deleteProducto(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("productos")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) fail("/admin/tablas/productos", error.message);
  revalidatePath("/admin/tablas/productos");
  redirect("/admin/tablas/productos?ok=deleted");
}
