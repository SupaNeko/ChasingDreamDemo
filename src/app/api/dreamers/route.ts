import { getDb } from "@/server/db/connection";
import { getOrCreateDreamer } from "@/server/db/dreamers";
import { dreamerRequestSchema } from "@/server/api/schemas";
import { jsonError } from "@/server/api/errors";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const parsed = dreamerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid dreamer name", 400);
  }

  try {
    const db = getDb();
    const dreamer = await getOrCreateDreamer(db, parsed.data);
    return Response.json(dreamer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError("DATABASE_ERROR", message, 500);
  }
}
