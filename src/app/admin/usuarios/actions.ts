"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

async function guard() {
  await requireAdminSession();
}

export async function createUsuario(formData: FormData) {
  await guard();
  const pass = String(formData.get("password") || "changeme123");
  const hash = await bcrypt.hash(pass, 10);
  const { error } = await getSupabaseAdmin().from("usuarios").insert({
    nombre: String(formData.get("nombre")).trim(),
    email: String(formData.get("email")).trim(),
    password_hash: hash,
    rol: String(formData.get("rol") || "operador"),
    activo: formData.get("activo") === "on"
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?ok=created");
}

export async function updateUsuario(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const data: Record<string, unknown> = {
    nombre: String(formData.get("nombre")).trim(),
    email: String(formData.get("email")).trim(),
    rol: String(formData.get("rol")),
    activo: formData.get("activo") === "on"
  };
  const pass = String(formData.get("password") || "");
  if (pass) data.password_hash = await bcrypt.hash(pass, 10);

  const { error } = await getSupabaseAdmin().from("usuarios").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?ok=updated");
}

export async function deleteUsuario(formData: FormData) {
  await guard();
  const { error } = await getSupabaseAdmin()
    .from("usuarios")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?ok=deleted");
}
