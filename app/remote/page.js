"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  AirVent,
  Tv,
  Wind,
  Disc,
  Power,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ArrowLeft,
  Play,
  Home,
  Check,
  ChevronDown as DropdownIcon,
  Sparkles,
  ChevronsUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ICON_MAP = {
  AirVent: AirVent,
  Tv: Tv,
  Wind: Wind,
  Disc: Disc,
};

const CATEGORY_NAMES = {
  air_conditioner: "에어컨",
  tv: "TV",
  air_purifier: "공기청정기",
  robot_cleaner: "로봇청소기",
};

export default function RemotePage() {
  const { devices, toggleDeviceStatus } = useDevices();

  // IoT 제어 가능한 기기만 필터링
  const smartDevices = devices.filter((d) => d.isSmartControl);
  const [selectedDeviceId, setSelectedDeviceId] = useState(smartDevices[0]?.id || "dev-1");

  const currentDevice = smartDevices.find((d) => d.id === selectedDeviceId) || smartDevices[0];
  const Icon = ICON_MAP[currentDevice?.icon] || Tv;
  const isOn = currentDevice?.status;

  // Remote Controls State
  const [acTemp, setAcTemp] = useState(24);
  const [acMode, setAcMode] = useState("cool");
  const [acWind, setAcWind] = useState("auto");

  const [tvVolume, setTvVolume] = useState(18);
  const [tvChannel, setTvChannel] = useState(11);

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-300 pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </Link>

          <span className="text-xs font-semibold text-primary">
            스마트 통합 리모컨
          </span>
        </div>

        {/* ── 1. 스마트 가전 드롭다운 셀렉터 (가로 스크롤 제거 ➔ 수십 대 가전도 한눈에 관리) ── */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-card hover:bg-muted border border-border transition-all text-left outline-none cursor-pointer group shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-muted-foreground block">
                  현재 제어 중인 가전
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground truncate">
                    {currentDevice?.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${isOn ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"}`}>
                    {isOn ? "가동 중" : "꺼짐"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/50 group-hover:bg-accent text-muted-foreground group-hover:text-foreground shrink-0 transition-colors ml-2">
              <ChevronsUpDown className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" className="w-[calc(100vw-2rem)] max-w-md bg-card border-border p-2 max-h-80 overflow-y-auto no-scrollbar">
            <DropdownMenuLabel>IoT 제어 가능 기기 ({smartDevices.length}대)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {smartDevices.map((dev) => {
              const DevIcon = ICON_MAP[dev.icon] || Tv;
              const isSelected = dev.id === selectedDeviceId;

              return (
                <DropdownMenuItem
                  key={dev.id}
                  onClick={() => setSelectedDeviceId(dev.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/20 text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary text-primary-foreground" : "bg-accent/50"}`}>
                      <DevIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs block text-foreground font-semibold">{dev.name}</span>
                      <span className="text-[10px] text-muted-foreground">{dev.brand} • {CATEGORY_NAMES[dev.category] || "스마트 가전"}</span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── 2. 만능 스마트 리모컨 본체 ── */}
        <div className="rounded-3xl bg-card border border-border p-6 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Header of Controller */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="min-w-0 flex-1 pr-4">
              <span className="text-xs text-muted-foreground block font-mono">
                {currentDevice?.brand}
              </span>
              <h2 className="font-bold text-base text-foreground truncate">
                {currentDevice?.name}
              </h2>
            </div>

            {/* Main Power Button */}
            {currentDevice && currentDevice.category !== "refrigerator" && (
              <button
                onClick={() => currentDevice?.id && toggleDeviceStatus(currentDevice.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isOn
                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Power className="w-6 h-6 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* ────────────────────────────────────────────────────────────────
              A. 에어컨 리모컨 인터페이스
          ──────────────────────────────────────────────────────────────── */}
          {currentDevice?.category === "air_conditioner" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Temp Display & Plus/Minus */}
              <div className="flex items-center justify-between px-4 py-2">
                <button
                  onClick={() => setAcTemp((prev) => Math.max(18, prev - 1))}
                  className="w-14 h-14 rounded-2xl bg-muted hover:bg-accent text-foreground flex items-center justify-center active:scale-95 transition-all text-xl font-bold border border-border shadow-sm"
                >
                  <Minus className="w-6 h-6" />
                </button>

                <div className="text-center">
                  <span className="text-[11px] text-muted-foreground block">희망 온도</span>
                  <div className="flex items-start justify-center">
                    <span className="text-5xl font-black font-mono text-foreground">
                      {acTemp}
                    </span>
                    <span className="text-xl font-bold text-primary mt-1">°C</span>
                  </div>
                </div>

                <button
                  onClick={() => setAcTemp((prev) => Math.min(30, prev + 1))}
                  className="w-14 h-14 rounded-2xl bg-muted hover:bg-accent text-foreground flex items-center justify-center active:scale-95 transition-all text-xl font-bold border border-border shadow-sm"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Modes */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cool", label: "❄️ 냉방" },
                  { id: "dry", label: "💧 제습" },
                  { id: "fan", label: "🍃 송풍" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAcMode(m.id)}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                      acMode === m.id
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                        : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Wind Speeds */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "auto", label: "자동풍" },
                  { id: "low", label: "미풍" },
                  { id: "high", label: "강풍" },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setAcWind(w.id)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      acWind === w.id
                        ? "bg-white text-black font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────
              B. TV 리모컨 인터페이스
          ──────────────────────────────────────────────────────────────── */}
          {currentDevice?.category === "tv" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Vol & Ch Controls */}
              <div className="grid grid-cols-2 gap-4">
                {/* Volume */}
                <div className="p-4 rounded-2xl bg-muted border border-border flex flex-col items-center justify-between h-36">
                  <button
                    onClick={() => setTvVolume((prev) => Math.min(100, prev + 1))}
                    className="w-10 h-10 rounded-xl bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground block">VOL</span>
                    <span className="font-mono font-bold text-sm text-foreground">{tvVolume}</span>
                  </div>
                  <button
                    onClick={() => setTvVolume((prev) => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>

                {/* Channel */}
                <div className="p-4 rounded-2xl bg-muted border border-border flex flex-col items-center justify-between h-36">
                  <button
                    onClick={() => setTvChannel((prev) => prev + 1)}
                    className="w-10 h-10 rounded-xl bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <span className="text-[10px] text-muted-foreground block">CH</span>
                    <span className="font-mono font-bold text-sm text-foreground">{tvChannel}</span>
                  </div>
                  <button
                    onClick={() => setTvChannel((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 4-Way Direction Pad (D-Pad) */}
              <div className="relative w-44 h-44 mx-auto rounded-full bg-muted border border-border flex items-center justify-center shadow-lg">
                <button className="absolute top-2 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button className="absolute bottom-2 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button className="absolute left-2 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="absolute right-2 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Center OK Button */}
                <button className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center shadow-md active:scale-95 transition-all">
                  OK
                </button>
              </div>

              {/* Quick OTT Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2.5 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 text-[#E50914] font-bold text-xs">
                  Netflix
                </button>
                <button className="py-2.5 rounded-xl bg-[#FF0000]/20 border border-[#FF0000]/30 text-[#FF0000] font-bold text-xs">
                  YouTube
                </button>
                <button className="py-2.5 rounded-xl bg-[#0064FF]/20 border border-[#0064FF]/30 text-[#0064FF] font-bold text-xs">
                  TVING
                </button>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────
              C. 로봇청소기 / 공기청정기 인터페이스
          ──────────────────────────────────────────────────────────────── */}
          {(currentDevice?.category === "robot_cleaner" || currentDevice?.category === "air_purifier") && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center py-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 border border-blue-500/20 flex items-center justify-center text-primary mb-3">
                  {currentDevice?.category === "robot_cleaner" ? (
                    <Disc className="w-12 h-12" />
                  ) : (
                    <Wind className="w-12 h-12" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">현재 상태</span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {isOn ? "정상 작동 중 (에코 모드)" : "대기 중 / 충전 완료"}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleDeviceStatus(currentDevice.id)}
                  className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>청소 시작</span>
                </button>
                <button
                  onClick={() => toggleDeviceStatus(currentDevice.id)}
                  className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-muted hover:bg-accent text-foreground font-bold text-sm border border-border"
                >
                  <Home className="w-4 h-4" />
                  <span>도크 복귀</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
