"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const AUTH_USER_STORAGE = "hsgm_auth_user";
const AUTH_TOKEN_STORAGE = "hsgm_auth_token";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isDemoUser: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  signInAsDemo: () => {},
});

export const DEFAULT_DEMO_USER = {
  id: "demo-user-101",
  email: "green_smart@hsgm.energy",
  user_metadata: {
    name: "한성스마트하우스",
    apartment: "한성푸르지오 102동 1404호 (32평)",
    plan: "주택용(저압) 누진 요금제",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // 브라우저 로컬 스토리지에서 자동 로그인 상태 즉시 복원
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. 로컬 저장소에 자동 로그인 세션이 남아있는지 확인
    try {
      const savedUserStr = localStorage.getItem(AUTH_USER_STORAGE);
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.id) {
          setUser(parsed);
          setIsDemoUser(parsed.id.startsWith("demo-"));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("자동 로그인 세션 복원 오류:", e);
    }

    // 2. Supabase 세션 확인
    if (isSupabaseConfigured && supabase) {
      const getInitialSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            setSession(session);
            setIsDemoUser(false);
            localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(session.user));
          } else {
            setUser(null);
          }
        } catch (err) {
          console.warn("Supabase session check error:", err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      getInitialSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, currentSession) => {
          if (currentSession?.user) {
            setUser(currentSession.user);
            setSession(currentSession);
            setIsDemoUser(false);
            localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(currentSession.user));
          } else {
            // 로컬 데모 유저가 아닐 때만 초기화
            const localUser = localStorage.getItem(AUTH_USER_STORAGE);
            if (!localUser || !localUser.includes("demo-")) {
              setUser(null);
              setSession(null);
            }
          }
        }
      );

      return () => subscription?.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // 에러 메시지 한글화 헬퍼
  const formatAuthError = (err) => {
    const msg = err?.message || String(err);
    if (msg.includes("Invalid login credentials")) {
      return "이메일 또는 비밀번호가 일치하지 않습니다.";
    }
    if (msg.includes("Email not confirmed")) {
      return "이메일 인증이 완료되지 않은 계정입니다. Supabase 대시보드(Authentication -> Providers -> Email)에서 'Confirm email' 설정을 끄시거나 이메일 인증을 진행해주세요.";
    }
    if (msg.includes("User already registered")) {
      return "이미 가입된 이메일 계정입니다. 해당 계정으로 로그인해주세요.";
    }
    if (msg.includes("Password should be at least")) {
      return "비밀번호는 최소 6자리 이상이어야 합니다.";
    }
    if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) {
      return "단시간에 너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
    return msg;
  };

  // 이메일 로그인 (자동 로그인 세션 즉시 영구 저장)
  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      const customUser = {
        id: "user-" + email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8),
        email,
        user_metadata: { name: email.split("@")[0] || "사용자" },
      };
      setUser(customUser);
      setIsDemoUser(false);

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(customUser));
        localStorage.setItem(AUTH_TOKEN_STORAGE, "token-" + Date.now());
      }
      return { success: true, user: customUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(formatAuthError(error));

      setUser(data.user);
      setSession(data.session);
      setIsDemoUser(false);

      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(data.user));
        if (data.session?.access_token) {
          localStorage.setItem(AUTH_TOKEN_STORAGE, data.session.access_token);
        }
      }
      return { success: true, data };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  // 회원가입
  const signUpWithEmail = async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured) {
      const newUser = {
        id: "user-" + Date.now().toString().slice(-6),
        email,
        user_metadata: { name: metadata.name || "신규 사용자", ...metadata },
      };
      setUser(newUser);
      setIsDemoUser(false);

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(newUser));
        localStorage.setItem(AUTH_TOKEN_STORAGE, "token-" + Date.now());
      }
      return { success: true, user: newUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw new Error(formatAuthError(error));

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        setIsDemoUser(false);

        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(data.user));
          if (data.session?.access_token) {
            localStorage.setItem(AUTH_TOKEN_STORAGE, data.session.access_token);
          }
        }
      }
      return { success: true, data };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  // 시연용 계정 원클릭 로그인 (해당 기기에 자동 로그인 영구 저장)
  const signInAsDemo = () => {
    setUser(DEFAULT_DEMO_USER);
    setIsDemoUser(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(DEFAULT_DEMO_USER));
      localStorage.setItem(AUTH_TOKEN_STORAGE, "demo-auto-token-" + Date.now());
    }
    return { success: true, user: DEFAULT_DEMO_USER };
  };

  // 로그아웃 (자동 로그인 세션 및 저장소 완전 삭제)
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_USER_STORAGE);
      localStorage.removeItem(AUTH_TOKEN_STORAGE);
      sessionStorage.clear();
    }

    setUser(null);
    setSession(null);
    setIsDemoUser(false);

    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        signInAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
