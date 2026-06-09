import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import type { DreamState, DreamSummary, SavedDream } from "@/types/dream";

export type SaveDreamInput = DreamState & {
  dreamerId: string;
  idempotencyKey?: string;
  sourceDreamId?: string;
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
  const now = new Date().toISOString();

  // 1. Update existing dream if sourceDreamId matches (resume editing)
  if (input.sourceDreamId) {
    const existing = db
      .prepare("SELECT id FROM dreams WHERE id = ? AND dreamer_id = ?")
      .get(input.sourceDreamId, input.dreamerId) as
      | Record<string, unknown>
      | undefined;

    if (existing) {
      db.prepare(
        `UPDATE dreams SET
          title = ?, story = ?, primary_emotion = ?, emotion_intensity = ?,
          emotion_arc = ?, keywords = ?, symbols = ?, gentle_reflection = ?,
          follow_up_question = ?, atmosphere = ?, fragments = ?, updated_at = ?
        WHERE id = ?`
      ).run(
        input.title,
        input.story,
        input.primaryEmotion ?? null,
        input.emotionIntensity ?? null,
        JSON.stringify(input.emotionArc),
        JSON.stringify(input.keywords),
        JSON.stringify(input.symbols),
        input.gentleReflection ?? null,
        input.followUpQuestion,
        input.atmosphere ? JSON.stringify(input.atmosphere) : null,
        JSON.stringify(input.fragments),
        now,
        existing.id
      );

      const row = db
        .prepare("SELECT * FROM dreams WHERE id = ?")
        .get(existing.id) as Record<string, unknown>;
      return parseDreamRow(row);
    }
  }

  // 2. Idempotency: avoid duplicate saves within the same session
  if (input.idempotencyKey) {
    const existing = db
      .prepare(
        "SELECT * FROM dreams WHERE dreamer_id = ? AND idempotency_key = ?"
      )
      .get(input.dreamerId, input.idempotencyKey) as
      | Record<string, unknown>
      | undefined;

    if (existing) {
      // Update the existing record with latest state
      db.prepare(
        `UPDATE dreams SET
          title = ?, story = ?, primary_emotion = ?, emotion_intensity = ?,
          emotion_arc = ?, keywords = ?, symbols = ?, gentle_reflection = ?,
          follow_up_question = ?, atmosphere = ?, fragments = ?, updated_at = ?
        WHERE id = ?`
      ).run(
        input.title,
        input.story,
        input.primaryEmotion ?? null,
        input.emotionIntensity ?? null,
        JSON.stringify(input.emotionArc),
        JSON.stringify(input.keywords),
        JSON.stringify(input.symbols),
        input.gentleReflection ?? null,
        input.followUpQuestion,
        input.atmosphere ? JSON.stringify(input.atmosphere) : null,
        JSON.stringify(input.fragments),
        now,
        existing.id
      );

      const row = db
        .prepare("SELECT * FROM dreams WHERE id = ?")
        .get(existing.id) as Record<string, unknown>;
      return parseDreamRow(row);
    }
  }

  // 3. Create new dream record
  const id = input.sourceDreamId || randomUUID();

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

function toDateKey(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
    dreamDate: toDateKey(row.dream_date as string),
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
