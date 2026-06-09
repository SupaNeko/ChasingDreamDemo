import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import type { DreamState, DreamSummary, SavedDream } from "@/types/dream";

export type SaveDreamInput = DreamState & {
  dreamerId: string;
  idempotencyKey?: string;
};

function parseDreamRow(row: Record<string, unknown>): SavedDream {
  return {
    id: row.id as string,
    dreamerId: row.dreamer_id as string,
    title: row.title as string,
    dreamDate: row.dream_date as string,
    story: row.story as string,
    primaryEmotion: row.primary_emotion as string | undefined,
    emotionIntensity: row.emotion_intensity as number | undefined,
    emotionArc: JSON.parse(row.emotion_arc as string),
    keywords: JSON.parse(row.keywords as string),
    symbols: JSON.parse(row.symbols as string),
    gentleReflection: row.gentle_reflection as string | undefined,
    followUpQuestion: row.follow_up_question as string,
    atmosphere: row.atmosphere ? JSON.parse(row.atmosphere as string) : undefined,
    fragments: JSON.parse(row.fragments as string),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function saveDream(
  db: Database.Database,
  input: SaveDreamInput
): Promise<SavedDream> {
  if (input.idempotencyKey) {
    const existing = db
      .prepare(
        "SELECT * FROM dreams WHERE dreamer_id = ? AND idempotency_key = ?"
      )
      .get(input.dreamerId, input.idempotencyKey) as
      | Record<string, unknown>
      | undefined;

    if (existing) {
      return parseDreamRow(existing);
    }
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO dreams (
      id, dreamer_id, title, dream_date, story,
      primary_emotion, emotion_intensity, emotion_arc, keywords, symbols,
      fragments, gentle_reflection, follow_up_question, atmosphere,
      idempotency_key, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.dreamerId,
    input.title,
    now,
    input.story,
    input.primaryEmotion ?? null,
    input.emotionIntensity ?? null,
    JSON.stringify(input.emotionArc),
    JSON.stringify(input.keywords),
    JSON.stringify(input.symbols),
    JSON.stringify(input.fragments),
    input.gentleReflection ?? null,
    input.followUpQuestion,
    input.atmosphere ? JSON.stringify(input.atmosphere) : null,
    input.idempotencyKey ?? null,
    now,
    now
  );

  const row = db
    .prepare("SELECT * FROM dreams WHERE id = ?")
    .get(id) as Record<string, unknown>;

  return parseDreamRow(row);
}

export async function listDreams(
  db: Database.Database,
  dreamerId: string
): Promise<DreamSummary[]> {
  const rows = db
    .prepare(
      `SELECT id, title, dream_date, primary_emotion, created_at
       FROM dreams WHERE dreamer_id = ? ORDER BY dream_date DESC`
    )
    .all(dreamerId) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    dreamDate: row.dream_date as string,
    primaryEmotion: row.primary_emotion as string | undefined,
    createdAt: row.created_at as string,
  }));
}

export async function getDreamDetail(
  db: Database.Database,
  input: { id: string; dreamerId: string }
): Promise<SavedDream | null> {
  const row = db
    .prepare("SELECT * FROM dreams WHERE id = ? AND dreamer_id = ?")
    .get(input.id, input.dreamerId) as Record<string, unknown> | undefined;

  if (!row) return null;
  return parseDreamRow(row);
}
