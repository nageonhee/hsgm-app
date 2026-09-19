"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import { energyService } from "@/services/energyService";
import { calculateDetailedBill } from "@/lib/energyCalculator";
import {
  Zap,
  PieChart as PieIcon,
  LineChart as LineIcon,
  AlertTriangle,
  AirVent,
  Utensils,
  Refrigerator,
  Tv,
  WashingMachine,
  Wind,
  Disc,
  Droplets,
  RotateCcw,
  Flame,
  Check,
  Calendar,
  Activity,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const ICON_MAP = {
  AirVent: AirVent,
  Utensils: Utensils,
  Refrigerator: Refrigerator,
  Tv: Tv,
  WashingMachine: WashingMachine,
  Wind: Wind,
  Disc: Disc,
  Droplets: Droplets,
  Zap: Zap,
};

const PIE_COLORS = [
  "#0070F3",
  "#38BDF8",
  "#34D399",
  "#FBBF24",
  "#A78BFA",
  "#F43F5E",
  "#FB923C",
  "#2DD4BF",
  "#64748B",
];

export default function EnergyPage() {
  const { devices = [] } = useDevices();
  const [chartMode, setChartMode] = useState("share");
  const [selectedDeviceForTrend, setSelectedDeviceForTrend] = useState(null);
  const [timeRange, setTimeRange] = useState("daily"); // "daily" | "monthly" | "yearly"
  const [hourlyLogs, setHourlyLogs] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Supabase energy_logs 테이블에서 24시간 전력 로그 로드
  useEffect(() => {
    async function loadLogs() {
      try {
        const logs = await energyService.getRecentLogs(24);
        if (logs && logs.length > 0) {
          setHourlyLogs(logs);
        }
      } catch (e) {
        console.error("전력 로그 로드 실패:", e);
      }
    }
    loadLogs();
  }, []);

  // 2. 실제 DB 가전 데이터를 기준으로 요금 랭킹 및 점유율 계산
  const ranking = useMemo(() => {
    if (!devices || devices.length === 0) return [];

    const totalUsage =
      devices.reduce(
        (sum, d) => sum + Number(d.monthlyUsageKWh ?? d.monthlyUsage ?? d.monthly_usage_kwh ?? 0),
        0
      ) || 1;

    // 월간 요금 기준 내림차순 정렬
    const sorted = [...devices].sort(
      (a, b) =>
        Number(b.monthlyCost ?? b.monthly_cost ?? 0) -
        Number(a.monthlyCost ?? a.monthly_cost ?? 0)
    );

    return sorted.map((d, index) => {
      const usageKWh = Number(d.monthlyUsageKWh ?? d.monthlyUsage ?? d.monthly_usage_kwh ?? 0);
      const monthlyCost = Number(d.monthlyCost ?? d.monthly_cost ?? 0);
      const currentPower = Number(d.currentPower ?? d.current_power ?? 0);
      const percent = totalUsage > 0 ? Math.round((usageKWh / totalUsage) * 100) : 0;

      return {
        deviceId: d.id,
        rank: index + 1,
        name: d.name,
        brand: d.brand || "기타",
        category: d.category,
        icon: d.icon || "Zap",
        currentPower,
        usageKWh,
        monthlyCost,
        percent,
        specs: d.specs || {},
      };
    });
  }, [devices]);

  // 3. 점유율 도넛 차트 데이터
  const pieData = useMemo(() => {
    if (!ranking || ranking.length === 0) return [];
    return ranking.map((item) => ({
      name: item.name,
      value: Math.max(0.1, item.usageKWh),
      cost: item.monthlyCost,
      percent: item.percent,
    }));
  }, [ranking]);

  // 4. 한전 누진세 계산 상세 (가구 전체 합산)
  const totalMonthlyKWh = useMemo(() => {
    return ranking.reduce((acc, d) => acc + d.usageKWh, 0);
  }, [ranking]);

  const billDetails = useMemo(() => {
    return calculateDetailedBill(totalMonthlyKWh);
  }, [totalMonthlyKWh]);

  // 5. 선택된 가전 정보
  const selectedDeviceObj = ranking.find((d) => d.deviceId === selectedDeviceForTrend);

  // 6. 가전별 실사용 가동 프로파일(제원표 추론)을 반영한 추이 데이터 산출
  const displayTrendData = useMemo(() => {
    const isSingle = Boolean(selectedDeviceObj);
    const cat = selectedDeviceObj?.category || "";
    const baseKW = isSingle
      ? Number(Math.max(0.05, (selectedDeviceObj.currentPower || 150) / 1000).toFixed(2))
      : Number(Math.max(0.5, totalMonthlyKWh / 150).toFixed(2));

    if (timeRange === "daily") {
      // 24시간 가동 프로파일
      if (!isSingle && hourlyLogs.length > 0) {
        return hourlyLogs.map((d) => ({ time: d.time, value: d.totalPowerKw }));
      }

      // 가전 특성별 24시간 곡선
      let curve = [0.6, 0.4, 0.8, 1.2, 1.4, 1.8, 0.9]; // 기본
      if (cat === "refrigerator" || cat === "water_dispenser") {
        curve = [0.95, 0.90, 0.95, 1.05, 1.0, 1.1, 0.95]; // 상시 가동
      } else if (cat === "air_conditioner") {
        curve = [0.3, 0.1, 0.5, 1.6, 2.0, 1.9, 0.7]; // 낮/저녁 피크
      } else if (cat === "tv" || cat === "cooker") {
        curve = [0.05, 0.0, 0.4, 0.8, 0.9, 1.9, 0.4]; // 저녁 집중
      }

      const timeLabels = ["00시", "04시", "08시", "12시", "16시", "20시", "24시"];
      return timeLabels.map((time, idx) => ({
        time,
        value: Number((baseKW * curve[idx]).toFixed(2)),
      }));
    }

    if (timeRange === "monthly") {
      // 월간 30일 추이
      const days = ["1일", "5일", "10일", "15일", "20일", "25일", "30일"];
      const factor = [0.9, 1.1, 1.2, 1.0, 1.3, 1.1, 0.95];
      return days.map((time, idx) => ({
        time,
        value: Number((baseKW * factor[idx]).toFixed(2)),
      }));
    }

    // 연도별 12개월 추이 (계절성 가중치 반영)
    const months = ["1월", "3월", "5월", "7월", "8월", "10월", "12월"];
    let seasonWeight = [1.2, 0.9, 0.8, 2.1, 2.4, 0.95, 1.3];
    if (cat === "air_conditioner") seasonWeight = [0.1, 0.1, 0.3, 3.2, 3.8, 0.2, 0.1];
    if (cat === "dehumidifier") seasonWeight = [0.1, 0.2, 0.5, 2.8, 3.0, 0.3, 0.1];

    return months.map((time, idx) => ({
      time,
      value: Number((baseKW * seasonWeight[idx]).toFixed(2)),
    }));
  }, [timeRange, selectedDeviceForTrend, selectedDeviceObj, hourlyLogs, totalMonthlyKWh]);

  // 7. 실시간 소비전력 집계 (W -> kW)
  const realtimePowerKW = useMemo(() => {
    const activeWatts = devices
      .filter((d) => d.status)
      .reduce((acc, d) => acc + Number(d.currentPower ?? d.current_power ?? 0), 0);

    if (activeWatts > 0) {
      return (activeWatts / 1000).toFixed(2);
    }
    if (hourlyLogs.length > 0) {
      return hourlyLogs[hourlyLogs.length - 1].totalPowerKw.toFixed(2);
    }
    return "2.41";
  }, [devices, hourlyLogs]);

  return (
    <AppShell>
      <div className="space-y-5 animate-in fade-in duration-300 pb-12">
        {/* 상단 헤더 & 한전 누진제 요약 바 */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              전력 모니터링 & 요금 진단
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              실시간 전체 부하: <strong className="text-foreground font-mono">{realtimePowerKW} kW</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs px-2.5 py-1 font-bold ${
                billDetails.currentTier === 3
                  ? "bg-red-500/20 text-red-500 border-red-500/30"
                  : billDetails.currentTier === 2
                  ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
              }`}
            >
              한전 누진 {billDetails.currentTier}단계
            </Badge>

            <Link
              href="/energy/forecast"
              className="flex items-center gap-1 border border-border text-xs h-8 px-3 rounded-full bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors font-semibold"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
              <span>누진세 시뮬레이터</span>
            </Link>
          </div>
        </div>

        {/* 한전 요금 누진 구간 진척도 미니 배너 */}
        <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              이달 누적 소비량: <strong className="text-foreground font-mono">{totalMonthlyKWh.toFixed(1)} kWh</strong>
            </span>
          </div>
          <div className="text-muted-foreground">
            {billDetails.currentTier < 3 ? (
              <span>
                다음 {billDetails.currentTier + 1}단계 누진선({billDetails.currentTier === 1 ? billDetails.tier1Limit : billDetails.tier2Limit}kWh)까지{" "}
                <strong className="text-primary font-mono">
                  {(
                    (billDetails.currentTier === 1 ? billDetails.tier1Limit : billDetails.tier2Limit) -
                    totalMonthlyKWh
                  ).toFixed(1)}{" "}
                  kWh
                </strong>{" "}
                여유
              </span>
            ) : (
              <span className="text-red-500 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                최고 누진 3단계 요율(307.3원/kWh) 적용 중
              </span>
            )}
          </div>
        </div>

        {/* 메인 2컬럼 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* [좌측 카드]: 차트 영역 */}
          <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
                <button
                  onClick={() => setChartMode("share")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    chartMode === "share"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>점유율 그래프</span>
                </button>
                <button
                  onClick={() => setChartMode("trend")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    chartMode === "trend"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LineIcon className="w-3.5 h-3.5" />
                  <span>추이 그래프</span>
                </button>
              </div>

              {/* 추이 그래프 시 기간 선택 드롭다운 */}
              {chartMode === "trend" && (
                <div className="flex items-center gap-2">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-accent/60 border border-border text-foreground font-bold text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:bg-accent"
                  >
                    <option value="daily">일별 (24시간)</option>
                    <option value="monthly">월별 (30일)</option>
                    <option value="yearly">연도별 (12개월)</option>
                  </select>

                  {selectedDeviceForTrend && (
                    <button
                      onClick={() => setSelectedDeviceForTrend(null)}
                      className="text-xs text-primary hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 px-2.5 py-1.5 rounded-xl border border-blue-500/20 transition-colors"
                      title="전체 가전 보기"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>전체</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 1. 점유율 도넛 차트 */}
            {chartMode === "share" && (
              <div className="space-y-3">
                <div className="h-56 w-full pt-1 flex items-center justify-center">
                  {mounted && pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, item) => [
                            `${value} kWh (₩${Number(item.payload.cost).toLocaleString()})`,
                            item.payload.name,
                          ]}
                          contentStyle={{
                            backgroundColor: "var(--popover)",
                            borderColor: "var(--border)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "var(--popover-foreground)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                      <PieIcon className="w-8 h-8 opacity-40 animate-pulse" />
                      <span>전력 점유율 데이터를 불러오는 중...</span>
                    </div>
                  )}
                </div>

                {/* 범례 리스트 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 max-h-28 overflow-y-auto no-scrollbar">
                  {pieData.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground p-1.5 rounded-xl bg-accent/40 border border-border/50 truncate"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="truncate font-medium text-foreground">{entry.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto font-mono">{entry.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. 시간대별/월별/연도별 추이 영역 차트 */}
            {chartMode === "trend" && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>
                      {selectedDeviceObj
                        ? `${selectedDeviceObj.name} 추론 부하 곡선`
                        : "가구 전체 가전 통합 전력 부하"}
                    </span>
                  </span>
                  <Badge className="bg-primary/20 text-primary text-[10px] py-0.5 px-2 border-primary/30 font-mono">
                    {timeRange === "daily" ? "일별 (24시간)" : timeRange === "monthly" ? "월별 (30일)" : "연도별 (12개월)"}
                  </Badge>
                </div>

                <div className="h-64 w-full pt-1 flex items-center justify-center">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayTrendData}>
                        <defs>
                          <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0070F3" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#0070F3" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="time"
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                          unit=" kW"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--popover)",
                            borderColor: "var(--border)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "var(--popover-foreground)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name={selectedDeviceObj ? `${selectedDeviceObj.name} 소비부하` : "전체 실시간 부하"}
                          stroke="#0070F3"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorTrend)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                      <LineIcon className="w-8 h-8 opacity-40 animate-pulse" />
                      <span>전력 추이 그래프를 불러오는 중...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* [우측 카드]: 개별 가전 요금 랭킹 목록 */}
          <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  개별 가전 요금 랭킹 전체
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                한전 요율 공식 환산
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
              {ranking.map((item) => {
                const Icon = ICON_MAP[item.icon] || Zap;
                const isSelected =
                  selectedDeviceForTrend === item.deviceId && chartMode === "trend";

                return (
                  <div
                    key={item.deviceId}
                    onClick={() => {
                      setSelectedDeviceForTrend(item.deviceId);
                      setChartMode("trend");
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/20 border-primary shadow-lg shadow-primary/20"
                        : "bg-muted border-border hover:bg-accent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-accent text-muted-foreground font-bold text-xs flex items-center justify-center">
                        {item.rank}
                      </span>

                      <div className="w-9 h-9 rounded-xl bg-accent/50 flex items-center justify-center text-foreground shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-foreground">
                            {item.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground block">
                          {item.brand} • 실시간 ~{item.currentPower}W • {item.percent}% 점유
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-extrabold text-sm sm:text-base text-foreground block">
                        ₩ {item.monthlyCost.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        {item.usageKWh} kWh
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}