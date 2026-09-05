"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import { energyService } from "@/services/energyService";
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
  RotateCcw,
  Flame,
  Check,
  Calendar,
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
  Zap: Zap,
};

const PIE_COLORS = ["#0070F3", "#38BDF8", "#34D399", "#FBBF24", "#A78BFA", "#64748B"];

export default function EnergyPage() {
  const { devices = [] } = useDevices();
  const [chartMode, setChartMode] = useState("share");
  const [selectedDeviceForTrend, setSelectedDeviceForTrend] = useState(null);
  const [timeRange, setTimeRange] = useState("daily"); // "daily" | "monthly" | "yearly"
  const [hourlyLogs, setHourlyLogs] = useState([]);

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

    const totalUsage = devices.reduce(
      (sum, d) => sum + Number(d.monthlyUsage || d.monthly_usage_kwh || 0),
      0
    ) || 1;

    // 월간 요금 기준 내림차순 정렬
    const sorted = [...devices].sort(
      (a, b) =>
        Number(b.monthlyCost || b.monthly_cost || 0) -
        Number(a.monthlyCost || a.monthly_cost || 0)
    );

    return sorted.map((d, index) => {
      const usageKWh = Number(d.monthlyUsage || d.monthly_usage_kwh || 0);
      const monthlyCost = Number(d.monthlyCost || d.monthly_cost || 0);
      const percent = Math.round((usageKWh / totalUsage) * 100);

      return {
        deviceId: d.id,
        rank: index + 1,
        name: d.name,
        brand: d.brand || "기타",
        category: d.category,
        icon: d.icon || "Zap",
        usageKWh,
        monthlyCost,
        percent,
      };
    });
  }, [devices]);

  // 3. 점유율 도넛 차트 데이터
  const pieData = useMemo(() => {
    return ranking.map((item) => ({
      name: item.name,
      value: item.usageKWh,
      cost: item.monthlyCost,
      percent: item.percent,
    }));
  }, [ranking]);

  // 4. 선택된 가전 정보
  const selectedDeviceObj = ranking.find((d) => d.deviceId === selectedDeviceForTrend);

  // 5. DB 로그 및 선택된 기간(일별/월별/연도별) 기준 전력 추이 매핑
  const displayTrendData = useMemo(() => {
    const multiplier = selectedDeviceObj ? (selectedDeviceObj.percent / 100) : 1;
    const baseKW = selectedDeviceObj ? Number((selectedDeviceObj.usageKWh / 120).toFixed(2)) : 2.41;

    if (timeRange === "daily") {
      // 일별 (24시간 추이)
      if (!selectedDeviceForTrend && hourlyLogs.length > 0) {
        return hourlyLogs.map((d) => ({ time: d.time, value: d.totalPowerKw }));
      }
      return [
        { time: "00시", value: Number((baseKW * 0.6 * multiplier).toFixed(2)) },
        { time: "04시", value: Number((baseKW * 0.4 * multiplier).toFixed(2)) },
        { time: "08시", value: Number((baseKW * 0.9 * multiplier).toFixed(2)) },
        { time: "12시", value: Number((baseKW * 1.3 * multiplier).toFixed(2)) },
        { time: "16시", value: Number((baseKW * 1.5 * multiplier).toFixed(2)) },
        { time: "20시", value: Number((baseKW * 1.8 * multiplier).toFixed(2)) },
        { time: "24시", value: Number((baseKW * 0.8 * multiplier).toFixed(2)) },
      ];
    }

    if (timeRange === "monthly") {
      // 월별 (30일 일별 추이)
      return [
        { time: "1일", value: Number((baseKW * 0.8 * multiplier).toFixed(2)) },
        { time: "5일", value: Number((baseKW * 1.1 * multiplier).toFixed(2)) },
        { time: "10일", value: Number((baseKW * 1.4 * multiplier).toFixed(2)) },
        { time: "15일", value: Number((baseKW * 1.2 * multiplier).toFixed(2)) },
        { time: "20일", value: Number((baseKW * 1.6 * multiplier).toFixed(2)) },
        { time: "25일", value: Number((baseKW * 1.3 * multiplier).toFixed(2)) },
        { time: "30일", value: Number((baseKW * 0.9 * multiplier).toFixed(2)) },
      ];
    }

    // 연도별 (12개월 추이)
    return [
      { time: "1월", value: Number((baseKW * 1.4 * multiplier).toFixed(2)) },
      { time: "3월", value: Number((baseKW * 0.9 * multiplier).toFixed(2)) },
      { time: "5월", value: Number((baseKW * 0.8 * multiplier).toFixed(2)) },
      { time: "7월", value: Number((baseKW * 2.2 * multiplier).toFixed(2)) },
      { time: "8월", value: Number((baseKW * 2.5 * multiplier).toFixed(2)) },
      { time: "10월", value: Number((baseKW * 1.0 * multiplier).toFixed(2)) },
      { time: "12월", value: Number((baseKW * 1.6 * multiplier).toFixed(2)) },
    ];
  }, [timeRange, selectedDeviceForTrend, selectedDeviceObj, hourlyLogs]);

  // 6. 실시간 소비전력 집계 (W -> kW)
  const realtimePowerKW = useMemo(() => {
    const activeWatts = devices
      .filter((d) => d.status)
      .reduce((acc, d) => acc + Number(d.currentPower || d.current_power || 0), 0);

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
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              전력 모니터링
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              실시간 {realtimePowerKW} kW
            </p>
          </div>

          <Link
            href="/energy/forecast"
            className="flex items-center gap-1 border border-border text-xs h-8 px-3 rounded-full bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mr-1" />
            <span>누진세 분석</span>
          </Link>
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

              {/* 추이 그래프 시 기간 선택 드롭다운 (일별/월별/연도별) */}
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
                <div className="h-56 w-full pt-1">
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
                </div>

                {/* 박스를 넘치지 않는 스크롤 범례 (기기가 많아도 안전) */}
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
                        ? `${selectedDeviceObj.name} 추이`
                        : "우리집 전체 전력 추이"}
                    </span>
                  </span>
                  <Badge className="bg-primary/20 text-primary text-[10px] py-0.5 px-2 border-primary/30 font-mono">
                    {timeRange === "daily" ? "일별 (24시간)" : timeRange === "monthly" ? "월별 (30일)" : "연도별 (12개월)"}
                  </Badge>
                </div>

                <div className="h-64 w-full pt-1">
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
                원(₩) 기준 환산
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
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
                          {item.brand} • {item.percent}% 점유
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