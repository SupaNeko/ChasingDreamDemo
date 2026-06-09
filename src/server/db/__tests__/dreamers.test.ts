import Database from "better-sqlite3";
import { migrate } from "../migrate";
import { getOrCreateDreamer } from "../dreamers";

describe("getOrCreateDreamer", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    migrate(db);
  });

  afterEach(() => {
    db.close();
  });

  it("creates a new dreamer with trimmed name", async () => {
    const dreamer = await getOrCreateDreamer(db, { name: "  小林  " });
    expect(dreamer.name).toBe("小林");
    expect(dreamer.id).toBeTruthy();
  });

  it("reuses existing dreamer and updates last_seen_at", async () => {
    const first = await getOrCreateDreamer(db, { name: "小林" });

    // Small delay to ensure last_seen_at changes
    await new Promise((r) => setTimeout(r, 10));

    const second = await getOrCreateDreamer(db, { name: "小林" });
    expect(second.id).toBe(first.id);
    expect(second.name).toBe(first.name);

    const row = db
      .prepare("SELECT last_seen_at FROM dreamers WHERE id = ?")
      .get(first.id) as { last_seen_at: string };

    const firstRow = db
      .prepare("SELECT created_at FROM dreamers WHERE id = ?")
      .get(first.id) as { created_at: string };

    expect(row.last_seen_at).not.toBe(firstRow.created_at);
  });

  it("rejects empty name", async () => {
    await expect(getOrCreateDreamer(db, { name: "" })).rejects.toThrow();
    await expect(getOrCreateDreamer(db, { name: "   " })).rejects.toThrow();
  });

  it("rejects name longer than 24 characters", async () => {
    const longName = "a".repeat(25);
    await expect(getOrCreateDreamer(db, { name: longName })).rejects.toThrow();
  });

  it("accepts name of exactly 24 characters", async () => {
    const exactName = "a".repeat(24);
    const dreamer = await getOrCreateDreamer(db, { name: exactName });
    expect(dreamer.name).toBe(exactName);
  });
});
