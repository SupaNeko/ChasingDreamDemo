"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarMonth } from "@/components/CalendarMonth";
import { DreamList } from "@/components/DreamList";
import { loadCurrentDreamer } from "@/lib/dreamer-storage";
import { listDreams } from "@/lib/client-api";
import type { DreamSummary, Dreamer } from "@/types/dream";

export default function CalendarPage() {
  const router = useRouter();
  const [dreamer, setDreamer] = useState<Dreamer | null>(null);
  const [dreams, setDreams] = useState<DreamSummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadCurrentDreamer();
    if (!d) {
      router.replace("/");
      return;
    }
    setDreamer(d);
    listDreams(d.id).then((res) => {
      setLoading(false);
      if (res.ok) {
        setDreams(res.data);
      } else {
        setError(res.error.error.message);
      }
    });
  }, [router]);

  const selectedDreams = useMemo(() => {
    if (!selectedDate) return [];
    return dreams.filter((d) => d.dreamDate === selectedDate);
  }, [dreams, selectedDate]);

  if (!dreamer) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-muted-text)",
          background: "var(--color-night-paper)",
        }}
      >
        正在加载…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-night-paper)",
        color: "var(--color-ink-gray)",
        padding: "24px 16px",
      }}
    >
      <header
        style={{
          maxWidth: 420,
          margin: "0 auto 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px",
            color: "var(--color-warm-candle)",
          }}
        >
          梦境日历
        </h1>
        <button
          onClick={() => router.push("/dream")}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted-text)",
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          返回梦舱
        </button>
      </header>

      {loading && (
        <p style={{ textAlign: "center", color: "var(--color-muted-text)" }}>
          正在加载梦境…
        </p>
      )}
      {error && (
        <p style={{ textAlign: "center", color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      <CalendarMonth
        dreams={dreams}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />

      {selectedDate && <DreamList dreams={selectedDreams} />}
    </div>
  );
}
