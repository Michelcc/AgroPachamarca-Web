/** Normaliza URL de imagen para <img src> (https obligatorio). */
export function normalizeImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let u = raw.trim();
  if (!u) return null;
  if (u.startsWith("//")) u = `https:${u}`;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}
