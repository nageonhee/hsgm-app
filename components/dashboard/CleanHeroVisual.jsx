"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AirVent,
  Tv,
  Refrigerator,
  WashingMachine,
  Utensils,
  Wind,
  Disc,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDevices } from "@/contexts/DeviceContext";

const CATEGORY_NAMES = {
  air_conditioner: "에어컨",
  refrigerator: "냉장고",
  washer: "세탁기",
  tv: "TV",
  cooker: "밥솥",
  air_purifier: "공기청정기",
  robot_cleaner: "청소기",
};

export function CleanHeroVisual({ summary }) {
  const { devices } = useDevices();
  const [selectedHeroIdx, setSelectedHeroIdx] = useState(0);

  // 대표 기기 목록
  const heroDevices = devices.slice(0, 5);
  const currentHero = heroDevices[selectedHeroIdx] || devices[0];

  const totalCost = summary?.totalEstimatedCost || 42350;
  const totalKW = summary?.realtimePowerKW || 2.41;

  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-6 max-w-xl mx-auto text-center animate-in fade-in duration-300">
      {/* 1. 제품 종류 카테고리 탭 (모델명이 아닌 '에어컨', '냉장고', '세탁기', 'TV' 등) */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-card border border-border mb-6 shadow-sm">
        {heroDevices.map((dev, idx) => {
          let categoryLabel = CATEGORY_NAMES[dev.category] || dev.name.split(" ")[0];
          
          // 동종 기기가 여러 대일 경우 넘버링 (에어컨 1, 에어컨 2)
          const sameCategoryDevices = heroDevices.filter(d => d.category === dev.category);
          if (sameCategoryDevices.length > 1) {
            const order = sameCategoryDevices.findIndex(d => d.id === dev.id) + 1;
            categoryLabel = `${categoryLabel} ${order}`;
          }

          const isSelected = selectedHeroIdx === idx;

          return (
            <button
              key={dev.id}
              onClick={() => setSelectedHeroIdx(idx)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? "bg-white text-black shadow-md shadow-white/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {categoryLabel}
            </button>
          );
        })}
      </div>

      {/* 2. 3D Visual Centerpiece */}
      <div className="relative my-3 w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-card border border-border flex flex-col items-center justify-center shadow-2xl">
          {currentHero?.category === "air_conditioner" ? (
            <AirVent className="w-20 h-20 text-foreground stroke-[1.2] drop-shadow-[0_0_15px_rgba(0,112,243,0.3)]" />
          ) : currentHero?.category === "refrigerator" ? (
            <Refrigerator className="w-20 h-20 text-foreground stroke-[1.2] drop-shadow-[0_0_15px_rgba(0,112,243,0.3)]" />
          ) : currentHero?.category === "washer" ? (
            <WashingMachine className="w-20 h-20 text-foreground stroke-[1.2] drop-shadow-[0_0_15px_rgba(0,112,243,0.3)]" />
          ) : currentHero?.category === "tv" ? (
            <Tv className="w-20 h-20 text-foreground stroke-[1.2] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          ) : currentHero?.category === "cooker" ? (
            <Utensils className="w-20 h-20 text-foreground stroke-[1.2] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          ) : (
            <Disc className="w-20 h-20 text-foreground stroke-[1.2] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          )}

          {currentHero?.status && (
            <span className="absolute bottom-3.5 flex items-center gap-1 text-[11px] font-mono text-primary font-bold bg-background/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {currentHero.currentPower} W
            </span>
          )}
        </div>
      </div>

      {/* 3. Device Name & Status with Blue [진입 ➔] Button */}
      <div className="w-full flex items-center justify-between px-2 sm:px-4 mt-3 mb-5">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate max-w-[240px] sm:max-w-xs">
            {currentHero?.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="text-[#94A3B8]">
              {currentHero?.status ? "100% 가동 중" : "대기 중 (절전)"}
            </span>
            <span>•</span>
            <span className="text-primary font-mono font-bold">
              월 ₩{currentHero?.monthlyCost?.toLocaleString()}
            </span>
          </div>
        </div>

        <Link
          href={`/devices/${currentHero?.id}`}
          className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span>진입</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>

      {/* 4. 2개 버튼: [전체 사용량] & [해당 기기 사용량] (에코모드 제거) */}
      <div className="w-full grid grid-cols-2 gap-3 px-2 sm:px-4">
        {/* Left: 전체 사용량 (우리집 전체) */}
        <Link
          href="/energy"
          className="flex items-center gap-3 p-4 rounded-2xl bg-card hover:bg-muted border border-border transition-all text-left group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-primary shrink-0">
            <Zap className="w-5 h-5 fill-blue-400" />
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block font-medium">
              우리집 전체 사용량
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-black text-sm sm:text-base text-foreground">
                ₩{totalCost.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-primary font-mono block mt-0.5">
              실시간 {totalKW} kW
            </span>
          </div>
        </Link>

        {/* Right: 해당 기기 사용량 (선택된 가전) */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-accent/50 flex items-center justify-center text-foreground shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-muted-foreground block font-medium truncate">
              {CATEGORY_NAMES[currentHero?.category] || "해당 기기"} 사용량
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-black text-sm sm:text-base text-foreground truncate">
                ₩{currentHero?.monthlyCost ? currentHero.monthlyCost.toLocaleString() : "0"}
              </span>
              <span className="text-[10px] text-muted-foreground">/월</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
              {currentHero?.monthlyUsageKWh} kWh ({currentHero?.currentPower}W)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
