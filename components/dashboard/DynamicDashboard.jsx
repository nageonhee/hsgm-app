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

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const deviceTouchStartX = useRef(null);
  const deviceTouchStartY = useRef(null);
  const categoryContainerRef = useRef(null);

  const availableCategories = DEFAULT_CATEGORIES;

  // 카테고리 변경 시 해당 칩이 자동으로 중앙으로 스크롤되도록 설정
  useEffect(() => {
    if (categoryContainerRef.current) {
      const activeBtn = categoryContainerRef.current.querySelector('[data-selected="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedCategory]);

  // 선택된 카테고리의 대표 기기 선정
  const activeDevice = useMemo(() => {
    return devices.find((d) => d.category === selectedCategory) || devices[0] || null;
  }, [devices, selectedCategory]);

  // 소비전력 및 한전 누진세 계산
  const activeDevices = useMemo(() => devices.filter((d) => d.status), [devices]);
  const totalActiveWatts = useMemo(
    () => devices.reduce((acc, d) => acc + (d.status ? d.currentPower || d.current_power || 0 : 0), 0),
    [devices]
  );
  const hourlyRunningCost = Math.round((totalActiveWatts / 1000) * 215);
  const totalMonthlyKWh = useMemo(
    () => devices.reduce((acc, d) => acc + (d.monthlyUsageKWh || d.monthly_usage_kwh || 0), 0),
    [devices]
  );
  const totalKepcoBill = useMemo(() => calculateKepcoBill(totalMonthlyKWh), [totalMonthlyKWh]);
  const [liveAccumulatedKWh, setLiveAccumulatedKWh] = useState(0.001);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveAccumulatedKWh((prev) => prev + 0.0001);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleDeviceTouchStart = (e) => {
    e.stopPropagation();
    deviceTouchStartX.current = e.touches[0].clientX;
    deviceTouchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
    setDragX(0);
  };

  const handleDeviceTouchMove = (e) => {
    e.stopPropagation();
    if (deviceTouchStartX.current === null || !isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - deviceTouchStartX.current;
    const diffY = currentY - deviceTouchStartY.current;

    // 수평 드래그가 주를 이룰 때만 실시간 위치 변경
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDragX(diffX);
    }
  };

  const handleDeviceTouchEnd = (e) => {
    e.stopPropagation();
    if (deviceTouchStartX.current === null) return;
    setIsDragging(false);

    const threshold = 55;
    const currentIndex = availableCategories.findIndex((c) => c.key === selectedCategory);

    if (dragX < -threshold && currentIndex !== -1) {
      // 왼쪽으로 드래그 -> 다음 기기 카테고리
      const nextIdx = (currentIndex + 1) % availableCategories.length;
      setSelectedCategory(availableCategories[nextIdx].key);
    } else if (dragX > threshold && currentIndex !== -1) {
      // 오른쪽으로 드래그 -> 이전 기기 카테고리
      const prevIdx = (currentIndex - 1 + availableCategories.length) % availableCategories.length;
      setSelectedCategory(availableCategories[prevIdx].key);
    }

    deviceTouchStartX.current = null;
    deviceTouchStartY.current = null;
    setDragX(0);
  };

  // 스와이프 중간 인식 실시간 계산
  const currentCategoryIndex = availableCategories.findIndex((c) => c.key === selectedCategory);
  const dragThreshold = 55;
  let targetCategory = null;

  if (isDragging && dragX !== 0 && currentCategoryIndex !== -1) {
    if (dragX < 0) {
      const nextIdx = (currentCategoryIndex + 1) % availableCategories.length;
      targetCategory = availableCategories[nextIdx];
    } else {
      const prevIdx = (currentCategoryIndex - 1 + availableCategories.length) % availableCategories.length;
      targetCategory = availableCategories[prevIdx];
    }
  }

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
      {/* 1. 상단 카테고리 칩 필터 (페이지 스와이프 이벤트 차단 e.stopPropagation() + 반응형 가로 스크롤 및 중앙 자동 정렬) */}
      <div
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="relative w-full max-w-full sm:max-w-xl mx-auto px-1"
      >
        {/* 모바일 화면용 가로 스크롤 힌트 페이드 그래디언트 */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 sm:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 sm:hidden" />

        <div
          ref={categoryContainerRef}
          className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 bg-muted/60 rounded-full border border-border shadow-xs overflow-x-auto max-w-full scrollbar-none touch-pan-x snap-x"
        >
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const hasActiveDevice = devices.some((d) => d.category === cat.key && d.status);

            return (
              <button
                key={cat.key}
                data-selected={isSelected ? "true" : "false"}
                onClick={() => setSelectedCategory(cat.key)}
                className={`relative px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 snap-center ${
                  isSelected
                    ? "bg-background text-foreground shadow-sm font-bold ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
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
      </div>

      {/* 2. 중앙 대형 기기 그래픽 영역 (화면 전체 너비 스와이프 영역 -> 가전만 변경, 페이지 전환 완전 차단) */}
      {activeDevice ? (
        <div
          onTouchStart={handleDeviceTouchStart}
          onTouchMove={handleDeviceTouchMove}
          onTouchEnd={handleDeviceTouchEnd}
          className="w-full relative flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-2 select-none touch-none cursor-grab active:cursor-grabbing"
        >
          <div
            style={{
              transform: `translateX(${dragX}px)`,
              transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="flex flex-col items-center space-y-3 sm:space-y-4 w-full"
          >
            {/* 메인 원형 기기 그래픽 및 완벽한 원형 빛 후광 */}
            <div className="relative flex items-center justify-center">
              {/* 원형 전방향 빛 후광 (라이트 모드 대비 강화) */}
              <div
                className={`absolute -inset-2 sm:-inset-2.5 rounded-full blur-md transition-all duration-500 pointer-events-none z-0 ${
                  activeDevice.status
                    ? "bg-blue-500/55 dark:bg-blue-500/30 scale-100 opacity-100"
                    : "bg-transparent scale-90 opacity-0"
                }`}
              />

              {/* 메인 원형 기기 본체 (불투명 bg-card 및 z-10으로 빛 위에 얹혀 내부 빛 침범 차단) */}
              <div
                className={`relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full border transition-all duration-300 flex items-center justify-center bg-card shadow-sm ${
                  activeDevice.status
                    ? "border-blue-500/60 dark:border-blue-500/40"
                    : "border-border/70 opacity-80"
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

            {/* 기기 명칭 및 상세 정보 */}
            <div className="text-center space-y-1.5 pt-1">
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase">
                    {activeDevice.brand}
                  </span>
                  <span className="text-[11px] text-muted-foreground">•</span>
                  <span className="text-[11px] sm:text-xs text-muted-foreground">
                    에너지 {activeDevice.energyGrade ?? 1}등급
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight mt-0.5">
                  {activeDevice.name}
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                  월 예상 ₩{Number(activeDevice.monthlyCost ?? activeDevice.monthly_cost ?? 0).toLocaleString()}원 (
                  {activeDevice.monthlyUsageKWh ?? activeDevice.monthly_usage_kwh ?? 0} kWh)
                </p>
              </div>
            </div>
          </div>

          {/* 메인 원터치 전원 버튼 및 상세 보기 버튼 (버튼 터치 시 클릭 작동을 위해 stopPropagation) */}
          <div
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 pt-0.5 z-10"
          >
            {activeDevice.category === "refrigerator" || activeDevice.isProtectedGuardrail ? (
              <div className="rounded-2xl font-bold text-xs h-9 sm:h-10 px-4 sm:px-5 gap-2 border border-border bg-muted/80 text-muted-foreground flex items-center shadow-xs cursor-default">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/70" />
                <span>상시 가동 가전 (IoT 제어 미지원)</span>
              </div>
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
              <Activity
                className={`w-3.5 h-3.5 shrink-0 ${
                  totalActiveWatts > 0 ? "text-blue-500 animate-pulse" : "text-muted-foreground"
                }`}
              />
              <span className="truncate">실시간 전력</span>
            </span>
            <Badge
              variant="outline"
              className="text-[9px] sm:text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/30 px-1.5 py-0 shrink-0"
            >
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