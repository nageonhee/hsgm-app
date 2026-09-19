"use client";

import React from "react";
import Link from "next/link";
import { Zap, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function MiniWidgets({ summary }) {
  const currentKW = summary?.realtimePowerKW || 2.41;
  const currentStage = summary?.currentProgressiveStage || 1;
  const currentKWh = summary?.currentUsageKWh || 178.4;
  const stage1Threshold = summary?.stage1ThresholdKWh || 200;
  const progressPercent = Math.min(Math.round((currentKWh / stage1Threshold) * 100), 100);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {/* Widget 1: Realtime Power */}
      <Link
        href="/energy"
        className="group rounded-2xl bg-card/60 border border-border p-4 hover:border-emerald-500/40 transition-all"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            실시간 부하
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
            {currentKW}
          </span>
          <span className="text-xs text-muted-foreground font-medium">kW</span>
        </div>
      </Link>

      {/* Widget 2: Progressive Stage */}
      <Link
        href="/energy/forecast"
        className="group rounded-2xl bg-card/60 border border-border p-4 hover:border-amber-500/40 transition-all"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            누진 {currentStage}단계
          </span>
          <span className="text-[11px] text-amber-400 font-semibold">{progressPercent}%</span>
        </div>
        <div className="my-2">
          <Progress value={progressPercent} className="h-1.5 bg-accent" />
        </div>
        <span className="text-[10px] text-muted-foreground block truncate">
          {currentKWh} / {stage1Threshold} kWh
        </span>
      </Link>
    </div>
  );
}
