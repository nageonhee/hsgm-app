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

  // IoT C2C 계정 연동 상태 및 가전 일괄 불러오기 스태이트
  const [stConnected, setStConnected] = useState(true); // 기본 연동됨 예시
  const [tuyaConnected, setTuyaConnected] = useState(false);
  const [isSyncingIoT, setIsSyncingIoT] = useState(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);
  const [fetchedDevices, setFetchedDevices] = useState([
    {
      id: "st-dev-1",
      name: "삼성 무풍에어컨 갤러리",
      brand: "삼성전자",
      model: "AF19TX772VFN",
      category: "air_conditioner",
      icon: "AirVent",
      power: "1750W",
      monthlyUsageKWh: 165.4,
      monthlyCost: 32000,
      energyGrade: 1,
      controlType: "c2c_smartthings",
      isSmartControl: true,
      selected: true,
    },
    {
      id: "st-dev-2",
      name: "비스포크 그랑데 AI 세탁기",
      brand: "삼성전자",
      model: "WF24DV1700",
      category: "washing_machine",
      icon: "WashingMachine",
      power: "450W",
      monthlyUsageKWh: 32.5,
      monthlyCost: 8500,
      energyGrade: 1,
      controlType: "c2c_smartthings",
      isSmartControl: true,
      selected: true,
    },
    {
      id: "st-dev-3",
      name: "SmartThings 전력 측정 플러그 (거실 TV)",
      brand: "삼성전자",
      model: "ST-PLUG-V2",
      category: "tv",
      icon: "Zap",
      power: "150W",
      monthlyUsageKWh: 18.0,
      monthlyCost: 4200,
      energyGrade: 1,
      controlType: "c2c_smartthings",
      isSmartControl: true,
      selected: true,
    },
  ]);

  const { addDevice } = useDevices();

  const handleConnectSmartThings = () => {
    if (stConnected) {
      if (confirm("Samsung SmartThings 연동을 해제하시겠습니까?")) {
        setStConnected(false);
      }
    } else {
      setIsSyncingIoT(true);
      setTimeout(() => {
        setIsSyncingIoT(false);
        setStConnected(true);
        alert("Samsung 계정이 성공적으로 연동되었습니다! [가전 한 번에 불러오기]를 실행해보세요.");
      }, 1000);
    }
  };

  const handleConnectTuya = () => {
    if (tuyaConnected) {
      setTuyaConnected(false);
    } else {
      setTuyaConnected(true);
      alert("Tuya / Smart Life 계정이 연동되었습니다.");
    }
  };

  const handleFetchSmartThingsDevices = () => {
    setIsFetchModalOpen(true);
  };

  const toggleDeviceSelection = (id) => {
    setFetchedDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  const handleBatchImportDevices = async () => {
    const targets = fetchedDevices.filter((d) => d.selected);
    if (targets.length === 0) {
      alert("등록할 기기를 최소 1개 이상 선택해 주세요.");
      return;
    }

    try {
      for (const dev of targets) {
        await addDevice({
          name: dev.name,
          brand: dev.brand,
          model: dev.model,
          category: dev.category,
          icon: dev.icon,
          currentPower: 0,
          monthlyUsageKWh: dev.monthlyUsageKWh,
          monthlyCost: dev.monthlyCost,
          annualEstimatedCost: dev.monthlyCost * 12,
          energyGrade: dev.energyGrade,
          isSmartControl: true,
          controlType: "c2c_smartthings",
          specs: { powerConsumption: dev.power, releaseYear: "2024" },
        });
      }
      setIsFetchModalOpen(false);
      alert(`스마트싱스 기기 ${targets.length}개가 인벤토리에 성공적으로 등록되었습니다!`);
    } catch (e) {
      alert("기기 등록 중 오류 발생: " + e.message);
    }
  };

  // 알림 토글 상태 (로컬 상태)
  const [notifyProgressive, setNotifyProgressive] = useState(true);
  const [notifyStandbyPower, setNotifyStandbyPower] = useState(true);
  const [notifyNightSaving, setNotifyNightSaving] = useState(false);

  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

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

        {/* 2. 스마트 홈 IoT 계정 C2C 연동 (SmartThings, Tuya, LG ThinQ) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">스마트 홈 IoT 계정 연동 (C2C)</h2>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
              Cloud-to-Cloud
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            제조사 클라우드 계정을 연동하면 별도 네트워크 설정 없이 계정에 연결된 스마트 가전과 전력 측정 플러그를 한 번에 불러올 수 있습니다.
          </p>

          <div className="space-y-3 pt-1">
            {/* 1. 삼성 SmartThings 연동 카드 */}
            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-extrabold text-sm">
                    ST
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">Samsung SmartThings</h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          stConnected
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {stConnected ? "계정 연동 완료" : "미연동"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      삼성 무풍에어컨, 그랑데 세탁기, 스마트 플러그 지원
                    </p>
                  </div>
                </div>

                <Button
                  variant={stConnected ? "outline" : "default"}
                  size="sm"
                  onClick={handleConnectSmartThings}
                  disabled={isSyncingIoT}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 shadow-xs ${
                    !stConnected ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-border"
                  }`}
                >
                  {isSyncingIoT ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : stConnected ? (
                    "연동 해제"
                  ) : (
                    "삼성 계정 연동하기"
                  )}
                </Button>
              </div>

              {stConnected && (
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    스마트싱스 가전 3개가 탐색되었습니다.
                  </span>
                  <Button
                    size="sm"
                    onClick={handleFetchSmartThingsDevices}
                    className="h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold gap-1 shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    가전 한 번에 불러오기
                  </Button>
                </div>
              )}
            </div>

            {/* 2. Tuya / Smart Life 연동 카드 */}
            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-extrabold text-sm">
                    TY
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">Tuya / Smart Life</h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          tuyaConnected
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {tuyaConnected ? "계정 연동 완료" : "미연동"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      중소기업 가전, Wi-Fi 스마트 플러그, 스마트 멀티탭 지원
                    </p>
                  </div>
                </div>

                <Button
                  variant={tuyaConnected ? "outline" : "default"}
                  size="sm"
                  onClick={handleConnectTuya}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 shadow-xs ${
                    !tuyaConnected ? "bg-orange-600 hover:bg-orange-700 text-white" : "border-border"
                  }`}
                >
                  {tuyaConnected ? "연동 해제" : "Tuya 계정 연동하기"}
                </Button>
              </div>
            </div>

            {/* 3. LG ThinQ 연동 카드 */}
            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-extrabold text-sm">
                    TQ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">LG ThinQ Connect</h3>
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border">
                        준비 중 (공식 Open API 파트너십)
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      LG 휘센 에어컨, 트롬 세탁기, 오브제 컬렉션 지원 예정
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" disabled className="h-9 px-3.5 rounded-xl text-xs font-bold border-border opacity-50">
                  순차 오픈 예정
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 관리 공간(Space) 관리 */}
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

      {/* 삼성 SmartThings C2C 가전 한 번에 불러오기 모달 */}
      <Dialog open={isFetchModalOpen} onOpenChange={setIsFetchModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border p-6 rounded-3xl shadow-2xl space-y-4">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                SmartThings 가전 한 번에 불러오기
              </DialogTitle>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] font-bold">
                OAuth 2.0 연동
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              삼성 계정에서 탐색된 가전 목록입니다. 등록할 기기를 선택하여 우리 앱 인벤토리에 일괄 추가하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {fetchedDevices.map((dev) => (
              <div
                key={dev.id}
                onClick={() => toggleDeviceSelection(dev.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  dev.selected
                    ? "bg-blue-500/10 border-blue-500/40 shadow-xs"
                    : "bg-accent/30 border-border opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dev.selected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">{dev.name}</h4>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {dev.brand} • 모델명: {dev.model} ({dev.power})
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  C2C 제어 준비됨
                </Badge>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFetchModalOpen(false)}
              className="h-10 rounded-xl text-xs font-semibold border-border"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleBatchImportDevices}
              className="h-10 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              선택한 {fetchedDevices.filter((d) => d.selected).length}개 가전 일괄 등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
