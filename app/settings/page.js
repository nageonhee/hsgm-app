"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useDevices } from "@/contexts/DeviceContext";
import { useTheme } from "next-themes";
import {
  User,
  Building,
  Shield,
  Bell,
  Database,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sliders,
  RefreshCw,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { user, isDemoUser, signOut } = useAuth();
  const { spaces = ["우리집"], currentSpace = "우리집", setCurrentSpace, addSpace } = useDevices();
  const { theme, setTheme } = useTheme();

  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  // 알림 토글 상태 (로컬 상태)
  const [notifyProgressive, setNotifyProgressive] = useState(true);
  const [notifyStandbyPower, setNotifyStandbyPower] = useState(true);
  const [notifyNightSaving, setNotifyNightSaving] = useState(false);

  const handleAddSpaceSubmit = (e) => {
    e?.preventDefault();
    if (!newSpaceName.trim()) return;
    addSpace(newSpaceName.trim());
    setNewSpaceName("");
    setIsAddSpaceOpen(false);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
        {/* 상단 타이틀 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            환경 설정 및 계정 관리
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            계정 정보, 관리 공간, 전력 알림 및 시스템 환경을 설정합니다.
          </p>
        </div>

        {/* 1. 계정 프로필 카드 */}
        <section className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <User className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {user?.user_metadata?.name || user?.email?.split("@")[0] || "스마트 사용자"}
                  </h2>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      isDemoUser
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    }`}
                  >
                    {isDemoUser ? "시연용 데모 계정" : "Supabase 클라우드 계정"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {user?.email || "guest@hsgm.energy"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-accent/40 border border-border/70 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground">거주 형태 및 평수</span>
              <p className="font-bold text-foreground">
                {user?.user_metadata?.apartment || "한성푸르지오 102동 (32평형)"}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-accent/40 border border-border/70 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground">전기 요금제 유형</span>
              <p className="font-bold text-foreground">주택용(저압) 누진 3단계 요금제</p>
            </div>
          </div>
        </section>

        {/* 2. 관리 공간(Space) 관리 */}
        <section className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">스마트 관리 공간</h2>
            </div>
            <Button
              onClick={() => setIsAddSpaceOpen(true)}
              size="sm"
              className="h-8 rounded-xl text-xs font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              공간 추가
            </Button>
          </div>

          <div className="space-y-2">
            {spaces.map((space) => {
              const isSelected = (currentSpace || "우리집") === space;
              return (
                <div
                  key={space}
                  onClick={() => setCurrentSpace(space)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary/40 shadow-xs"
                      : "bg-accent/30 border-border hover:bg-accent/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="text-xs sm:text-sm font-bold text-foreground">{space}</span>
                    {isSelected && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">
                        현재 관리 중
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {isSelected ? "활성 공간" : "전환하기"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. 스마트 전력 알림 설정 */}
        <section className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-foreground">스마트 에너지 알림</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-accent/30 border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">누진세 3단계 진입 위험 알림</p>
                <p className="text-[11px] text-muted-foreground">
                  월 누적 400kWh 초과 도달 3일 전 스마트 푸시 발송
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifyProgressive(!notifyProgressive)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  notifyProgressive ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifyProgressive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-accent/30 border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">이상 대기전력 낭비 감지 알림</p>
                <p className="text-[11px] text-muted-foreground">
                  가동하지 않는 가전에서 50W 이상 지속 소비 시 알림
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifyStandbyPower(!notifyStandbyPower)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  notifyStandbyPower ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifyStandbyPower ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 4. 시스템 및 테마 설정 */}
        <section className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">시스템 및 테마</h2>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-accent/30 border border-border">
            <div>
              <p className="text-xs font-bold text-foreground">화면 다크 / 라이트 모드</p>
              <p className="text-[11px] text-muted-foreground">
                현재 테마: {theme === "dark" ? "다크 모드" : "라이트 모드"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-border"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {theme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"}
            </Button>
          </div>
        </section>

        {/* 5. 계정 작업 (로그아웃 / 계정 전환) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-destructive">로그아웃 및 계정 전환</h3>
              <p className="text-[11px] text-muted-foreground">
                현재 기기에 저장된 자동 로그인 세션을 해제하고 로그인 화면으로 이동합니다.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut()}
              className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </section>
      </div>

      {/* 새 공간 추가 다이얼로그 모달 */}
      <Dialog open={isAddSpaceOpen} onOpenChange={setIsAddSpaceOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border p-5 rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              새 스마트 관리 공간 추가
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              추가된 공간별로 독립적인 가전 등록 및 실시간 전력 DB가 분리 관리됩니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSpaceSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">공간 이름 입력</label>
              <Input
                placeholder="예: 거실, 안방, 부모님 댁, 세컨하우스"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                autoFocus
                className="h-11 rounded-2xl bg-accent/50 border-border text-xs focus-visible:ring-primary"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddSpaceOpen(false)}
                className="h-10 rounded-xl text-xs font-semibold"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!newSpaceName.trim()}
                className="h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
              >
                새 공간 생성하기
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
