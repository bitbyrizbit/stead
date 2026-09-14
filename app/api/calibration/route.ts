/**
 * POST /api/calibration
 *
 * Persists a calibration profile to Neon (serverless Postgres).
 * GET  /api/calibration?session_id=<id>  — retrieves the latest profile.
 *
 * Error handling: if DATABASE_URL is missing or the query fails, we return
 * a 200 with { success: false, fallback: true } rather than a 500 — the
 * client must NEVER let a backend failure block the demo.
 */

import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, minCutoff, beta, avgDeviation } = body as {
      sessionId: string;
      minCutoff: number;
      beta: number;
      avgDeviation: number;
    };

    if (!sessionId || minCutoff == null || beta == null || avgDeviation == null) {
      return Response.json({ success: false, error: "missing fields" }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      insert into calibration_profiles (session_id, min_cutoff, beta, avg_deviation)
      values (${sessionId}, ${minCutoff}, ${beta}, ${avgDeviation})
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("[calibration POST]", err);
    // Return 200 + fallback flag so the client can continue without retrying.
    return Response.json({ success: false, fallback: true });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return Response.json({ success: false, error: "missing session_id" }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`
      select min_cutoff, beta, avg_deviation, created_at
      from calibration_profiles
      where session_id = ${sessionId}
      order by created_at desc
      limit 1
    `;

    if (rows.length === 0) {
      return Response.json({ success: false, error: "not found" }, { status: 404 });
    }

    const row = rows[0];
    return Response.json({
      success: true,
      minCutoff: row.min_cutoff,
      beta: row.beta,
      avgDeviation: row.avg_deviation,
    });
  } catch (err) {
    console.error("[calibration GET]", err);
    return Response.json({ success: false, fallback: true });
  }
}
