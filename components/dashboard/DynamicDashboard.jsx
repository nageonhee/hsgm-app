"use client";

import React, { useState, useMemo } from "react";
import { useDevices } from "@/contexts/DeviceContext";
import {
  AirVent,
  Refrigerator,
  WashingMachine,
  Tv,
  Utensils,
  Zap,
} from "lucide-react";

const CATEGORIES = [
  { key: "air_conditioner", label: "에어컨" },
  { key: "refrigerator", label: "냉장고" },
  { key: "washer", label: "세탁기" },
  { key: "tv", label: "TV" },
  { key: "cooker", label: "밥솥" },
];

export default function DynamicDashboard() {
  const { devices = [] } = useDevices();
  const [selectedCategory, setSelectedCategory] = useState("air_conditioner");

  // 현재 선택된 카테고리의 가전 찾기 (없을 경우 첫 번째 가전 또는 기본값)
  const activeDevice = useMemo(() => {
    const found = devices.find((d) => d.category === selectedCategory);
    return (
      found ||
      devices[0] || {
        name: "등록된 기기 없음",
        status: false,
        current_power: 0,
        monthly_cost: 0,
        monthly_usage_kwh: 0,
      }
    );
  }, [devices, selectedCategory]);

  // DB 필드(스네이크 케이스)와 목업 필드(카멜 케이스) 호환 처리
  const isOn = Boolean(activeDevice.status ?? activeDevice.isOn);
  const currentPower = activeDevice.current_power ?? activeDevice.currentPower ?? 0;
  const monthlyCost = Number(activeDevice.monthly_cost ?? activeDevice.monthlyCost ?? 0);
  const monthlyUsage = Number(activeDevice.monthly_usage_kwh ?? activeDevice.monthlyUsage ?? 0);

  // 우리집 전체 전력 및 요금 집계
  const totalCost = useMemo(() => {
    const sum = devices.reduce(
      (acc, d) => acc + Number(d.monthly_cost ?? d.monthlyCost ?? 0),
      0
    );
    return sum > 0 ? sum : 42350;
  }, [devices]);

  const totalPowerKw = useMemo(() => {
    const sumWatts = devices.reduce(
      (acc, d) => acc + (d.status ? Number(d.current_power ?? d.currentPower ?? 0) : 0),
      0
    );
    return sumWatts > 0 ? (sumWatts / 1000).toFixed(2) : "2.41";
  }, [devices]);

  // 가전 카테고리별 중앙 아이콘 매핑
  const renderDeviceIcon = (category) => {
    const iconProps = { className: "w-24 h-24 text-foreground stroke-[1.5]" };
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
      default:
        return <Zap {...iconProps} />;
    }
  };

  const currentCategoryObj = CATEGORIES.find((c) => c.key === selectedCategory);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center py-6 px-4 space-y-8 animate-in fade-in duration-300">
      {/* 1. 상단 카테고리 칩 목록 */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-full border border-border shadow-xs overflow-x-auto max-w-full no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 2. 중앙 대형 기기 그래픽 및 실시간 전력 뱃지 */}
      <div className="flex flex-col items-center space-y-5">
        <div className="relative w-64 h-64 rounded-full border border-border/70 bg-gradient-to-b from-muted/30 to-muted/80 flex items-center justify-center shadow-inner">
          {renderDeviceIcon(activeDevice.category || selectedCategory)}

          {/* 하단 실시간 소비전력 뱃지 */}
          <div className="absolute -bottom-3 bg-background border border-border px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOn ? "bg-blue-500 animate-pulse" : "bg-muted-foreground/50"
              }`}
            />
            <span className="text-xs font-bold text-foreground">
              {currentPower} W
            </span>
          </div>
        </div>

        {/* 기기 명칭 및 가동 상태 정보 */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-foreground">
            {activeDevice.name}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {isOn ? "100% 가동 중" : "전원 꺼짐"} • 월 ₩{monthlyCost.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 3. 하단 전력 및 요금 요약 카드 (2열 그리드) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg">
        {/* 전체 사용량 카드 */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs text-muted-foreground font-medium">
            우리집 전체 사용량
          </span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              ₩{totalCost.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            실시간 {totalPowerKw} kW
          </p>
        </div>

        {/* 선택 가전 사용량 카드 */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs text-muted-foreground font-medium">
            {currentCategoryObj?.label || "가전"} 사용량
          </span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
            <span className="text-lg font-extrabold text-foreground tracking-tight">
              ₩{monthlyCost.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                /월
              </span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {monthlyUsage} kWh ({currentPower}W)
          </p>
        </div>
      </div>
    </div>
  );
}