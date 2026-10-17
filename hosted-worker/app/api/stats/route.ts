import { json, preflight, stats } from "../counter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return json(await stats(), 200, req);
}

export async function OPTIONS(req: Request) { return preflight(req); }
