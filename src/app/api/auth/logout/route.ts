import { destroySession } from "@/lib/session";

export async function POST(request: Request) {
  await destroySession();
  const url = new URL("/login", request.url);
  return Response.redirect(url, 303);
}
