"use client";

import React, { useMemo } from "react";
import type { DreamKeyword } from "@/types/dream";

function getKeywordColor(type: DreamKeyword["type"]): string {
  switch (type) {
    case "emotion":
      return "var(--color-rose-shadow)";
    case "place":
      return "var(--color-blue-mist)";
    case "color":
      return "var(--color-warm-candle)";
    default:
      return "var(--color-muted-text)";
  }
}

function stableRandom(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

interface KeywordBubbleProps {
  keywords: DreamKeyword[];
}

export function KeywordBubble({ keywords }: KeywordBubbleProps) {
  const positioned = useMemo(() => {
    return keywords.map((k, i) => {
      const top = 10 + stableRandom(`${k.text}-t`, 80);
      const left = 5 + stableRandom(`${k.text}-l`, 90);
      const delay = stableRandom(`${k.text}-d`, 10);
      return { ...k, top, left, delay };
    });
  }, [keywords]);

  return (
    <>
      {positioned.map((k) => (
        <span
          key={`${k.text}-${k.type}`}
          className="keyword-bubble"
          style={{
            position: "absolute",
            top: `${k.top}%`,
            left: `${k.left}%`,
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(34, 37, 46, 0.7)",
            color: getKeywordColor(k.type),
            fontSize: "13px",
            fontFamily: "var(--font-body)",
            border: `1px solid ${getKeywordColor(k.type)}33`,
            pointerEvents: "none",
            animationDelay: `${k.delay}s`,
            zIndex: 1,
          }}
        >
          {k.text}
        </span>
      ))}
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .keyword-bubble {
          animation: drift 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .keyword-bubble {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
