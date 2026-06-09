"use client";

import React from "react";

interface DreamStoryPanelProps {
  story?: string;
}

export function DreamStoryPanel({ story }: DreamStoryPanelProps) {
  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "32px 24px",
        fontFamily: "var(--font-display)",
        fontSize: "20px",
        lineHeight: 1.8,
        color: "var(--color-ink-gray)",
        textAlign: "center",
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {story ? (
        <p style={{ whiteSpace: "pre-wrap" }}>{story}</p>
      ) : (
        <p
          style={{
            color: "var(--color-muted-text)",
            fontStyle: "italic",
            fontSize: "18px",
          }}
        >
          讲述你的梦境碎片，巡梦员会帮你温柔地拼起来…
        </p>
      )}
    </div>
  );
}
