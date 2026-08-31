import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";
import { generateSections } from "@/lib/generate-checklist";
import { rateLimited } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "editor", { write: true });
  if ("response" in auth) return auth.response;

  const limited = await rateLimited("generate-sections", 10, 60);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";
  if (description.length < 10) {
    return jsonError("Please describe the project in a sentence or two", 400);
  }

  // Only drafts onto an empty checklist — never mixes into existing sections.
  const existing = (await sql()`
    SELECT count(*)::int AS count FROM sections WHERE project_id = ${id}
  `) as { count: number }[];
  if (existing[0].count > 0) {
    return jsonError("This project already has sections", 409);
  }

  let names: string[];
  try {
    names = await generateSections(description, auth.user.preferred_language);
  } catch (err) {
    console.error("section generation failed:", err);
    return jsonError("generation_failed", 502);
  }

  for (let i = 0; i < names.length; i++) {
    await sql()`
      INSERT INTO sections (project_id, name, name_lang, position, created_by)
      VALUES (${id}, ${names[i]}, ${auth.user.preferred_language}, ${i}, ${auth.user.id})
    `;
  }
  return NextResponse.json({ created: names.length });
}
