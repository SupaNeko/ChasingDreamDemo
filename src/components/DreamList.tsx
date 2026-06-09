"use client";

import React from "react";
import Link from "next/link";
import type { DreamSummary } from "@/types/dream";

interface DreamListProps {
  dreams: DreamSummary[];
}

export function DreamList({ dreams }: DreamListProps) {
  if (dreams.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "16px",
          color: "var(--color-ink-gray)",
          marginBottom: 12,
        }}
      >
        当日梦境
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {dreams.map((d) => (
          <li key={d.id}>
            <Link
              href={`/dreams/${d.id}`}
              style={{
                display: "block",
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-quiet-border)",
                background: "var(--color-surface)",
                color: "var(--color-ink-gray)",
                textDecoration: "none",
                transition: "background var(--duration-fast) var(--easing-default)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "15px",
                  }}
                >
                  {d.title}
                </span>
                {d.primaryEmotion && (
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--color-muted-text)",
                    }}
                  >
                    {d.primaryEmotion}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
