"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Key, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const { user, autoLoginKey, signInWithEmail, signInAsDemo, loginWithAutoKey, generateNewAutoKey } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [inputKey, setInputKey] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [showKeyLogin, setShowKeyLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 자동 로그인 키가 있고 사용자 세션이 유효하면 대시보드로 자동 이동
  useEffect(() => {
    if (user && autoLoginKey) {
      router.push("/dashboard");
    }
  }, [user, autoLoginKey, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await signInWithEmail(email, password, keepLoggedIn);
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "로그인에 실패했습니다. 정보를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setErrorMsg("");
    signInAsDemo(keepLoggedIn);
    router.push("/dashboard");
  };

  const handleKeyLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await loginWithAutoKey(inputKey);
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "보안 키 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = () => {
    const key = generateNewAutoKey();
    setGeneratedKey(key);
    setInputKey(key);
    setSuccessMsg("새 자동 로그인 보안 키가 발급되었습니다!");
  };

  const handleCopyKey = () => {
    const target = generatedKey || inputKey || autoLoginKey;
    if (target && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Neon Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 mb-2.5">
            <Zap className="w-8 h-8 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            HSGM 스마트 에너지
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            스마트 가전 에너지 관리 및 보안 로그인
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-card/80 border border-border p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
              {successMsg}
            </div>
          )}

          {/* 탭 전환: 일반 로그인 vs 자동 로그인 보안 키 */}
          <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setShowKeyLogin(false)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                !showKeyLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              계정 로그인
            </button>
            <button
              type="button"
              onClick={() => setShowKeyLogin(true)}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                showKeyLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>자동 로그인 키</span>
            </button>
          </div>

          {!showKeyLogin ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
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
                    className="pl-10 h-11 rounded-2xl bg-accent/50 border-border text-xs focus-visible:ring-emerald-400"
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 rounded-2xl bg-accent/50 border-border text-xs focus-visible:ring-emerald-400"
                  />
                </div>
              </div>

              {/* 자동 로그인 유지 체크박스 */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-emerald-500 cursor-pointer"
                  />
                  <span>자동 로그인 키 발급 & 유지</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/20 gap-2 mt-1"
              >
                <span>{loading ? "인증 확인 중..." : "로그인하기"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Button>
            </form>
          ) : (
            /* 자동 로그인 보안 키 입력 및 발급 영역 */
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <form onSubmit={handleKeyLogin} className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      발급받은 자동 로그인 키
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateKey}
                      className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      새 키 발급
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      required
                      placeholder="HSGM-KEY-..."
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      className="pl-10 pr-9 h-11 rounded-2xl bg-accent/50 border-border text-xs font-mono focus-visible:ring-emerald-400"
                    />
                    {inputKey && (
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        title="키 복사"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !inputKey.trim()}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/20 gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>보안 키로 즉시 로그인</span>
                </Button>
              </form>

              <div className="p-3 rounded-2xl bg-muted/50 border border-border text-[11px] text-muted-foreground leading-relaxed">
                💡 발급받은 고유 키를 저장해두면 다음 접속부터 아이디/비밀번호 입력 없이 원클릭 자동 로그인이 지원됩니다.
              </div>
            </div>
          )}

          {/* Quick Demo Access Button */}
          <div className="pt-2 border-t border-border space-y-2">
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

          <div className="text-center text-xs text-muted-foreground pt-1">
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
