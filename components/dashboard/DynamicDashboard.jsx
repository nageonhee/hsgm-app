"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useDevices } from "@/contexts/DeviceContext";
import { calculateKepcoBill } from "@/lib/energyCalculator";
import {
  AirVent,
  Refrigerator,
  WashingMachine,
  Tv,
  Utensils,
  Wind,
  Disc,
  Zap,
  Power,
  Star,
  Plus,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 지원 가전 카테고리 정의
const DEFAULT_CATEGORIES = [
  { key: "air_conditioner", label: "에어컨" },
  { key: "refrigerator", label: "냉장고" },
  { key: "washer", label: "세탁기" },
  { key: "tv", label: "TV" },
  { key: "cooker", label: "밥솥" },
  { key: "air_purifier", label: "공기청정기" },
  { key: "robot_cleaner", label: "로봇청소기" },
];

export default function DynamicDashboard() {
  const { devices = [], toggleDeviceStatus, togglePinDevice } = useDevices();
  const [selectedCategory, setSelectedCategory] = useState("air_conditioner");

  const deviceTouchStartX = useRef(null);
  const deviceTouchStartY = useRef(null);

  // 등록된 기기들에서 실제로 존재하는 카테고리들을 동적으로 탭에 반영
  const availableCategories = useMemo(() => {
    const registeredKeys = new Set(devices.map((d) => d.category));
    return DEFAULT_CATEGORIES.filter(
      (c) => registeredKeys.has(c.key) || ["air_conditioner", "refrigerator", "washer", "tv"].includes(c.key)
    );
  }, [devices]);

  // 현재 선택된 카테고리의 가전 찾기
  const activeDevice = useMemo(() => {
    const found = devices.find((d) => d.category === selectedCategory);
    return found || devices[0] || null;
  }, [devices, selectedCategory]);

  // 실시간 가동 중인 기기 목록
  const activeDevices = useMemo(() => devices.filter((d) => d.status), [devices]);

  // 실시간 가동 총 소비전력(W)
  const totalActiveWatts = useMemo(() => {
    return activeDevices.reduce(
      (sum, d) => sum + Number(d.currentPower ?? d.current_power ?? 0),
      0
    );
  }, [activeDevices]);

  // [약점 3 해결] 실시간 가동 시간 누적 kWh 티커 상태
  const [liveAccumulatedKWh, setLiveAccumulatedKWh] = useState(0);

  // 기기가 가동 중일 때 2초마다 실제 전력량(W * t) 누적 계산 (스마트 계량기 시뮬레이션)
  useEffect(() => {
    if (totalActiveWatts <= 0) return;

    const interval = setInterval(() => {
      // 2초 동안 소비된 전력량 (kWh = (W / 1000) * (2 / 3600))
      const deltaKWh = (totalActiveWatts / 1000) * (2 / 3600);
      setLiveAccumulatedKWh((prev) => prev + deltaKWh);
    }, 2000);

    return () => clearInterval(interval);
  }, [totalActiveWatts]);

  // 등록된 모든 기기의 기본 월간 예상 전력량 + 실시간 누적 전력량
  const totalMonthlyKWh = useMemo(() => {
    const baseKWh = devices.reduce(
      (sum, d) => sum + Number(d.monthlyUsageKWh ?? d.monthly_usage_kwh ?? d.monthlyUsage ?? 0),
      0
    );
    return baseKWh + liveAccumulatedKWh;
  }, [devices, liveAccumulatedKWh]);

  // 한전 공식 누진 요금제 기준 이번 달 예상 청구 요금
  const totalKepcoBill = useMemo(() => {
    return calculateKepcoBill(totalMonthlyKWh);
  }, [totalMonthlyKWh]);

  // 실시간 가동 W 기준 시간당(h) 예상 추가 요금 (한전 2단계 요율 214.6원 기준)
  const hourlyRunningCost = useMemo(() => {
    if (totalActiveWatts <= 0) return 0;
    return Math.round((totalActiveWatts / 1000) * 214.6);
  }, [totalActiveWatts]);

  const handleDeviceTouchStart = (e) => {
    e.stopPropagation();
    deviceTouchStartX.current = e.touches[0].clientX;
    deviceTouchStartY.current = e.touches[0].clientY;
  };

  const handleDeviceTouchEnd = (e) => {
    e.stopPropagation();
    if (deviceTouchStartX.current === null || deviceTouchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - deviceTouchStartX.current;
    const deltaY = e.changedTouches[0].clientY - deviceTouchStartY.current;
    deviceTouchStartX.current = null;
    deviceTouchStartY.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      const currentIndex = availableCategories.findIndex((c) => c.key === selectedCategory);
      if (currentIndex === -1) return;

      if (deltaX < 0) {
        // 왼쪽으로 스와이프 -> 다음 기기 카테고리
        const nextIdx = (currentIndex + 1) % availableCategories.length;
        setSelectedCategory(availableCategories[nextIdx].key);
      } else {
        // 오른쪽으로 스와이프 -> 이전 기기 카테고리
        const prevIdx = (currentIndex - 1 + availableCategories.length) % availableCategories.length;
        setSelectedCategory(availableCategories[prevIdx].key);
      }
    }
  };

  // 홈 즐겨찾기(Pin) 기기 목록
  const pinnedDevices = useMemo(() => {
    return devices.filter((d) => d.isPinned);
  }, [devices]);

  // 가전 카테고리별 중앙 아이콘 매핑
  const renderDeviceIcon = (category) => {
    const iconProps = { className: "w-16 h-16 sm:w-24 sm:h-24 text-foreground stroke-[1.5]" };
    switch (category) {
      case "air_conditioner":
        return <AirVent {...iconProps} />;
      case "refrigerator":
        return <Refrigerator {...iconProps} />;
      case "washer":
        return <WashingMachine {...iconProps} />;
      case "tv":
        return <Tv {...iconProps} />;
      case "cooker":
        return <Utensils {...iconProps} />;
      case "air_purifier":
        return <Wind {...iconProps} />;
      case "robot_cleaner":
        return <Disc {...iconProps} />;
      default:
        return <Zap {...iconProps} />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-2 sm:py-4 px-3 sm:px-4 space-y-4 sm:space-y-6 my-auto animate-in fade-in duration-300">
      {/* 1. 상단 카테고리 칩 필터 */}
      <div className="flex items-center justify-center mx-auto gap-1.5 p-1.5 bg-muted/60 rounded-full border border-border shadow-xs overflow-x-auto max-w-full scrollbar-none">
        {availableCategories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const hasActiveDevice = devices.some((d) => d.category === cat.key && d.status);

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`relative px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
              {hasActiveDevice && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. 중앙 대형 기기 그래픽 및 실시간 원터치 전원 제어 (좌우 스와이프 시 기기 전환) */}
      {activeDevice ? (
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div
            onTouchStart={handleDeviceTouchStart}
            onTouchEnd={handleDeviceTouchEnd}
            className="relative group cursor-grab active:cursor-grabbing select-none"
          >
            {/* 좌우 스와이프 안내 화살표 */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hidden sm:flex items-center pointer-events-none">
              <ChevronLeft className="w-5 h-5 animate-pulse" />
            </div>
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hidden sm:flex items-center pointer-events-none">
              <ChevronRight className="w-5 h-5 animate-pulse" />
            </div>

            {/* 후면 가동 상태 글로우 효과 */}
            <div
              className={`absolute -inset-2 rounded-full blur-xl transition-all duration-500 opacity-60 ${
                activeDevice.status
                  ? "bg-blue-500/30 scale-105"
                  : "bg-transparent scale-95"
              }`}
            />

            {/* 메인 원형 기기 그래픽 */}
            <div
              className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border transition-all duration-300 flex items-center justify-center shadow-inner ${
                activeDevice.status
                  ? "border-blue-500/50 bg-gradient-to-b from-blue-500/10 via-muted/30 to-muted/80 shadow-blue-500/10"
                  : "border-border/70 bg-gradient-to-b from-muted/20 to-muted/60 opacity-80"
              }`}
            >
              {renderDeviceIcon(activeDevice.category || selectedCategory)}

              {/* 하단 실시간 소비전력 뱃지 */}
              <div className="absolute -bottom-3 bg-background border border-border px-3.5 py-1 rounded-full shadow-md flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeDevice.status ? "bg-blue-500 animate-pulse" : "bg-muted-foreground/50"
                  }`}
                />
                <span className="text-xs font-mono font-bold text-foreground">
                  {activeDevice.status
                    ? `${activeDevice.currentPower ?? activeDevice.current_power ?? 0} W`
                    : "대기전력 0 W"}
                </span>
              </div>
            </div>
          </div>

          {/* 기기 명칭 및 원클릭 전원 버튼 */}
          <div className="text-center space-y-1.5 pt-1">
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase">
                  {activeDevice.brand}
                </span>
                <span className="text-[11px] text-muted-foreground">•</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground">에너지 {activeDevice.energyGrade ?? 1}등급</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight mt-0.5">
                {activeDevice.name}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                월 예상 ₩{Number(activeDevice.monthlyCost ?? activeDevice.monthly_cost ?? 0).toLocaleString()}원 (
                {activeDevice.monthlyUsageKWh ?? activeDevice.monthly_usage_kwh ?? 0} kWh)
              </p>
            </div>

            {/* 메인 원터치 전원 버튼 */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {activeDevice.category === "refrigerator" || activeDevice.isProtectedGuardrail ? (
                <Button
                  onClick={() => toggleDeviceStatus(activeDevice.id)}
                  size="sm"
                  className="rounded-2xl font-extrabold text-xs h-9 sm:h-10 px-4 sm:px-5 gap-2 transition-all shadow-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span>24시간 가동 중 (끄기 불가)</span>
                </Button>
              ) : (
                <Button
                  onClick={() => toggleDeviceStatus(activeDevice.id)}
                  size="sm"
                  className={`rounded-2xl font-extrabold text-xs h-9 sm:h-10 px-4 sm:px-5 gap-2 transition-all shadow-md ${
                    activeDevice.status
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <Power className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span>{activeDevice.status ? "전원 가동 중 (끄기)" : "가전 전원 켜기"}</span>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-2xl text-xs h-9 sm:h-10 px-3 sm:px-3.5 border-border"
              >
                <Link href={`/devices/${activeDevice.id}`}>
                  상세 보기
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* 등록된 가전이 없을 때 가이드 카드 */
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground">
            <Zap className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">등록된 가전이 없습니다</h3>
            <p className="text-xs text-muted-foreground">
              사진 한 장으로 명판을 스캔하여 첫 번째 스마트 가전을 등록해 보세요.
            </p>
          </div>
          <Button asChild size="sm" className="rounded-xl gap-1.5 text-xs font-bold mt-2">
            <Link href="/devices/add">
              <Plus className="w-4 h-4" />
              첫 가전 스캔 등록
            </Link>
          </Button>
        </div>
      )}

      {/* 3. 하단 실시간 종합 전력 & 한전 누진 요금 요약 (모바일 2열 나란히 배치) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full max-w-lg">
        {/* 전체 소비전력 카드 */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-card border border-border shadow-xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold flex items-center gap-1 truncate">
              <Activity className={`w-3.5 h-3.5 shrink-0 ${totalActiveWatts > 0 ? "text-blue-500 animate-pulse" : "text-muted-foreground"}`} />
              <span className="truncate">실시간 전력</span>
            </span>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/30 px-1.5 py-0 shrink-0">
              {activeDevices.length}대 가동
            </Badge>
          </div>
          <div>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-lg sm:text-2xl font-mono font-extrabold text-foreground tracking-tight">
                {totalActiveWatts.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">W</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono block">
              ({(totalActiveWatts / 1000).toFixed(2)} kW)
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50 font-mono">
            <span className="truncate">작동 {activeDevices.length}/{devices.length}대</span>
            {totalActiveWatts > 0 ? (
              <span className="text-blue-500 font-bold shrink-0">
                ₩{hourlyRunningCost.toLocaleString()}/h
              </span>
            ) : (
              <span className="shrink-0">대기 중</span>
            )}
          </div>
        </div>

        {/* 한전 누진 요금 카드 */}
        <Link
          href="/energy/forecast"
          className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-card border border-border shadow-xs space-y-1.5 flex flex-col justify-between hover:border-primary/50 transition-all group"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold flex items-center gap-1 truncate">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">예상 청구 요금</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-primary flex items-center font-bold shrink-0 group-hover:underline">
              누진세
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-lg sm:text-2xl font-mono font-extrabold text-foreground tracking-tight">
                ₩{totalKepcoBill.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">/월</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono block truncate">
              총 {totalMonthlyKWh.toFixed(1)} kWh
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50 font-mono">
            <span className="text-emerald-500 font-bold truncate">누진세 분석</span>
            {liveAccumulatedKWh > 0 && (
              <span className="text-emerald-500 text-[9px] font-bold animate-pulse shrink-0">
                +{(liveAccumulatedKWh * 1000).toFixed(1)}Wh
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* 4. 홈 화면 즐겨찾기(홈 표시) 가전 빠른 제어 그리드 */}
      {pinnedDevices.length > 0 && (
        <div className="w-full max-w-lg space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              홈 빠른 제어 ({pinnedDevices.length})
            </span>
            <Link href="/devices" className="text-[11px] text-muted-foreground hover:text-foreground">
              전체 관리 ➔
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {pinnedDevices.map((pDev) => (
              <div
                key={pDev.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  pDev.status
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-card/60 border-border opacity-75"
                }`}
              >
                <div className="space-y-0.5 truncate mr-2">
                  <p className="text-xs font-bold text-foreground truncate">{pDev.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {pDev.status ? `${pDev.currentPower || 0}W 가동` : "꺼짐"}
                  </p>
                </div>
                <button
                  onClick={() => toggleDeviceStatus(pDev.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    pDev.status
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Power className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}