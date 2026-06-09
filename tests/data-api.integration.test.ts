import Database from "better-sqlite3";
import { migrate } from "@/server/db/migrate";
import { setDb } from "@/server/db/connection";
import { POST as postDreamers } from "@/app/api/dreamers/route";
import { POST as postDreams, GET as getDreams } from "@/app/api/dreams/route";
import { GET as getDreamDetail } from "@/app/api/dreams/[id]/route";

describe("Data API Integration", () => {
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

  it("exercises the full dream lifecycle with isolation", async () => {
    // 1. Create 小林
    const xiaolinRes = await postDreamers(
      new Request("http://localhost/api/dreamers", {
        method: "POST",
        body: JSON.stringify({ name: "小林" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(xiaolinRes.status).toBe(200);
    const xiaolin = await xiaolinRes.json();
    expect(xiaolin.name).toBe("小林");

    // 2. Save a dream for 小林
    const dreamState = {
      title: "Mountain Flight",
      story: "I soared above snowy peaks.",
      primaryEmotion: "wonder",
      emotionIntensity: 0.9,
      emotionArc: ["calm", "awe", "joy"],
      keywords: [
        { text: "mountain", type: "place" as const, weight: 0.95 },
        { text: "flight", type: "action" as const, weight: 0.88 },
      ],
      symbols: ["eagle", "snow"],
      gentleReflection: "A journey of freedom.",
      followUpQuestion: "What did the snow feel like?",
      atmosphere: { palette: "white", motion: "soaring", density: 0.3 },
      fragments: [
        {
          id: "frag-1",
          content: "soaring",
          inputType: "text" as const,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const saveRes = await postDreams(
      new Request("http://localhost/api/dreams", {
        method: "POST",
        body: JSON.stringify({
          dreamerId: xiaolin.id,
          state: dreamState,
        }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(saveRes.status).toBe(200);
    const savedDream = await saveRes.json();
    expect(savedDream.title).toBe("Mountain Flight");
    expect(savedDream.dreamerId).toBe(xiaolin.id);
    expect(savedDream.emotionArc).toEqual(["calm", "awe", "joy"]);
    expect(savedDream.keywords).toEqual(dreamState.keywords);

    // 3. List dreams for 小林
    const listRes = await getDreams(
      new Request(`http://localhost/api/dreams?dreamerId=${xiaolin.id}`)
    );
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Mountain Flight");

    // 4. Get dream detail for 小林
    const detailRes = await getDreamDetail(
      new Request(
        `http://localhost/api/dreams/${savedDream.id}?dreamerId=${xiaolin.id}`
      ),
      { params: Promise.resolve({ id: savedDream.id }) }
    );
    expect(detailRes.status).toBe(200);
    const detail = await detailRes.json();
    expect(detail.title).toBe("Mountain Flight");
    expect(detail.story).toBe("I soared above snowy peaks.");

    // 5. Create 小周
    const xiaozhouRes = await postDreamers(
      new Request("http://localhost/api/dreamers", {
        method: "POST",
        body: JSON.stringify({ name: "小周" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(xiaozhouRes.status).toBe(200);
    const xiaozhou = await xiaozhouRes.json();

    // 6. Prove 小周 cannot access 小林's dream
    const crossRes = await getDreamDetail(
      new Request(
        `http://localhost/api/dreams/${savedDream.id}?dreamerId=${xiaozhou.id}`
      ),
      { params: Promise.resolve({ id: savedDream.id }) }
    );
    expect(crossRes.status).toBe(404);
    const crossBody = await crossRes.json();
    expect(crossBody.error.code).toBe("NOT_FOUND");

    // 7. Prove 小周's list is empty
    const xiaozhouListRes = await getDreams(
      new Request(`http://localhost/api/dreams?dreamerId=${xiaozhou.id}`)
    );
    expect(xiaozhouListRes.status).toBe(200);
    const xiaozhouList = await xiaozhouListRes.json();
    expect(xiaozhouList).toHaveLength(0);
  });
});
