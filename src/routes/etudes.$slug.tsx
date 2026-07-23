import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type CaseStudy = {
  id: string;
  slug: string;
  project_id: string | null;
  client: string;
  title: string;
  tagline: string | null;
  release_label: string | null;
  release_date: string | null;
  site_label: string | null;
  site_url: string | null;
  cover_url: string | null;
  backdrop_url: string | null;
  context: string | null;
  challenge: string | null;
  idea: string | null;
  execution: string[];
  gallery: string[];
  published: boolean;
};

export const Route = createFileRoute("/etudes/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Étude de cas — ${params.slug} · LCD` },
      {
        name: "description",
        content:
          "Une étude de cas LCD : contexte, défi, idée et exécution. Le parcours créatif derrière un projet livré.",
      },
      { property: "og:title", content: `Étude de cas — ${params.slug} · LCD` },
      {
        property: "og:url",
        content: `https://connecteurdigital.lovable.app/etudes/${params.slug}`,
      },
      { property: "og:type", content: "article" },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://connecteurdigital.lovable.app/etudes/${params.slug}`,
      },
    ],
  }),
  component: CaseStudyPage,
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--lcd-bg)] text-[var(--lcd-fg)]">
        <div className="text-center">
          <p className="text-hairline text-[var(--lcd-dim)]">Cette étude n'a pas chargé.</p>
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-4 border border-[var(--lcd-fg)] px-4 py-2 text-hairline uppercase"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-[var(--lcd-bg)] text-[var(--lcd-fg)]">
      <div className="text-center">
        <p className="font-[var(--font-display)] text-5xl">404</p>
        <p className="mt-3 text-hairline text-[var(--lcd-dim)]">Étude introuvable.</p>
        <Link to="/" className="mt-6 inline-block text-hairline underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  ),
});

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["case-study", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("case_studies")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data as CaseStudy | null;
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--lcd-bg)] text-[var(--lcd-fg)]">
        <p className="text-hairline text-[var(--lcd-dim)]">Chargement…</p>
      </div>
    );
  }
  if (error) throw error;
  if (!data) throw notFound();

  const cs = data;
  const blocks = [
    { n: "01", label: "Le contexte", body: cs.context },
    { n: "02", label: "Le défi", body: cs.challenge },
    { n: "03", label: "L'idée", body: cs.idea },
  ].filter((b) => b.body && b.body.trim().length > 0);

  const bg = cs.backdrop_url ?? cs.cover_url;

  return (
    <div className="relative min-h-screen bg-[var(--lcd-bg)] text-[var(--lcd-fg)]">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[var(--lcd-line)]/40 bg-[var(--lcd-bg)]/70 px-5 py-4 backdrop-blur md:px-10 md:py-5">
        <Link to="/" className="font-[var(--font-serif)] text-xl tracking-tight">
          LCD<span className="text-[var(--lcd-accent)]">.</span>
        </Link>
        <Link to="/" className="text-hairline text-[var(--lcd-dim)] hover:text-[var(--lcd-fg)]">
          ← Retour au studio
        </Link>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-24 md:pt-32">
        {bg ? (
          <>
            <div className="absolute inset-0 -z-10">
              <img
                src={bg}
                alt=""
                className="h-full w-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--lcd-bg)]/60 to-[var(--lcd-bg)]" />
            </div>
          </>
        ) : null}
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 text-hairline text-[var(--lcd-dim)]"
          >
            <span className="h-px w-8 bg-[var(--lcd-accent)]" />
            Étude de cas — {cs.client}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-[var(--font-display)] text-[clamp(2.6rem,8vw,7rem)] font-medium leading-[0.94] tracking-[-0.03em]"
          >
            {cs.title}
          </motion.h1>
          {cs.tagline ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 max-w-3xl font-[var(--font-serif)] text-[clamp(1.5rem,3vw,2.6rem)] italic leading-tight text-[var(--lcd-dim)]"
            >
              « {cs.tagline.replace(/^[«"]\s*|\s*[»"]$/g, "")} »
            </motion.p>
          ) : null}

          {/* Meta strip */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 gap-8 border-t border-[var(--lcd-line)] pt-8 sm:grid-cols-3"
          >
            <MetaCell label="Client" value={cs.client} />
            {cs.release_label ? <MetaCell label="Sortie" value={cs.release_label} /> : null}
            {cs.site_url ? (
              <MetaCell
                label="Site"
                value={
                  <a
                    href={cs.site_url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[var(--lcd-accent)] underline-offset-4 hover:text-[var(--lcd-accent)]"
                  >
                    {cs.site_label ?? cs.site_url.replace(/^https?:\/\//, "")}
                  </a>
                }
              />
            ) : null}
          </motion.dl>
        </div>
      </section>

      {/* Cover full-bleed */}
      {cs.cover_url ? (
        <section className="border-t border-[var(--lcd-line)]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
            <div className="aspect-[16/10] w-full overflow-hidden border border-[var(--lcd-line)]">
              <img
                src={cs.cover_url}
                alt={cs.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Numbered blocks */}
      <section className="border-t border-[var(--lcd-line)]">
        <div className="mx-auto max-w-5xl px-5 py-24 md:px-10 md:py-40">
          <div className="flex flex-col gap-24 md:gap-32">
            {blocks.map((b) => (
              <NumberedBlock key={b.n} n={b.n} label={b.label} body={b.body!} />
            ))}

            {cs.execution.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr] md:gap-16">
                <div className="text-hairline text-[var(--lcd-accent)]">04</div>
                <div>
                  <h2 className="font-[var(--font-display)] text-3xl leading-tight md:text-5xl">
                    L'exécution
                  </h2>
                  <ul className="mt-8 flex flex-col divide-y divide-[var(--lcd-line)] border-y border-[var(--lcd-line)]">
                    {cs.execution.map((line, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="flex items-start gap-4 py-5 md:py-6"
                      >
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[var(--lcd-accent)]" />
                        <span className="text-lg leading-snug text-[var(--lcd-fg)] md:text-xl">
                          {line}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {cs.gallery.length > 0 ? (
        <section className="border-t border-[var(--lcd-line)]">
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-10 md:py-32">
            <div className="mb-10 text-hairline text-[var(--lcd-dim)]">
              — Galerie · {cs.gallery.length} captures
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {cs.gallery.map((url, i) => (
                <motion.div
                  key={url + i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: (i % 4) * 0.08 }}
                  className="flex items-center justify-center overflow-hidden border border-[var(--lcd-line)] bg-black p-3"
                >
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    className="max-h-[70vh] w-full object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA site */}
      {cs.site_url ? (
        <section className="border-t border-[var(--lcd-line)]">
          <div className="mx-auto max-w-6xl px-5 py-24 text-center md:px-10 md:py-40">
            <div className="text-hairline text-[var(--lcd-dim)]">Le résultat en ligne</div>
            <a
              href={cs.site_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block font-[var(--font-display)] text-[clamp(2rem,6vw,5rem)] leading-tight tracking-tight underline decoration-[var(--lcd-accent)] underline-offset-[0.15em] hover:text-[var(--lcd-accent)]"
            >
              {cs.site_label ?? cs.site_url.replace(/^https?:\/\//, "")}
              <span className="ml-3 inline-block align-middle text-[var(--lcd-accent)]">↗</span>
            </a>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-[var(--lcd-line)] px-5 py-10 text-center text-hairline text-[var(--lcd-dim)] md:px-10">
        <Link to="/" className="hover:text-[var(--lcd-fg)]">
          ← LCD — Digital Experiences Studio
        </Link>
      </footer>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-hairline text-[var(--lcd-dim)]">{label}</dt>
      <dd className="mt-2 font-[var(--font-display)] text-lg md:text-xl">{value}</dd>
    </div>
  );
}

function NumberedBlock({ n, label, body }: { n: string; label: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr] md:gap-16"
    >
      <div className="text-hairline text-[var(--lcd-accent)]">{n}</div>
      <div>
        <h2 className="font-[var(--font-display)] text-3xl leading-tight md:text-5xl">{label}</h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--lcd-fg)]/90 md:text-2xl md:leading-[1.4]">
          {body}
        </p>
      </div>
    </motion.div>
  );
}