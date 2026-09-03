"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  Zap,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import socialData from "@/data/social.json";

export default function SocialPage() {
  const [drJoined, setDrJoined] = useState(true);
  const { neighborComparison, nationalDR, oldApplianceROI } = socialData;

  const barData = neighborComparison.monthlyComparison;
  const oldDevice = oldApplianceROI[0];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            소셜 리포트
          </h1>
          <Badge className="bg-primary/20 text-primary border-blue-500/30 text-xs">
            상위 24% 절약
          </Badge>
        </div>

        {/* ── 1. 국민 DR (에너지 쉼표) 참여 카드 ── */}
        <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary block mb-1">
                {nationalDR.activeEvent.title}
              </span>
              <h2 className="text-base font-bold text-foreground">
                피크 시간 절전 인센티브
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">내 포인트</span>
              <span className="font-mono font-extrabold text-base sm:text-lg text-foreground">
                {nationalDR.accumulatedPoints.toLocaleString()} P
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-muted border border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground text-[11px] truncate max-w-[200px]">
              {nationalDR.activeEvent.suggestedAction}
            </span>
            <button
              onClick={() => setDrJoined(!drJoined)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                drJoined
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-accent text-muted-foreground"
              }`}
            >
              {drJoined ? "참여 중" : "참여하기"}
            </button>
          </div>
        </div>

        {/* ── 2. 이웃(동일 32평형) 비교 바 차트 ── */}
        <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">
                동일 32평형 이웃 비교
              </h3>
            </div>
            <span className="text-xs text-primary font-semibold">
              월 11,850원 절약 중
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" kWh" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E232B",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                <Bar dataKey="myHome" name="우리 집 (kWh)" fill="#0070F3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="neighbors" name="이웃 평균 (kWh)" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 3. 노후 가전 교체 ROI 분석 ── */}
        <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-foreground">
                노후 가전 교체 ROI 분석
              </h3>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              회수 기간 {oldDevice.paybackPeriodYears}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted border border-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">구형 냉장고 월 요금:</span>
              <span className="font-mono text-red-400 font-bold">₩{oldDevice.currentMonthlyCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">1등급 신형 교체 시:</span>
              <span className="font-mono text-primary font-bold">₩{oldDevice.newMonthlyCost.toLocaleString()} (연 ₩195,600 절감)</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
