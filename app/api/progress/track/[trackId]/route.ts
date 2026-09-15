import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { err } from "@/lib/validation";

// ── GET /api/progress/track/[trackId] ─────────────────────
// Body: { contentIds: string[] }  ← sent as query param
// Returns array of { content_id, completed, quiz_score, quiz_total }
// One request for the whole track instead of N requests
export async function GET(
  req: NextRequest,
  { params }: { params: { trackId: string } },
) {
  const session = await getSession();
  if (!session) return err("غير مخوّل", 401, "UNAUTHENTICATED");

  // contentIds passed as ?ids=1-1,1-2,1-3
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean);
  if (!ids || ids.length === 0) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("content_progress")
    .select("content_id, completed, quiz_score, quiz_total")
    .eq("user_id", session.sub)
    .in("content_id", ids);

  if (error) {
    console.error("[progress/track/GET]", error);
    return err("خطأ في الخادم", 500, "DB_ERROR");
  }

  return NextResponse.json(data ?? []);
}

export const dynamic = "force-dynamic";
