import { body, db, idOK, json, originOK, preflight, stats } from "../counter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!originOK(req)) return json({ error: "Origin rejected" }, 403, req);
  let data: Record<string, unknown>;
  try { data = await body(req); } catch { return json({ error: "Invalid JSON" }, 400, req); }
  if (!idOK(data.visitorId)) return json({ error: "Invalid visitor ID" }, 400, req);
  await db().prepare("INSERT OR IGNORE INTO visits(id) VALUES(?)").bind(data.visitorId).run();
  return json(await stats(), 200, req);
}

export async function OPTIONS(req: Request) { return preflight(req); }
