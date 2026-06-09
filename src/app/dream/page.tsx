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
  const [dreamer, setDreamer] = useState<Dreamer | null>(null);
  const [state, setState] = useState<DreamState>(emptyState);
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
      } else {
        setError(result.error.error.message);
      }
    },
    [dreamer, state]
  );

  const handleSave = useCallback(async () => {
    if (!dreamer || !state.story || !state.title) return;
    setSaving(true);
    setSaveStatus("idle");
    const idempotencyKey = crypto.randomUUID();
    const result = await saveDream(dreamer.id, state, idempotencyKey);
    setSaving(false);
    if (result.ok) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
      setError(result.error.error.message);
    }
  }, [dreamer, state]);

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
        <KeywordBubble keywords={state.keywords} />
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
