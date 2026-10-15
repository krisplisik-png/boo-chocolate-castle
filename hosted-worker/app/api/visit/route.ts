import { body, db, idOK, json, originOK, stats } from "../counter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!originOK(req)) return json({ error: "Origin rejected" }, 403);
  let data: Record<string, unknown>;
  try { data = await body(req); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!idOK(data.visitorId)) return json({ error: "Invalid visitor ID" }, 400);
  await db().prepare("INSERT OR IGNORE INTO visits(id) VALUES(?)").bind(data.visitorId).run();
  return json(await stats());
}
