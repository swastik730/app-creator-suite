DROP POLICY IF EXISTS "Read published models" ON public.study_models;
CREATE POLICY "Anyone reads published models" ON public.study_models FOR SELECT TO anon USING (published);
CREATE POLICY "Members read models" ON public.study_models FOR SELECT TO authenticated USING (published OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Read published solutions" ON public.ncert_solutions;
CREATE POLICY "Anyone reads published solutions" ON public.ncert_solutions FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Members read solutions" ON public.ncert_solutions FOR SELECT TO authenticated USING (status = 'published' OR public.is_staff(auth.uid()));