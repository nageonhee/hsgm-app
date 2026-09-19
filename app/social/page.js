"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Users, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import socialData from "@/data/social.json";

export default function SocialPage() {
  const { neighborComparison, oldApplianceROI } = socialData;
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

        {/* ── 1. 이웃(동일 32평형) 비교 바 차트 ── */}
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

        {/* ── 2. 노후 가전 교체 ROI 분석 ── */}
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
