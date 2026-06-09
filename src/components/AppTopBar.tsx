"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Save, LogOut } from "lucide-react";
import { IconButton } from "./IconButton";
import { clearCurrentDreamer } from "@/lib/dreamer-storage";

interface AppTopBarProps {
  dreamerName: string;
  canSave: boolean;
  onSave: () => void;
  saving?: boolean;
}

export function AppTopBar({ dreamerName, canSave, onSave, saving }: AppTopBarProps) {
  const handleSwitch = () => {
    clearCurrentDreamer();
    window.location.href = "/";
  };

  return (
    <header
      style={{
        position: "relative",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-quiet-border)",
        background: "var(--color-night-paper)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "14px",
          color: "var(--color-muted-text)",
        }}
      >
        {dreamerName}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link href="/calendar" passHref legacyBehavior>
          <a aria-label="日历">
            <IconButton icon={Calendar} aria-label="日历" />
          </a>
        </Link>
        <IconButton
          icon={Save}
          aria-label="保存梦境"
          disabled={!canSave || saving}
          onClick={onSave}
        />
        <IconButton
          icon={LogOut}
          aria-label="切换梦者"
          type="button"
          onClick={handleSwitch}
        />
      </div>
    </header>
  );
}
