
-- =====================================================
-- Enum for app roles
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- =====================================================
-- Profiles table
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- User roles table
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- has_role security-definer function
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =====================================================
-- Enrollments table
-- =====================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  enrolled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Progress table
-- =====================================================
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_progress_user_course ON public.progress(user_id, course_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress TO authenticated;
GRANT ALL ON public.progress TO service_role;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Quiz attempts table
-- =====================================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  course_id TEXT,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  answers JSONB,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user_item ON public.quiz_attempts(user_id, item_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Resume state table
-- =====================================================
CREATE TABLE public.resume_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  last_item_id TEXT NOT NULL,
  last_module_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_state TO authenticated;
GRANT ALL ON public.resume_state TO service_role;
ALTER TABLE public.resume_state ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies: profiles
-- =====================================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS Policies: user_roles
-- =====================================================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS Policies: enrollments
-- =====================================================
CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage enrollments"
  ON public.enrollments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS Policies: progress
-- =====================================================
CREATE POLICY "Users can manage their own progress"
  ON public.progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.progress FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS Policies: quiz_attempts
-- =====================================================
CREATE POLICY "Users can manage their own quiz attempts"
  ON public.quiz_attempts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS Policies: resume_state
-- =====================================================
CREATE POLICY "Users can manage their own resume state"
  ON public.resume_state FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all resume state"
  ON public.resume_state FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Trigger: auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Default role: student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Trigger: updated_at maintenance
-- =====================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_resume_updated_at
  BEFORE UPDATE ON public.resume_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
