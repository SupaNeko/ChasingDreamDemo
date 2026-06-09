import type { Dreamer } from "@/types/dream";

const STORAGE_KEY = "chasing-dream.currentDreamer";

export function saveCurrentDreamer(dreamer: Dreamer): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dreamer));
  } catch {
    // Ignore localStorage errors (e.g., quota exceeded)
  }
}

export function loadCurrentDreamer(): Dreamer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "id" in parsed &&
      "name" in parsed &&
      typeof (parsed as Record<string, unknown>).id === "string" &&
      typeof (parsed as Record<string, unknown>).name === "string"
    ) {
      return parsed as Dreamer;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearCurrentDreamer(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
