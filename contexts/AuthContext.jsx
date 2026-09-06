"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const AUTO_LOGIN_KEY_STORAGE = "hsgm_auto_login_token";
const AUTO_LOGIN_USER_STORAGE = "hsgm_auto_login_user";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isDemoUser: false,
  autoLoginKey: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  signInAsDemo: () => {},
  loginWithAutoKey: async () => {},
  generateNewAutoKey: () => {},
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
  const [autoLoginKey, setAutoLoginKey] = useState(null);

  // 고유 자동로그인 키 생성 헬퍼
  const createAutoKey = (userId = "user") => {
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    const time = Date.now().toString(36).toUpperCase();
    return `HSGM-KEY-${userId.substring(0, 6).toUpperCase()}-${rand}-${time}`;
  };

  // 초기 자동 로그인 체크
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedKey = localStorage.getItem(AUTO_LOGIN_KEY_STORAGE);
      const savedUserStr = localStorage.getItem(AUTO_LOGIN_USER_STORAGE);

      if (savedKey && savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        setUser(parsedUser);
        setAutoLoginKey(savedKey);
        setIsDemoUser(parsedUser.id.startsWith("demo-"));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("자동 로그인 파싱 오류:", e);
    }

    if (!isSupabaseConfigured) {
      const mockSession = sessionStorage.getItem("mock_user");
      if (mockSession) {
        try {
          const parsed = JSON.parse(mockSession);
          setUser(parsed);
          setIsDemoUser(true);
        } catch (e) {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          setIsDemoUser(false);
        }
      } catch (err) {
        console.warn("Supabase session check error:", err);
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
        } else if (!isDemoUser) {
          // If no auto-login key was saved
          if (!localStorage.getItem(AUTO_LOGIN_KEY_STORAGE)) {
            setUser(null);
            setSession(null);
          }
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [isDemoUser]);

  // 이메일 로그인 (자동로그인 키 옵션 지원)
  const signInWithEmail = async (email, password, enableAutoLogin = true) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: "user-" + email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8),
        email,
        user_metadata: { name: email.split("@")[0] || "사용자" },
      };
      setUser(mockUser);
      setIsDemoUser(false);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("mock_user", JSON.stringify(mockUser));
        if (enableAutoLogin) {
          const key = createAutoKey(mockUser.id);
          localStorage.setItem(AUTO_LOGIN_KEY_STORAGE, key);
          localStorage.setItem(AUTO_LOGIN_USER_STORAGE, JSON.stringify(mockUser));
          setAutoLoginKey(key);
        }
      }
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    setSession(data.session);
    setIsDemoUser(false);

    if (enableAutoLogin && typeof window !== "undefined") {
      const key = createAutoKey(data.user.id);
      localStorage.setItem(AUTO_LOGIN_KEY_STORAGE, key);
      localStorage.setItem(AUTO_LOGIN_USER_STORAGE, JSON.stringify(data.user));
      setAutoLoginKey(key);
    }
    return { success: true, data };
  };

  const signUpWithEmail = async (email, password, metadata = {}, enableAutoLogin = true) => {
    if (!isSupabaseConfigured) {
      const newUser = {
        id: "user-" + Date.now().toString().slice(-6),
        email,
        user_metadata: { name: metadata.name || "신규 사용자", ...metadata },
      };
      setUser(newUser);
      setIsDemoUser(false);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("mock_user", JSON.stringify(newUser));
        if (enableAutoLogin) {
          const key = createAutoKey(newUser.id);
          localStorage.setItem(AUTO_LOGIN_KEY_STORAGE, key);
          localStorage.setItem(AUTO_LOGIN_USER_STORAGE, JSON.stringify(newUser));
          setAutoLoginKey(key);
        }
      }
      return { success: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return { success: true, data };
  };

  // 시연용 계정 로그인
  const signInAsDemo = (enableAutoLogin = true) => {
    setUser(DEFAULT_DEMO_USER);
    setIsDemoUser(true);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("mock_user", JSON.stringify(DEFAULT_DEMO_USER));
      if (enableAutoLogin) {
        const key = createAutoKey(DEFAULT_DEMO_USER.id);
        localStorage.setItem(AUTO_LOGIN_KEY_STORAGE, key);
        localStorage.setItem(AUTO_LOGIN_USER_STORAGE, JSON.stringify(DEFAULT_DEMO_USER));
        setAutoLoginKey(key);
      }
    }
    return { success: true };
  };

  // 자동로그인 키로 즉시 로그인
  const loginWithAutoKey = async (keyInput) => {
    const cleanKey = (keyInput || "").trim();
    if (!cleanKey || !cleanKey.startsWith("HSGM-KEY-")) {
      throw new Error("올바른 HSGM 자동 로그인 키 형식이 아닙니다 (예: HSGM-KEY-...)");
    }

    // 키가 유효하면 해당 계정(또는 데모/저장 계정)으로 즉시 로그인
    const targetUser = DEFAULT_DEMO_USER;
    setUser(targetUser);
    setIsDemoUser(true);
    setAutoLoginKey(cleanKey);

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTO_LOGIN_KEY_STORAGE, cleanKey);
      localStorage.setItem(AUTO_LOGIN_USER_STORAGE, JSON.stringify(targetUser));
      sessionStorage.setItem("mock_user", JSON.stringify(targetUser));
    }
    return { success: true, user: targetUser };
  };

  // 새로운 자동 로그인 키 발급
  const generateNewAutoKey = () => {
    const currentId = user?.id || "demo-user";
    const newKey = createAutoKey(currentId);
    setAutoLoginKey(newKey);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTO_LOGIN_KEY_STORAGE, newKey);
      if (user) {
        localStorage.setItem(AUTO_LOGIN_USER_STORAGE, JSON.stringify(user));
      }
    }
    return newKey;
  };

  // 로그아웃
  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mock_user");
      localStorage.removeItem(AUTO_LOGIN_KEY_STORAGE);
      localStorage.removeItem(AUTO_LOGIN_USER_STORAGE);
    }

    setUser(null);
    setSession(null);
    setIsDemoUser(false);
    setAutoLoginKey(null);

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
        autoLoginKey,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        signInAsDemo,
        loginWithAutoKey,
        generateNewAutoKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
