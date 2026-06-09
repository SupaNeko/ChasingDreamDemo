"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DreamSummary } from "@/types/dream";

interface CalendarMonthProps {
  dreams: DreamSummary[];
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function CalendarMonth({
  dreams,
  onSelectDate,
  selectedDate,
}: CalendarMonthProps) {
  const [current, setCurrent] = useState(() => new Date());
  const year = current.getFullYear();
  const month = current.getMonth();

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of dreams) {
      map.set(d.dreamDate, (map.get(d.dreamDate) || 0) + 1);
    }
    return map;
  }, [dreams]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          onClick={prevMonth}
          aria-label="上个月"
          style={{
            background: "none",
            border: "none",
            color: "var(--color-ink-gray)",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            color: "var(--color-ink-gray)",
          }}
        >
          {year}年{month + 1}月
        </h2>
        <button
          onClick={nextMonth}
          aria-label="下个月"
          style={{
            background: "none",
            border: "none",
            color: "var(--color-ink-gray)",
            cursor: "pointer",
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
          textAlign: "center",
        }}
      >
        {weekDays.map((w) => (
          <div
            key={w}
            style={{
              fontSize: "13px",
              color: "var(--color-muted-text)",
              padding: "8px 0",
            }}
          >
            {w}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateKey = formatDateKey(year, month, day);
          const count = countsByDate.get(dateKey) || 0;
          const hasDreams = count > 0;
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              onClick={() => hasDreams && onSelectDate(dateKey)}
              aria-label={`${dateKey}${hasDreams ? ` 有${count}个梦境` : ""}`}
              disabled={!hasDreams}
              style={{
                padding: "10px 0",
                borderRadius: "var(--radius-md)",
                border: isSelected
                  ? "1px solid var(--color-warm-candle)"
                  : "1px solid transparent",
                background: isSelected
                  ? "rgba(201, 169, 110, 0.15)"
                  : "transparent",
                color: hasDreams
                  ? "var(--color-ink-gray)"
                  : "var(--color-muted-text)",
                cursor: hasDreams ? "pointer" : "default",
                fontSize: "14px",
                position: "relative",
              }}
            >
              {day}
              {hasDreams && (
                <span
                  style={{
                    display: "block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--color-warm-candle)",
                    margin: "4px auto 0",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {dreams.length === 0 && (
        <p
          style={{
            textAlign: "center",
            color: "var(--color-muted-text)",
            marginTop: 24,
            fontSize: "14px",
          }}
        >
          还没有梦境记录
        </p>
      )}
    </div>
  );
}
