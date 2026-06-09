import Database from "better-sqlite3";

export function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS dreamers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dreams (
      id TEXT PRIMARY KEY,
      dreamer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      dream_date TEXT NOT NULL,
      story TEXT NOT NULL,
      primary_emotion TEXT,
      emotion_intensity REAL,
      emotion_arc TEXT,
      keywords TEXT,
      symbols TEXT,
      fragments TEXT,
      gentle_reflection TEXT,
      follow_up_question TEXT,
      atmosphere TEXT,
      idempotency_key TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (dreamer_id) REFERENCES dreamers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_dreams_dreamer_date ON dreams(dreamer_id, dream_date);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_dreams_idempotency ON dreams(dreamer_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
  `);
}
