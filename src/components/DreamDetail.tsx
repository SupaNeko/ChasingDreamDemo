"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PenLine, Sparkles } from "lucide-react";
import type { SavedDream } from "@/types/dream";

interface DreamDetailProps {
  dream: SavedDream;
}

export function DreamDetail({ dream }: DreamDetailProps) {
  const router = useRouter();

  const paletteColors: Record<string, string> = {
    "soft-neutral": "var(--color-night-paper)",
    "warm-dusk": "oklch(22% 0.03 30)",
    "cool-mist": "oklch(22% 0.03 250)",
    "deep-forest": "oklch(18% 0.04 145)",
  };

  const bg = paletteColors[dream.atmosphere?.palette || "soft-neutral"] || paletteColors["soft-neutral"];

  const handleResumeToDream = () => {
    const state = {
      title: dream.title,
      story: dream.story,
      primaryEmotion: dream.primaryEmotion,
      emotionIntensity: dream.emotionIntensity,
      emotionArc: dream.emotionArc,
      keywords: dream.keywords,
      symbols: dream.symbols,
      gentleReflection: dream.gentleReflection,
      followUpQuestion: dream.followUpQuestion,
      atmosphere: dream.atmosphere,
      fragments: dream.fragments,
    };
    sessionStorage.setItem(
      "chasing-dream.resumeState",
      JSON.stringify({ state, sourceDreamId: dream.id })
    );
    router.push("/dream");
  };

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

        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--color-quiet-border)", textAlign: "center" }}>
          <button
            onClick={handleResumeToDream}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--color-warm-candle)",
              color: "var(--color-night-paper)",
              fontSize: "16px",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = "1"; }}
          >
            <Sparkles size={18} />
            放入梦仓继续修改
          </button>
          <p style={{ marginTop: "10px", fontSize: "13px", color: "var(--color-muted-text)" }}>
            你可以在梦舱继续补充新的梦境碎片
          </p>
        </div>
      </article>
    </div>
  );
}
