import Database from "better-sqlite3";
import { migrate } from "../migrate";
import { getOrCreateDreamer } from "../dreamers";
import { saveDream, listDreams, getDreamDetail } from "../dreams";
import type { DreamState } from "@/types/dream";

function makeDreamState(overrides?: Partial<DreamState>): DreamState {
  return {
    title: "Test Dream",
    story: "I was flying over a mountain.",
    primaryEmotion: "joy",
    emotionIntensity: 0.8,
    emotionArc: ["calm", "excitement", "peace"],
    keywords: [
      { text: "mountain", type: "place" as const, weight: 0.9 },
      { text: "flying", type: "action" as const, weight: 0.8 },
    ],
    symbols: ["eagle", "sky"],
    gentleReflection: "A peaceful journey.",
    followUpQuestion: "How did the mountain feel?",
    atmosphere: { palette: "blue", motion: "flowing", density: 0.5 },
    fragments: [
      { id: "f1", content: "flying", inputType: "text", createdAt: new Date().toISOString() },
    ],
    ...overrides,
  };
}

describe("dreams repository", () => {
  let db: Database.Database;
  let dreamerA: { id: string; name: string };
  let dreamerB: { id: string; name: string };

  beforeEach(async () => {
    db = new Database(":memory:");
    migrate(db);
    dreamerA = await getOrCreateDreamer(db, { name: "小林" });
    dreamerB = await getOrCreateDreamer(db, { name: "小周" });
  });

  afterEach(() => {
    db.close();
  });

  describe("isolation", () => {
    it("listDreams returns empty for dreamer B when dreamer A has dreams", async () => {
      const state = makeDreamState();
      await saveDream(db, { dreamerId: dreamerA.id, ...state });

      const bDreams = await listDreams(db, dreamerB.id);
      expect(bDreams).toHaveLength(0);
    });

    it("getDreamDetail returns null when querying A's dream with B's id", async () => {
      const state = makeDreamState();
      const saved = await saveDream(db, { dreamerId: dreamerA.id, ...state });

      const detail = await getDreamDetail(db, { id: saved.id, dreamerId: dreamerB.id });
      expect(detail).toBeNull();
    });
  });

  describe("saveDream", () => {
    it("saves a dream and returns it with generated fields", async () => {
      const state = makeDreamState();
      const saved = await saveDream(db, { dreamerId: dreamerA.id, ...state });

      expect(saved.id).toBeTruthy();
      expect(saved.dreamerId).toBe(dreamerA.id);
      expect(saved.title).toBe(state.title);
      expect(saved.story).toBe(state.story);
      expect(saved.createdAt).toBeTruthy();
      expect(saved.updatedAt).toBeTruthy();
      expect(saved.dreamDate).toBeTruthy();
    });

    it("round-trips JSON fields correctly", async () => {
      const state = makeDreamState();
      const saved = await saveDream(db, { dreamerId: dreamerA.id, ...state });

      expect(saved.emotionArc).toEqual(state.emotionArc);
      expect(saved.keywords).toEqual(state.keywords);
      expect(saved.symbols).toEqual(state.symbols);
      expect(saved.fragments).toEqual(state.fragments);
      expect(saved.atmosphere).toEqual(state.atmosphere);
    });

    it("returns existing dream on duplicate idempotency key", async () => {
      const state = makeDreamState();
      const saved1 = await saveDream(db, {
        dreamerId: dreamerA.id,
        idempotencyKey: "key-1",
        ...state,
      });

      const saved2 = await saveDream(db, {
        dreamerId: dreamerA.id,
        idempotencyKey: "key-1",
        ...state,
      });

      expect(saved2.id).toBe(saved1.id);

      const allDreams = db
        .prepare("SELECT COUNT(*) as count FROM dreams WHERE dreamer_id = ?")
        .get(dreamerA.id) as { count: number };
      expect(allDreams.count).toBe(1);
    });
  });

  describe("listDreams", () => {
    it("returns dream summaries for the dreamer", async () => {
      const state1 = makeDreamState({ title: "Dream One" });
      const state2 = makeDreamState({ title: "Dream Two" });

      await saveDream(db, { dreamerId: dreamerA.id, ...state1 });
      await saveDream(db, { dreamerId: dreamerA.id, ...state2 });

      const list = await listDreams(db, dreamerA.id);
      expect(list).toHaveLength(2);
      expect(list.map((d) => d.title)).toContain("Dream One");
      expect(list.map((d) => d.title)).toContain("Dream Two");
    });
  });

  describe("getDreamDetail", () => {
    it("returns full dream detail for the correct dreamer", async () => {
      const state = makeDreamState();
      const saved = await saveDream(db, { dreamerId: dreamerA.id, ...state });

      const detail = await getDreamDetail(db, { id: saved.id, dreamerId: dreamerA.id });
      expect(detail).not.toBeNull();
      expect(detail!.title).toBe(state.title);
      expect(detail!.story).toBe(state.story);
      expect(detail!.emotionArc).toEqual(state.emotionArc);
    });

    it("returns null for non-existent id", async () => {
      const detail = await getDreamDetail(db, {
        id: "non-existent",
        dreamerId: dreamerA.id,
      });
      expect(detail).toBeNull();
    });
  });
});
