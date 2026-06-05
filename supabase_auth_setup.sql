-- ============================================================
-- 인증 셋업: profiles 테이블 + 자동 생성 트리거
-- Supabase Dashboard > SQL Editor 에서 실행
-- ============================================================

-- 1. profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. 본인 프로필 읽기 허용
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 4. 관리자는 모든 프로필 읽기/수정 가능
--    (service_role key 사용 시 RLS 우회됨)

-- 5. 신규 유저 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 특정 유저를 관리자로 승격 (email로 조회)
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
