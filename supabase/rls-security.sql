-- ============================================================
-- CONECTA LAR — Migração Incremental de Segurança (RLS)
-- SEGURA PARA DADOS EXISTENTES: apenas DROP/CREATE POLICY + ADD CONSTRAINT
-- Nenhuma tabela é recriada. Nenhum dado é perdido.
-- Executar via: npx supabase db query --linked -f supabase/rls-security.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. REMOVER TODAS AS POLÍTICAS INSEGURAS EXISTENTES
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "Profiles: public can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: allow insert on signup" ON public.profiles;

-- INSTITUTIONS
DROP POLICY IF EXISTS "Allow public read institutions" ON public.institutions;
DROP POLICY IF EXISTS "Allow authenticated insert institutions" ON public.institutions;

-- COURSES
DROP POLICY IF EXISTS "Courses: public read" ON public.courses;
DROP POLICY IF EXISTS "Courses: volunteers can create" ON public.courses;
DROP POLICY IF EXISTS "Courses: owners can update" ON public.courses;
DROP POLICY IF EXISTS "Courses: owners can delete" ON public.courses;
DROP POLICY IF EXISTS "Volunteers can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Volunteers can delete own courses" ON public.courses;

-- ENROLLMENTS
DROP POLICY IF EXISTS "Enrollments: users read own" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments: users can enroll" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments: users can unenroll" ON public.enrollments;

-- RATINGS
DROP POLICY IF EXISTS "Ratings: public read" ON public.ratings;
DROP POLICY IF EXISTS "Ratings: users can rate" ON public.ratings;
DROP POLICY IF EXISTS "Ratings: users can update own" ON public.ratings;

-- COMMENTS
DROP POLICY IF EXISTS "Comments: public read" ON public.comments;
DROP POLICY IF EXISTS "Comments: users can comment" ON public.comments;
DROP POLICY IF EXISTS "Comments: users can delete own" ON public.comments;

-- REPORTS
DROP POLICY IF EXISTS "Reports: users can create own" ON public.reports;
DROP POLICY IF EXISTS "Reports: users can read own" ON public.reports;

-- ============================================================
-- 2. NOVAS POLÍTICAS RLS SEGURA
-- ============================================================

-- PROFILES: apenas o próprio usuário pode ler/atualizar
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Trigger handle_new_user já existe e funciona corretamente (SECURITY DEFINER).
-- Não é necessário recriá-la. A política INSERT foi removida pois o trigger
-- opera como SECURITY DEFINER e bypassa RLS automaticamente.

-- INSTITUTIONS: apenas voluntários podem ler e inserir
CREATE POLICY institutions_select ON public.institutions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'volunteer'
  ));

CREATE POLICY institutions_insert ON public.institutions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'volunteer'
  ));

-- COURSES: leitura para autenticados, escrita apenas pelo owner voluntário
CREATE POLICY courses_select ON public.courses
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY courses_insert ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = volunteer_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'volunteer')
  );

CREATE POLICY courses_update_owner ON public.courses
  FOR UPDATE TO authenticated
  USING (auth.uid() = volunteer_id)
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY courses_delete_owner ON public.courses
  FOR DELETE TO authenticated
  USING (auth.uid() = volunteer_id);

-- ENROLLMENTS: apenas o próprio aluno, verificado como tipo 'aluno'
CREATE POLICY enrollments_select_own ON public.enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = alumni_id);

CREATE POLICY enrollments_insert ON public.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = alumni_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'aluno')
  );

CREATE POLICY enrollments_delete_own ON public.enrollments
  FOR DELETE TO authenticated
  USING (auth.uid() = alumni_id);

-- RATINGS: leitura pública para autenticados, escrita apenas por alunos inscritos
CREATE POLICY ratings_select ON public.ratings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY ratings_insert ON public.ratings
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'aluno')
    AND EXISTS (SELECT 1 FROM public.enrollments WHERE alumni_id = auth.uid() AND course_id = ratings.course_id)
  );

CREATE POLICY ratings_update ON public.ratings
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.enrollments WHERE alumni_id = auth.uid() AND course_id = ratings.course_id)
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.enrollments WHERE alumni_id = auth.uid() AND course_id = ratings.course_id)
  );

-- COMMENTS: leitura para autenticados, escrita apenas por alunos inscritos
CREATE POLICY comments_select ON public.comments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY comments_insert ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'aluno')
    AND EXISTS (SELECT 1 FROM public.enrollments WHERE alumni_id = auth.uid() AND course_id = comments.course_id)
  );

CREATE POLICY comments_delete_own ON public.comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- REPORTS: inserção permitida exceto para o owner do curso, sem SELECT via client
CREATE POLICY reports_insert ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = reports.course_id AND volunteer_id = auth.uid()
    )
  );

-- ============================================================
-- 3. VIEW SEGURA PARA PERFIS PÚBLICOS DE VOLUNTÁRIOS
-- ============================================================

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, user_type, specialty
FROM public.profiles
WHERE user_type = 'volunteer';

GRANT SELECT ON public.public_profiles TO authenticated;
REVOKE ALL ON public.public_profiles FROM anon;

-- ============================================================
-- 4. RPC SEGURA: get_volunteer_contact
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_volunteer_contact(p_course_id BIGINT)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT p.email
  FROM public.profiles p
  JOIN public.courses c ON c.volunteer_id = p.id
  WHERE c.id = p_course_id
    AND p.user_type = 'volunteer'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_volunteer_contact(BIGINT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_volunteer_contact(BIGINT) FROM anon;

-- ============================================================
-- 5. ÍNDICES DE PERFORMANCE (apenas os que não existem)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_courses_volunteer ON public.courses(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_created ON public.courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_alumni ON public.enrollments(alumni_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_ratings_course ON public.ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_comments_course_created ON public.comments(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_course ON public.reports(course_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- ============================================================
-- 6. CONSTRAINTS ADICIONAIS (segurança no banco)
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'courses_video_url_check' AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_video_url_check
      CHECK (video_url ~ '^https://(www\.)?youtube\.com/watch\?v=' OR video_url ~ '^https://youtu\.be/');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_content_length_check' AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.comments ADD CONSTRAINT comments_content_length_check
      CHECK (char_length(content) BETWEEN 1 AND 5000);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reports_reason_length_check' AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.reports ADD CONSTRAINT reports_reason_length_check
      CHECK (char_length(reason) BETWEEN 1 AND 2000);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'courses_title_length_check' AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_title_length_check
      CHECK (char_length(title) <= 300);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'courses_description_length_check' AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_description_length_check
      CHECK (char_length(description) <= 10000);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'courses_extra_material_length_check' AND constraint_schema = 'public'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_extra_material_length_check
      CHECK (extra_material IS NULL OR char_length(extra_material) <= 5000);
  END IF;
END $$;

-- ============================================================
-- 7. REVOGAR PERMISSÕES ANON
-- ============================================================

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.institutions FROM anon;
REVOKE ALL ON public.courses FROM anon;
REVOKE ALL ON public.enrollments FROM anon;
REVOKE ALL ON public.ratings FROM anon;
REVOKE ALL ON public.comments FROM anon;
REVOKE ALL ON public.reports FROM anon;

COMMIT;
