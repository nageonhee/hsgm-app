"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Lock, Mail, User, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();

  const [name, setName] = useState("");
  const [apartment, setApartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await signUpWithEmail(email, password, { name, apartment });
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 mb-3">
            <Zap className="w-8 h-8 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            HSGM 계정 생성
          </h1>
          <p className="text-xs text-muted-foreground">
            나만의 고유 제품 관리와 전력 데이터를 안전하게 생성합니다.
          </p>
        </div>

        <div className="rounded-3xl bg-card/80 border border-border p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                사용자 / 세대 이름
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  required
                  placeholder="예: 한성 스마트하우스"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/50 border-border text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                거주 형태 및 평수 (이웃 비교용)
              </label>
              <div className="relative">
                <Home className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="예: 푸르지오 102동 (32평형)"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/50 border-border text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                이메일
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/50 border-border text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  placeholder="6자리 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/50 border-border text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 gap-2 mt-4"
            >
              <span>{loading ? "계정 생성 중..." : "회원가입 완료"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-emerald-400 font-bold hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
