"use client";

import React from "react";
import Link from "next/link";
import { TrendingDown, ChevronRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeroCost({ summary, deviceCount }) {
  const cost = summary?.totalEstimatedCost || 42350;
  const savedRate = summary?.savedRate || 12.0;
  const savedAmount = summary?.savedAmount || 5750;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card/90 border border-border p-6 sm:p-7 backdrop-blur-xl">
      {/* Top Meta */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-muted-foreground">
          이번 달 예상 전기요금
        </span>
        <Link
          href="/devices"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-accent/50 px-2.5 py-1 rounded-full border border-border"
        >
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>가전 {deviceCount}대</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Hero Cost */}
      <div className="flex items-baseline gap-1.5 my-2">
        <span className="text-2xl sm:text-3xl text-emerald-400 font-bold">₩</span>
        <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground font-mono">
          {cost.toLocaleString()}
        </span>
      </div>

      {/* Saving Badge */}
      <div className="flex items-center gap-2 pt-3 border-t border-border mt-3">
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-1 gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>지난달 대비 {savedRate}% (▼ {savedAmount.toLocaleString()}원) 절약 중</span>
        </Badge>
      </div>
    </div>
  );
}
