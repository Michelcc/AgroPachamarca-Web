import { redirect } from "next/navigation";
import { requireAdminSession, type SessionUser } from "./session";

export async function getAdminPageUser(): Promise<SessionUser> {
  try {
    return await requireAdminSession();
  } catch {
    redirect("/login");
  }
}
