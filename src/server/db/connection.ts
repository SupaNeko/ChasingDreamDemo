import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { migrate } from "./migrate";

export function createConnection(dbPath?: string): Database.Database {
  const targetPath =
    dbPath ??
    process.env.DATABASE_PATH ??
    (process.env.VERCEL ? "/tmp/chasing-dream.sqlite" : undefined) ??
    path.resolve(process.cwd(), "data", "chasing-dream.sqlite");

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // 在只读文件系统（如 Vercel Serverless）上会失败
    }
  }

  const db = new Database(targetPath);
  db.pragma("journal_mode = WAL");
  migrate(db);
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
