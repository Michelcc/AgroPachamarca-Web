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

/** Usuario de la app móvil: Supabase Auth + tabla profiles */
export async function createUsuarioMovil(formData: FormData) {
  await guard();
  const db = getSupabaseAdmin();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !nombre || !username) {
    throw new Error("Email, contraseña, nombre y username son requeridos.");
  }

  const { data: auth, error: authErr } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, username }
  });

  if (authErr) throw new Error(authErr.message);

  const userId = auth.user?.id;
  if (!userId) throw new Error("No se obtuvo el id del usuario.");

  const { error: profileErr } = await db.from("profiles").upsert({
    id: userId,
    nombre,
    username,
    rol: "agricultor",
    activo: true
  });

  if (profileErr) throw new Error(profileErr.message);

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?ok=mobile_created");
}
