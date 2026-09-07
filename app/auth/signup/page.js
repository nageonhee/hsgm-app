"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, User, Home, ArrowRight } from "lucide-react";
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
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-xl shadow-primary/25 mb-3 text-primary-foreground font-black text-2xl tracking-tighter">
            H
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            HSGM 계정 생성
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            나만의 고유 제품 관리와 전력 데이터를 안전하게 생성합니다.
          </p>
        </div>

        <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                사용자 / 세대 이름
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  required
                  placeholder="예: 한성 스마트하우스"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/40 border-border text-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                거주 형태 및 평수 (이웃 비교용)
              </label>
              <div className="relative">
                <Home className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="예: 푸르지오 102동 (32평형)"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-accent/40 border-border text-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
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
                  placeholder="6자리 이상"
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
              <span>{loading ? "계정 생성 중..." : "회원가입 완료"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-1">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
