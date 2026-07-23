
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-promote first signup to admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text,
  client text,
  year text,
  url text,
  cover_url text,
  story text,
  roles text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published projects"
  ON public.projects FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed real projects from connecteurdigital.fr
INSERT INTO public.projects (slug, title, subtitle, description, client, year, url, sort_order, published) VALUES
  ('kev-adams', 'Kev Adams', 'Humoriste & Acteur', 'Site officiel de l''humoriste et acteur Kev Adams — une écriture digitale à la hauteur de sa présence scénique.', 'Kev Adams', '2025', 'https://kevadams.fr/', 1, true),
  ('padel-fight-club', 'Padel Fight Club', 'Youtubeur Padel', 'Identité digitale nerveuse et communauté fédérée autour de la nouvelle scène padel.', 'Padel Fight Club', '2025', null, 2, true),
  ('raw-talent-sport', 'Raw Talent Sport', 'Stages de basket aux Bahamas', 'Plateforme immersive pour révéler la nouvelle génération d''athlètes lors de camps internationaux.', 'Raw Talent Sport', '2026', null, 3, true),
  ('elite-padel-experience', 'Elite Padel Experience', 'Stages de padel en Espagne', 'Une expérience premium pour des stages haut de gamme entre soleil, terre battue et performance.', 'Elite Padel Experience', '2025', null, 4, true),
  ('aquazen-64', 'Aquazen 64', 'Entretien & réparation piscines', 'Site vitrine élégant pour un artisan piscinier du Pays basque.', 'Aquazen 64', '2025', null, 5, true),
  ('classic-auto-vintage', 'Classic Auto Vintage', 'Garage automobile', 'Une esthétique rétro-cinéma pour un garage spécialisé dans les voitures de collection.', 'Classic Auto Vintage', '2026', null, 6, true),
  ('padel-track', 'Padel Track', 'Application mobile', 'Application mobile pour suivre sa progression, ses matchs et sa communauté padel.', 'Padel Track', '2025', null, 7, true),
  ('colorcraft', 'ColorCraft', 'Application mobile', 'Une app créative dédiée à la couleur, aux palettes et à l''inspiration visuelle.', 'ColorCraft', '2025', null, 8, true),
  ('euskal-bike', 'Euskal Bike', 'Magasin', 'Identité digitale d''un magasin de vélos ancré dans la culture basque.', 'Euskal Bike', '2026', null, 9, true),
  ('swapy', 'Swapy', 'Application d''échanges entre professionnels', 'Une plateforme B2B pour échanger biens et services entre pros, pensée mobile-first.', 'Swapy', '2026', null, 10, true),
  ('agence-du-lac', 'L''Agence du Lac', 'La maison de nos rêves', 'Site immobilier premium pour une agence dédiée aux maisons d''exception au bord des lacs.', 'L''Agence du Lac', '2026', null, 11, true);
