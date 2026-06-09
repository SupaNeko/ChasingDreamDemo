"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import type { SavedDream } from "@/types/dream";

interface DreamDetailProps {
  dream: SavedDream;
}

export function DreamDetail({ dream }: DreamDetailProps) {
  const paletteColors: Record<string, string> = {
    "soft-neutral": "var(--color-night-paper)",
    "warm-dusk": "oklch(22% 0.03 30)",
    "cool-mist": "oklch(22% 0.03 250)",
    "deep-forest": "oklch(18% 0.04 145)",
  };

  const bg = paletteColors[dream.atmosphere?.palette || "soft-neutral"] || paletteColors["soft-neutral"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: "var(--color-ink-gray)",
        padding: "24px",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Link
          href="/calendar"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-muted-text)",
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} />
          日历
        </Link>
        <Link
          href="/dream"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-muted-text)",
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          <PenLine size={16} />
          梦舱
        </Link>
      </nav>

      <article style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            marginBottom: "8px",
            color: "var(--color-warm-candle)",
          }}
        >
          {dream.title}
        </h1>
        {dream.primaryEmotion && (
          <p style={{ color: "var(--color-rose-shadow)", fontSize: "14px", marginBottom: "24px" }}>
            主导情绪：{dream.primaryEmotion}
            {typeof dream.emotionIntensity === "number" && (
              <span style={{ marginLeft: 8, color: "var(--color-muted-text)" }}>
                强度 {Math.round(dream.emotionIntensity * 100)}%
              </span>
            )}
          </p>
        )}

        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            lineHeight: 1.8,
            marginBottom: "32px",
            whiteSpace: "pre-wrap",
          }}
        >
          {dream.story}
        </div>

        {dream.gentleReflection && (
          <blockquote
            style={{
              borderLeft: "3px solid var(--color-warm-candle)",
              paddingLeft: "16px",
              marginBottom: "32px",
              color: "var(--color-muted-text)",
              fontStyle: "italic",
            }}
          >
            {dream.gentleReflection}
          </blockquote>
        )}

        {dream.keywords.length > 0 && (
          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "14px", color: "var(--color-muted-text)", marginBottom: "10px" }}>
              关键词
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {dream.keywords.map((k) => (
                <span
                  key={`${k.text}-${k.type}`}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "1px solid var(--color-quiet-border)",
                    fontSize: "13px",
                    color: "var(--color-ink-gray)",
                  }}
                >
                  {k.text}
                </span>
              ))}
            </div>
          </section>
        )}

        {dream.symbols.length > 0 && (
          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "14px", color: "var(--color-muted-text)", marginBottom: "10px" }}>
              象征
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {dream.symbols.map((s) => (
                <span
                  key={s}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "1px solid var(--color-quiet-border)",
                    fontSize: "13px",
                    color: "var(--color-ink-gray)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {dream.fragments.length > 0 && (
          <section>
            <h2 style={{ fontSize: "14px", color: "var(--color-muted-text)", marginBottom: "10px" }}>
              原始碎片
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {dream.fragments.map((f) => (
                <li
                  key={f.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-quiet-border)",
                    fontSize: "14px",
                  }}
                >
                  {f.content}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
