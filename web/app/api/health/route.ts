import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = (await sql()`
      SELECT count(*)::int AS tables
      FROM pg_tables WHERE schemaname = 'public'
    `) as { tables: number }[];
    return NextResponse.json({
      ok: true,
      app: "MonthlyAlerts",
      database: { connected: true, tables: rows[0].tables },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        app: "MonthlyAlerts",
        database: { connected: false },
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
