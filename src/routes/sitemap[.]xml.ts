import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LANDINGS } from "@/lib/landings";
import { absoluteUrl } from "@/lib/seo";

type Entry = { path: string; lastmod?: string; priority: string };

async function caseStudyEntries(): Promise<Entry[]> {
  const { data, error } = await (supabase as any)
    .from("case_studies")
    .select("slug,updated_at")
    .eq("published", true);
  if (error) {
    console.error(error);
    return [];
  }
  return ((data ?? []) as { slug: string; updated_at: string }[]).map((c) => ({
    path: `/etudes/${c.slug}`,
    lastmod: c.updated_at?.slice(0, 10),
    priority: "0.7",
  }));
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = [
          { path: "/", priority: "1.0" },
          ...LANDINGS.map((l) => ({ path: l.path, priority: "0.9" })),
          ...(await caseStudyEntries()),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${absoluteUrl(e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<priority>${e.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
