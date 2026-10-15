import { body, db, idOK, json, originOK, stats } from "../counter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!originOK(req)) return json({ error: "Origin rejected" }, 403);
  let data: Record<string, unknown>;
  try { data = await body(req); } catch { return json({ error: "Invalid JSON" }, 400); }
  const medals = data.earned;
  if (!idOK(data.visitorId) || !idOK(data.runId) || !Array.isArray(medals) ||
      medals.length !== 15 || new Set(medals).size !== 15 ||
      !medals.every(k => typeof k === "string" && /^[0-2]:[0-4]$/.test(k))) {
    return json({ error: "All 15 medals required" }, 400);
  }
  const database = db();
  await database.prepare("INSERT OR IGNORE INTO visits(id) VALUES(?)").bind(data.visitorId).run();
  await database.prepare(`INSERT INTO completions(number, run_id, visitor_id)
    SELECT COALESCE(MAX(number), 0) + 1, ?, ? FROM completions
    WHERE NOT EXISTS (SELECT 1 FROM completions WHERE run_id = ?)`).bind(data.runId, data.visitorId, data.runId).run();
  const row = await database.prepare("SELECT number FROM completions WHERE run_id = ?").bind(data.runId).first<{ number: number }>();
  if (!row) return json({ error: "Could not issue card" }, 503);
  return json({ number: row.number, card: `B1-${String(row.number).padStart(6, "0")}`, ...await stats() });
}
