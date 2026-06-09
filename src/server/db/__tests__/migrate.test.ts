import Database from "better-sqlite3";
import { migrate } from "../migrate";

describe("migrate", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
  });

  afterEach(() => {
    db.close();
  });

  it("creates dreamers table with expected columns", () => {
    migrate(db);

    const columns = db
      .prepare("SELECT name FROM pragma_table_info('dreamers')")
      .all() as { name: string }[];

    const columnNames = columns.map((c) => c.name);
    expect(columnNames).toContain("id");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("created_at");
    expect(columnNames).toContain("last_seen_at");
  });

  it("creates dreams table with expected columns", () => {
    migrate(db);

    const columns = db
      .prepare("SELECT name FROM pragma_table_info('dreams')")
      .all() as { name: string }[];

    const columnNames = columns.map((c) => c.name);
    expect(columnNames).toContain("id");
    expect(columnNames).toContain("dreamer_id");
    expect(columnNames).toContain("title");
    expect(columnNames).toContain("dream_date");
    expect(columnNames).toContain("story");
    expect(columnNames).toContain("primary_emotion");
    expect(columnNames).toContain("emotion_intensity");
    expect(columnNames).toContain("emotion_arc");
    expect(columnNames).toContain("keywords");
    expect(columnNames).toContain("symbols");
    expect(columnNames).toContain("fragments");
    expect(columnNames).toContain("gentle_reflection");
    expect(columnNames).toContain("follow_up_question");
    expect(columnNames).toContain("atmosphere");
    expect(columnNames).toContain("idempotency_key");
    expect(columnNames).toContain("created_at");
    expect(columnNames).toContain("updated_at");
  });

  it("creates indexes on dreams table", () => {
    migrate(db);

    const indexes = db
      .prepare("SELECT name FROM pragma_index_list('dreams')")
      .all() as { name: string }[];

    const indexNames = indexes.map((i) => i.name);
    expect(indexNames).toContain("idx_dreams_dreamer_date");
    expect(indexNames).toContain("idx_dreams_idempotency");
  });

  it("is idempotent (can run twice without error)", () => {
    expect(() => {
      migrate(db);
      migrate(db);
    }).not.toThrow();
  });
});
