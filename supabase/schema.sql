-- ==============================================================================
-- HSGM (Home Smart Green Manager) Supabase Schema
-- RLS (Row Level Security) 기반 사용자 격리 데이터베이스 스키마
-- ==============================================================================

-- 1. 사용자 프로필 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    apartment VARCHAR(100),
    area_pyeong INTEGER DEFAULT 32,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 본인의 프로필만 조회 및 수정 가능"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

-- 2. 가전 인벤토리 테이블 (devices)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Zap',
    status BOOLEAN DEFAULT false,
    current_power INTEGER DEFAULT 0, -- W
    monthly_usage_kwh NUMERIC(8, 2) DEFAULT 0,
    monthly_cost INTEGER DEFAULT 0,
    energy_grade INTEGER DEFAULT 1,
    is_smart_control BOOLEAN DEFAULT false, -- IoT 원격제어 지원 여부
    control_type VARCHAR(20) DEFAULT 'none', -- 'wifi', 'ir', 'plug', 'none'
    is_protected_guardrail BOOLEAN DEFAULT false, -- 냉장고 등 24시간 필수 보호
    specs JSONB DEFAULT '{}'::jsonb,
    consumables JSONB DEFAULT '[]'::jsonb,
    manual_url TEXT,
    as_center_name VARCHAR(100),
    as_phone VARCHAR(50),
    as_site_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 본인의 가전만 조회/추가/수정/삭제 가능"
    ON public.devices FOR ALL
    USING (auth.uid() = user_id);

-- 3. 전력 사용량 및 NILM 부하 분리 로그
CREATE TABLE IF NOT EXISTS public.energy_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    total_power_kw NUMERIC(6, 2) NOT NULL,
    device_power_breakdown JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.energy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 본인의 전력 로그만 접근 가능"
    ON public.energy_logs FOR ALL
    USING (auth.uid() = user_id);
