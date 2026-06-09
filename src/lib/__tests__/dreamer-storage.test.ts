import { describe, it, expect, beforeEach } from "vitest";
import {
  saveCurrentDreamer,
  loadCurrentDreamer,
  clearCurrentDreamer,
} from "../dreamer-storage";
import type { Dreamer } from "@/types/dream";

const mockDreamer: Dreamer = { id: "dreamer-1", name: "阿梦" };

describe("dreamer-storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads current dreamer", () => {
    saveCurrentDreamer(mockDreamer);
    const loaded = loadCurrentDreamer();
    expect(loaded).toEqual(mockDreamer);
  });

  it("returns null when no dreamer is saved", () => {
    const loaded = loadCurrentDreamer();
    expect(loaded).toBeNull();
  });

  it("clears current dreamer", () => {
    saveCurrentDreamer(mockDreamer);
    clearCurrentDreamer();
    const loaded = loadCurrentDreamer();
    expect(loaded).toBeNull();
  });

  it("recovers from invalid JSON and returns null", () => {
    localStorage.setItem("chasing-dream.currentDreamer", "not-json");
    const loaded = loadCurrentDreamer();
    expect(loaded).toBeNull();
  });
});
