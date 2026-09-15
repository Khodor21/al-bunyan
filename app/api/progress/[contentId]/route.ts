import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { err } from "@/lib/validation";

// ── GET /api/progress/[contentId] ─────────────────────────
// Returns { completed, completed_at, quiz_score, quiz_total } or null
export async function GET(
  _req: NextRequest,
  { params }: { params: { contentId: string } },
) {
  const session = await getSession();
  if (!session) return err("غير مخوّل", 401, "UNAUTHENTICATED");

  const { data, error } = await supabase
    .from("content_progress")
    .select("completed, completed_at, quiz_score, quiz_total")
    .eq("user_id", session.sub)
    .eq("content_id", params.contentId)
    .maybeSingle();

  if (error) {
    console.error("[progress/GET]", error);
    return err("خطأ في الخادم", 500, "DB_ERROR");
  }

  return NextResponse.json(data ?? null);
}

// ── POST /api/progress/[contentId] ────────────────────────
// Body: { completed?: boolean, quizScore?: number, quizTotal?: number }
export async function POST(
  req: NextRequest,
  { params }: { params: { contentId: string } },
) {
  const session = await getSession();
  if (!session) return err("غير مخوّل", 401, "UNAUTHENTICATED");

  const body = await req.json();
  const { completed, quizScore, quizTotal } = body as {
    completed?: boolean;
    quizScore?: number;
    quizTotal?: number;
  };

  const payload: Record<string, unknown> = {
    user_id: session.sub,
    content_id: params.contentId,
    updated_at: new Date().toISOString(),
  };

  if (completed !== undefined) {
    payload.completed = completed;
    if (completed) payload.completed_at = new Date().toISOString();
  }
  if (quizScore !== undefined) payload.quiz_score = quizScore;
  if (quizTotal !== undefined) payload.quiz_total = quizTotal;

  const { data, error } = await supabase
    .from("content_progress")
    .upsert(payload, { onConflict: "user_id,content_id" })
    .select("completed, completed_at, quiz_score, quiz_total")
    .single();

  if (error) {
    console.error("[progress/POST]", error);
    return err("خطأ في الخادم", 500, "DB_ERROR");
  }

  return NextResponse.json(data);
}

export const dynamic = "force-dynamic";
