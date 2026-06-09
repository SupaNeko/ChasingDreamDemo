"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import {
  saveCurrentDreamer,
  loadCurrentDreamer,
} from "@/lib/dreamer-storage";
import { getOrCreateDreamer } from "@/lib/client-api";

export function LaunchForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousDreamer, setPreviousDreamer] = useState<
    ReturnType<typeof loadCurrentDreamer>
  >(null);

  useEffect(() => {
    setPreviousDreamer(loadCurrentDreamer());
  }, []);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 24;
  const isTooLong = trimmed.length > 24;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    const result = await getOrCreateDreamer(trimmed);
    if (result.ok) {
      saveCurrentDreamer(result.data);
      router.push("/dream");
    } else {
      setError(result.error.error.message);
      setLoading(false);
    }
  };

  const handleResume = () => {
    if (previousDreamer) {
      router.push("/dream");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--color-night-paper)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "48px",
          color: "var(--color-warm-candle)",
          marginBottom: "8px",
          letterSpacing: "0.1em",
        }}
      >
        巡梦
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          color: "var(--color-muted-text)",
          marginBottom: "40px",
        }}
      >
        把梦境碎片温柔拼回来
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <input
          type="text"
          placeholder="你的名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          aria-label="你的名字"
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: "18px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-quiet-border)",
            background: "var(--color-surface)",
            color: "var(--color-ink-gray)",
            outline: "none",
          }}
        />
        {isTooLong && (
          <span
            style={{
              color: "var(--color-error)",
              fontSize: "14px",
            }}
          >
            名字不超过24个字符
          </span>
        )}
        {error && (
          <span
            style={{
              color: "var(--color-error)",
              fontSize: "14px",
            }}
          >
            {error}
          </span>
        )}
        <Button variant="primary" loading={loading} disabled={!isValid}>
          {loading ? "正在进入…" : "进入梦境"}
        </Button>
      </form>

      {previousDreamer && (
        <button
          onClick={handleResume}
          style={{
            marginTop: "24px",
            background: "none",
            border: "none",
            color: "var(--color-muted-text)",
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          继续以 {previousDreamer.name} 进入
        </button>
      )}
    </div>
  );
}
