import { env } from "cloudflare:workers";

const pagesOrigin = "https://krisplisik-png.github.io";

export const idOK = (id: unknown): id is string =>
  typeof id === "string" && /^[a-zA-Z0-9-]{16,80}$/.test(id);

function headers(req?: Request) {
  const origin = req?.headers.get("origin");
  const sameOrigin = origin && origin === new URL(req!.url).origin;
  const crossOrigin = origin === pagesOrigin;
  return {
    "Cache-Control": "no-store",
    ...(sameOrigin || crossOrigin ? {
      "Access-Control-Allow-Origin": origin!,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    } : {}),
  };
}

export function json(data: unknown, status = 200, req?: Request) {
  return Response.json(data, { status, headers: headers(req) });
}

export function preflight(req: Request) {
  if (!originOK(req)) return json({ error: "Origin rejected" }, 403, req);
  return new Response(null, { status: 204, headers: headers(req) });
}

export function originOK(req: Request) {
  const origin = req.headers.get("origin");
  try {
    return !origin || new URL(origin).host === new URL(req.url).host || origin === pagesOrigin;
  } catch {
    return false;
  }
}

export async function body(req: Request) {
  const raw = await req.text();
  if (raw.length > 4096) throw new Error("Too large");
  return JSON.parse(raw) as Record<string, unknown>;
}

export const db = () => {
  if (!env.DB) throw new Error("Counter database unavailable");
  return env.DB;
};

export async function stats() {
  const database = db();
  const [visits, completions] = await Promise.all([
    database.prepare("SELECT COUNT(*) AS n FROM visits").first<{ n: number }>(),
    database.prepare("SELECT COUNT(*) AS n FROM completions").first<{ n: number }>(),
  ]);
  return { visited: visits?.n ?? 0, completed: completions?.n ?? 0 };
}
