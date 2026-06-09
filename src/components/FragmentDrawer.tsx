"use client";

import React, { useState } from "react";
import { Menu, Type, Mic } from "lucide-react";
import type { FragmentInput } from "@/types/dream";

interface FragmentDrawerProps {
  fragments: FragmentInput[];
}

export function FragmentDrawer({ fragments }: FragmentDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        height: "100%",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "关闭碎片抽屉" : "打开碎片抽屉"}
        aria-expanded={open}
        style={{
          width: 44,
          height: 44,
          marginTop: 60,
          marginRight: 8,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-quiet-border)",
          background: "var(--color-surface)",
          color: "var(--color-ink-gray)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Menu size={20} />
      </button>
      {open && (
        <div
          style={{
            width: 280,
            height: "calc(100% - 60px)",
            background: "var(--color-surface)",
            borderLeft: "1px solid var(--color-quiet-border)",
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              marginBottom: "16px",
              color: "var(--color-ink-gray)",
            }}
          >
            梦境碎片
          </h3>
          {fragments.length === 0 && (
            <p style={{ color: "var(--color-muted-text)", fontSize: "14px" }}>
              还没有记录任何碎片
            </p>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {fragments.map((f) => (
              <li
                key={f.id}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-quiet-border)",
                  background: "var(--color-night-paper)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                    color: "var(--color-muted-text)",
                    fontSize: "12px",
                  }}
                >
                  {f.inputType === "text" ? <Type size={14} /> : <Mic size={14} />}
                  <span>{new Date(f.createdAt).toLocaleString("zh-CN")}</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--color-ink-gray)", margin: 0 }}>
                  {f.content}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
