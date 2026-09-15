"use client";

import { useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────
export interface ItemProgress {
  content_id: string;
  completed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
}

export interface TrackStats {
  completedCount: number; // how many مقررات done
  totalCount: number; // total مقررات in track
  quizScoreSum: number; // sum of all quiz_score
  quizTotalSum: number; // sum of all quiz_total (i.e. max possible)
  progressMap: Record<string, ItemProgress>; // contentId → progress
}

type Status = "loading" | "ready" | "error";

// ── In-memory cache ────────────────────────────────────────
const cache = new Map<string, { data: TrackStats; fetchedAt: number }>();
const STALE_MS = 5 * 60 * 1000;

// ── Hook ───────────────────────────────────────────────────
export function useTrackProgress(trackId: string, contentIds: string[]) {
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (contentIds.length === 0) {
      setStatus("ready");
      return;
    }

    const cacheKey = trackId;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < STALE_MS) {
      setStats(cached.data);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    const ids = contentIds.join(",");

    fetch(`/api/progress/track/${trackId}?ids=${ids}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: ItemProgress[]) => {
        if (cancelled) return;

        const progressMap: Record<string, ItemProgress> = {};
        rows.forEach((r) => {
          progressMap[r.content_id] = r;
        });

        const completedCount = contentIds.filter(
          (id) => progressMap[id]?.completed,
        ).length;

        const quizScoreSum = rows.reduce((s, r) => s + (r.quiz_score ?? 0), 0);
        const quizTotalSum = rows.reduce((s, r) => s + (r.quiz_total ?? 0), 0);

        const data: TrackStats = {
          completedCount,
          totalCount: contentIds.length,
          quizScoreSum,
          quizTotalSum,
          progressMap,
        };

        cache.set(cacheKey, { data, fetchedAt: Date.now() });
        setStats(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [trackId, contentIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { stats, status };
}
