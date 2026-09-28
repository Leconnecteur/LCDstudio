import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BriefForm } from "@/components/BriefForm";
import { CONTACT_EMAIL, CONTACT_PHONE_LABEL, whatsappUrl } from "@/lib/contact";
import { LANDINGS, type Landing } from "@/lib/landings";
import kevImg from "@/assets/kev-adams.jpg";
import permisImg from "@/assets/project-permis.jpg";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const REFERENCE_IMAGES = { kev: kevImg, permis: permisImg };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 text-hairline text-[var(--lcd-dim)]">
      <span className="h-px w-10 bg-[var(--lcd-accent)]" />
      <span>{children}</span>
    </div>
  );
}

export function LandingPage({ landing: l }: { landing: Landing }) {
  const others = LANDINGS.filter((o) => o.path !== l.path);
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--lcd-bg)] text-[var(--lcd-fg)] selection:bg-[var(--lcd-accent)]/40">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--lcd-line)]/40 bg-[var(--lcd-bg)]/75 backdrop-blur">
        <div className="flex items-center justify-between gap-6 px-5 py-4 md:px-10 md:py-5">
          <Link to="/" className="font-[var(--font-serif)] text-2xl leading-none tracking-tight">
            LCD<span className="text-[var(--lcd-accent)]">.</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {LANDINGS.map((o) => (
              <a
                key={o.path}
                href={o.path}
                aria-current={o.path === l.path ? "page" : undefined}
                className={`text-hairline transition-colors hover:text-[var(--lcd-fg)] ${
                  o.path === l.path ? "text-[var(--lcd-fg)]" : "text-[var(--lcd-dim)]"
                }`}
              >
                {o.navLabel}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--lcd-fg)] px-4 py-2.5 text-hairline text-[var(--lcd-bg)]"
          >
            Présenter mon projet →
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
          <nav aria-label="Fil d'Ariane" className="mb-10 text-hairline text-[var(--lcd-dim)]">
            <Link to="/" className="hover:text-[var(--lcd-fg)]">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--lcd-fg)]/80">{l.navLabel}</span>
          </nav>
          <Eyebrow>{l.eyebrow}</Eyebrow>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mt-8 max-w-6xl font-[var(--font-display)] text-[clamp(2.6rem,7vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.03em]"
          >
            {l.h1[0]}{" "}
            <em className="block font-[var(--font-serif)] italic text-[var(--lcd-dim)]">
              {l.h1[1]}
            </em>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end"
          >
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--lcd-fg)]/85 md:col-span-7 md:text-xl">
              {l.intro}
            </p>
            <div className="flex flex-col gap-4 md:col-span-5 md:items-end">
              <a
                href="#contact"
                className="group inline-flex w-fit items-center gap-3 rounded-full bg-[var(--lcd-fg)] px-7 py-4 text-[var(--lcd-bg)] transition-opacity hover:opacity-90"
              >
                <span className="text-hairline">Recevoir une proposition sous 48 h</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
              <span className="text-hairline text-[var(--lcd-dim)]">
                {l.delay} · Référence :{" "}
                <span className="text-[var(--lcd-fg)]">{l.reference.client}</span>
              </span>
            </div>
          </motion.div>
        </section>

        {/* Pourquoi */}
        <section className="border-t border-[var(--lcd-line)] px-5 py-16 md:px-10 md:py-28">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
            <h2 className="font-[var(--font-display)] text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.02em] md:col-span-5">
              {l.why.title}
            </h2>
            <div className="flex flex-col gap-6 text-base leading-relaxed text-[var(--lcd-fg)]/80 md:col-span-7 md:text-lg">
              {l.why.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Livrables */}
        <section className="border-t border-[var(--lcd-line)] py-16 md:py-28">
          <div className="px-5 md:px-10">
            <Eyebrow>Ce que l'on crée pour vous</Eyebrow>
            <h2 className="mt-6 font-[var(--font-display)] text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.02em]">
              Tout ce qu'il faut,{" "}
              <em className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">
                rien de générique.
              </em>
            </h2>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-px border-y border-[var(--lcd-line)] bg-[var(--lcd-line)] md:mt-16 md:grid-cols-2 lg:grid-cols-3">
            {l.deliverables.map((d, i) => (
              <li key={d.title} className="flex flex-col gap-3 bg-[var(--lcd-bg)] p-6 md:p-10">
                <span className="text-hairline text-[var(--lcd-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-[var(--font-display)] text-2xl font-medium tracking-[-0.01em]">
                  {d.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--lcd-dim)] md:text-base">
                  {d.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Référence */}
        <section className="border-t border-[var(--lcd-line)] px-5 py-16 md:px-10 md:py-28">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden border border-[var(--lcd-line)] md:col-span-7">
              <img
                src={REFERENCE_IMAGES[l.reference.image]}
                alt={`${l.reference.client} — ${l.reference.label}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-6 md:col-span-5">
              <Eyebrow>Référence</Eyebrow>
              <h2 className="font-[var(--font-display)] text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-none tracking-[-0.02em]">
                {l.reference.client}
                <em className="mt-2 block font-[var(--font-serif)] text-[0.6em] italic text-[var(--lcd-dim)]">
                  {l.reference.label}
                </em>
              </h2>
              <p className="text-base leading-relaxed text-[var(--lcd-fg)]/80 md:text-lg">
                {l.reference.desc}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-hairline">
                {l.reference.url ? (
                  <a
                    href={l.reference.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--lcd-fg)] underline underline-offset-4"
                  >
                    Voir le site en ligne ↗
                  </a>
                ) : null}
                <Link
                  to="/"
                  hash="etudes"
                  className="text-[var(--lcd-dim)] underline underline-offset-4 hover:text-[var(--lcd-fg)]"
                >
                  Toutes nos études de cas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="border-t border-[var(--lcd-line)] px-5 py-16 md:px-10 md:py-28">
          <Eyebrow>Comment ça se passe</Eyebrow>
          <h2 className="mt-6 font-[var(--font-display)] text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.02em]">
            Quatre étapes.{" "}
            <em className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">
              Un seul interlocuteur.
            </em>
          </h2>
          <ol className="mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
            {l.steps.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col gap-3 border-t border-[var(--lcd-line)] pt-6"
              >
                <span className="text-hairline text-[var(--lcd-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-[var(--font-display)] text-xl font-medium">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--lcd-dim)]">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="border-t border-[var(--lcd-line)] px-5 py-16 md:px-10 md:py-28">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-4">
              <Eyebrow>Questions fréquentes</Eyebrow>
              <h2 className="mt-6 font-[var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.02em]">
                Vos questions,{" "}
                <em className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">
                  nos réponses.
                </em>
              </h2>
            </div>
            <div className="divide-y divide-[var(--lcd-line)] border-y border-[var(--lcd-line)] md:col-span-8">
              {l.faq.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-[var(--font-display)] text-lg font-medium md:text-xl [&::-webkit-details-marker]:hidden">
                    <h3>{f.q}</h3>
                    <span
                      aria-hidden
                      className="mt-1 text-[var(--lcd-accent)] transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--lcd-fg)]/80">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="border-t border-[var(--lcd-line)] px-5 py-16 md:px-10 md:py-28"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="flex flex-col gap-8 lg:col-span-5">
              <Eyebrow>Contact</Eyebrow>
              <h2 className="font-[var(--font-display)] text-[clamp(2.4rem,5vw,5rem)] font-medium leading-[0.95] tracking-[-0.03em]">
                {l.ctaTitle}
              </h2>
              <p className="text-base leading-relaxed text-[var(--lcd-fg)]/80">
                Décrivez votre projet en quelques lignes : vous recevez une première idée et une
                proposition sous 48 h, sans engagement.
              </p>
              <div className="flex flex-col gap-2 text-hairline">
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--lcd-fg)] hover:underline"
                >
                  WhatsApp · {CONTACT_PHONE_LABEL}
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[var(--lcd-dim)] hover:text-[var(--lcd-fg)]"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <BriefForm defaultType={l.briefType} source={l.path} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--lcd-line)] px-5 py-12 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="font-[var(--font-serif)] text-3xl">
              LCD<span className="text-[var(--lcd-accent)]">.</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[var(--lcd-dim)]">
              Studio digital spécialisé dans les sites de sortie de films et les sites d'artistes.
            </p>
          </div>
          <nav aria-label="Nos expertises" className="flex flex-col gap-2 text-sm">
            <span className="text-hairline text-[var(--lcd-dim)]">Voir aussi</span>
            {others.map((o) => (
              <a key={o.path} href={o.path} className="hover:text-[var(--lcd-accent)]">
                {o.eyebrow}
              </a>
            ))}
            <Link to="/" className="hover:text-[var(--lcd-accent)]">
              Le studio LCD
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t border-[var(--lcd-line)] pt-6 text-hairline text-[var(--lcd-dim)]">
          © 2026 LCD Studio — Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
