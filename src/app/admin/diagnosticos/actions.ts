"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function deleteDiagnostico(formData: FormData) {
  await requireAdminSession();
  const { error } = await getSupabaseAdmin()
    .from("diagnosticos_ia")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/diagnosticos");
  const fecha = String(formData.get("fecha") || "");
  redirect(fecha ? `/admin/diagnosticos?fecha=${fecha}` : "/admin/diagnosticos?ok=deleted");
}
