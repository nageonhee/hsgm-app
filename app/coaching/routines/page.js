"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  Sliders,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RoutinesPage() {
  const { routines, toggleRoutine } = useDevices();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/coaching"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>AI 진단으로 돌아가기</span>
          </Link>
          <span className="text-xs text-muted-foreground">
            자율 제어 IoT 연동
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            맞춤형 에코 루틴
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            라이프스타일에 맞게 스마트 플러그와 IR 블래스터로 대기전력을 자동 제어합니다.
          </p>
        </div>

        {/* Safety Guardrail Highlight */}
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <span className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">안전 가드레일 제약:</strong> 냉장고 등 24시간 필수 기기는 음식물 보호를 위해 자동 차단에서 1순위로 영구 제외됩니다.
          </span>
        </div>

        {/* Routines List */}
        <div className="space-y-3">
          {routines.map((routine) => {
            const isActive = routine.isActive;

            return (
              <div
                key={routine.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? "bg-card border-border shadow-sm"
                    : "bg-muted border-border opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-foreground">
                        {routine.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isActive ? "bg-primary/20 text-primary" : "bg-accent/50 text-muted-foreground"}`}>
                        {isActive ? "가동 중" : "정지"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {routine.description}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleRoutine(routine.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      isActive ? "bg-primary" : "bg-foreground/20"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border mt-3 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    대상: {routine.devices.join(", ")}
                  </span>
                  <span className="font-bold text-primary font-mono">
                    월 ₩{routine.estimatedSavingMonth.toLocaleString()} 절약
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
