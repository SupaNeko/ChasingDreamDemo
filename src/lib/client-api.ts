import type {
  Dreamer,
  DreamState,
  DreamSummary,
  SavedDream,
  InputType,
  ApiError,
} from "@/types/dream";

const API_BASE = "";

async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    let data: unknown;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { error: { code: "UNKNOWN", message: await res.text() } };
    }
    if (!res.ok) {
      const error =
        data && typeof data === "object" && "error" in data
          ? (data as ApiError)
          : { error: { code: "HTTP_ERROR", message: `HTTP ${res.status}` } };
      return { ok: false, error };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    return {
      ok: false,
      error: {
        error: {
          code: "NETWORK_ERROR",
          message:
            err instanceof Error ? err.message : "网络请求失败，请稍后重试",
        },
      },
    };
  }
}

export async function getOrCreateDreamer(
  name: string
): Promise<{ ok: true; data: Dreamer } | { ok: false; error: ApiError }> {
  return safeFetch<Dreamer>(`${API_BASE}/api/dreamers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function runDreamAgent(request: {
  dreamerName: string;
  currentState: Partial<DreamState> | null;
  fragment: { content: string; inputType: InputType };
}): Promise<{ ok: true; data: { state: DreamState } } | { ok: false; error: ApiError }> {
  return safeFetch<{ state: DreamState }>(`${API_BASE}/api/dream-agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export async function saveDream(
  dreamerId: string,
  state: DreamState,
  idempotencyKey?: string,
  sourceDreamId?: string
): Promise<{ ok: true; data: SavedDream } | { ok: false; error: ApiError }> {
  return safeFetch<SavedDream>(`${API_BASE}/api/dreams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dreamerId, state, idempotencyKey, sourceDreamId }),
  });
}

export async function listDreams(
  dreamerId: string
): Promise<{ ok: true; data: DreamSummary[] } | { ok: false; error: ApiError }> {
  return safeFetch<DreamSummary[]>(
    `${API_BASE}/api/dreams?dreamerId=${encodeURIComponent(dreamerId)}`
  );
}

export async function getDreamDetail(
  dreamerId: string,
  id: string
): Promise<{ ok: true; data: SavedDream } | { ok: false; error: ApiError }> {
  return safeFetch<SavedDream>(
    `${API_BASE}/api/dreams/${encodeURIComponent(id)}?dreamerId=${encodeURIComponent(dreamerId)}`
  );
}
