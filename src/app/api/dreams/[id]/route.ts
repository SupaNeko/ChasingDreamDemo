import { getDb } from "@/server/db/connection";
import { getDreamDetail } from "@/server/db/dreams";
import { dreamDetailQuerySchema } from "@/server/api/schemas";
import { jsonError } from "@/server/api/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const dreamerId = searchParams.get("dreamerId") ?? "";

  const parsed = dreamDetailQuerySchema.safeParse({ dreamerId });
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Missing dreamerId", 400);
  }

  try {
    const db = getDb();
    const dream = await getDreamDetail(db, {
      id,
      dreamerId: parsed.data.dreamerId,
    });
    if (!dream) {
      return jsonError("NOT_FOUND", "Dream not found", 404);
    }
    return Response.json(dream);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError("DATABASE_ERROR", message, 500);
  }
}
