import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

export async function getOrCreateDreamer(
  db: Database.Database,
  input: { name: string }
): Promise<{ id: string; name: string }> {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Name is required");
  }

  if (name.length > 24) {
    throw new Error("Name must be 24 characters or less");
  }

  const existing = db
    .prepare("SELECT id, name FROM dreamers WHERE name = ?")
    .get(name) as { id: string; name: string } | undefined;

  if (existing) {
    const now = new Date().toISOString();
    db.prepare("UPDATE dreamers SET last_seen_at = ? WHERE id = ?").run(
      now,
      existing.id
    );
    return existing;
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    "INSERT INTO dreamers (id, name, created_at, last_seen_at) VALUES (?, ?, ?, ?)"
  ).run(id, name, now, now);

  return { id, name };
}
