"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInAsDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

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
    signInAsDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Neon Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 mb-3">
            <Zap className="w-8 h-8 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            HSGM 스마트 에너지
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            Supabase Auth 기반 사용자별 제품 관리 권한 격리
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                이메일 계정
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="green_smart@hsgm.energy"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-2xl bg-accent/50 border-border text-xs focus-visible:ring-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
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
                  className="pl-10 h-12 rounded-2xl bg-accent/50 border-border text-xs focus-visible:ring-emerald-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 gap-2 mt-2"
            >
              <span>{loading ? "인증 확인 중..." : "로그인하기"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </form>

          {/* Quick Demo Access Button (Essential for store review & demonstrations) */}
          <div className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoLogin}
              className="w-full h-11 rounded-2xl border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>시연용 계정으로 1초 즉시 시작하기</span>
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2">
            계정이 없으신가요?{" "}
            <Link href="/auth/signup" className="text-emerald-400 font-bold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
