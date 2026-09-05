"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  AirVent,
  Utensils,
  Refrigerator,
  Tv,
  WashingMachine,
  Wind,
  Disc,
  Power,
  Plus,
  ShieldCheck,
  Zap,
  Filter,
  Search,
  ExternalLink,
  BookOpen,
  Wrench,
  ShoppingCart,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const ICON_MAP = {
  AirVent: AirVent,
  Utensils: Utensils,
  Refrigerator: Refrigerator,
  Tv: Tv,
  WashingMachine: WashingMachine,
  Wind: Wind,
  Disc: Disc,
};

export default function DevicesPage() {
  const { devices, toggleDeviceStatus, togglePinDevice } = useDevices();
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const brands = ["ALL", "LG전자", "삼성전자", "다이슨", "쿠쿠전자", "로보락"];

  const filteredDevices = devices
    .filter((d) => {
      const matchesBrand = selectedBrand === "ALL" || d.brand === selectedBrand;
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesSearch;
    })
    .sort((a, b) => {
      const aIsIoT = (a.isSmartControl !== false) && a.category !== "refrigerator" && !a.isProtectedGuardrail;
      const bIsIoT = (b.isSmartControl !== false) && b.category !== "refrigerator" && !b.isProtectedGuardrail;
      if (aIsIoT && !bIsIoT) return -1;
      if (!aIsIoT && bIsIoT) return 1;
      return 0;
    });

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              스마트 제품 관리
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                {devices.length}대 통합 관리 중
              </Badge>
            </h1>
          </div>

          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 gap-2 h-11 px-5"
          >
            <Link href="/devices/add">
              <Plus className="w-5 h-5 stroke-[2.5]" />
              새 기기 스캔 추가
            </Link>
          </Button>
        </div>

        {/* Search & Brand Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card/60 border border-border backdrop-blur-xl">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="기기명, 모델명, 제조사 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-accent/50 border-border rounded-xl text-xs h-10"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedBrand === b
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {b === "ALL" ? "전체 제조사" : b}
              </button>
            ))}
          </div>
        </div>

        {/* Device Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDevices.map((device) => {
            const Icon = ICON_MAP[device.icon] || Zap;
            const isOn = device.status;
            const isFridgeGuardrail = device.category === "refrigerator" || device.isProtectedGuardrail;

            return (
              <div
                key={device.id}
                className={`relative flex flex-col justify-between rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${
                  isOn
                    ? "bg-card/90 border-primary/50 dark:border-primary/30 shadow-[0_0_12px_rgba(37,99,235,0.45)] dark:shadow-[0_0_8px_rgba(59,130,246,0.25)]"
                    : "bg-card/40 border-border opacity-80 hover:opacity-100"
                }`}
              >
                {/* Top Row: Brand, Grade & Power Switch */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mr-1">
                      {device.brand}
                    </span>
                    <button
                      onClick={() => togglePinDevice(device.id)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors border ${
                        device.isPinned
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : "bg-muted text-muted-foreground hover:bg-accent border-border"
                      }`}
                      title={device.isPinned ? "홈 화면에서 숨기기" : "홈 화면에 띄우기"}
                    >
                      <Star className={`w-3 h-3 ${device.isPinned ? "fill-amber-500" : ""}`} />
                      홈 표시
                    </button>
                    <Badge variant="outline" className="text-[10px] bg-accent/50 border-border px-1.5 py-0 font-medium">
                      에너지 {device.energyGrade}등급
                    </Badge>
                    {isFridgeGuardrail && (
                      <Badge variant="outline" className="text-[10px] bg-muted border-border text-muted-foreground gap-1 px-1.5 py-0">
                        <ShieldCheck className="w-3 h-3 text-muted-foreground/70" />
                        상시 가동 (IoT 미지원)
                      </Badge>
                    )}
                  </div>

                  <button
                    onClick={() => toggleDeviceStatus(device.id)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isFridgeGuardrail
                        ? "bg-muted text-muted-foreground/50 border border-border cursor-default"
                        : isOn
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                        : "bg-accent text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
                    }`}
                    title={isFridgeGuardrail ? "상시 가동 가전 (IoT 원격 제어 미지원)" : isOn ? "전원 끄기" : "전원 켜기"}
                  >
                    {isFridgeGuardrail ? (
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                    ) : (
                      <Power className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    )}
                  </button>
                </div>

                {/* Device Icon + Name + Model */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-accent/50 border border-border flex items-center justify-center text-foreground shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                      {device.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                      모델명: {device.model}
                    </p>
                  </div>
                </div>

                {/* Key Specs Pills */}
                {device.specs && (
                  <div className="p-2.5 rounded-2xl bg-muted/50 border border-border text-xs space-y-1 mb-3">
                    {Object.entries(device.specs).slice(0, 2).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-medium text-foreground truncate ml-2">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Energy Grades (출시 당시 vs 현행 환산) */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[10px] sm:text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-muted border border-border text-foreground">
                    {device.releaseYear || "출시"}년 기준 {device.releaseEnergyGrade || 1}등급
                  </span>
                  <span className="text-muted-foreground">➔</span>
                  <span className={`px-2 py-0.5 rounded-lg font-bold border ${
                    (device.currentEnergyGrade || 1) > (device.releaseEnergyGrade || 1)
                      ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400"
                      : "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400"
                  }`}>
                    2024년 기준 {device.currentEnergyGrade || 1}등급
                  </span>
                </div>

                {/* Power & Cost Metrics (금액 중심) */}
                <div className="flex items-baseline justify-between pt-3 border-t border-border mb-4">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">월 예상 요금</span>
                    <span className="font-mono font-extrabold text-base sm:text-lg text-foreground">
                      ₩ {device.monthlyCost.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/월</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">월간 전력량</span>
                    <span className="font-mono text-xs text-muted-foreground">{device.monthlyUsageKWh} kWh</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl text-xs h-9 border-border hover:bg-accent hover:text-primary"
                  >
                    <Link href={`/devices/${device.id}`}>
                      상세 스펙 & A/S
                    </Link>
                  </Button>
                  {device.consumables?.[0] && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl text-xs h-9 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 gap-1"
                    >
                      <a
                        href={device.consumables[0].buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        소모품
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
