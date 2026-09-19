"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, Wrench, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FocusCards() {
  const [activeTab, setActiveTab] = useState("coaching");

  return (
    <div className="rounded-3xl bg-card/60 border border-border p-5 backdrop-blur-xl">
      {/* Switcher */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-accent/50 border border-border">
          <button
            onClick={() => setActiveTab("coaching")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "coaching"
                ? "bg-emerald-500 text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AI 코칭
          </button>
          <button
            onClick={() => setActiveTab("care")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "care"
                ? "bg-teal-500 text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            소모품 · A/S
          </button>
        </div>

        <Link
          href={activeTab === "coaching" ? "/coaching" : "/diagnosis"}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center"
        >
          더보기 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {activeTab === "coaching" ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-foreground">
              에어컨 희망온도 1도 상향 제안
            </span>
            <Badge className="bg-emerald-500 text-black text-[10px] py-0">
              월 5,000원 절약
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            26°C ➔ 27°C 조절 시 체감 냉방 유지 & 요금 즉시 절감
          </p>
          <Button
            asChild
            size="sm"
            className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl"
          >
            <Link href="/coaching">AI 시뮬레이션 질문하기</Link>
          </Button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-foreground">
              에어컨 필터 교체 권장
            </span>
            <span className="text-[11px] text-amber-400 font-bold">D-12</span>
          </div>
          <p className="text-xs text-muted-foreground">
            최저가: <strong className="text-foreground">24,800원</strong> (정가 대비 14% 할인)
          </p>
          <Button
            asChild
            size="sm"
            className="w-full h-8 text-xs bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-xl"
          >
            <a href="https://www.lge.co.kr" target="_blank" rel="noopener noreferrer">
              소모품 최저가 구매 <ExternalLink className="w-3 h-3 ml-1 inline" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
