import { json } from "./utils";

export async function readJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

export function corsOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
    }
  });
}

export function verifyCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) return false;

  const url = new URL(request.url);
  const keyParam = url.searchParams.get("key");
  if (keyParam && keyParam === secret) return true;

  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/Bearer\s+(\S+)/i);
  return !!m && m[1] === secret;
}

export function methodNotAllowed() {
  return json({ ok: false, error: "Método no permitido" }, 405);
}
