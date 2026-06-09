"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Save, LogOut } from "lucide-react";
import { IconButton } from "./IconButton";
import { clearCurrentDreamer } from "@/lib/dreamer-storage";
import { useRouter } from "next/navigation";

interface AppTopBarProps {
  dreamerName: string;
  canSave: boolean;
  onSave: () => void;
  saving?: boolean;
}

export function AppTopBar({ dreamerName, canSave, onSave, saving }: AppTopBarProps) {
  const router = useRouter();

  const handleSwitch = () => {
    clearCurrentDreamer();
    router.push("/");
  };

  return (
    <header
      style={{
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
          onClick={handleSwitch}
        />
      </div>
    </header>
  );
}
