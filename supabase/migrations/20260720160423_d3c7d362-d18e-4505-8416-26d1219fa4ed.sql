
CREATE POLICY "Admins can upload project covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read project covers"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update project covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'project-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete project covers"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-covers' AND public.has_role(auth.uid(), 'admin'));
