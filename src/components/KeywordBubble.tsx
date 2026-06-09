"use client";

import React, { useMemo } from "react";
import type { DreamKeyword } from "@/types/dream";

interface KeywordBubbleProps {
  keywords: DreamKeyword[];
}

function getBubbleGradient(type: DreamKeyword["type"]): string {
  switch (type) {
    case "emotion":
      return "radial-gradient(circle at 35% 35%, rgba(255,160,160,0.28), rgba(180,90,110,0.08))";
    case "person":
      return "radial-gradient(circle at 35% 35%, rgba(160,200,255,0.28), rgba(90,130,180,0.08))";
    case "place":
      return "radial-gradient(circle at 35% 35%, rgba(160,220,180,0.28), rgba(90,150,120,0.08))";
    case "color":
      return "radial-gradient(circle at 35% 35%, rgba(255,220,140,0.28), rgba(200,170,90,0.08))";
    case "action":
      return "radial-gradient(circle at 35% 35%, rgba(200,170,255,0.28), rgba(140,110,180,0.08))";
    case "symbol":
      return "radial-gradient(circle at 35% 35%, rgba(255,200,160,0.28), rgba(180,140,90,0.08))";
    default:
      return "radial-gradient(circle at 35% 35%, rgba(180,190,210,0.25), rgba(120,130,150,0.06))";
  }
}

function getGlowColor(type: DreamKeyword["type"]): string {
  switch (type) {
    case "emotion": return "rgba(255,160,160,0.35)";
    case "person": return "rgba(160,200,255,0.35)";
    case "place": return "rgba(160,220,180,0.35)";
    case "color": return "rgba(255,220,140,0.35)";
    case "action": return "rgba(200,170,255,0.35)";
    case "symbol": return "rgba(255,200,160,0.35)";
    default: return "rgba(180,190,210,0.3)";
  }
}

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const x = Math.sin(h) * 10000;
  return x - Math.floor(x);
}

export function KeywordBubble({ keywords }: KeywordBubbleProps) {
  const bubbles = useMemo(() => {
    const left: Array<ReturnType<typeof makeBubble>> = [];
    const right: Array<ReturnType<typeof makeBubble>> = [];

    function makeBubble(k: DreamKeyword, i: number, side: "left" | "right") {
      const baseSize = 40 + k.weight * 60;
      const rand = seededRandom(`${k.text}-${i}-${side}`);
      const fluctuation = 0.75 + rand * 0.5;
      const size = Math.round(baseSize * fluctuation);
      const phase = seededRandom(`${k.text}-phase-${side}`) * 6;
      const sideJitter = seededRandom(`${k.text}-x-${side}`) * 60;
      return {
        ...k,
        size,
        side,
        sideJitter,
        phase,
        top: 0,
      };
    }

    keywords.forEach((k, i) => {
      if (i % 2 === 0) left.push(makeBubble(k, i, "left"));
      else right.push(makeBubble(k, i, "right"));
    });

    // Distribute evenly across full viewport height (10% - 85%)
    // to avoid overlaps, with a small random jitter
    function distribute(list: Array<ReturnType<typeof makeBubble>>, offsetRatio: number) {
      const count = list.length;
      if (count === 0) return;
      const usableHeight = 0.75; // 10% - 85%
      const step = usableHeight / Math.max(count, 1);
      list.forEach((b, idx) => {
        const base = 0.12 + idx * step + offsetRatio * step;
        const jitter = (seededRandom(`${b.text}-y`) - 0.5) * step * 0.5;
        b.top = Math.max(0.08, Math.min(0.82, base + jitter)) * 100;
      });
    }

    distribute(left, 0);
    distribute(right, 0.5); // staggered between left bubbles

    return [...left, ...right];
  }, [keywords]);

  if (bubbles.length === 0) return null;

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 56, // below top bar
          left: 0,
          right: 0,
          bottom: 72, // above input bar
          pointerEvents: "none",
          zIndex: 5,
          overflow: "hidden",
        }}
      >
        {bubbles.map((b) => (
          <span
            key={`${b.text}-${b.type}`}
            className="keyword-bubble"
            style={{
              position: "absolute",
              top: `${b.top}%`,
              [b.side]: `${6 + b.sideJitter * 0.35}%`,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              background: getBubbleGradient(b.type),
              boxShadow: `
                inset -3px -3px 8px rgba(255,255,255,0.15),
                inset 3px 3px 8px rgba(255,255,255,0.05),
                0 0 18px ${getGlowColor(b.type)},
                0 4px 12px rgba(0,0,0,0.25)
              `,
              color: "rgba(255,255,255,0.9)",
              fontSize: Math.max(11, Math.round(b.size * 0.22)),
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 4,
              lineHeight: 1.2,
              animationDelay: `${b.phase}s`,
              wordBreak: "break-all",
            }}
          >
            {b.text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes bubble-float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          33% {
            transform: translateY(-10px) scale(1.03);
          }
          66% {
            transform: translateY(-4px) scale(0.98);
          }
        }
        .keyword-bubble {
          animation: bubble-float 5s ease-in-out infinite;
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
