import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import lcdLogo from "@/assets/lcd-logo.png";
import type { Database } from "@/integrations/supabase/types";

import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { Loader } from "@/components/Loader";
import { BriefForm } from "@/components/BriefForm";
import { CONTACT_EMAIL, CONTACT_PHONE_LABEL, selectBriefType, whatsappUrl } from "@/lib/contact";
import { LANDINGS } from "@/lib/landings";
import {
  ldJson,
  ORGANIZATION_ID,
  organizationJsonLd,
  seo,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

import heroImg from "@/assets/hero.jpg";
import heroVideoMp4 from "@/assets/hero-cinema-browser.mp4";
import heroVideoWebm from "@/assets/hero-cinema-browser.webm";
import permisImg from "@/assets/project-permis.jpg";
import kevImg from "@/assets/kev-adams.jpg";
import geremyPortrait from "@/assets/geremy-portrait.jpg";
// import kevAdamsAsset from "@/assets/kev-adams.jpg.asset.json";
// import filmExperienceAsset from "@/assets/film-experience-set.jpg.asset.json";
import rawImg from "@/assets/project-raw.jpg";
import padelImg from "@/assets/project-padel.jpg";
import ctaImg from "@/assets/cta.jpg";
import missionImg from "@/assets/concept-mission.jpg";
import cannesImg from "@/assets/concept-cannes.jpg";
import rolandImg from "@/assets/concept-roland.jpg";
import tourImg from "@/assets/concept-tour.jpg";
// import portraitAsset from "@/assets/geremy-portrait.jpg.asset.json";

const HOME_TITLE = "LCD Studio — Création de sites pour films & artistes";
const HOME_DESCRIPTION =
  "Studio digital pour le cinéma et la musique : sites de sortie de films, sites officiels d'artistes et d'humoristes, expériences interactives. Références : Kev Adams, Apollo Films.";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [projects, concepts, cases] = await Promise.all([
      fetchProjects().catch(() => [] as DbProject[]),
      fetchConcepts().catch(() => [] as DbConcept[]),
      fetchCasePreviews().catch(() => [] as CasePreview[]),
    ]);
    return { projects, concepts, cases };
  },
  head: () => {
    const { meta, links } = seo({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" });
    return {
      meta,
      links,
      scripts: [
        ldJson(organizationJsonLd),
        ldJson({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: "fr-FR",
          publisher: { "@id": ORGANIZATION_ID },
        }),
      ],
    };
  },
  component: Home,
});

const EASE = [0.2, 0.8, 0.2, 1] as const;

async function fetchProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as DbProject[];
}

async function fetchConcepts() {
  const { data, error } = await (supabase as any)
    .from("concepts")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbConcept[];
}

async function fetchCasePreviews() {
  const { data, error } = await (supabase as any)
    .from("case_studies")
    .select("id,slug,client,title,tagline,cover_url,release_label")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(6);
  if (error) throw error;
  return (data ?? []) as CasePreview[];
}

function useProjects() {
  const initialData = Route.useLoaderData().projects;
  return useQuery({ queryKey: ["projects"], queryFn: fetchProjects, initialData });
}

function useConcepts() {
  const initialData = Route.useLoaderData().concepts;
  return useQuery({ queryKey: ["concepts"], queryFn: fetchConcepts, initialData });
}

function useCasePreviews() {
  const initialData = Route.useLoaderData().cases;
  return useQuery({ queryKey: ["case-studies-preview"], queryFn: fetchCasePreviews, initialData });
}

function Home() {
  const { data: projectRows = [] } = useProjects();
  const { data: concepts = [] } = useConcepts();
  const { data: cases = [] } = useCasePreviews();
  const hasProjects = projectRows.length > 0;
  const hasConcepts = concepts.length > 0;
  const hasCases = cases.length > 0;
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--lcd-bg)] text-[var(--lcd-fg)] selection:bg-[var(--lcd-accent)]/40">
      <SmoothScroll />
      <CustomCursor />
      <Loader />
      <Nav hasProjects={hasProjects} hasConcepts={hasConcepts} hasCases={hasCases} />
      <main>
        <Hero />
        <Clients />
        <Offers />
        {hasProjects ? <Featured /> : null}
        <CaseStudiesPreview />
        <Approach />
        <Studio />
        <ConceptLab />
        <PullQuote />
        <FinalCTA />
      </main>
      <Footer hasConcepts={hasConcepts} hasCases={hasCases} />
      <MobileBar />
    </div>
  );
}

/* --------------------------------- Nav --------------------------------- */

function Nav({
  hasProjects = true,
  hasConcepts = true,
  hasCases = true,
}: {
  hasProjects?: boolean;
  hasConcepts?: boolean;
  hasCases?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linksRaw = [
    ["Offres", "#offres"],
    ["Projets", "#projets"],
    ["Études de cas", "#etudes"],
    ["Studio", "#studio"],
    ["Contact", "#contact"],
  ] as ReadonlyArray<readonly [string, string]>;
  const links = linksRaw.filter(
    ([, h]) =>
      (hasProjects || h !== "#projets") &&
      (hasConcepts || h !== "#concepts") &&
      (hasCases || h !== "#etudes"),
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-7">
          <a href="#top" className="flex items-baseline gap-3">
            <span className="font-[var(--font-serif)] text-[26px] leading-none tracking-tight md:text-4xl">
              LCD<span className="text-[var(--lcd-accent)]">.</span>
            </span>
            <span className="hidden text-hairline text-[var(--lcd-dim)] md:block">
              digital experiences studio
            </span>
          </a>
          <nav className="hidden items-center gap-10 md:flex">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-hairline text-[var(--lcd-fg)]/80 transition-colors hover:text-[var(--lcd-fg)]"
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 inline-flex h-11 items-center gap-3 rounded-full border border-[var(--lcd-fg)]/25 pl-4 pr-1.5 md:hidden"
          >
            <span className="text-hairline uppercase">{open ? "Fermer" : "Menu"}</span>
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[var(--lcd-fg)] text-[var(--lcd-bg)]">
              <span
                className={`absolute h-px w-3.5 bg-current transition-transform duration-500 ${
                  open ? "rotate-45" : "-translate-y-[3px]"
                }`}
              />
              <span
                className={`absolute h-px w-3.5 bg-current transition-transform duration-500 ${
                  open ? "-rotate-45" : "translate-y-[3px]"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <motion.div
        initial={false}
        animate={{ clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="fixed inset-0 z-40 overflow-hidden bg-[var(--lcd-bg)] md:hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--lcd-bg)]/85 via-[var(--lcd-bg)]/60 to-[var(--lcd-bg)]" />

        <div className="relative flex h-full flex-col justify-between px-6 pb-10 pt-24">
          <div className="flex items-center justify-between text-hairline text-[var(--lcd-dim)]">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--lcd-accent)]" />
              Menu
            </span>
            <span>{String(links.length).padStart(2, "0")} / {String(links.length).padStart(2, "0")}</span>
          </div>

          <ul className="mt-8 flex flex-col">
            {links.map(([label, href], i) => (
              <li key={label} className="border-b border-[var(--lcd-line)]">
                <a
                  onClick={() => setOpen(false)}
                  href={href}
                  className="group flex items-baseline justify-between overflow-hidden py-4"
                >
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: open ? "0%" : "110%" }}
                    transition={{ duration: 0.9, ease: EASE, delay: open ? 0.15 + i * 0.07 : 0 }}
                    className="font-[var(--font-display)] text-[15vw] font-medium leading-[0.95] tracking-[-0.03em]"
                  >
                    {label}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: open ? 0.35 + i * 0.07 : 0 }}
                    className="text-hairline text-[var(--lcd-dim)]"
                  >
                    0{i + 1}
                  </motion.span>
                </a>
              </li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: open ? 1 : 0, y: open ? 0 : 20 }}
            transition={{ duration: 0.7, ease: EASE, delay: open ? 0.65 : 0 }}
            className="mt-10 flex flex-col gap-6"
          >
            <a
              href="mailto:hello@lcdstudio.fr"
              onClick={() => setOpen(false)}
              className="font-[var(--font-serif)] text-2xl italic tracking-tight"
            >
              hello@lcdstudio.fr
            </a>
            <div className="flex items-center gap-4 text-hairline text-[var(--lcd-dim)]">
              <a
                href="https://www.instagram.com/lcd_studio_digital"
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="hover:text-[var(--lcd-fg)]"
              >
                Instagram
              </a>
              <span className="h-px w-4 bg-[var(--lcd-line)]" />
              <a
                href="https://www.facebook.com/people/Le-Connecteur-Digital/61566337440874/"
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="hover:text-[var(--lcd-fg)]"
              >
                Facebook
              </a>
            </div>
            <div className="flex items-center justify-between text-hairline text-[var(--lcd-dim)]">
              <span>Worldwide</span>
              <span>© 2026</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

/* ------------------------------ Mobile bar ------------------------------ */

function MobileBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const bottom = document.documentElement.scrollHeight - window.innerHeight - y;
      setVisible(y > window.innerHeight * 0.6 && bottom > 140);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <motion.div
      initial={false}
      animate={{ y: visible ? 0 : 120, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full border border-[var(--lcd-fg)]/15 bg-[var(--lcd-bg)]/85 px-2 py-2 pl-5 backdrop-blur md:hidden"
    >
      <span className="text-hairline text-[var(--lcd-dim)]">
        <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[var(--lcd-accent)] align-middle" />
        Un projet en tête ?
      </span>
      <a
        href="#contact"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--lcd-fg)] px-4 py-2 text-hairline text-[var(--lcd-bg)]"
      >
        Nous écrire
        <ArrowRight className="h-3 w-3" />
      </a>
    </motion.div>
  );
}

/* --------------------------------- Hero --------------------------------- */

function RevealLines({
  lines,
  className = "",
  delay = 0,
}: {
  lines: React.ReactNode[];
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block overflow-hidden"
          style={{ lineHeight: 0.95 }}
        >
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.09 }}
            className="block"
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const soundEnabledRef = useRef(false);
  const userMutedRef = useRef(false);
  const fadeFrameRef = useRef<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundPromptVisible, setSoundPromptVisible] = useState(false);
  const [heroInView, setHeroInView] = useState(true);

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }, []);

  const isHeroAudibleZone = useCallback(() => {
    const el = ref.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > viewportHeight * 0.18 && rect.top < viewportHeight * 0.82;
  }, []);

  const enableSound = useCallback(() => {
    if (userMutedRef.current || !isHeroAudibleZone()) return;
    if (soundEnabledRef.current) return;
    const v = videoRef.current;
    if (!v) return;
    cancelFade();
    v.muted = false;
    v.defaultMuted = false;
    v.volume = 1;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          soundEnabledRef.current = true;
          setSoundEnabled(true);
          setSoundPromptVisible(false);
        })
        .catch(() => {
          v.muted = true;
          v.defaultMuted = true;
          setSoundPromptVisible(true);
          v.play().catch(() => {});
        });
      return;
    }
    soundEnabledRef.current = true;
    setSoundEnabled(true);
    setSoundPromptVisible(false);
  }, [cancelFade, isHeroAudibleZone]);

  const disableSound = useCallback((opts?: { fade?: boolean }) => {
    cancelFade();
    const v = videoRef.current;
    soundEnabledRef.current = false;
    setSoundEnabled(false);
    if (!v) return;
    const finish = () => {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 1;
      fadeFrameRef.current = null;
    };
    if (opts?.fade && !v.muted) {
      const start = v.volume;
      const duration = 900;
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        v.volume = Math.max(0, start * (1 - p));
        if (p < 1) fadeFrameRef.current = requestAnimationFrame(step);
        else finish();
      };
      fadeFrameRef.current = requestAnimationFrame(step);
    } else {
      finish();
    }
  }, [cancelFade]);

  const toggleSound = useCallback(() => {
    if (soundEnabledRef.current) {
      userMutedRef.current = true;
      disableSound();
      return;
    }
    userMutedRef.current = false;
    enableSound();
  }, [disableSound, enableSound]);

  useEffect(() => {
    const cleanup = () => {
      window.removeEventListener("scroll", keepMutedPlaybackAlive);
    };

    const playMuted = () => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.play().catch(() => {});
    };

    const keepMutedPlaybackAlive = () => {
      if (!isHeroAudibleZone()) {
        setSoundPromptVisible(false);
        disableSound();
        return;
      }
      if (soundEnabledRef.current) return;
      const v = videoRef.current;
      if (!v) return;
      // A scroll is not a reliable user gesture for sound in Chrome/Safari.
      // Keep the hero playing silently instead of attempting an unmute that can pause it.
      if (!v.muted || v.paused) playMuted();
      setSoundPromptVisible(true);
    };

    playMuted();
    window.addEventListener("scroll", keepMutedPlaybackAlive, { passive: true });
    return cleanup;
  }, [disableSound, isHeroAudibleZone]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !soundEnabled) return;
    cancelFade();
    if (!isHeroAudibleZone()) {
      disableSound();
      return;
    }
    v.muted = false;
    v.defaultMuted = false;
    v.volume = 1;
    v.play().catch(() => {
      soundEnabledRef.current = false;
      setSoundEnabled(false);
      setSoundPromptVisible(true);
      v.muted = true;
      v.defaultMuted = true;
      v.play().catch(() => {});
    });
  }, [cancelFade, disableSound, isHeroAudibleZone, soundEnabled]);

  // Auto-coupure du son au bout de 18s pour ne pas devenir envahissant
  useEffect(() => {
    if (!soundEnabled) return;
    const timer = window.setTimeout(() => disableSound({ fade: true }), 18000);
    return () => window.clearTimeout(timer);
  }, [soundEnabled, disableSound]);

  // Coupe le son dès que le hero n'est plus visible à l'écran, y compris sur mobile.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const updateHeroAudioZone = () => {
      const visible = isHeroAudibleZone();
      setHeroInView(visible);
      if (!visible) {
        setSoundPromptVisible(false);
        disableSound();
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && isHeroAudibleZone();
        setHeroInView(visible);
        if (!visible) disableSound();
      },
      { threshold: [0, 0.15, 0.35] },
    );
    io.observe(el);
    updateHeroAudioZone();
    window.addEventListener("scroll", updateHeroAudioZone, { passive: true });
    window.addEventListener("touchmove", updateHeroAudioZone, { passive: true });
    window.addEventListener("resize", updateHeroAudioZone);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", updateHeroAudioZone);
      window.removeEventListener("touchmove", updateHeroAudioZone);
      window.removeEventListener("resize", updateHeroAudioZone);
    };
  }, [disableSound, isHeroAudibleZone]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[100svh] w-full flex-col justify-end overflow-hidden pb-16 md:pb-20"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          poster={heroImg}
          loop
          playsInline
          preload="auto"
          onPause={(event) => {
            if (event.currentTarget.muted) event.currentTarget.play().catch(() => {});
          }}
          className="h-full w-full object-cover object-center md:object-center [object-position:60%_center] md:[object-position:center]"
        >
          <source src={heroVideoMp4} type="video/mp4" />
          <source src={heroVideoWebm} type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--lcd-bg)]/20 via-transparent to-[var(--lcd-bg)]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_100%,rgba(5,5,5,0.85),transparent_60%)]" />
      </motion.div>

      <button
        type="button"
        data-sound-toggle
        onClick={toggleSound}
        aria-pressed={soundEnabled}
        className={`fixed bottom-24 right-5 z-30 inline-flex items-center gap-3 rounded-full border border-[var(--lcd-fg)]/20 bg-[var(--lcd-bg)]/45 px-4 py-3 text-hairline text-[var(--lcd-fg)] backdrop-blur transition-all duration-500 md:absolute md:bottom-10 md:right-10 ${
          heroInView ? "pointer-events-auto" : "pointer-events-none translate-y-3 opacity-0"
        } ${
          heroInView && soundPromptVisible && !soundEnabled ? "opacity-100" : "opacity-70 hover:opacity-100"
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {!soundEnabled && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lcd-accent)] opacity-60" />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              soundEnabled ? "bg-[var(--lcd-fg)]" : "bg-[var(--lcd-accent)]"
            }`}
          />
        </span>
        {soundEnabled ? "Couper le son" : "Activer le son"}
      </button>

      <div className="relative z-10 px-5 md:px-10">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-6 text-hairline text-[var(--lcd-fg)]/80 md:mb-8"
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[var(--lcd-accent)] align-middle" />
          Studio digital · Cinéma & artistes
        </motion.div>

        <h1 className="font-[var(--font-display)] text-[clamp(2.4rem,7.2vw,9rem)] font-medium leading-[0.92] tracking-[-0.03em]">
          <RevealLines
            delay={0.55}
            lines={[
              <>Le site qui fait</>,
              <>parler de votre film</>,
              <>
                <span className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">
                  et de votre musique.
                </span>
              </>,
            ]}
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-8 flex flex-col gap-8 md:mt-12 md:flex-row md:flex-wrap md:items-end md:justify-between"
        >
          <div className="flex max-w-xl flex-col gap-4">
            <p className="text-base leading-relaxed text-[var(--lcd-fg)]/85 md:text-lg">
              Sortie en salle, album, tournée : on conçoit des sites et des expériences
              interactives qui créent l'attente et remplissent les salles.
            </p>
            <p className="text-hairline text-[var(--lcd-dim)]">
              Ils nous ont fait confiance — <span className="text-[var(--lcd-fg)]">Kev Adams</span> ·{" "}
              <span className="text-[var(--lcd-fg)]">Apollo Films</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 rounded-full bg-[var(--lcd-fg)] px-6 py-4 text-[var(--lcd-bg)] transition-opacity hover:opacity-90"
            >
              <span className="text-hairline">Présenter mon projet</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#offres" className="group inline-flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--lcd-line)] transition-colors group-hover:border-[var(--lcd-fg)]">
                <ArrowDown className="h-4 w-4" />
              </span>
              <span className="text-hairline">Voir les offres</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------- Featured Projects ---------------------------- */

/* -------------------------------- Studio -------------------------------- */

function Studio() {
  return (
    <section
      id="studio"
      className="relative border-t border-[var(--lcd-line)] py-14 md:py-24"
    >
      <div className="px-5 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div className="md:col-span-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-[var(--lcd-line)] bg-[var(--lcd-elev)]">
            <img
              src={geremyPortrait}
              alt="Gérémy — Fondateur de LCD"
              className="absolute inset-0 h-full w-full object-cover grayscale-[20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--lcd-bg)]/90 via-[var(--lcd-bg)]/20 to-[var(--lcd-bg)]/10" />
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[var(--lcd-fg)]/80">
                <span>Studio</span>
                <span>2026</span>
              </div>
              <div>
                <div className="mt-2 text-xs uppercase tracking-[0.3em] text-[var(--lcd-fg)]/80">
                  Founder · Direction créative
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--lcd-dim)] mb-6">
            — Le studio
          </div>
          <h2 className="font-[var(--font-serif)] text-[clamp(2.2rem,5vw,4.5rem)] leading-[1.05] tracking-tight">
            Une <em className="italic text-[var(--lcd-dim)]">écriture visuelle</em> au
            service des projets qui marquent.
          </h2>
          <div className="mt-8 max-w-2xl space-y-5 text-[var(--lcd-dim)] text-base md:text-lg leading-relaxed">
            <p>
              LCD accompagne les films et les artistes qui ont une histoire à raconter.
              On conçoit des expériences digitales pensées comme des objets de promotion —
              soignées, impactantes, à part entière.
            </p>
            <p>
              Petit studio par choix, obsessionnel sur le détail. Passionné par le cinéma
              et le monde artistique, je me renouvelle à chaque projet : changer de
              registre, s'adapter, réinventer la mise en scène. La répétition n'est pas mon
              terrain.
            </p>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px w-16 bg-[var(--lcd-line)]" />
            <div className="font-[var(--font-serif)] italic text-xl text-[var(--lcd-fg)]">
              Gérémy
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--lcd-dim)]">
              Fondateur
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Clients -------------------------------- */

const CLIENTS = [
  "Kev Adams",
  "Apollo Films",
  "Holà los Padelistos",
  "Raw Talent Sports",
];

function Clients() {
  const items = [...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS];

  return (
    <section
      aria-label="Ils nous ont fait confiance"
      className="relative overflow-hidden border-t border-[var(--lcd-line)] py-10 md:py-14"
    >
      <div className="px-5 md:px-10">
        <div className="mb-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-[var(--lcd-dim)] md:mb-8">
          <span>— Ils nous font confiance</span>
          <span className="h-px flex-1 bg-[var(--lcd-line)]" />
        </div>
      </div>

      <div className="group relative flex overflow-hidden">
        <div className="marquee flex shrink-0 items-center gap-8 md:gap-14">
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-4 md:gap-6"
            >
              <span className="font-[var(--font-serif)] text-base italic text-[var(--lcd-dim)] md:text-xl">
                {String((i % CLIENTS.length) + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-nowrap font-[var(--font-display)] text-xl font-medium tracking-[-0.01em] text-[var(--lcd-fg)] md:text-3xl">
                {name}
              </span>
              <span className="mx-2 h-1.5 w-1.5 rounded-full bg-[var(--lcd-accent)] md:mx-4" />
            </div>
          ))}
        </div>
        <div className="marquee flex shrink-0 items-center gap-8 md:gap-14" aria-hidden="true">
          {items.map((name, i) => (
            <div
              key={`dup-${name}-${i}`}
              className="flex shrink-0 items-center gap-4 md:gap-6"
            >
              <span className="font-[var(--font-serif)] text-base italic text-[var(--lcd-dim)] md:text-xl">
                {String((i % CLIENTS.length) + 1).padStart(2, "0")}
              </span>
              <span className="whitespace-nowrap font-[var(--font-display)] text-xl font-medium tracking-[-0.01em] text-[var(--lcd-fg)] md:text-3xl">
                {name}
              </span>
              <span className="mx-2 h-1.5 w-1.5 rounded-full bg-[var(--lcd-accent)] md:mx-4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Featured Projects ---------------------------- */

type Project = {
  title: string;
  kicker: string;
  desc: string;
  img: string;
  backdrop?: string;
  gallery?: string[];
  year?: string;
  client?: string;
  role?: string[];
  story?: string;
  url?: string;
};


// Images de repli pour les projets sans cover_url (rotation cinématographique).
const FALLBACK_IMAGES = [permisImg, kevImg, rawImg, padelImg];

type DbProject = Database["public"]["Tables"]["projects"]["Row"];


function dbToProject(p: DbProject, i: number): Project {
  return {
    title: p.title,
    kicker: p.subtitle ?? p.client ?? "Projet",
    desc: p.description ?? "",
    img: p.cover_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    backdrop: p.backdrop_url ?? undefined,
    gallery: (p as unknown as { gallery?: string[] }).gallery ?? [],
    year: p.year ?? undefined,
    client: p.client ?? undefined,
    role: p.roles?.length ? p.roles : undefined,
    story: p.story ?? undefined,
    url: p.url ?? undefined,
  };
}

function Featured() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [view, setView] = useState<"grid" | "index">("grid");
  const { data: rows = [], isLoading } = useProjects();
  const projects = rows.map(dbToProject);
  return (
    <section id="projets" className="relative border-t border-[var(--lcd-line)] py-14 md:py-24">
      <div className="px-5 md:px-10">
        <SectionHead
          index="02"
          eyebrow="Réalisations"
          title={["Des projets", <em key="e" className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">qui laissent une trace.</em>]}
        />

        <div className="mt-10 flex items-center justify-between gap-4 md:mt-14">
          <span className="text-hairline text-[var(--lcd-dim)]">
            {projects.length.toString().padStart(2, "0")} projets — vue d'ensemble
          </span>
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--lcd-line)] p-1">
            {(["grid", "index"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1.5 text-hairline transition-colors ${
                  view === v ? "bg-[var(--lcd-fg)] text-[var(--lcd-bg)]" : "text-[var(--lcd-dim)] hover:text-[var(--lcd-fg)]"
                }`}
              >
                {v === "grid" ? "Grille" : "Index"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="mt-16 text-hairline text-[var(--lcd-dim)]">Chargement des projets…</p>
        ) : projects.length === 0 ? (
          <p className="mt-16 text-hairline text-[var(--lcd-dim)]">Aucun projet publié pour le moment.</p>
        ) : view === "grid" ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:grid-cols-4 md:gap-x-6 md:gap-y-16">
            {projects.map((p, i) => (
              <ProjectThumb
                key={p.title + i}
                project={p}
                index={i}
                total={projects.length}
                onOpen={() => setActiveIdx(i)}
              />
            ))}
          </div>
        ) : (
          <ProjectIndex projects={projects} onOpen={(i) => setActiveIdx(i)} />
        )}
      </div>
      <ProjectModal
        project={activeIdx !== null ? projects[activeIdx] ?? null : null}
        onClose={() => setActiveIdx(null)}
      />
    </section>
  );
}

function ProjectThumb({
  project,
  index,
  total,
  onOpen,
}: {
  project: Project;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <article ref={ref} className="group relative" data-cursor>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ouvrir ${project.title}`}
        className="relative block w-full overflow-hidden text-left"
      >
        <div
          className="aspect-[3/4] w-full"
          style={{
            clipPath: inView ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
            transition: "clip-path 0.9s cubic-bezier(0.2,0.8,0.2,1)",
          }}
        >
          <motion.img
            src={project.img}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover"
            initial={{ scale: 1.1 }}
            animate={inView ? { scale: 1 } : { scale: 1.1 }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--lcd-bg)]/80 to-transparent" />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between text-[10px] uppercase tracking-[0.2em] text-[var(--lcd-fg)]/70">
          <span>{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
          <span>{project.year ?? ""}</span>
        </div>
      </button>
      <div className="mt-3">
        <h3 className="font-[var(--font-display)] text-base font-medium leading-tight tracking-[-0.01em] md:text-lg">
          {project.title}
        </h3>
        <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[var(--lcd-dim)]">{project.kicker}</p>
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            data-cursor
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[var(--lcd-fg)] underline-offset-4 hover:underline"
          >
            Voir le projet <ArrowRight className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function ProjectIndex({ projects, onOpen }: { projects: Project[]; onOpen: (i: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative mt-10 md:mt-14">
      <ul className="border-t border-[var(--lcd-line)]">
        {projects.map((p, i) => (
          <li key={p.title + i} className="relative border-b border-[var(--lcd-line)]">
            <button
              type="button"
              onClick={() => onOpen(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              data-cursor
              className="group grid w-full grid-cols-12 items-center gap-3 py-5 text-left transition-colors hover:bg-white/[0.02] md:py-6"
            >
              <span className="col-span-2 text-hairline text-[var(--lcd-dim)] md:col-span-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="col-span-10 font-[var(--font-display)] text-2xl font-medium leading-none tracking-[-0.01em] md:col-span-6 md:text-3xl">
                {p.title}
              </span>
              <span className="col-span-8 col-start-3 text-hairline text-[var(--lcd-dim)] md:col-span-3 md:col-start-auto">
                {p.kicker}
              </span>
              <span className="col-span-2 text-right text-hairline text-[var(--lcd-dim)]">
                {p.year ?? ""}
              </span>
            </button>
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 bg-[var(--lcd-bg)] px-3 py-1 text-hairline text-[var(--lcd-fg)] opacity-0 transition-opacity hover:underline md:inline-flex md:group-hover:opacity-100"
                aria-label={`Voir le projet ${p.title}`}
              >
                Voir ↗
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      {/* Aperçu flottant desktop */}
      <div className="pointer-events-none absolute right-6 top-0 hidden h-full w-64 md:block">
        <div className="sticky top-24">
          {hover !== null && projects[hover] ? (
            <motion.img
              key={hover}
              src={projects[hover].img}
              alt=""
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-[3/4] w-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const open = project !== null;
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <motion.div
      initial={false}
      animate={open ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed inset-0 z-[80] overflow-y-auto bg-[var(--lcd-bg)]"
      data-lenis-prevent
      style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
    >
      {project ? (
        <>
          <motion.div
            initial={{ scale: 1.06 }}
            animate={open ? { scale: 1 } : { scale: 1.06 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative h-[70svh] w-full overflow-hidden"
          >
            <img
              src={project.backdrop || project.img}
              alt={project.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[var(--lcd-bg)]" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-6 md:px-10 md:py-8">
              <span className="text-hairline text-[var(--lcd-fg)]/80">
                <span className="text-[var(--lcd-accent)]">●</span> Case study
              </span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center gap-3 rounded-full border border-[var(--lcd-fg)]/30 px-5 text-hairline uppercase text-[var(--lcd-fg)]/90 backdrop-blur-sm transition-colors hover:bg-[var(--lcd-fg)]/10"
              >
                Fermer
                <span aria-hidden>✕</span>
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
              <div className="text-hairline text-[var(--lcd-dim)]">{project.kicker}</div>
              <h3 className="mt-4 font-[var(--font-display)] text-[clamp(2.4rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.03em]">
                {project.title}
              </h3>
            </div>
          </motion.div>

          <div className="mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-24">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <MetaBlock label="Client" value={project.client ?? "—"} />
              <MetaBlock label="Année" value={project.year ?? "—"} />
              <MetaBlock
                label="Périmètre"
                value={project.role?.join(" · ") ?? "—"}
              />
            </div>
            <p className="mt-16 max-w-3xl font-[var(--font-serif)] text-2xl italic leading-snug text-[var(--lcd-fg)] md:text-4xl">
              {project.story}
            </p>
            <p className="mt-8 max-w-3xl text-sm text-[var(--lcd-dim)] md:text-base">
              {project.desc}
            </p>
            {project.gallery && project.gallery.length ? (
              <div className="mt-20 md:mt-28">
                <div className="mb-8 flex items-center gap-4 text-hairline text-[var(--lcd-dim)] md:mb-12">
                  <span className="h-px flex-1 bg-[var(--lcd-line)]" />
                  <span>Le site — vu depuis le mobile</span>
                  <span className="h-px flex-1 bg-[var(--lcd-line)]" />
                </div>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10">
                  {project.gallery.map((url, i) => (
                    <PhoneFrame key={url + i} src={url} index={i} />
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-20 md:mt-28">
              <div className="mb-6 text-hairline text-[var(--lcd-dim)]">Couverture</div>
              <div className="relative overflow-hidden border border-[var(--lcd-line)]">
                <img src={project.img} alt={project.title} className="w-full object-cover" />
              </div>
            </div>
            <div className="mt-16 flex flex-wrap items-center gap-4">
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-4 border border-[var(--lcd-fg)] bg-[var(--lcd-fg)] px-6 py-4 text-[var(--lcd-bg)] transition-colors hover:bg-transparent hover:text-[var(--lcd-fg)]"
                >
                  <span className="text-hairline">Voir le site en ligne</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </a>
              ) : null}
              <a
                href="#contact"
                onClick={onClose}
                className="group inline-flex items-center gap-4 border border-[var(--lcd-fg)]/40 px-6 py-4 transition-colors hover:border-[var(--lcd-fg)]"
              >
                <span className="text-hairline">Un projet similaire ?</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="text-hairline text-[var(--lcd-dim)] hover:text-[var(--lcd-fg)]"
              >
                ← retour aux projets
              </button>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-[var(--lcd-line)] pt-4">
      <span className="text-hairline text-[var(--lcd-dim)]">{label}</span>
      <span className="font-[var(--font-display)] text-lg">{value}</span>
    </div>
  );
}

/* --------------------------------- Offres --------------------------------- */

type Offer = {
  type: "film" | "artiste";
  label: string;
  title: React.ReactNode;
  pitch: string;
  items: string[];
  delay: string;
  proof: string;
  cta: string;
  img: string;
  page: string;
  pageLabel: string;
};

const OFFERS: Offer[] = [
  {
    type: "film",
    label: "Pour les distributeurs & productions",
    title: <>Sortie <em className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">de film</em></>,
    pitch:
      "Un site événement pensé comme une campagne : on donne envie de voir le film, et on envoie le public en salle.",
    items: [
      "Site de sortie sur mesure, dans l'univers du film",
      "Mécanique virale : jeu, énigme, QR code en salle",
      "Bande-annonce, casting, presse, séances en 1 clic",
      "Pensé mobile d'abord, prêt pour les réseaux",
    ],
    delay: "Livré en 3 à 5 semaines avant la sortie",
    proof: "Apollo Films — Le Permis, La Maison de nos rêves",
    cta: "Lancer un projet film",
    img: permisImg,
    page: "/site-sortie-film",
    pageLabel: "Tout savoir sur nos sites de film",
  },
  {
    type: "artiste",
    label: "Pour les artistes, managers & labels",
    title: <>Site <em className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">d'artiste</em></>,
    pitch:
      "Un site officiel à la hauteur de votre présence sur scène, qui rassemble votre public et vend vos dates.",
    items: [
      "Site officiel avec une vraie identité visuelle",
      "Tournée, billetterie et actus centralisées",
      "Lancement d'album ou de spectacle : page événement dédiée",
      "Autonomie totale pour mettre à jour vos dates",
    ],
    delay: "Livré en 3 à 4 semaines",
    proof: "Kev Adams — site officiel",
    cta: "Lancer un projet artiste",
    img: kevImg,
    page: "/creation-site-artiste",
    pageLabel: "Tout savoir sur nos sites d'artiste",
  },
];

function Offers() {
  return (
    <section id="offres" className="relative border-t border-[var(--lcd-line)] py-14 md:py-24">
      <div className="px-5 md:px-10">
        <SectionHead
          index="01"
          eyebrow="Offres"
          title={[<>Deux spécialités.</>, <em key="e" className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">Une seule obsession.</em>]}
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-px border-y border-[var(--lcd-line)] bg-[var(--lcd-line)] md:mt-16 lg:grid-cols-2">
        {OFFERS.map((o, i) => (
          <OfferCard key={o.type} offer={o} index={i} />
        ))}
      </div>

      <p className="mt-10 px-5 text-sm text-[var(--lcd-dim)] md:px-10">
        Humoriste ou artiste de spectacle ?{" "}
        <a href="/site-humoriste" className="text-[var(--lcd-fg)] underline underline-offset-4">
          Découvrez nos sites d'humoristes
        </a>
        . Un autre projet — sportif, événement, marque ?{" "}
        <a
          href="#contact"
          onClick={() => selectBriefType("autre")}
          className="text-[var(--lcd-fg)] underline underline-offset-4"
        >
          Parlons-en aussi
        </a>
        .
      </p>
    </section>
  );
}

function OfferCard({ offer, index }: { offer: Offer; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px -15% 0px", once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.1 }}
      className="group flex flex-col bg-[var(--lcd-bg)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={offer.img}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover grayscale-[15%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--lcd-bg)] via-black/20 to-transparent" />
        <span className="absolute left-5 top-5 text-hairline text-[var(--lcd-fg)]/85 md:left-8 md:top-8">
          {String(index + 1).padStart(2, "0")} · {offer.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-6 px-5 pb-10 pt-2 md:px-8 md:pb-12">
        <h3 className="font-[var(--font-display)] text-4xl font-medium leading-tight tracking-[-0.02em] md:text-5xl">
          {offer.title}
        </h3>
        <p className="max-w-lg text-base leading-relaxed text-[var(--lcd-fg)]/85">{offer.pitch}</p>
        <ul className="flex flex-col gap-2.5 text-sm text-[var(--lcd-fg)]/80 md:text-base">
          {offer.items.map((it) => (
            <li key={it} className="flex items-baseline gap-3">
              <span className="h-px w-4 shrink-0 translate-y-[-4px] bg-[var(--lcd-accent)]" />
              {it}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-1 border-t border-[var(--lcd-line)] pt-5 text-hairline">
          <span className="text-[var(--lcd-fg)]">{offer.delay}</span>
          <span className="text-[var(--lcd-dim)]">Référence : {offer.proof}</span>
        </div>
        <a
          href="#contact"
          onClick={() => selectBriefType(offer.type)}
          className="group/cta inline-flex w-fit items-center gap-4 border border-[var(--lcd-fg)]/40 px-6 py-4 transition-colors hover:border-[var(--lcd-fg)] hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)]"
        >
          <span className="text-hairline">{offer.cta}</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-1" />
        </a>
        <a
          href={offer.page}
          className="w-fit text-hairline text-[var(--lcd-dim)] underline underline-offset-4 hover:text-[var(--lcd-fg)]"
        >
          {offer.pageLabel} →
        </a>
      </div>
    </motion.div>
  );
}

/* ------------------------------- Approach ------------------------------- */

const STEPS = [
  { n: "01", t: "Découvrir", d: "Comprendre l'univers, l'audience et les enjeux du projet." },
  { n: "02", t: "Imaginer", d: "Conceptualiser des idées fortes et des mécaniques engageantes." },
  { n: "03", t: "Concevoir", d: "Designer des expériences belles, fluides, intuitives." },
  { n: "04", t: "Développer", d: "Développer avec les meilleures technologies pour des performances optimales." },
  { n: "05", t: "Lancer", d: "Déployer, orchestrer, mesurer l'onde de choc." },
  { n: "06", t: "Faire évoluer", d: "Ajuster et faire évoluer l'expérience dans le temps." },
];

function Approach() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const height = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  return (
    <section id="approche" className="relative border-t border-[var(--lcd-line)] py-14 md:py-24">
      <div className="px-5 md:px-10">
        <SectionHead
          index="04"
          eyebrow="Notre approche"
          title={[<>Des idées.</>, <>Un processus.</>, <em key="e" className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">Des émotions.</em>]}
        />
      </div>

      <div ref={ref} className="relative mx-auto mt-20 max-w-5xl px-5 md:mt-28 md:px-10">
        <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-[var(--lcd-line)] md:left-16" />
        <motion.div
          style={{ height }}
          className="pointer-events-none absolute left-8 top-0 w-px bg-[var(--lcd-accent)] md:left-16"
        />

        <ul className="flex flex-col gap-16 md:gap-24">
          {STEPS.map((s, i) => (
            <Step key={s.n} step={s} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Step({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  return (
    <li ref={ref} className="relative grid grid-cols-[4rem_1fr] items-start gap-6 md:grid-cols-[8rem_1fr] md:gap-10">
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="relative z-10 grid h-16 w-16 place-items-center rounded-full border border-[var(--lcd-line)] bg-[var(--lcd-bg)] text-hairline"
        >
          {step.n}
        </motion.div>
      </div>
      <div className="pt-3">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="font-[var(--font-display)] text-4xl font-medium tracking-[-0.02em] md:text-6xl"
        >
          {step.t}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="mt-4 max-w-md text-sm text-[var(--lcd-dim)] md:text-base"
        >
          {step.d}
        </motion.p>
      </div>
      {index === STEPS.length - 1 ? null : null}
    </li>
  );
}

/* --------------------------------- Phone --------------------------------- */

function PhoneFrame({ src, index }: { src: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, ease: EASE, delay: (index % 3) * 0.08 }}
      className={`relative mx-auto w-full max-w-[260px] ${index % 2 === 1 ? "md:translate-y-10" : ""}`}
    >
      <div className="relative aspect-[9/19.5] rounded-[2.2rem] border border-[var(--lcd-fg)]/20 bg-black p-[8px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div className="relative h-full w-full overflow-hidden rounded-[1.7rem]">
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------ Concept Lab ------------------------------ */

type DbConcept = {
  id: string;
  slug: string;
  tag: string;
  title: string;
  pitch: string;
  image_url: string | null;
  sort_order: number;
  published: boolean;
};

const CONCEPT_FALLBACK_IMAGES = [missionImg, cannesImg, rolandImg, tourImg];

const CONCEPTS_FALLBACK = [
  {
    tag: "Nouveau concept",
    title: "Mission Impossible",
    pitch: "Et si votre téléphone devenait votre mission ? Un appel mystérieux, une série d'énigmes, un compte à rebours.",
    img: missionImg,
  },
  {
    tag: "Concept festival",
    title: "Festival de Cannes",
    pitch: "Et si le Festival devenait une expérience digitale immersive, ouverte depuis n'importe quel salon dans le monde ?",
    img: cannesImg,
  },
  {
    tag: "Concept sport",
    title: "Roland-Garros",
    pitch: "Une expérience interactive pour suivre chaque échange, chaque coup droit, chaque silence de la terre battue.",
    img: rolandImg,
  },
  {
    tag: "Concept live",
    title: "Tour de France",
    pitch: "Une carte interactive, des défis, des classements. Le peloton en temps réel dans la poche des fans.",
    img: tourImg,
  },
];

function ConceptLab({ featured = false }: { featured?: boolean } = {}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const { data } = useConcepts();
  const items = (data ?? []).map((c, i) => ({
    tag: c.tag,
    title: c.title,
    pitch: c.pitch,
    img: c.image_url || CONCEPT_FALLBACK_IMAGES[i % CONCEPT_FALLBACK_IMAGES.length],
  }));
  if (items.length === 0 && !featured) return null;
  return (
    <section id="concepts" className="relative overflow-hidden border-t border-[var(--lcd-line)] py-14 md:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="marquee flex whitespace-nowrap opacity-[0.04]">
          {[0, 1].map((k) => (
            <span
              key={k}
              className="mr-16 font-[var(--font-serif)] text-[18vw] italic leading-none"
            >
              concept lab · concept lab ·
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-5 md:px-10">
        <SectionHead
          index={featured ? "01" : "05"}
          eyebrow={featured ? "En ce moment · Concept lab" : "Concept lab"}
          title={
            featured
              ? [<>Les idées</>, <em key="e" className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">en cours d'exploration.</em>]
              : [<>Le laboratoire</>, <em key="e" className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">des idées à venir.</em>]
          }
        />

        {items.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-6 md:mt-24 md:grid-cols-2 md:gap-10">
            {items.map((c, i) => (
              <ConceptCard key={c.title} c={c} index={i} onOpen={() => setActiveIdx(i)} />
            ))}
          </div>
        ) : (
          <div className="mt-16 border border-dashed border-[var(--lcd-line)] p-10 text-center text-sm text-[var(--lcd-dim)] md:mt-24 md:p-16">
            Aucun concept publié pour le moment. Les prochaines idées apparaîtront ici.
          </div>
        )}
      </div>
      <ConceptModal
        concept={activeIdx !== null ? items[activeIdx] ?? null : null}
        onClose={() => setActiveIdx(null)}
      />
    </section>
  );
}

function ConceptCard({
  c,
  index,
  onOpen,
}: {
  c: { tag: string; title: string; pitch: string; img: string };
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 1, ease: EASE, delay: (index % 2) * 0.15 }}
      className={`group relative flex flex-col overflow-hidden border border-[var(--lcd-line)] bg-[#0a0a0a] ${index % 3 === 1 ? "md:translate-y-16" : ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Découvrir le concept ${c.title}`}
        className="flex flex-1 flex-col text-left"
        data-cursor
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img
            src={c.img}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: EASE }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 text-hairline text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--lcd-accent)]" />
            {c.tag}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
          <h3 className="font-[var(--font-display)] text-4xl font-medium leading-[0.95] tracking-[-0.02em] md:text-5xl">
            {c.title}
          </h3>
          <p className="max-w-md text-sm text-[var(--lcd-dim)] md:text-base">{c.pitch}</p>
          <div className="mt-auto flex items-center gap-3 text-hairline">
            découvrir le concept
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </button>
    </motion.article>
  );
}

function ConceptModal({
  concept,
  onClose,
}: {
  concept: { tag: string; title: string; pitch: string; img: string } | null;
  onClose: () => void;
}) {
  const open = concept !== null;
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <motion.div
      initial={false}
      animate={open ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed inset-0 z-[80] overflow-y-auto bg-[var(--lcd-bg)]"
      data-lenis-prevent
      style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
    >
      {concept ? (
        <>
          <motion.div
            initial={{ scale: 1.06 }}
            animate={open ? { scale: 1 } : { scale: 1.06 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative h-[60svh] w-full overflow-hidden"
          >
            <img src={concept.img} alt={concept.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[var(--lcd-bg)]" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-6 md:px-10 md:py-8">
              <span className="text-hairline text-[var(--lcd-fg)]/80">
                <span className="text-[var(--lcd-accent)]">●</span> Concept lab
              </span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center gap-3 rounded-full border border-[var(--lcd-fg)]/30 px-5 text-hairline uppercase text-[var(--lcd-fg)]/90 backdrop-blur-sm transition-colors hover:bg-[var(--lcd-fg)]/10"
              >
                Fermer
                <span aria-hidden>✕</span>
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-10 md:pb-14">
              <div className="text-hairline text-[var(--lcd-dim)]">{concept.tag}</div>
              <h3 className="mt-4 font-[var(--font-display)] text-[clamp(2.4rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.03em]">
                {concept.title}
              </h3>
            </div>
          </motion.div>

          <div className="mx-auto max-w-3xl px-5 py-16 md:px-10 md:py-24">
            <p className="max-w-3xl font-[var(--font-serif)] text-2xl italic leading-snug text-[var(--lcd-fg)] md:text-4xl">
              {concept.pitch}
            </p>
            <div className="mt-16 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                onClick={onClose}
                className="group inline-flex items-center gap-4 border border-[var(--lcd-fg)] bg-[var(--lcd-fg)] px-6 py-4 text-[var(--lcd-bg)] transition-colors hover:bg-transparent hover:text-[var(--lcd-fg)]"
              >
                <span className="text-hairline">Discuter de ce concept</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="text-hairline text-[var(--lcd-dim)] hover:text-[var(--lcd-fg)]"
              >
                ← retour aux concepts
              </button>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

/* --------------------------------- Trust --------------------------------- */

/* ------------------------------ Case studies ----------------------------- */

type CasePreview = {
  id: string;
  slug: string;
  client: string;
  title: string;
  tagline: string | null;
  cover_url: string | null;
  release_label: string | null;
};

function CaseStudiesPreview() {
  const { data = [] } = useCasePreviews();

  if (data.length === 0) return null;

  return (
    <section
      id="etudes"
      className="relative overflow-hidden border-t border-[var(--lcd-line)] py-14 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="marquee flex whitespace-nowrap opacity-[0.03]">
          {[0, 1].map((k) => (
            <span
              key={k}
              className="mr-16 font-[var(--font-serif)] text-[18vw] italic leading-none"
            >
              études de cas · études de cas ·
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-5 md:px-10">
        <SectionHead
          index="03"
          eyebrow="Études de cas"
          title={[
            <>Le parcours,</>,
            <em key="e" className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">
              pas seulement le résultat.
            </em>,
          ]}
          aside={
            <span className="text-hairline text-[var(--lcd-dim)]">
              {String(data.length).padStart(2, "0")} récits
            </span>
          }
        />

        <ul className="mt-16 flex flex-col divide-y divide-[var(--lcd-line)] border-y border-[var(--lcd-line)] md:mt-24">
          {data.map((c, i) => (
            <CaseRow key={c.id} c={c} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CaseRow({ c, index }: { c: CasePreview; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.05 }}
      className="group relative"
    >
      <Link
        to="/etudes/$slug"
        params={{ slug: c.slug }}
        className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-1 py-8 md:grid-cols-[3rem_1fr_1fr_auto] md:gap-8 md:py-12"
        data-cursor
      >
        <span className="text-hairline text-[var(--lcd-dim)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <div className="text-hairline text-[var(--lcd-dim)]">Étude de cas — {c.client}</div>
          <div className="mt-2 font-[var(--font-display)] text-2xl leading-tight tracking-tight md:text-4xl">
            {c.title}
          </div>
        </div>
        <div className="hidden max-w-md text-sm italic text-[var(--lcd-dim)] md:block">
          {c.tagline ? `« ${c.tagline.replace(/^[«"]\s*|\s*[»"]$/g, "")} »` : c.release_label ?? ""}
        </div>
        <div className="flex items-center gap-3 text-hairline text-[var(--lcd-dim)] transition-colors group-hover:text-[var(--lcd-fg)]">
          <span className="hidden md:inline">lire l'étude</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
      {c.cover_url ? (
        <div className="pointer-events-none absolute right-8 top-1/2 hidden aspect-[16/10] w-52 -translate-y-1/2 overflow-hidden border border-[var(--lcd-line)] opacity-0 shadow-2xl transition-opacity duration-500 group-hover:opacity-100 md:right-40 md:block">
          <img src={c.cover_url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
    </motion.li>
  );
}


/* ------------------------------- Pull quote ------------------------------- */

function PullQuote() {
  const ref = useRef<HTMLDivElement>(null);
  const words = "Nous ne créons pas des sites. Nous créons des expériences dont on se souvient.".split(" ");
  const inView = useInView(ref, { once: true, margin: "-20%" });
  return (
    <section ref={ref} className="relative py-16 md:py-28">
      <div className="mx-auto max-w-6xl px-5 text-center md:px-10">
        <p className="font-[var(--font-display)] text-[clamp(2rem,6vw,6rem)] font-medium leading-[1.05] tracking-[-0.02em]">
          {words.map((w, i) => {
            const italic = i >= 5 && i <= 7; // "des sites."
            return (
              <span key={i} className="inline-block overflow-hidden pb-2 pr-3">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={inView ? { y: "0%" } : { y: "110%" }}
                  transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 }}
                  className={`inline-block ${italic ? "font-[var(--font-serif)] italic text-[var(--lcd-dim)]" : ""}`}
                >
                  {w}
                </motion.span>
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}

/* -------------------------------- Final CTA -------------------------------- */

function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <section id="contact" ref={ref} className="relative isolate overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src={ctaImg}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </motion.div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col items-start gap-8 lg:col-span-5">
          <span className="text-hairline text-[var(--lcd-dim)]">
            <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[var(--lcd-accent)] align-middle" />
            parlons de votre prochaine sortie
          </span>
          <h2 className="font-[var(--font-display)] text-[clamp(2.6rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.03em]">
            Votre sortie
            <br />
            approche ?{" "}
            <em className="font-[var(--font-serif)] italic text-[var(--lcd-dim)]">Parlons-en.</em>
          </h2>
          <ul className="flex flex-col gap-3 text-base text-[var(--lcd-fg)]/85">
            {[
              "Réponse et première idée sous 48 h",
              "Site livré en 3 à 5 semaines, calé sur votre date",
              "Un interlocuteur unique, de l'idée à la mise en ligne",
            ].map((t) => (
              <li key={t} className="flex items-baseline gap-3">
                <span className="h-px w-5 shrink-0 translate-y-[-4px] bg-[var(--lcd-accent)]" />
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-hairline">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[var(--lcd-fg)] underline-offset-4 hover:underline"
            >
              WhatsApp · {CONTACT_PHONE_LABEL}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[var(--lcd-dim)] underline-offset-4 hover:text-[var(--lcd-fg)] hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <BriefForm />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Footer --------------------------------- */

function Footer({
  hasConcepts = true,
  hasCases = true,
}: { hasConcepts?: boolean; hasCases?: boolean } = {}) {
  const studioLinks = [
    { label: "À propos", href: "#studio" },
    { label: "Offres", href: "#offres" },
    { label: "Projets", href: "#projets" },
    { label: "Approche", href: "#approche" },
    ...(hasConcepts ? [{ label: "Concepts", href: "#concepts" }] : []),
    ...(hasCases ? [{ label: "Études de cas", href: "#etudes" }] : []),
    { label: "Contact", href: "#contact" },
  ];
  return (
    <footer className="border-t border-[var(--lcd-line)] px-5 pb-8 pt-20 md:px-10 md:pt-32">
      <div className="flex flex-col justify-between gap-16 md:flex-row">
        <div className="max-w-md">
          <img
            src={lcdLogo}
            alt="LCD — Digital Experiences Studio"
            width={480}
            height={480}
            loading="lazy"
            className="h-auto w-40 md:w-52"
          />
          <p className="mt-6 text-sm text-[var(--lcd-dim)]">
            Studio digital spécialisé dans les sites de sortie de films et les sites
            d'artistes.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <FooterCol
            title="Studio"
            links={studioLinks}
          />
          <FooterCol
            title="Expertises"
            links={LANDINGS.map((l) => ({ label: l.navLabel, href: l.path }))}
          />
          <FooterCol
            title="Suivez-nous"
            links={[
              { label: "Instagram", href: "https://www.instagram.com/lcd_studio_digital" },
              { label: "Facebook", href: "https://www.facebook.com/people/Le-Connecteur-Digital/61566337440874/" },
            ]}
          />
          <FooterCol
            title="Contact"
            links={[
              { label: "hello@lcdstudio.fr", href: "mailto:hello@lcdstudio.fr" },
              { label: "0033 6 13 63 09 84", href: "tel:+33613630984" },
              { label: "WhatsApp", href: whatsappUrl() },
              { label: "France", href: "#" },
            ]}
          />
        </div>
      </div>
      <div className="mt-20 flex flex-col items-start justify-between gap-3 border-t border-[var(--lcd-line)] pt-6 text-hairline text-[var(--lcd-dim)] md:flex-row md:items-center">
        <span>© 2026 LCD — Tous droits réservés.</span>
        <span className="flex items-center gap-4">
          Made with intent
          <a href="/admin" className="hover:text-[var(--lcd-fg)]">Admin</a>
        </span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<string | { label: string; href: string }>;
}) {
  return (
    <div>
      <div className="text-hairline text-[var(--lcd-dim)]">{title}</div>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((l) => {
          const item = typeof l === "string" ? { label: l, href: "#" } : l;
          return (
            <li key={item.label}>
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="text-sm transition-colors hover:text-[var(--lcd-accent)]"
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------- Helpers -------------------------------- */

function SectionHead({
  index,
  eyebrow,
  title,
  aside,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode[];
  aside?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  return (
    <div ref={ref} className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-4 text-hairline text-[var(--lcd-dim)]">
          <span>{index}</span>
          <span className="h-px w-10 bg-[var(--lcd-line)]" />
          <span>{eyebrow}</span>
        </div>
        {aside}
      </div>
      <h2 className="font-[var(--font-display)] text-[clamp(2.2rem,7vw,7rem)] font-medium leading-[0.95] tracking-[-0.03em]">
        {title.map((line, i) => (
          <span key={i} className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={inView ? { y: "0%" } : { y: "110%" }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
              className="block"
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h2>
    </div>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="currentColor" aria-hidden>
      <path d="M3 1.5v9l7-4.5-7-4.5z" />
    </svg>
  );
}
function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M6 1v10M2 7l4 4 4-4" />
    </svg>
  );
}
function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M1 6h10M7 2l4 4-4 4" />
    </svg>
  );
}
