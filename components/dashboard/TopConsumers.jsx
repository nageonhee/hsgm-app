"use client";

import React from "react";
import Link from "next/link";
import {
  AirVent,
  Utensils,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ICON_MAP = {
  AirVent: AirVent,
  Utensils: Utensils,
  Refrigerator: Refrigerator,
  Tv: Tv,
  WashingMachine: WashingMachine,
  Zap: Zap,
};

export function TopConsumers({ ranking = [] }) {
  const topList = ranking.slice(0, 3);

  return (
    <div className="rounded-3xl bg-card/60 border border-border p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
          <Flame className="w-4 h-4 text-red-400" />
          <span>전기 먹는 하마 TOP 3</span>
        </div>
        <Link
          href="/energy"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center"
        >
          더보기 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Ranking List */}
      <div className="space-y-2">
        {topList.map((item, idx) => {
          const Icon = ICON_MAP[item.icon] || Zap;
          const isNo1 = idx === 0;

          return (
            <div
              key={item.deviceId || idx}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isNo1
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-accent/20 border-border"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isNo1 ? "bg-destructive text-destructive-foreground" : "bg-accent text-muted-foreground"
                  }`}
                >
                  {item.rank}
                </span>

                <div className="w-8 h-8 rounded-xl bg-accent/50 flex items-center justify-center text-foreground">
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <span className="font-bold text-xs text-foreground block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.percent}% 점유
                  </span>
                </div>
              </div>

              <div className="text-right font-mono font-bold text-sm text-foreground">
                ₩ {item.monthlyCost.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
