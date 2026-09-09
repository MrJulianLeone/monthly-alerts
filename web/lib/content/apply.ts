import { sql } from "@/lib/db";
import { getTemplate } from "@/lib/content";

/**
 * Copies a public checklist template into a project: sections and items are
 * inserted in English (source_lang "en") and translated per viewer like any
 * other content. Only used on empty projects. Returns the item count.
 */
export async function applyTemplate(
  projectId: string,
  slug: string,
  userId: string
): Promise<number> {
  const template = getTemplate(slug);
  if (!template) return 0;

  let items = 0;
  for (let si = 0; si < template.sections.length; si++) {
    const section = template.sections[si];
    const rows = (await sql()`
      INSERT INTO sections (project_id, name, name_lang, position, created_by)
      VALUES (${projectId}, ${section.name}, 'en', ${si}, ${userId})
      RETURNING id
    `) as { id: string }[];
    const sectionId = rows[0].id;
    if (section.items.length === 0) continue;
    const titles = section.items.map((i) => i.title);
    const descriptions = section.items.map((i) => i.description ?? null);
    const positions = section.items.map((_, i) => i);
    await sql()`
      INSERT INTO items (project_id, section_id, title, description, source_lang, position, created_by)
      SELECT ${projectId}, ${sectionId}, t.title, t.description, 'en', t.position, ${userId}
      FROM unnest(${titles}::text[], ${descriptions}::text[], ${positions}::int[])
        AS t(title, description, position)
    `;
    items += section.items.length;
  }
  await sql()`UPDATE projects SET template_slug = ${slug} WHERE id = ${projectId}`;
  return items;
}
