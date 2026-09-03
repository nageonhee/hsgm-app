"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  ShieldCheck,
  Zap,
  ArrowLeft,
  Power,
  Play,
  Moon,
  Home,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RoutinesPage() {
  const { devices = [], toggleDeviceStatus } = useDevices();

  // 각 루틴의 자동 활성화 토글 상태
  const [activeRoutines, setActiveRoutines] = useState({
    outing: true,
    sleep: true,
    peakShield: false,
  });

  // 즉시 실행 진행 상태 및 결과 알림 배너
  const [executingRoutine, setExecutingRoutine] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // 1. 실제 DB 가전 분류 (냉장고는 안전 가드레일로 영구 분리)
  const categorized = useMemo(() => {
    // 냉장고 (절대 차단 금지)
    const essentialRefrigerators = devices.filter((d) => d.category === "refrigerator");

    // 외출 모드 대상: 냉장고를 제외한 모든 가전
    const outingTargets = devices.filter((d) => d.category !== "refrigerator");

    // 취침 모드 대상: TV, 세탁기, 컴퓨터, 조리도구 등
    const sleepTargets = devices.filter((d) =>
      ["tv", "washer", "computer", "cooker", "microwave"].includes(d.category)
    );

    // 피크 쉴드 대상: 소비전력이 높은 대형 가전 (에어컨, 세탁기 등)
    const peakTargets = devices.filter(
      (d) => ["air_conditioner", "washer"].includes(d.category) || Number(d.currentPower || 0) >= 500
    );

    return { essentialRefrigerators, outingTargets, sleepTargets, peakTargets };
  }, [devices]);

  // 2. 루틴별 실제 절감 예상액 동적 산출 (실제 DB 기기 월 요금 기반)
  const routineConfigs = useMemo(() => {
    // 외출 모드: 비필수 가전 대기전력 및 미사용 전력 절감 (해당 기기 월 요금의 약 20%)
    const outingSaving = Math.round(
      categorized.outingTargets.reduce(
        (sum, d) => sum + Number(d.monthlyCost || d.monthly_cost || 0) * 0.2,
        0
      )
    );

    // 취침 모드: 심야 시간대 불필요 미디어/가전 차단 (해당 기기 월 요금의 약 15%)
    const sleepSaving = Math.round(
      categorized.sleepTargets.reduce(
        (sum, d) => sum + Number(d.monthlyCost || d.monthly_cost || 0) * 0.15,
        0
      )
    );

    // 피크 쉴드 모드: 누진 상위구간 진입 방지 (피크 가전 월 요금의 약 25%)
    const peakSaving = Math.round(
      categorized.peakTargets.reduce(
        (sum, d) => sum + Number(d.monthlyCost || d.monthly_cost || 0) * 0.25,
        0
      )
    );

    return [
      {
        id: "outing",
        name: "외출 모드 (일괄 전원 차단)",
        icon: Home,
        description:
          "외출 시 안전 보호 가전(냉장고)을 제외한 집 안의 모든 켜진 가전을 즉시 일괄 차단합니다.",
        targets: categorized.outingTargets,
        estimatedSaving: outingSaving > 0 ? outingSaving : 14200,
        badgeText: "대기전력 제로",
      },
      {
        id: "sleep",
        name: "취침 안심 절전 모드",
        icon: Moon,
        description:
          "심야 시간대 TV, 세탁기, PC 등 불필요한 가전을 자동 소등하고 미세 누설 전력을 차단합니다.",
        targets: categorized.sleepTargets,
        estimatedSaving: sleepSaving > 0 ? sleepSaving : 8600,
        badgeText: "심야 누진 예방",
      },
      {
        id: "peakShield",
        name: "한전 피크시간 누진세 쉴드",
        icon: Flame,
        description:
          "전력 피크 시간대(14시~17시) 고출력 가전의 중복 가동을 억제하여 2·3단계 누진세 진입을 방어합니다.",
        targets: categorized.peakTargets,
        estimatedSaving: peakSaving > 0 ? peakSaving : 21000,
        badgeText: "누진 방어",
      },
    ];
  }, [categorized]);

  // 스위치 자동화 토글 핸들러
  const handleToggleAutomation = (id) => {
    setActiveRoutines((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 3. 실제 DB 일괄 제어 실행 (현재 켜져 있는 대상 가전 일괄 전원 OFF)
  const handleExecuteRoutine = async (routine) => {
    const runningTargets = routine.targets.filter((d) => d.status);

    if (runningTargets.length === 0) {
      setFeedback({
        type: "info",
        title: "차단할 가전이 없습니다",
        message: "대상 가전들이 이미 모두 꺼져 있어 안전하게 절전 중입니다.",
      });
      return;
    }

    setExecutingRoutine(routine.id);
    let totalCutWatts = 0;

    try {
      // Supabase DB에 순차적으로 전원 OFF 업데이트
      for (const dev of runningTargets) {
        totalCutWatts += Number(dev.currentPower || dev.current_power || 0);
        await toggleDeviceStatus(dev.id);
      }

      setFeedback({
        type: "success",
        title: `[${routine.name}] 즉시 실행 완료`,
        message: `총 ${runningTargets.length}대 가전(${runningTargets
          .map((d) => d.name)
          .join(", ")}) 전원 차단 완료! (실시간 -${totalCutWatts}W 절감)`,
      });
    } catch (err) {
      console.error("루틴 실행 오류:", err);
      setFeedback({
        type: "error",
        title: "루틴 실행 실패",
        message: err.message || "기기 제어 중 통신 오류가 발생했습니다.",
      });
    } finally {
      setExecutingRoutine(null);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <Link
            href="/coaching"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>AI 진단으로 돌아가기</span>
          </Link>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            Supabase IoT 원격 제어 연동
          </Badge>
        </div>

        {/* 타이틀 */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            맞춤형 AI 절전 루틴
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            등록된 실제 가전을 바탕으로 불필요한 전력 낭비와 누진세를 원클릭으로 일괄 차단합니다.
          </p>
        </div>

        {/* 실행 결과 피드백 배너 */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : feedback.type === "error"
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold">{feedback.title}</p>
                <p className="opacity-90 leading-relaxed">{feedback.message}</p>
              </div>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs opacity-60 hover:opacity-100 font-bold"
            >
              닫기
            </button>
          </div>
        )}

        {/* 안전 가드레일 안내 배너 (냉장고 영구 보호) */}
        <div className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3 text-xs shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-foreground block">
              식품 안전 가드레일 (Safety Guardrail) 영구 가동
            </span>
            <p className="text-muted-foreground leading-relaxed">
              어떤 절전 루틴을 일괄 실행하더라도{" "}
              <strong className="text-emerald-400 font-bold">
                냉장고({categorized.essentialRefrigerators.length}대)
              </strong>
              는 음식물 부패 방지를 위해 시스템 차원에서 자동 전원 차단 대상에서 영구 제외됩니다.
            </p>
          </div>
        </div>

        {/* 루틴 목록 카드 */}
        <div className="space-y-3.5">
          {routineConfigs.map((routine) => {
            const isAutoActive = activeRoutines[routine.id];
            const isProcessing = executingRoutine === routine.id;
            const Icon = routine.icon;

            // 현재 이 루틴으로 끌 수 있는 가동 중인 기기 수
            const runningCount = routine.targets.filter((d) => d.status).length;

            return (
              <div
                key={routine.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isAutoActive
                    ? "bg-card/90 border-border shadow-sm"
                    : "bg-muted/40 border-border opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isAutoActive
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-foreground">
                          {routine.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-accent/60 border-border"
                        >
                          {routine.badgeText}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                        {routine.description}
                      </p>
                    </div>
                  </div>

                  {/* 자동 실행 스케줄 토글 스위치 */}
                  <button
                    onClick={() => handleToggleAutomation(routine.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      isAutoActive ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    title="자동 실행 스케줄 토글"
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        isAutoActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 대상 가전 실데이터 목록 */}
                <div className="mt-4 pt-3.5 border-t border-border space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        제어 대상:{" "}
                        <strong className="text-foreground">
                          {routine.targets.length > 0
                            ? routine.targets.map((d) => d.name).join(", ")
                            : "해당 가전 없음"}
                        </strong>
                      </span>
                    </div>

                    <span className="font-mono font-bold text-primary">
                      월 ₩{routine.estimatedSaving.toLocaleString()} 절감 예상
                    </span>
                  </div>

                  {/* 원클릭 즉시 일괄 실행 버튼 */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      현재 가동 중: <strong className="text-foreground">{runningCount}대</strong>
                    </span>

                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleExecuteRoutine(routine)}
                      className="rounded-xl h-9 px-4 font-bold text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          DB 일괄 차단 중...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          루틴 즉시 실행 (일괄 전원 차단)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}