import Link from "next/link";
import type { GuideBlock } from "@/lib/content/types";

/** Renders a guide's block list with the site's sheet styling. */
export function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="max-w-2xl">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="display text-3xl mt-12 mb-4">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="display text-xl mt-8 mb-3">
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="text-[15px] leading-relaxed text-ink-soft mb-4">
                {block.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc pl-6 space-y-1.5 mb-5 text-[15px] leading-relaxed text-ink-soft">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal pl-6 space-y-1.5 mb-5 text-[15px] leading-relaxed text-ink-soft">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          case "callout":
            return (
              <aside key={i} className="sheet grid-paper p-5 my-7">
                <p className="microlabel mb-2">{block.title}</p>
                <p className="text-sm leading-relaxed">{block.text}</p>
              </aside>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto my-6 border-[1.5px] border-line-strong">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sheet text-left">
                      {block.headers.map((h, j) => (
                        <th key={j} className="microlabel font-normal px-3 py-2 border-b-[1.5px] border-line-strong">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k} className={`px-3 py-2 align-top ${k === 0 ? "font-medium" : "text-ink-soft"}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

export function FaqList({ title, faq }: { title: string; faq: { q: string; a: string }[] }) {
  if (faq.length === 0) return null;
  return (
    <section className="max-w-2xl mt-12">
      <h2 className="display text-3xl mb-4">{title}</h2>
      <dl className="divide-y divide-line border-y-[1.5px] border-line-strong">
        {faq.map((f, i) => (
          <div key={i} className="py-4">
            <dt className="font-semibold text-[15px] mb-1.5">{f.q}</dt>
            <dd className="text-[15px] leading-relaxed text-ink-soft">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function CardGrid({
  label,
  cards,
}: {
  label: string;
  cards: { href: string; title: string; blurb: string; meta?: string }[];
}) {
  if (cards.length === 0) return null;
  return (
    <section className="mt-12">
      <p className="microlabel mb-4">{label}</p>
      <div className="grid sm:grid-cols-2 gap-px bg-line-strong border-[1.5px] border-line-strong">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="bg-sheet p-6 hover:bg-paper transition-colors">
            {c.meta && <p className="microlabel mb-2">{c.meta}</p>}
            <h3 className="display text-xl mb-1.5">{c.title}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{c.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** JSON-LD helper. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
