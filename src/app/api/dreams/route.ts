import { getDb } from "@/server/db/connection";
import { saveDream, listDreams } from "@/server/db/dreams";
import {
  saveDreamRequestSchema,
  dreamListQuerySchema,
} from "@/server/api/schemas";
import { jsonError } from "@/server/api/errors";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const parsed = saveDreamRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid dream payload", 400);
  }

  try {
    const db = getDb();
    const dream = await saveDream(db, {
      ...parsed.data.state,
      dreamerId: parsed.data.dreamerId,
      idempotencyKey: parsed.data.idempotencyKey,
    });
    return Response.json(dream);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError("DATABASE_ERROR", message, 500);
  }
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const dreamerId = searchParams.get("dreamerId") ?? "";

  const parsed = dreamListQuerySchema.safeParse({ dreamerId });
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Missing dreamerId", 400);
  }

  try {
    const db = getDb();
    const dreams = await listDreams(db, parsed.data.dreamerId);
    return Response.json(dreams);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError("DATABASE_ERROR", message, 500);
  }
}
