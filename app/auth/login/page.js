"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithEmail, signInAsDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 이 기기에서 이미 로그인된 이력이 있으면 자동으로 대시보드로 즉시 이동
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "로그인에 실패했습니다. 정보를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setErrorMsg("");
    signInAsDemo();
    router.push("/dashboard");
  };

  // 자동 로그인 확인 중일 때 깜빡임 방지 스피너
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header & Official Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-xl shadow-primary/25 mb-3 text-primary-foreground font-black text-2xl tracking-tighter">
            H
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            HSGM 스마트 에너지
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            제조사 통합 스마트 가전 에너지 관리 솔루션
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                이메일 계정
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/40 border-border text-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/40 border-border text-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-primary/20 gap-2 mt-2"
            >
              <span>{loading ? "인증 확인 중..." : "로그인하기"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-3 border-t border-border space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoLogin}
              className="w-full h-11 rounded-2xl border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>시연용 계정으로 1초 즉시 시작하기</span>
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-1">
            계정이 없으신가요?{" "}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
