"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppTopBar } from "@/components/AppTopBar";
import { DreamStoryPanel } from "@/components/DreamStoryPanel";
import { InputBar } from "@/components/InputBar";
import { KeywordBubble } from "@/components/KeywordBubble";
import { FragmentDrawer } from "@/components/FragmentDrawer";
import { loadCurrentDreamer } from "@/lib/dreamer-storage";
import { runDreamAgent, saveDream } from "@/lib/client-api";
import type { DreamState, Dreamer } from "@/types/dream";

function loadResumeState(): { state: DreamState; sourceDreamId?: string } | null {
  try {
    const raw = sessionStorage.getItem("chasing-dream.resumeState");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    sessionStorage.removeItem("chasing-dream.resumeState");
    if (
      parsed &&
      typeof parsed === "object" &&
      "state" in parsed &&
      parsed.state &&
      typeof parsed.state === "object" &&
      "story" in parsed.state &&
      typeof (parsed.state as Record<string, unknown>).story === "string"
    ) {
      return {
        state: parsed.state as DreamState,
        sourceDreamId:
          "sourceDreamId" in parsed &&
          typeof parsed.sourceDreamId === "string"
            ? parsed.sourceDreamId
            : undefined,
      };
    }
  } catch {
    // ignore parse error
  }
  return null;
}

const emptyState: DreamState = {
  title: "",
  story: "",
  emotionArc: [],
  keywords: [],
  symbols: [],
  followUpQuestion: "",
  fragments: [],
};

export default function DreamPage() {
  const router = useRouter();
  const resumed = loadResumeState();
  const [dreamer, setDreamer] = useState<Dreamer | null>(null);
  const [state, setState] = useState<DreamState>(resumed?.state ?? emptyState);
  const [sessionKey] = useState(() => resumed?.sourceDreamId ?? crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadCurrentDreamer();
    if (!d) {
      router.replace("/");
      return;
    }
    setDreamer(d);
  }, [router]);

  const autoSave = useCallback(
    async (nextState: DreamState) => {
      if (!dreamer || !nextState.story || !nextState.title) return;
      setSaving(true);
      await saveDream(dreamer.id, nextState, sessionKey, sessionKey);
      setSaving(false);
      // Auto-save is silent; do not show "saved" toast
    },
    [dreamer, sessionKey]
  );

  const handleSend = useCallback(
    async (content: string, inputType: "text" | "voice") => {
      if (!dreamer) return;
      setLoading(true);
      setError(null);
      const result = await runDreamAgent({
        dreamerName: dreamer.name,
        currentState: state.story ? state : null,
        fragment: { content, inputType },
      });
      setLoading(false);
      if (result.ok) {
        setState(result.data.state);
        await autoSave(result.data.state);
      } else {
        setError(result.error.error.message);
      }
    },
    [dreamer, state, autoSave]
  );

  const handleSave = useCallback(async () => {
    if (!dreamer || !state.story || !state.title) return;
    setSaving(true);
    setSaveStatus("idle");
    const result = await saveDream(dreamer.id, state, sessionKey, sessionKey);
    setSaving(false);
    if (result.ok) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
      setError(result.error.error.message);
    }
  }, [dreamer, state, sessionKey]);

  if (!dreamer) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-muted-text)",
        }}
      >
        正在进入梦舱…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-night-paper)",
        position: "relative",
      }}
    >
      <AppTopBar
        dreamerName={dreamer.name}
        canSave={!!state.story && !!state.title}
        onSave={handleSave}
        saving={saving}
      />
      {saveStatus === "success" && (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-warm-candle)",
            color: "var(--color-night-paper)",
            fontSize: "14px",
            zIndex: 20,
          }}
        >
          已保存
        </div>
      )}
      <main
        style={{
          flex: 1,
          position: "relative",
          overflowY: "auto",
          paddingBottom: 80,
        }}
      >
        <DreamStoryPanel story={state.story} />
        {state.followUpQuestion && (
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              padding: "0 24px 24px",
              textAlign: "center",
              color: "var(--color-muted-text)",
              fontSize: "15px",
              lineHeight: 1.7,
              fontStyle: "italic",
            }}
          >
            {state.followUpQuestion}
          </div>
        )}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              color: "var(--color-muted-text)",
              fontSize: "14px",
            }}
          >
            正在拼合…
          </div>
        )}
        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "8px 16px",
              color: "var(--color-error)",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}
      </main>
      <KeywordBubble keywords={state.keywords} />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <InputBar onSend={handleSend} loading={loading} />
      </div>
      <FragmentDrawer fragments={state.fragments} />
    </div>
  );
}
