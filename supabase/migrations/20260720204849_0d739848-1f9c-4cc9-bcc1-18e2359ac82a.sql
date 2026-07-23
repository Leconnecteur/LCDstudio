-- Case studies: long-form editorial pieces detailing the journey behind a project
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,                -- the punchline in quotes ("Et si une agence immobilière...")
  release_label TEXT,          -- e.g. "Sortie 7 octobre"
  release_date DATE,
  site_label TEXT,             -- e.g. "agencedulac-immo.com"
  site_url TEXT,
  cover_url TEXT,
  backdrop_url TEXT,
  context TEXT,                -- 01. Le contexte
  challenge TEXT,              -- 02. Le défi
  idea TEXT,                   -- 03. L'idée
  execution TEXT[] NOT NULL DEFAULT '{}',  -- 04. L'exécution (bullet list)
  gallery TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.case_studies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published case studies"
  ON public.case_studies FOR SELECT
  USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert case studies"
  ON public.case_studies FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update case studies"
  ON public.case_studies FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete case studies"
  ON public.case_studies FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_case_studies_sort ON public.case_studies (sort_order, created_at DESC);
CREATE INDEX idx_case_studies_project ON public.case_studies (project_id);