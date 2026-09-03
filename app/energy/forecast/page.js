"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CloudSun,
  Bot,
  CheckCircle2,
  ArrowLeft,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProgressiveForecastPage() {
  const { energyData } = useDevices();
  const [aiPreventActive, setAiPreventActive] = useState(true);

  const summary = energyData?.summary || {};
  const stages = energyData?.progressiveStages || [];
  const currentKWh = summary.currentUsageKWh || 178.4;
  const breakDate = summary.projectedStageBreakDate || "9월 18일 (목)";

  const forecastData = [
    { day: "9/1", actual: 20, projectedNormal: 20, withAiShield: 20 },
    { day: "9/5", actual: 65, projectedNormal: 65, withAiShield: 65 },
    { day: "9/10", actual: 120, projectedNormal: 120, withAiShield: 120 },
    { day: "9/15", actual: 178.4, projectedNormal: 178.4, withAiShield: 178.4 },
    { day: "9/18 (돌파)", actual: null, projectedNormal: 208, withAiShield: 192 },
    { day: "9/22", actual: null, projectedNormal: 245, withAiShield: 215 },
    { day: "9/26", actual: null, projectedNormal: 280, withAiShield: 232 },
    { day: "9/30 (월말)", actual: null, projectedNormal: 310, withAiShield: 248 },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Link href="/energy">
              <ArrowLeft className="w-4 h-4" />
              <span>에너지 모니터링</span>
            </Link>
          </Button>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
            기상청 날씨 ML 연동
          </Badge>
        </div>

        {/* Warning Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-950/20 to-card border border-amber-500/30 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500 text-black font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  누진세 상위 2단계 돌파 주의보
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                현재 패턴 유지 시 <strong className="text-amber-300 font-bold">{breakDate}</strong>에 1단계(200kWh)를 돌파하여 요율이 <strong className="text-foreground">kWh당 120원 → 214.6원(1.8배)</strong>으로 인상됩니다.
              </p>
            </div>

            <Button
              onClick={() => setAiPreventActive(!aiPreventActive)}
              className={`rounded-2xl font-bold text-xs h-11 px-5 gap-2 transition-all shadow-lg shrink-0 ${
                aiPreventActive
                  ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
                  : "bg-accent hover:bg-white/20 text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{aiPreventActive ? "AI 누진세 방지 쉴드 작동 중" : "AI 방지 쉴드 활성화"}</span>
            </Button>
          </div>
        </div>

        {/* Progressive Stage 3-Step Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stages.map((stg) => {
            const isCurrent = stg.stage === 1;
            const isTarget = stg.stage === 2;

            return (
              <div
                key={stg.stage}
                className={`p-5 rounded-3xl border transition-all ${
                  isCurrent
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : isTarget
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-card/40 border-border opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-foreground">
                    누진 {stg.stage}단계
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      isCurrent
                        ? "border-emerald-500/40 text-emerald-400"
                        : isTarget
                        ? "border-amber-500/40 text-amber-300"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {isCurrent ? "현재 구간 (89% 도달)" : isTarget ? "예상 진입 구간" : "안전 (미도달)"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground block mb-2">{stg.range}</span>
                <div className="flex items-baseline gap-1 font-mono">
                  <strong className="text-lg font-bold text-foreground">{stg.ratePerKWh}</strong>
                  <span className="text-xs text-muted-foreground">원 / kWh</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time-Series Forecast Chart with Weather ML */}
        <div className="rounded-3xl bg-card/70 border border-border p-6 backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-foreground tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                월말 누진 구간 돌파 시계열 예측 그래프
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                기상청 이번 주 늦더위(최고 31°C) 예보 및 가구 라이프스타일 머신러닝 반영
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-xl border border-border">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span>기상청 서울 주간 날씨 연동</span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" kWh" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                {/* 200 kWh 누진세 1단계 기준선 */}
                <ReferenceLine
                  y={200}
                  label={{
                    value: "200 kWh (1단계 한계선)",
                    fill: "#F87171",
                    fontSize: 11,
                    position: "insideTopRight",
                  }}
                  stroke="#F87171"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="현재까지 실제 사용량"
                  stroke="#4ADE80"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4ADE80" }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedNormal"
                  name="일반 사용 지속 시 (누진 폭탄 위험)"
                  stroke="#F87171"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                {aiPreventActive && (
                  <Line
                    type="monotone"
                    dataKey="withAiShield"
                    name="AI 누진 쉴드 제어 시 (절감 경로)"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                일반 예측 (월말 310 kWh / ₩64,200)
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                AI 제어 적용 (월말 248 kWh / ₩47,800)
              </span>
            </div>
            <span className="text-emerald-400 font-bold">
              예상 절감액: 월 16,400원
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
