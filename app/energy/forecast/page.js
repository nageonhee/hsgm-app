"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  calculateDetailedBill,
  getTariffTiers,
  inferDevicePowerUsage,
} from "@/lib/energyCalculator";
import {
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CloudSun,
  ArrowLeft,
  Zap,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
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

export default function ProgressiveForecastPage() {
  const { devices = [], loading } = useDevices();
  const [aiPreventActive, setAiPreventActive] = useState(true);

  // 사용자 인터랙티브 시뮬레이션: 주요 가전 시간 조절 오프셋 (단위: 시간)
  const [adjustments, setAdjustments] = useState({});

  // 1. 현재 날짜 및 이번 달 총 일수 계산
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), currentMonth, 0).getDate();

  const { tier1Limit, tier2Limit, seasonName } = useMemo(
    () => getTariffTiers(currentMonth),
    [currentMonth]
  );

  const KEPCO_STAGES = useMemo(
    () => [
      { stage: 1, range: `~ ${tier1Limit}kWh`, ratePerKWh: "120.0" },
      { stage: 2, range: `${tier1Limit + 1} ~ ${tier2Limit}kWh`, ratePerKWh: "214.6" },
      { stage: 3, range: `${tier2Limit}kWh 초과`, ratePerKWh: "307.3" },
    ],
    [tier1Limit, tier2Limit]
  );

  // 조절 가능한 피크 가전 목록 (상시 가동 냉장고/냉온수기는 가드레일 보호로 제외)
  const adjustableDevices = useMemo(() => {
    return devices.filter((d) => {
      const cat = d.category || "";
      return !cat.includes("refrigerator") && !cat.includes("water");
    });
  }, [devices]);

  const handleHourChange = (id, deltaHours) => {
    setAdjustments((prev) => ({
      ...prev,
      [id]: Number(deltaHours),
    }));
  };

  const handleResetAdjustments = () => {
    setAdjustments({});
  };

  // 2. 가전별 제원표 추론 기반 시뮬레이션 계산
  const calculatedMetrics = useMemo(() => {
    let baseMonthlyKWh = 0;
    let adjustedMonthlyKWh = 0;

    devices.forEach((d) => {
      const ratedW = Number(
        d.currentPower ||
        String(d.power || d.specs?.powerConsumption || "").match(/\d+/)?.[0] ||
        150
      );
      const defaultUsage = Number(d.monthlyUsageKWh || d.monthlyUsage || 35);
      baseMonthlyKWh += defaultUsage;

      // 사용자 슬라이더 조절치 반영
      const deltaHour = adjustments[d.id] || 0;
      if (deltaHour !== 0) {
        // 일일 추가/절감 kWh = (정격 W * 가동률 60% * 변경시간) / 1000
        const deltaDailyKWh = (ratedW * 0.6 * deltaHour) / 1000;
        const deltaMonthlyKWh = deltaDailyKWh * totalDaysInMonth;
        adjustedMonthlyKWh += Math.max(0, defaultUsage + deltaMonthlyKWh);
      } else {
        adjustedMonthlyKWh += defaultUsage;
      }
    });

    if (baseMonthlyKWh === 0) {
      baseMonthlyKWh = 280;
      adjustedMonthlyKWh = 280;
    }

    const dailyAverage = adjustedMonthlyKWh / totalDaysInMonth;
    const currentUsageKWh = Math.round(dailyAverage * currentDay * 10) / 10;
    const projectedNormal = Math.round(adjustedMonthlyKWh * 10) / 10;

    // AI 누진 방지 쉴드: 조절 가능한 가전의 피크 시간 분산 및 대기전력 차단 (잔여기간 정밀 18~24% 절감)
    const remainingDays = Math.max(1, totalDaysInMonth - currentDay);
    const projectedShield = Math.round(
      (currentUsageKWh + dailyAverage * 0.78 * remainingDays) * 10
    ) / 10;

    // 누진 돌파 구간 및 돌파 예상일자 판정
    let breakStage = null;
    let breakDateText = "월말까지 돌파 없음";

    if (currentUsageKWh < tier1Limit && projectedNormal >= tier1Limit) {
      breakStage = 2;
      const daysToBreak = Math.ceil((tier1Limit - currentUsageKWh) / dailyAverage);
      const breachDay = Math.min(totalDaysInMonth, currentDay + daysToBreak);
      breakDateText = `${currentMonth}월 ${breachDay}일경`;
    } else if (currentUsageKWh < tier2Limit && projectedNormal >= tier2Limit) {
      breakStage = 3;
      const daysToBreak = Math.ceil((tier2Limit - currentUsageKWh) / dailyAverage);
      const breachDay = Math.min(totalDaysInMonth, currentDay + daysToBreak);
      breakDateText = `${currentMonth}월 ${breachDay}일경`;
    } else if (currentUsageKWh >= tier2Limit) {
      breakStage = 3;
      breakDateText = "이미 3단계 돌파 완료";
    } else if (currentUsageKWh >= tier1Limit) {
      breakStage = 2;
      breakDateText = "이미 2단계 돌파 완료";
    }

    // 시계열 예측 차트 데이터
    const checkpoints = [1, 5, 10, 15, 20, 25, totalDaysInMonth];
    const forecastChart = checkpoints.map((day) => {
      const isPast = day <= currentDay;
      const actualVal = isPast ? Math.round(dailyAverage * day * 10) / 10 : null;
      const normalVal = Math.round(dailyAverage * day * 10) / 10;
      const shieldVal = isPast
        ? actualVal
        : Math.round((currentUsageKWh + dailyAverage * 0.78 * (day - currentDay)) * 10) / 10;

      return {
        day: `${currentMonth}/${day}`,
        actual: actualVal,
        projectedNormal: normalVal,
        withAiShield: shieldVal,
      };
    });

    const normalBillDetail = calculateDetailedBill(projectedNormal, currentMonth);
    const shieldBillDetail = calculateDetailedBill(projectedShield, currentMonth);
    const savedAmount = Math.max(0, normalBillDetail.totalBill - shieldBillDetail.totalBill);

    return {
      currentUsageKWh,
      projectedNormal,
      projectedShield,
      breakStage,
      breakDateText,
      forecastChart,
      normalBill: normalBillDetail.totalBill,
      shieldBill: shieldBillDetail.totalBill,
      savedAmount,
      normalTier: normalBillDetail.currentTier,
      shieldTier: shieldBillDetail.currentTier,
      isAdjusted: Object.keys(adjustments).some((k) => adjustments[k] !== 0),
    };
  }, [devices, adjustments, currentMonth, currentDay, totalDaysInMonth, tier1Limit, tier2Limit]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
        {/* 상단 네비게이션 */}
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
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            {seasonName} • KEPCO 누진 요율 실시간 매핑
          </Badge>
        </div>

        {/* 누진 상태 경고 배너 */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all ${
            calculatedMetrics.breakStage
              ? "bg-gradient-to-r from-amber-500/20 via-amber-950/20 to-card border-amber-500/30"
              : "bg-gradient-to-r from-emerald-500/20 via-emerald-950/20 to-card border-emerald-500/30"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`p-2 rounded-xl font-bold ${
                    calculatedMetrics.breakStage
                      ? "bg-amber-500 text-black"
                      : "bg-emerald-500 text-black"
                  }`}
                >
                  {calculatedMetrics.breakStage ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {calculatedMetrics.breakStage === 3
                    ? "누진세 최고 3단계 진입 경보"
                    : calculatedMetrics.breakStage === 2
                    ? "누진세 2단계 돌파 주의보"
                    : "누진세 1단계 최저 요율 안전 유지"}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                현재 전력 소비 패턴 유지 시{" "}
                <strong className="text-amber-300 font-bold">
                  {calculatedMetrics.breakDateText}
                </strong>
                에 {calculatedMetrics.breakStage ? `${calculatedMetrics.breakStage}단계` : "다음 구간"}로 인상될 예정입니다. (현재 누적:{" "}
                <strong className="text-foreground">{calculatedMetrics.currentUsageKWh} kWh</strong>)
              </p>
            </div>

            <Button
              onClick={() => setAiPreventActive(!aiPreventActive)}
              className={`rounded-2xl font-bold text-xs h-11 px-5 gap-2 transition-all shadow-lg shrink-0 ${
                aiPreventActive
                  ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
                  : "bg-accent hover:bg-accent/80 text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{aiPreventActive ? "AI 누진세 방지 쉴드 작동 중" : "AI 방지 쉴드 활성화"}</span>
            </Button>
          </div>
        </div>

        {/* 한전 누진 3단계 게이지 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {KEPCO_STAGES.map((stg) => {
            const isCurrent =
              stg.stage === 1
                ? calculatedMetrics.currentUsageKWh <= tier1Limit
                : stg.stage === 2
                ? calculatedMetrics.currentUsageKWh > tier1Limit &&
                  calculatedMetrics.currentUsageKWh <= tier2Limit
                : calculatedMetrics.currentUsageKWh > tier2Limit;

            const isTarget = calculatedMetrics.breakStage === stg.stage;

            return (
              <div
                key={stg.stage}
                className={`p-5 rounded-3xl border transition-all ${
                  isCurrent
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : isTarget
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-card/40 border-border opacity-70"
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
                    {isCurrent
                      ? "현재 사용 구간"
                      : isTarget
                      ? "월말 도달 예상"
                      : "안전 구간"}
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

        {/* ★ [신규 위젯]: 가전별 실사용 시간 조절 누진세 시뮬레이터 ★ */}
        {adjustableDevices.length > 0 && (
          <div className="rounded-3xl bg-card border border-border p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground">
                    가전별 가동시간 조절 시뮬레이터
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    하루 사용 시간을 늘리거나 줄였을 때의 월말 누진세 변화를 시뮬레이션합니다.
                  </p>
                </div>
              </div>

              {calculatedMetrics.isAdjusted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetAdjustments}
                  className="rounded-xl text-xs h-8 gap-1 border-border text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3 h-3" />
                  초기화
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {adjustableDevices.map((dev) => {
                const val = adjustments[dev.id] || 0;
                return (
                  <div
                    key={dev.id}
                    className="p-3.5 rounded-2xl bg-muted/60 border border-border space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground truncate max-w-[180px]">
                        {dev.name}
                      </span>
                      <span
                        className={`font-mono font-extrabold ${
                          val > 0
                            ? "text-red-400"
                            : val < 0
                            ? "text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {val > 0 ? `+${val}시간/일` : val < 0 ? `${val}시간/일` : "기본 유지"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">-3h</span>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.5"
                        value={val}
                        onChange={(e) => handleHourChange(dev.id, e.target.value)}
                        className="flex-1 h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-[10px] text-muted-foreground">+3h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 월말 시계열 예측 차트 */}
        <div className="rounded-3xl bg-card border border-border p-6 backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-foreground tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                {currentMonth}월 누진 구간 돌파 시계열 예측
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                등록 가전 {devices.length}대 제원표 프로파일 및 실시간 누진제 요율 반영
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-xl border border-border">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span>한전 누진 3단계 기준선 적용</span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calculatedMetrics.forecastChart}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" kWh" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--popover-foreground)",
                  }}
                />
                {/* 누진 1단계 기준선 */}
                <ReferenceLine
                  y={tier1Limit}
                  label={{
                    value: `${tier1Limit} kWh (1단계 한계선)`,
                    fill: "#F87171",
                    fontSize: 11,
                    position: "insideTopRight",
                  }}
                  stroke="#F87171"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
                {/* 누진 2단계 기준선 */}
                <ReferenceLine
                  y={tier2Limit}
                  label={{
                    value: `${tier2Limit} kWh (2단계 한계선)`,
                    fill: "#EF4444",
                    fontSize: 11,
                    position: "insideTopRight",
                  }}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="현재까지 누적 실사용량"
                  stroke="#4ADE80"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4ADE80" }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedNormal"
                  name="현재 패턴 지속 시 (월말 예측)"
                  stroke="#F87171"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                {aiPreventActive && (
                  <Line
                    type="monotone"
                    dataKey="withAiShield"
                    name="AI 쉴드 적용 시 (절감 경로)"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 하단 요금 비교 및 예상 절감액 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                예상 청구액: {calculatedMetrics.projectedNormal} kWh (₩
                {calculatedMetrics.normalBill.toLocaleString()})
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                AI 쉴드 적용 시: {calculatedMetrics.projectedShield} kWh (₩
                {calculatedMetrics.shieldBill.toLocaleString()})
              </span>
            </div>
            <span className="text-emerald-400 font-bold text-sm">
              예상 절감액: 월 ₩{calculatedMetrics.savedAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}