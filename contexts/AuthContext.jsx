"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

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

const DEFAULT_DEMO_USER = {
  id: "demo-user-101",
  email: "green_smart@hsgm.energy",
  user_metadata: {
    name: "한성스마트하우스",
    apartment: "한성푸르지오 102동 1404호 (32평)",
    plan: "주택용(저압) 누진 요금제",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_DEMO_USER);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check if we have a mock user in sessionStorage
      const savedUser = typeof window !== "undefined" ? sessionStorage.getItem("mock_user") : null;
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(DEFAULT_DEMO_USER);
        }
      } else {
        setUser(DEFAULT_DEMO_USER);
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
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [isDemoUser]);

  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: "demo-user-custom",
        email,
        user_metadata: { name: email.split("@")[0] || "사용자" },
      };
      setUser(mockUser);
      if (typeof window !== "undefined") sessionStorage.setItem("mock_user", JSON.stringify(mockUser));
      setIsDemoUser(true);
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
    return { success: true, data };
  };

  const signUpWithEmail = async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured) {
      const newUser = {
        id: "demo-user-" + Date.now(),
        email,
        user_metadata: { name: metadata.name || "신규 사용자", ...metadata },
      };
      setUser(newUser);
      if (typeof window !== "undefined") sessionStorage.setItem("mock_user", JSON.stringify(newUser));
      setIsDemoUser(true);
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

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      if (typeof window !== "undefined") sessionStorage.removeItem("mock_user");
    }
    setUser(null);
    setSession(null);
    setIsDemoUser(false);
    
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  };

  const signInAsDemo = () => {
    setUser(DEFAULT_DEMO_USER);
    if (typeof window !== "undefined") sessionStorage.removeItem("mock_user");
    setIsDemoUser(true);
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
