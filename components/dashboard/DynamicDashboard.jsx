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
  ChevronRight,
  Activity,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DynamicDashboard() {
  const { devices = [], toggleDeviceStatus } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const deviceTouchStartX = useRef(null);
  const deviceTouchStartY = useRef(null);
  const tabsContainerRef = useRef(null);

  // 1. 기기 목록이 로드되거나 변경될 때: 목록의 최상단 기기(devices[0])를 기본 선택
  useEffect(() => {
    if (devices.length > 0) {
      if (!selectedDeviceId || !devices.some((d) => d.id === selectedDeviceId)) {
        setSelectedDeviceId(devices[0].id);
      }
    } else {
      setSelectedDeviceId(null);
    }
  }, [devices, selectedDeviceId]);

  // 선택된 활성 기기 객체 (기본값: 최상단 기기 devices[0])
  const activeDevice = useMemo(() => {
    if (!devices || devices.length === 0) return null;
    return devices.find((d) => d.id === selectedDeviceId) || devices[0];
  }, [devices, selectedDeviceId]);

  // 기기 탭 변경 시 해당 탭이 중앙으로 자동 스크롤
  useEffect(() => {
    if (tabsContainerRef.current && activeDevice) {
      const activeBtn = tabsContainerRef.current.querySelector('[data-selected="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [activeDevice]);

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

  // 중앙 원형 그래픽 스와이프 제어 (기기 간 순환 전환)
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

    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDragX(diffX);
    }
  };

  const handleDeviceTouchEnd = (e) => {
    e.stopPropagation();
    if (deviceTouchStartX.current === null) return;
    setIsDragging(false);

    const threshold = 55;
    const currentIndex = devices.findIndex((d) => d.id === activeDevice?.id);

    if (dragX < -threshold && currentIndex !== -1 && devices.length > 1) {
      // 왼쪽으로 스와이프 -> 다음 등록 기기
      const nextIdx = (currentIndex + 1) % devices.length;
      setSelectedDeviceId(devices[nextIdx].id);
    } else if (dragX > threshold && currentIndex !== -1 && devices.length > 1) {
      // 오른쪽으로 스와이프 -> 이전 등록 기기
      const prevIdx = (currentIndex - 1 + devices.length) % devices.length;
      setSelectedDeviceId(devices[prevIdx].id);
    }

    deviceTouchStartX.current = null;
    deviceTouchStartY.current = null;
    setDragX(0);
  };

  // 홈 즐겨찾기(Pin) 기기 목록
  const pinnedDevices = useMemo(() => {
    return devices.filter((d) => d.isPinned);
  }, [devices]);

  // 가전 아이콘 매핑
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
      {/* 1. 상단 등록 기기 전환 탭 바 (해당 영역 내 스크롤만 동작하며 페이지 스와이프 간섭 완벽 차단) */}
      {devices.length > 0 && (
        <div
          data-swipe-ignore="true"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="relative w-full max-w-full sm:max-w-xl mx-auto px-1"
        >
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 sm:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 sm:hidden" />

          <div
            ref={tabsContainerRef}
            className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 bg-muted/60 rounded-full border border-border shadow-xs overflow-x-auto max-w-full scrollbar-none touch-pan-x snap-x"
          >
            {devices.map((device) => {
              const isSelected = activeDevice?.id === device.id;
              return (
                <button
                  key={device.id}
                  data-selected={isSelected ? "true" : "false"}
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={`relative px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 snap-center ${
                    isSelected
                      ? "bg-background text-foreground shadow-sm font-bold ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  }`}
                >
                  {device.isPinned && (
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate max-w-[110px] sm:max-w-[140px]">{device.name}</span>
                  {device.status && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}

            <Link
              href="/devices/add"
              className="px-2.5 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-background/50 flex items-center gap-1 shrink-0 snap-center border border-dashed border-border transition-colors"
              title="새 스마트 가전 등록"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">기기 추가</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. 중앙 대형 기기 그래픽 영역 (등록된 기기가 있을 때) */}
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
            {/* 메인 원형 기기 그래픽 및 원형 빛 후광 */}
            <div className="relative flex items-center justify-center">
              <div
                className={`absolute -inset-2 sm:-inset-2.5 rounded-full blur-md transition-all duration-500 pointer-events-none z-0 ${
                  activeDevice.status
                    ? "bg-blue-500/40 dark:bg-blue-500/25 scale-100 opacity-100"
                    : "bg-transparent scale-90 opacity-0"
                }`}
              />

              <div
                className={`relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full border transition-all duration-300 flex items-center justify-center bg-card shadow-sm ${
                  activeDevice.status
                    ? "border-blue-500/50 dark:border-blue-500/40"
                    : "border-border/70 opacity-80"
                }`}
              >
                {renderDeviceIcon(activeDevice.category)}

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

          {/* 메인 원터치 전원 버튼 및 상세 보기 버튼 */}
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
        /* 0대 등록 시: 스마트홈 통합 관리 인터랙티브 SVG 그래픽 & 깔끔한 스탠바이 안내 */
        <div className="w-full flex flex-col items-center justify-center py-6 sm:py-8 space-y-4">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* 배경 은은한 오비탈 펄스 링 */}
            <div className="absolute inset-2 rounded-full border border-dashed border-border/80 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-8 rounded-full border border-blue-500/20 dark:border-blue-500/10 animate-pulse" />

            {/* 인터랙티브 스마트홈 통합 관리 커스텀 SVG */}
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 에너지 연결 트랙 라인 */}
              <path
                d="M120 120 L60 70 M120 120 L180 70 M120 120 L50 160 M120 120 L190 160 M120 120 L120 40"
                stroke="currentColor"
                className="text-border"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* 주변 가전 스마트 노드들 */}
              {/* 1. 에어컨 노드 */}
              <g transform="translate(45, 55)">
                <circle cx="15" cy="15" r="14" className="fill-muted stroke-border" strokeWidth="1" />
                <path d="M10 15h10M12 18h6M11 12h8" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* 2. 세탁기 노드 */}
              <g transform="translate(165, 55)">
                <circle cx="15" cy="15" r="14" className="fill-muted stroke-border" strokeWidth="1" />
                <rect x="9" y="8" width="12" height="14" rx="2" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.2" />
                <circle cx="15" cy="16" r="3.5" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.2" />
              </g>

              {/* 3. 스마트 TV 노드 */}
              <g transform="translate(105, 25)">
                <circle cx="15" cy="15" r="14" className="fill-muted stroke-border" strokeWidth="1" />
                <rect x="8" y="9" width="14" height="9" rx="1.5" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.2" />
                <path d="M13 20h4" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* 4. 냉장고 노드 */}
              <g transform="translate(35, 145)">
                <circle cx="15" cy="15" r="14" className="fill-muted stroke-border" strokeWidth="1" />
                <rect x="10" y="8" width="10" height="14" rx="1.5" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.2" />
                <path d="M10 14h10" stroke="currentColor" className="text-muted-foreground" strokeWidth="1" />
              </g>

              {/* 5. 로봇청소기 / 공기청정기 노드 */}
              <g transform="translate(175, 145)">
                <circle cx="15" cy="15" r="14" className="fill-muted stroke-border" strokeWidth="1" />
                <circle cx="15" cy="15" r="7" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.2" />
                <circle cx="15" cy="15" r="2" className="fill-muted-foreground" />
              </g>

              {/* 중앙 메인 AI 에너지 허브 본체 */}
              <g transform="translate(85, 85)">
                <circle cx="35" cy="35" r="34" className="fill-card stroke-blue-500/40 shadow-lg" strokeWidth="2" />
                <circle cx="35" cy="35" r="28" className="fill-blue-500/10" />
                <path
                  d="M35 22 L27 36 L34 36 L32 48 L43 33 L36 33 Z"
                  className="fill-blue-600 dark:fill-blue-400"
                />
              </g>
            </svg>

            {/* 중앙 하단 스탠바이 모드 뱃지 */}
            <div className="absolute -bottom-2 bg-background border border-border px-3.5 py-1 rounded-full shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
              <span className="text-xs font-mono font-bold text-muted-foreground">스탠바이 • 0 W</span>
            </div>
          </div>

          {/* 깔끔하고 절제된 타이포그래피 및 안내 문구 */}
          <div className="text-center space-y-1.5 max-w-sm px-4">
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-500 tracking-wider uppercase">
              HSGM Smart Home Hub
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">
              등록된 스마트 가전이 없습니다
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-medium">
              가전 명판 사진을 스캔하거나 직접 입력하여 첫 스마트 가전을 등록해 보세요.
            </p>
          </div>

          {/* 원터치 기기 등록 버튼 */}
          <Button asChild size="sm" className="rounded-2xl h-10 px-5 gap-2 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/devices/add">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              스마트 가전 스캔 등록
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
                onClick={() => setSelectedDeviceId(pDev.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  activeDevice?.id === pDev.id
                    ? "ring-2 ring-primary/40 border-primary/50 bg-card"
                    : pDev.status
                    ? "bg-blue-500/10 border-blue-500/30 hover:border-primary/40"
                    : "bg-card/60 border-border opacity-75 hover:opacity-100"
                }`}
              >
                <div className="space-y-0.5 truncate mr-2">
                  <p className="text-xs font-bold text-foreground truncate">{pDev.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {pDev.status ? `${pDev.currentPower || 0}W 가동` : "꺼짐"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDeviceStatus(pDev.id);
                  }}
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