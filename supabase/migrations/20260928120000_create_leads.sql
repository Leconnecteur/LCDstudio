-- Leads : demandes de projet envoyées depuis le formulaire de brief du site
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 50),
  company text CHECK (company IS NULL OR char_length(company) <= 200),
  project_type text NOT NULL CHECK (project_type IN ('film', 'artiste', 'autre')),
  release_date text CHECK (release_date IS NULL OR char_length(release_date) <= 100),
  budget text CHECK (budget IS NULL OR char_length(budget) <= 100),
  message text CHECK (message IS NULL OR char_length(message) <= 5000),
  source text CHECK (source IS NULL OR char_length(source) <= 200),
  status text NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'contacté', 'gagné', 'perdu')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'nouveau');

CREATE POLICY "Admins can read leads"
  ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
