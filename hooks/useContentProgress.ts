"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────
export interface ContentProgress {
  completed: boolean;
  completedAt: string | null;
  quizScore: number | null;
  quizTotal: number | null;
}

type Status = "loading" | "ready" | "error";

// ── In-memory cache (survives re-renders, cleared on page refresh) ─
// Key: contentId → { data, fetchedAt }
const cache = new Map<
  string,
  { data: ContentProgress | null; fetchedAt: number }
>();
const STALE_MS = 5 * 60 * 1000; // 5 minutes

// ── Hook ───────────────────────────────────────────────────
export function useContentProgress(contentId: string) {
  const [progress, setProgress] = useState<ContentProgress | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const savingRef = useRef(false);

  // ── Fetch (or return cache) on mount ──
  useEffect(() => {
    const cached = cache.get(contentId);
    const now = Date.now();

    if (cached && now - cached.fetchedAt < STALE_MS) {
      setProgress(cached.data);
      setStatus("ready");
      return;
    }

    let cancelled = false;

    fetch(`/api/progress/${contentId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ContentProgress | null) => {
        if (cancelled) return;
        cache.set(contentId, { data, fetchedAt: Date.now() });
        setProgress(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  // ── Save completion ────────────────────────────────────────
  const saveCompleted = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;

    try {
      const res = await fetch(`/api/progress/${contentId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      if (res.ok) {
        const updated: ContentProgress = await res.json();
        cache.set(contentId, { data: updated, fetchedAt: Date.now() });
        setProgress(updated);
      }
    } finally {
      savingRef.current = false;
    }
  }, [contentId]);

  // ── Save quiz result ───────────────────────────────────────
  const saveQuizResult = useCallback(
    async (score: number, total: number) => {
      if (savingRef.current) return;
      savingRef.current = true;

      try {
        const res = await fetch(`/api/progress/${contentId}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizScore: score, quizTotal: total }),
        });

        if (res.ok) {
          const updated: ContentProgress = await res.json();
          cache.set(contentId, { data: updated, fetchedAt: Date.now() });
          setProgress(updated);
        }
      } finally {
        savingRef.current = false;
      }
    },
    [contentId],
  );

  return { progress, status, saveCompleted, saveQuizResult };
}
