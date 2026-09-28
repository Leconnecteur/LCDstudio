import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { draftProjectCopy, draftCaseStudy } from "@/lib/ai-writer.functions";

// Types locaux — la table concepts et la colonne gallery existent en DB.
type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  client: string | null;
  year: string | null;
  url: string | null;
  cover_url: string | null;
  backdrop_url: string | null;
  story: string | null;
  roles: string[];
  gallery: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};
type ProjectInsert = Partial<ProjectRow> & { slug: string; title: string };

type ConceptRow = {
  id: string;
  slug: string;
  tag: string;
  title: string;
  pitch: string;
  image_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};
type ConceptInsert = Partial<ConceptRow> & { slug: string; title: string; pitch: string; tag: string };

type CaseRow = {
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
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};
type CaseInsert = Partial<CaseRow> & { slug: string; title: string; client: string };

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LCD Studio" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyProject: ProjectInsert = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  client: "",
  year: "",
  url: "",
  cover_url: "",
  backdrop_url: "",
  story: "",
  gallery: [],
  roles: [],
  sort_order: 0,
  published: true,
};

const emptyConcept: ConceptInsert = {
  slug: "",
  tag: "Nouveau concept",
  title: "",
  pitch: "",
  image_url: "",
  sort_order: 0,
  published: true,
};

const emptyCase: CaseInsert = {
  slug: "",
  client: "",
  title: "",
  tagline: "",
  release_label: "",
  site_label: "",
  site_url: "",
  cover_url: "",
  backdrop_url: "",
  context: "",
  challenge: "",
  idea: "",
  execution: [],
  gallery: [],
  sort_order: 0,
  published: true,
  project_id: null,
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) {
    return <Shell><p className="text-[var(--lcd-dim)]">Chargement…</p></Shell>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <Shell>
        <p className="text-[var(--lcd-dim)]">
          Votre compte n'est pas administrateur. Contactez le propriétaire du studio.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}
          className="mt-6 text-hairline underline"
        >
          Se déconnecter
        </button>
      </Shell>
    );
  }

  return <Dashboard email={user.email ?? ""} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--lcd-bg)] text-[var(--lcd-fg)]">
      <header className="flex items-center justify-between border-b border-[var(--lcd-line)] px-6 py-5">
        <Link to="/" className="font-[var(--font-serif)] text-2xl">
          LCD<span className="text-[var(--lcd-accent)]">.</span>
          <span className="ml-3 text-hairline text-[var(--lcd-dim)]">Admin</span>
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"leads" | "projects" | "concepts" | "cases">("leads");

  const { data: projects = [], isLoading: loadingP } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as ProjectRow[];
    },
  });
  const { data: concepts = [], isLoading: loadingC } = useQuery({
    queryKey: ["admin-concepts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("concepts")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ConceptRow[];
    },
  });
  const { data: cases = [], isLoading: loadingCS } = useQuery({
    queryKey: ["admin-cases"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("case_studies")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CaseRow[];
    },
  });

  const [editingProject, setEditingProject] = useState<ProjectInsert | null>(null);
  const [editingConcept, setEditingConcept] = useState<ConceptInsert | null>(null);
  const [editingCase, setEditingCase] = useState<CaseInsert | null>(null);

  const upsertProject = useMutation({
    mutationFn: async (p: ProjectInsert) => {
      const { error } = await (supabase as any)
        .from("projects")
        .upsert({ ...p }, { onConflict: "slug" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditingProject(null);
    },
  });
  const delProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const upsertConcept = useMutation({
    mutationFn: async (c: ConceptInsert) => {
      const { error } = await (supabase as any)
        .from("concepts")
        .upsert({ ...c }, { onConflict: "slug" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-concepts"] });
      qc.invalidateQueries({ queryKey: ["concepts"] });
      setEditingConcept(null);
    },
  });
  const delConcept = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("concepts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-concepts"] });
      qc.invalidateQueries({ queryKey: ["concepts"] });
    },
  });

  const upsertCase = useMutation({
    mutationFn: async (c: CaseInsert) => {
      const { error } = await (supabase as any)
        .from("case_studies")
        .upsert({ ...c }, { onConflict: "slug" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-cases"] });
      qc.invalidateQueries({ queryKey: ["case-studies-preview"] });
      setEditingCase(null);
    },
  });
  const delCase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("case_studies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-cases"] });
      qc.invalidateQueries({ queryKey: ["case-studies-preview"] });
    },
  });

  return (
    <Shell>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-4xl tracking-tight">
            {tab === "leads"
              ? "Demandes"
              : tab === "projects"
              ? "Projets"
              : tab === "concepts"
              ? "Concept Lab"
              : "Études de cas"}
          </h1>
          <p className="mt-2 text-sm text-[var(--lcd-dim)]">Connecté · {email}</p>
        </div>
        <div className="flex gap-3">
          {tab === "leads" ? null : tab === "projects" ? (
            <button
              type="button"
              onClick={() =>
                setEditingProject({
                  ...emptyProject,
                  sort_order: (projects.at(-1)?.sort_order ?? 0) + 1,
                })
              }
              className="border border-[var(--lcd-fg)] px-4 py-2 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)]"
            >
              + Nouveau projet
            </button>
          ) : tab === "concepts" ? (
            <button
              type="button"
              onClick={() =>
                setEditingConcept({
                  ...emptyConcept,
                  sort_order: (concepts.at(-1)?.sort_order ?? 0) + 1,
                })
              }
              className="border border-[var(--lcd-fg)] px-4 py-2 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)]"
            >
              + Nouveau concept
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setEditingCase({
                  ...emptyCase,
                  sort_order: (cases.at(-1)?.sort_order ?? 0) + 1,
                })
              }
              className="border border-[var(--lcd-fg)] px-4 py-2 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)]"
            >
              + Nouvelle étude
            </button>
          )}
          <button
            type="button"
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}
            className="text-hairline text-[var(--lcd-dim)] hover:text-[var(--lcd-fg)]"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-8 inline-flex items-center gap-1 rounded-full border border-[var(--lcd-line)] p-1">
        {(["leads", "projects", "concepts", "cases"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={`rounded-full px-4 py-1.5 text-hairline uppercase transition-colors ${
              tab === v
                ? "bg-[var(--lcd-fg)] text-[var(--lcd-bg)]"
                : "text-[var(--lcd-dim)] hover:text-[var(--lcd-fg)]"
            }`}
          >
            {v === "leads"
              ? "Demandes"
              : v === "projects"
              ? `Projets (${projects.length})`
              : v === "concepts"
              ? `Concepts (${concepts.length})`
              : `Études (${cases.length})`}
          </button>
        ))}
      </div>

      {tab === "leads" ? (
        <LeadsPanel />
      ) : tab === "projects" ? (
        loadingP ? (
        <p className="text-[var(--lcd-dim)]">Chargement…</p>
      ) : (
        <ul className="divide-y divide-[var(--lcd-line)] border-y border-[var(--lcd-line)]">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-hairline text-[var(--lcd-dim)]">
                    #{String(p.sort_order).padStart(2, "0")}
                  </span>
                  <span className="font-[var(--font-display)] text-xl">{p.title}</span>
                  {!p.published ? (
                    <span className="text-hairline text-[var(--lcd-accent)]">brouillon</span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-[var(--lcd-dim)]">
                  {p.client ?? "—"} · {p.year ?? "—"} · {p.slug} · {(p.gallery ?? []).length} image(s)
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(p)}
                  className="text-hairline underline"
                >
                  Éditer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Supprimer ${p.title} ?`)) delProject.mutate(p.id);
                  }}
                  className="text-hairline text-[var(--lcd-accent)] underline"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
        )
      ) : tab === "concepts" ? (
        loadingC ? (
        <p className="text-[var(--lcd-dim)]">Chargement…</p>
      ) : (
        <ul className="divide-y divide-[var(--lcd-line)] border-y border-[var(--lcd-line)]">
          {concepts.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-hairline text-[var(--lcd-dim)]">
                    #{String(c.sort_order).padStart(2, "0")}
                  </span>
                  <span className="font-[var(--font-display)] text-xl">{c.title}</span>
                  <span className="text-hairline text-[var(--lcd-accent)]">{c.tag}</span>
                  {!c.published ? (
                    <span className="text-hairline text-[var(--lcd-dim)]">brouillon</span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-[var(--lcd-dim)] line-clamp-1">{c.pitch}</div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setEditingConcept(c)} className="text-hairline underline">
                  Éditer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Supprimer ${c.title} ?`)) delConcept.mutate(c.id);
                  }}
                  className="text-hairline text-[var(--lcd-accent)] underline"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
        )
      ) : loadingCS ? (
        <p className="text-[var(--lcd-dim)]">Chargement…</p>
      ) : (
        <ul className="divide-y divide-[var(--lcd-line)] border-y border-[var(--lcd-line)]">
          {cases.length === 0 ? (
            <li className="py-10 text-center text-sm text-[var(--lcd-dim)]">
              Aucune étude de cas. Crée-en une pour raconter le parcours d'un projet livré.
            </li>
          ) : null}
          {cases.map((cs) => (
            <li key={cs.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-hairline text-[var(--lcd-dim)]">
                    #{String(cs.sort_order).padStart(2, "0")}
                  </span>
                  <span className="font-[var(--font-display)] text-xl">{cs.title}</span>
                  <span className="text-hairline text-[var(--lcd-accent)]">{cs.client}</span>
                  {!cs.published ? (
                    <span className="text-hairline text-[var(--lcd-dim)]">brouillon</span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-[var(--lcd-dim)] line-clamp-1">
                  {cs.tagline ?? cs.slug} · {(cs.execution ?? []).length} pt(s) d'exécution
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/etudes/${cs.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-hairline text-[var(--lcd-dim)] underline"
                >
                  Voir ↗
                </a>
                <button
                  type="button"
                  onClick={() => setEditingCase({ ...cs, project_id: cs.project_id ?? null })}
                  className="text-hairline underline"
                >
                  Éditer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Supprimer ${cs.title} ?`)) delCase.mutate(cs.id);
                  }}
                  className="text-hairline text-[var(--lcd-accent)] underline"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingProject ? (
        <ProjectEditModal
          project={editingProject}
          saving={upsertProject.isPending}
          error={upsertProject.error instanceof Error ? upsertProject.error.message : null}
          onCancel={() => setEditingProject(null)}
          onSave={(p) => upsertProject.mutate(p)}
        />
      ) : null}

      {editingConcept ? (
        <ConceptEditModal
          concept={editingConcept}
          saving={upsertConcept.isPending}
          error={upsertConcept.error instanceof Error ? upsertConcept.error.message : null}
          onCancel={() => setEditingConcept(null)}
          onSave={(c) => upsertConcept.mutate(c)}
        />
      ) : null}

      {editingCase ? (
        <CaseEditModal
          projects={projects}
          caseStudy={editingCase}
          saving={upsertCase.isPending}
          error={upsertCase.error instanceof Error ? upsertCase.error.message : null}
          onCancel={() => setEditingCase(null)}
          onSave={(c) => upsertCase.mutate(c)}
        />
      ) : null}
    </Shell>
  );
}

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_type: "film" | "artiste" | "autre";
  release_date: string | null;
  budget: string | null;
  message: string | null;
  source: string | null;
  status: "nouveau" | "contacté" | "gagné" | "perdu";
  created_at: string;
};

const LEAD_STATUSES: LeadRow["status"][] = ["nouveau", "contacté", "gagné", "perdu"];
const LEAD_TYPE_LABEL: Record<LeadRow["project_type"], string> = {
  film: "Film",
  artiste: "Artiste",
  autre: "Autre",
};

function LeadsPanel() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LeadRow[];
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadRow["status"] }) => {
      const { error } = await (supabase as any).from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }),
  });

  if (isLoading) return <p className="text-[var(--lcd-dim)]">Chargement…</p>;
  if (error) {
    return (
      <p className="text-sm text-[var(--lcd-accent)]">
        Impossible de charger les demandes. La table « leads » doit être créée (migration
        supabase/migrations/20260928120000_create_leads.sql).
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--lcd-line)] border-y border-[var(--lcd-line)]">
      {leads.length === 0 ? (
        <li className="py-10 text-center text-sm text-[var(--lcd-dim)]">
          Aucune demande pour l'instant. Les briefs envoyés depuis le site apparaîtront ici.
        </li>
      ) : null}
      {leads.map((l) => (
        <li key={l.id} className="flex flex-col gap-3 py-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-[var(--font-display)] text-xl">{l.name}</span>
              <span className="text-hairline text-[var(--lcd-accent)]">{LEAD_TYPE_LABEL[l.project_type]}</span>
              {l.company ? <span className="text-sm text-[var(--lcd-fg)]/80">{l.company}</span> : null}
              <span className="text-hairline text-[var(--lcd-dim)]">
                {new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-[var(--lcd-dim)]">
              <a href={`mailto:${l.email}`} className="underline">{l.email}</a>
              {l.phone ? <a href={`tel:${l.phone}`} className="underline">{l.phone}</a> : null}
              {l.release_date ? <span>Sortie : {l.release_date}</span> : null}
              {l.budget ? <span>Budget : {l.budget}</span> : null}
              {l.source ? <span>Source : {l.source}</span> : null}
            </div>
            {l.message ? (
              <p className="mt-3 whitespace-pre-line text-sm text-[var(--lcd-fg)]/85">{l.message}</p>
            ) : null}
          </div>
          <select
            value={l.status}
            onChange={(e) => setStatus.mutate({ id: l.id, status: e.target.value as LeadRow["status"] })}
            className="border border-[var(--lcd-line)] bg-[var(--lcd-bg)] px-3 py-2 text-hairline uppercase text-[var(--lcd-fg)]"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}

function ProjectEditModal({
  project,
  saving,
  error,
  onCancel,
  onSave,
}: {
  project: ProjectInsert;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (p: ProjectInsert) => void;
}) {
  const [form, setForm] = useState<ProjectInsert>(project);
  const set = <K extends keyof ProjectInsert>(k: K, v: ProjectInsert[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const [notes, setNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const draft = useServerFn(draftProjectCopy);

  const runAI = async () => {
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await draft({
        data: {
          title: form.title,
          client: form.client ?? undefined,
          year: form.year ?? undefined,
          url: form.url ?? undefined,
          notes,
        },
      });
      setForm((f) => ({
        ...f,
        subtitle: res.subtitle || f.subtitle,
        description: res.description || f.description,
        story: res.story || f.story,
      }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur IA");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6">
      <div className="w-full max-w-2xl border border-[var(--lcd-line)] bg-[var(--lcd-bg)] p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-2xl">
            {project.slug ? "Éditer le projet" : "Nouveau projet"}
          </h2>
          <button type="button" onClick={onCancel} className="text-hairline text-[var(--lcd-dim)]">
            Fermer ✕
          </button>
        </div>

        {/* Assistant IA */}
        <div className="mt-6 border border-[var(--lcd-line)] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-hairline uppercase text-[var(--lcd-accent)]">
            <span>✨</span> Assistant rédaction
          </div>
          <p className="mt-2 text-sm text-[var(--lcd-dim)]">
            Écris quelques notes brutes (ce que tu as fait, pour qui, l'intention, le résultat).
            L'IA rédigera pour toi un sous-titre, une description et une story soignés.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ex : site event pour la sortie du film Le Permis, mécanique de code à débloquer via QR en salle, +40k joueurs uniques la première semaine…"
            className={`${inputCls} mt-3`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runAI}
              disabled={aiLoading || !form.title}
              className="border border-[var(--lcd-accent)] bg-[var(--lcd-accent)]/10 px-4 py-2 text-hairline uppercase text-[var(--lcd-accent)] hover:bg-[var(--lcd-accent)]/20 disabled:opacity-40"
            >
              {aiLoading ? "Rédaction…" : "Rédiger avec l'IA"}
            </button>
            <span className="text-hairline text-[var(--lcd-dim)]">
              Renseigne d'abord le titre. Les champs existants seront remplacés.
            </span>
          </div>
          {aiError ? <p className="mt-2 text-sm text-[var(--lcd-accent)]">{aiError}</p> : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Field label="Slug (unique, sans espaces)" required>
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              required
              placeholder="ex : le-permis-de-conduire"
              className={inputCls}
            />
          </Field>
          <Field label="Titre" required>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Le Permis de Conduire" className={inputCls} />
          </Field>
          <Field label="Sous-titre" hint="Une accroche courte (max ~60 car.)">
            <input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="Campagne interactive · sortie ciné" className={inputCls} />
          </Field>
          <Field label="Client" hint="Le nom qui apparaîtra à côté du projet">
            <input value={form.client ?? ""} onChange={(e) => set("client", e.target.value)} placeholder="Apollo Films" className={inputCls} />
          </Field>
          <Field label="Année">
            <input value={form.year ?? ""} onChange={(e) => set("year", e.target.value)} placeholder="2025" className={inputCls} />
          </Field>
          <Field label="Lien externe" hint="URL du site en ligne">
            <input value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
          <Field label="Image de couverture" full>
            <CoverUploader
              value={form.cover_url ?? ""}
              onChange={(url) => set("cover_url", url)}
            />
          </Field>
          <Field label="Image de fond (vue détaillée)" full>
            <CoverUploader
              value={form.backdrop_url ?? ""}
              onChange={(url) => set("backdrop_url", url)}
            />
          </Field>
          <Field label="Galerie mobile — captures d'écran du site" full hint="Ces images seront affichées dans des mockups téléphone dans la vue détaillée">
            <GalleryUploader
              value={form.gallery ?? []}
              onChange={(g) => set("gallery", g)}
            />
          </Field>
          <Field label="Description courte" full hint="1 à 2 phrases (max ~220 car.)">
            <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Site événementiel pour accompagner la sortie du film en salles avec une mécanique de jeu interactive." className={inputCls} />
            <CharCount value={form.description ?? ""} max={220} />
          </Field>
          <Field label="Story / case study" full hint="2 à 3 phrases (max ~400 car.). Parle à la 1ère personne du studio.">
            <textarea value={form.story ?? ""} onChange={(e) => set("story", e.target.value)} rows={4} placeholder="Nous avons imaginé une expérience où chaque spectateur devient acteur du film…" className={inputCls} />
            <CharCount value={form.story ?? ""} max={400} />
          </Field>
          <Field label="Ordre">
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => set("sort_order", parseInt(e.target.value, 10) || 0)}
              className={inputCls}
            />
          </Field>
          <Field label="Publié">
            <label className="flex h-full items-center gap-3 pt-3">
              <input
                type="checkbox"
                checked={form.published ?? true}
                onChange={(e) => set("published", e.target.checked)}
              />
              <span className="text-sm">Visible sur le site</span>
            </label>
          </Field>
          {error ? <p className="md:col-span-2 text-sm text-[var(--lcd-accent)]">{error}</p> : null}
          <div className="md:col-span-2 mt-4 flex items-center justify-end gap-3">
            <button type="button" onClick={onCancel} className="text-hairline text-[var(--lcd-dim)]">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="border border-[var(--lcd-fg)] px-6 py-3 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)] disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConceptEditModal({
  concept,
  saving,
  error,
  onCancel,
  onSave,
}: {
  concept: ConceptInsert;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (c: ConceptInsert) => void;
}) {
  const [form, setForm] = useState<ConceptInsert>(concept);
  const set = <K extends keyof ConceptInsert>(k: K, v: ConceptInsert[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6">
      <div className="w-full max-w-2xl border border-[var(--lcd-line)] bg-[var(--lcd-bg)] p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-2xl">
            {concept.slug ? "Éditer le concept" : "Nouveau concept"}
          </h2>
          <button type="button" onClick={onCancel} className="text-hairline text-[var(--lcd-dim)]">
            Fermer ✕
          </button>
        </div>
        <p className="mt-4 text-sm text-[var(--lcd-dim)]">
          Les concepts sont des idées non-commissionnées : ils démontrent une posture éditoriale.
          Écris comme un pitch de film — 2 phrases qui donnent envie.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Field label="Slug (unique)" required>
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              required
              placeholder="mission-impossible"
              className={inputCls}
            />
          </Field>
          <Field label="Étiquette" hint="Ex : Concept festival, Concept sport…">
            <input value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="Concept festival" className={inputCls} />
          </Field>
          <Field label="Titre" required full>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Festival de Cannes" className={inputCls} />
          </Field>
          <Field label="Pitch" required full hint="2 phrases max — commence par 'Et si…'">
            <textarea
              value={form.pitch}
              onChange={(e) => set("pitch", e.target.value)}
              required
              rows={3}
              placeholder="Et si le Festival devenait une expérience digitale immersive, ouverte depuis n'importe quel salon dans le monde ?"
              className={inputCls}
            />
            <CharCount value={form.pitch} max={220} />
          </Field>
          <Field label="Image" full>
            <CoverUploader
              value={form.image_url ?? ""}
              onChange={(url) => set("image_url", url)}
            />
          </Field>
          <Field label="Ordre">
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => set("sort_order", parseInt(e.target.value, 10) || 0)}
              className={inputCls}
            />
          </Field>
          <Field label="Publié">
            <label className="flex h-full items-center gap-3 pt-3">
              <input
                type="checkbox"
                checked={form.published ?? true}
                onChange={(e) => set("published", e.target.checked)}
              />
              <span className="text-sm">Visible sur le site</span>
            </label>
          </Field>
          {error ? <p className="md:col-span-2 text-sm text-[var(--lcd-accent)]">{error}</p> : null}
          <div className="md:col-span-2 mt-4 flex items-center justify-end gap-3">
            <button type="button" onClick={onCancel} className="text-hairline text-[var(--lcd-dim)]">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="border border-[var(--lcd-fg)] px-6 py-3 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)] disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  return (
    <div className={`mt-1 text-right text-[10px] uppercase tracking-wide ${over ? "text-[var(--lcd-accent)]" : "text-[var(--lcd-dim)]"}`}>
      {len} / {max}
    </div>
  );
}

const inputCls =
  "w-full border border-[var(--lcd-line)] bg-transparent px-3 py-2 text-[var(--lcd-fg)] outline-none focus:border-[var(--lcd-fg)]";

function Field({
  label,
  children,
  required,
  full,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
  hint?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-hairline text-[var(--lcd-dim)]">
        {label} {required ? "*" : ""}
      </span>
      {children}
      {hint ? <span className="text-[10px] italic text-[var(--lcd-dim)]/70">{hint}</span> : null}
    </label>
  );
}

function CoverUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("project-covers")
        .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data, error: signErr } = await supabase.storage
        .from("project-covers")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr || !data?.signedUrl) throw signErr ?? new Error("Impossible de générer l'URL");
      onChange(data.signedUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <img
          src={value}
          alt="Aperçu"
          className="h-40 w-full border border-[var(--lcd-line)] object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center border border-dashed border-[var(--lcd-line)] text-hairline text-[var(--lcd-dim)]">
          Aucune image
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border border-[var(--lcd-fg)] px-4 py-2 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)] disabled:opacity-50"
        >
          {uploading ? "Envoi…" : value ? "Remplacer l'image" : "Téléverser une image"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-hairline text-[var(--lcd-dim)] underline"
          >
            Retirer
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-[var(--lcd-accent)]">{error}</p> : null}
    </div>
  );
}

function CaseEditModal({
  caseStudy,
  projects,
  saving,
  error,
  onCancel,
  onSave,
}: {
  caseStudy: CaseInsert;
  projects: ProjectRow[];
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (c: CaseInsert) => void;
}) {
  const [form, setForm] = useState<CaseInsert>(caseStudy);
  const set = <K extends keyof CaseInsert>(k: K, v: CaseInsert[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const [notes, setNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const draft = useServerFn(draftCaseStudy);

  const runAI = async () => {
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await draft({
        data: {
          title: form.title,
          client: form.client,
          tagline: form.tagline ?? undefined,
          notes,
        },
      });
      setForm((f) => ({
        ...f,
        tagline: res.tagline || f.tagline,
        context: res.context || f.context,
        challenge: res.challenge || f.challenge,
        idea: res.idea || f.idea,
        execution: res.execution.length ? res.execution : (f.execution ?? []),
      }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur IA");
    } finally {
      setAiLoading(false);
    }
  };

  const setExecItem = (i: number, val: string) => {
    const next = [...(form.execution ?? [])];
    next[i] = val;
    set("execution", next);
  };
  const addExecItem = () => set("execution", [...(form.execution ?? []), ""]);
  const removeExecItem = (i: number) => {
    const next = [...(form.execution ?? [])];
    next.splice(i, 1);
    set("execution", next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6">
      <div className="w-full max-w-3xl border border-[var(--lcd-line)] bg-[var(--lcd-bg)] p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-2xl">
            {caseStudy.slug ? "Éditer l'étude" : "Nouvelle étude de cas"}
          </h2>
          <button type="button" onClick={onCancel} className="text-hairline text-[var(--lcd-dim)]">
            Fermer ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-[var(--lcd-dim)]">
          Une étude de cas raconte le <em>parcours</em> derrière un projet livré :
          contexte → défi → idée → exécution. Elle a sa propre page publique{" "}
          <code className="text-[var(--lcd-fg)]">/etudes/{form.slug || "…"}</code>.
        </p>

        {/* Assistant IA */}
        <div className="mt-6 border border-[var(--lcd-line)] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-hairline uppercase text-[var(--lcd-accent)]">
            <span>✨</span> Assistant rédaction — 4 blocs
          </div>
          <p className="mt-2 text-sm text-[var(--lcd-dim)]">
            Écris tes notes brutes : le contexte (film, événement, date), le brief, ce qui t'a
            posé problème, l'idée, ce que tu as concrètement livré. L'IA rédige la punchline et
            les 4 blocs.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Ex : Apollo Films — sortie du film La Maison de nos rêves le 7 oct. Objectif : marquer les esprits. Idée : une fausse agence immobilière (L'Agence du Lac) où les 'biens' sont en réalité les séances ciné. On a livré identité complète + parcours de réservation en 1 clic."
            className={`${inputCls} mt-3`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runAI}
              disabled={aiLoading || !form.title || !form.client}
              className="border border-[var(--lcd-accent)] bg-[var(--lcd-accent)]/10 px-4 py-2 text-hairline uppercase text-[var(--lcd-accent)] hover:bg-[var(--lcd-accent)]/20 disabled:opacity-40"
            >
              {aiLoading ? "Rédaction…" : "Rédiger avec l'IA"}
            </button>
            <span className="text-hairline text-[var(--lcd-dim)]">
              Renseigne titre + client d'abord. Les champs existants seront remplacés.
            </span>
          </div>
          {aiError ? <p className="mt-2 text-sm text-[var(--lcd-accent)]">{aiError}</p> : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Field label="Slug (URL de l'étude)" required>
            <input
              value={form.slug}
              onChange={(e) =>
                set(
                  "slug",
                  e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                )
              }
              required
              placeholder="apollo-films-agence-du-lac"
              className={inputCls}
            />
          </Field>
          <Field label="Titre" required>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="La Maison de nos rêves"
              className={inputCls}
            />
          </Field>
          <Field label="Client" required>
            <input
              value={form.client}
              onChange={(e) => set("client", e.target.value)}
              required
              placeholder="Apollo Films"
              className={inputCls}
            />
          </Field>
          <Field label="Sortie / Label date" hint="Ex : Sortie 7 octobre, Édition 2026…">
            <input
              value={form.release_label ?? ""}
              onChange={(e) => set("release_label", e.target.value)}
              placeholder="Sortie 7 octobre"
              className={inputCls}
            />
          </Field>
          <Field
            label="Punchline"
            full
            hint="La phrase choc affichée en gros. Sans guillemets, ils sont ajoutés automatiquement."
          >
            <textarea
              value={form.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value)}
              rows={2}
              placeholder="Et si une agence immobilière ne vendait pas des maisons… mais des places de cinéma ?"
              className={inputCls}
            />
            <CharCount value={form.tagline ?? ""} max={140} />
          </Field>
          <Field label="Label du site" hint="Ex : agencedulac-immo.com">
            <input
              value={form.site_label ?? ""}
              onChange={(e) => set("site_label", e.target.value)}
              placeholder="agencedulac-immo.com"
              className={inputCls}
            />
          </Field>
          <Field label="URL du site">
            <input
              value={form.site_url ?? ""}
              onChange={(e) => set("site_url", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
          <Field label="Projet lié (optionnel)" full hint="Rattache cette étude à un projet existant.">
            <select
              value={form.project_id ?? ""}
              onChange={(e) => set("project_id", e.target.value || null)}
              className={inputCls}
            >
              <option value="">— aucun —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.client ? `· ${p.client}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Image de couverture" full>
            <CoverUploader value={form.cover_url ?? ""} onChange={(url) => set("cover_url", url)} />
          </Field>
          <Field label="Image de fond (hero)" full>
            <CoverUploader
              value={form.backdrop_url ?? ""}
              onChange={(url) => set("backdrop_url", url)}
            />
          </Field>

          <Field label="01 · Le contexte" full hint="2 à 3 phrases : qui, quand, pour quel événement.">
            <textarea
              value={form.context ?? ""}
              onChange={(e) => set("context", e.target.value)}
              rows={4}
              placeholder="Apollo Films s'apprête à sortir « La Maison de nos rêves » le 7 octobre. La mission : créer l'attente autour du film et transformer une simple page de promotion en un moment dont on parle."
              className={inputCls}
            />
            <CharCount value={form.context ?? ""} max={400} />
          </Field>
          <Field
            label="02 · Le défi"
            full
            hint="Ce qu'on voulait éviter, la difficulté à contourner."
          >
            <textarea
              value={form.challenge ?? ""}
              onChange={(e) => set("challenge", e.target.value)}
              rows={4}
              placeholder="Le public scrolle les sites de films sans s'arrêter : affiche, bande-annonce, dates — on connaît. Pour marquer les esprits, il fallait casser le format et provoquer la surprise."
              className={inputCls}
            />
            <CharCount value={form.challenge ?? ""} max={400} />
          </Field>
          <Field label="03 · L'idée" full hint="Le concept créatif, presque comme un pitch de film.">
            <textarea
              value={form.idea ?? ""}
              onChange={(e) => set("idea", e.target.value)}
              rows={5}
              placeholder="En découvrant le synopsis, l'évidence : créer une vraie fausse agence immobilière, « L'Agence du Lac ». Mais à la place des biens à vendre, on y trouve les cinémas qui diffusent le film…"
              className={inputCls}
            />
            <CharCount value={form.idea ?? ""} max={500} />
          </Field>

          <Field label="04 · L'exécution" full hint="Liste à puces : ce qu'on a concrètement livré.">
            <div className="flex flex-col gap-2">
              {(form.execution ?? []).map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-3 text-hairline text-[var(--lcd-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <textarea
                    value={line}
                    onChange={(e) => setExecItem(i, e.target.value)}
                    rows={2}
                    placeholder="Une identité d'agence immobilière complète et crédible, jusque dans les moindres détails."
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeExecItem(i)}
                    className="mt-2 text-hairline text-[var(--lcd-accent)]"
                    aria-label="Retirer"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExecItem}
                className="self-start border border-dashed border-[var(--lcd-line)] px-3 py-1.5 text-hairline uppercase text-[var(--lcd-dim)] hover:border-[var(--lcd-fg)] hover:text-[var(--lcd-fg)]"
              >
                + Ajouter un point
              </button>
            </div>
          </Field>

          <Field label="Galerie" full hint="Screenshots ou visuels illustrant l'étude.">
            <GalleryUploader value={form.gallery ?? []} onChange={(g) => set("gallery", g)} />
          </Field>

          <Field label="Ordre">
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => set("sort_order", parseInt(e.target.value, 10) || 0)}
              className={inputCls}
            />
          </Field>
          <Field label="Publié">
            <label className="flex h-full items-center gap-3 pt-3">
              <input
                type="checkbox"
                checked={form.published ?? true}
                onChange={(e) => set("published", e.target.checked)}
              />
              <span className="text-sm">Visible sur le site</span>
            </label>
          </Field>
          {error ? <p className="md:col-span-2 text-sm text-[var(--lcd-accent)]">{error}</p> : null}
          <div className="md:col-span-2 mt-4 flex items-center justify-end gap-3">
            <button type="button" onClick={onCancel} className="text-hairline text-[var(--lcd-dim)]">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="border border-[var(--lcd-fg)] px-6 py-3 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)] disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("project-covers")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error: signErr } = await supabase.storage
    .from("project-covers")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("URL invalide");
  return data.signedUrl;
}

function GalleryUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const u = await uploadImage(f);
        urls.push(u);
      }
      onChange([...(value ?? []), ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const remove = (i: number) => {
    const next = [...value];
    next.splice(i, 1);
    onChange(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length ? (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {value.map((url, i) => (
            <div key={url + i} className="relative flex items-center justify-center overflow-hidden border border-[var(--lcd-line)] bg-black">
              <img src={url} alt="" className="max-h-64 w-full object-contain" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-1.5 py-1 text-[10px] uppercase text-[var(--lcd-fg)]">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="hover:text-[var(--lcd-accent)]">←</button>
                  <button type="button" onClick={() => move(i, 1)} className="hover:text-[var(--lcd-accent)]">→</button>
                </div>
                <button type="button" onClick={() => remove(i)} className="text-[var(--lcd-accent)]">✕</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center border border-dashed border-[var(--lcd-line)] text-hairline text-[var(--lcd-dim)]">
          Aucune capture — ajoute 3 à 6 screenshots mobile du site
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border border-[var(--lcd-fg)] px-4 py-2 text-hairline uppercase hover:bg-[var(--lcd-fg)] hover:text-[var(--lcd-bg)] disabled:opacity-50"
        >
          {uploading ? "Envoi…" : "+ Ajouter des captures"}
        </button>
        <span className="text-hairline text-[var(--lcd-dim)]">
          Sélection multiple possible · format portrait recommandé
        </span>
      </div>
      {error ? <p className="text-sm text-[var(--lcd-accent)]">{error}</p> : null}
    </div>
  );
}