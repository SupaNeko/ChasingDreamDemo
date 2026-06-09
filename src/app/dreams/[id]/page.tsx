"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DreamDetail } from "@/components/DreamDetail";
import { loadCurrentDreamer } from "@/lib/dreamer-storage";
import { getDreamDetail } from "@/lib/client-api";
import type { SavedDream, Dreamer } from "@/types/dream";

export default function DreamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [dreamer, setDreamer] = useState<Dreamer | null>(null);
  const [dream, setDream] = useState<SavedDream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadCurrentDreamer();
    if (!d) {
      router.replace("/");
      return;
    }
    setDreamer(d);
    getDreamDetail(d.id, id).then((res) => {
      setLoading(false);
      if (res.ok) {
        setDream(res.data);
      } else {
        setError(res.error.error.message);
      }
    });
  }, [router, id]);

  if (!dreamer || loading) {
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
        正在加载梦境…
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-error)",
          background: "var(--color-night-paper)",
        }}
      >
        {error || "梦境未找到"}
      </div>
    );
  }

  return <DreamDetail dream={dream} />;
}
