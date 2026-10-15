import { json, stats } from "../counter";

export const dynamic = "force-dynamic";

export async function GET() {
  return json(await stats());
}
