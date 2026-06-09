import Database from "better-sqlite3";
import { migrate } from "@/server/db/migrate";
import { setDb } from "@/server/db/connection";
import { POST as postDreamers } from "@/app/api/dreamers/route";
import { POST as postDreams, GET as getDreams } from "@/app/api/dreams/route";
import { GET as getDreamDetail } from "@/app/api/dreams/[id]/route";

describe("route handlers", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    migrate(db);
    setDb(db);
  });

  afterEach(() => {
    db.close();
    setDb(null);
  });

  describe("POST /api/dreamers", () => {
    it("creates a dreamer successfully", async () => {
      const request = new Request("http://localhost/api/dreamers", {
        method: "POST",
        body: JSON.stringify({ name: "小林" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await postDreamers(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.name).toBe("小林");
      expect(body.id).toBeTruthy();
    });

    it("returns 400 for invalid name", async () => {
      const request = new Request("http://localhost/api/dreamers", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await postDreamers(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/dreams", () => {
    it("saves a dream successfully", async () => {
      const dreamerRes = await postDreamers(
        new Request("http://localhost/api/dreamers", {
          method: "POST",
          body: JSON.stringify({ name: "小林" }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const dreamer = await dreamerRes.json();

      const request = new Request("http://localhost/api/dreams", {
        method: "POST",
        body: JSON.stringify({
          dreamerId: dreamer.id,
          state: {
            title: "Flying Dream",
            story: "I flew over mountains.",
            emotionArc: ["calm", "excitement"],
            keywords: [{ text: "mountain", type: "place", weight: 0.9 }],
            symbols: ["eagle"],
            followUpQuestion: "How high?",
            fragments: [
              { id: "f1", content: "flying", inputType: "text", createdAt: new Date().toISOString() },
            ],
          },
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await postDreams(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.title).toBe("Flying Dream");
      expect(body.dreamerId).toBe(dreamer.id);
    });
  });

  describe("GET /api/dreams", () => {
    it("lists only current dreamer's dreams", async () => {
      const d1Res = await postDreamers(
        new Request("http://localhost/api/dreamers", {
          method: "POST",
          body: JSON.stringify({ name: "小林" }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const d1 = await d1Res.json();

      const d2Res = await postDreamers(
        new Request("http://localhost/api/dreamers", {
          method: "POST",
          body: JSON.stringify({ name: "小周" }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const d2 = await d2Res.json();

      // Save dream for d1
      await postDreams(
        new Request("http://localhost/api/dreams", {
          method: "POST",
          body: JSON.stringify({
            dreamerId: d1.id,
            state: {
              title: "D1 Dream",
              story: "...",
              emotionArc: [],
              keywords: [],
              symbols: [],
              followUpQuestion: "?",
              fragments: [],
            },
          }),
          headers: { "Content-Type": "application/json" },
        })
      );

      const response = await getDreams(
        new Request(`http://localhost/api/dreams?dreamerId=${d2.id}`)
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toHaveLength(0);
    });
  });

  describe("GET /api/dreams/[id]", () => {
    it("returns dream detail for correct dreamer", async () => {
      const d1Res = await postDreamers(
        new Request("http://localhost/api/dreamers", {
          method: "POST",
          body: JSON.stringify({ name: "小林" }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const d1 = await d1Res.json();

      const dreamRes = await postDreams(
        new Request("http://localhost/api/dreams", {
          method: "POST",
          body: JSON.stringify({
            dreamerId: d1.id,
            state: {
              title: "D1 Dream",
              story: "...",
              emotionArc: [],
              keywords: [],
              symbols: [],
              followUpQuestion: "?",
              fragments: [],
            },
          }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const dream = await dreamRes.json();

      const response = await getDreamDetail(
        new Request(`http://localhost/api/dreams/${dream.id}?dreamerId=${d1.id}`),
        { params: Promise.resolve({ id: dream.id }) }
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.title).toBe("D1 Dream");
    });

    it("returns 404 for cross-dreamer access", async () => {
      const d1Res = await postDreamers(
        new Request("http://localhost/api/dreamers", {
          method: "POST",
          body: JSON.stringify({ name: "小林" }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const d1 = await d1Res.json();

      const d2Res = await postDreamers(
        new Request("http://localhost/api/dreamers", {
          method: "POST",
          body: JSON.stringify({ name: "小周" }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const d2 = await d2Res.json();

      const dreamRes = await postDreams(
        new Request("http://localhost/api/dreams", {
          method: "POST",
          body: JSON.stringify({
            dreamerId: d1.id,
            state: {
              title: "D1 Dream",
              story: "...",
              emotionArc: [],
              keywords: [],
              symbols: [],
              followUpQuestion: "?",
              fragments: [],
            },
          }),
          headers: { "Content-Type": "application/json" },
        })
      );
      const dream = await dreamRes.json();

      const response = await getDreamDetail(
        new Request(`http://localhost/api/dreams/${dream.id}?dreamerId=${d2.id}`),
        { params: Promise.resolve({ id: dream.id }) }
      );
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error.code).toBe("NOT_FOUND");
    });
  });
});
