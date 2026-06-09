import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

export function createConnection(dbPath?: string): Database.Database {
  const targetPath = dbPath ?? path.resolve(process.cwd(), "data", "chasing-dream.sqlite");

  if (!dbPath) {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(targetPath);
  db.pragma("journal_mode = WAL");
  return db;
}

let singletonDb: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!singletonDb) {
    singletonDb = createConnection();
  }
  return singletonDb;
}

export function setDb(db: Database.Database | null): void {
  singletonDb = db;
}
