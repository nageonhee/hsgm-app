"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import { calculateGradeSavings } from "@/lib/energyCalculator";
import {
  AirVent,
  Utensils,
  Refrigerator,
  Tv,
  WashingMachine,
  Wind,
  Disc,
  ArrowLeft,
  Power,
  Zap,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  FileText,
  Phone,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Trash2,
  AlertTriangle,
  Activity,
  Clock,
  Gauge,
  Droplets,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
};

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { devices, toggleDeviceStatus, deleteDevice, currentYear = 2026 } = useDevices();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const device = devices.find((d) => d.id === params.id) || devices[0];
  const Icon = ICON_MAP[device?.icon] || Zap;
  const isOn = device?.status;

  const handleDelete = async () => {
    if (!device || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteDevice(device.id);
      router.push("/devices");
    } catch (e) {
      console.error("삭제 실패:", e);
      setIsDeleting(false);
    }
  };

  if (!device) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground">
          기기 정보를 찾을 수 없습니다.
        </div>
      </AppShell>
    );
  }

  const releaseGrade = device.releaseEnergyGrade || device.energyGrade || 1;
  const currentGrade = device.currentEnergyGrade || releaseGrade;
  const isGradeDowngraded = currentGrade > releaseGrade;
  const gradeDiff = Math.max(0, currentGrade - releaseGrade);
  const { annualLoss } = calculateGradeSavings(device.monthlyUsageKWh || 35, gradeDiff);

  // 제원표 기반 추론 데이터 추출
  const dutyCycle = device.specs?.inferredDutyCycle || "표준 자동";
  const dailyHours = device.specs?.inferredDailyHours || "일평균 권장";
  const formulaReason = device.specs?.formulaReason || device.powerInference?.formulaReason;
  const currentSimulatedPower = device.currentPower || device.powerInference?.currentPower || 0;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <Link
            href="/devices"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>가전 목록</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{device.brand}</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="이 기기 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 1. Hero Card ── */}
        <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-accent/50 border border-border flex items-center justify-center text-foreground shrink-0">
                <Icon className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  {device.name}
                </h1>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {device.model} • {device.releaseYear}년 출시
                </p>
              </div>
            </div>

            {/* 전원 제어 / 가드레일 토글 */}
            {device.category === "refrigerator" || device.category === "water_dispenser" || device.isProtectedGuardrail ? (
              <button
                onClick={() => toggleDeviceStatus(device.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-all"
                title="상시 가동 필수 가전 (전원 자동 차단 가드레일 보호 중)"
              >
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </button>
            ) : device.isSmartControl !== false && (
              <button
                onClick={() => toggleDeviceStatus(device.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isOn
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Power className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* 핵심 전력 지표 (실시간 W + 월간 kWh + 월 예상액) */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border">
            <div className="p-3 rounded-2xl bg-muted border border-border">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block">실시간 가동</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-primary flex items-center gap-0.5 mt-0.5">
                <Activity className="w-3.5 h-3.5 inline" />
                {currentSimulatedPower} W
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-muted border border-border">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block">월간 소비전력</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-foreground mt-0.5 block">
                {device.monthlyUsageKWh} kWh
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-muted border border-border">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block">한전 예상 요금</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-foreground mt-0.5 block">
                ₩ {Number(device.monthlyCost || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. ★ 제원표 기반 실사용 추론 인포그래픽 위젯 ★ ── */}
        <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[11px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI 제원 역산 모델
              </Badge>
              <h3 className="font-bold text-sm text-foreground">
                실사용 전력 패턴 추론
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">카테고리 듀티사이클</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <Gauge className="w-3.5 h-3.5 text-primary" />
                압축기/모터 가동률
              </span>
              <strong className="text-base font-extrabold font-mono text-foreground block">
                {dutyCycle}
              </strong>
              <span className="text-[10px] text-muted-foreground block">인버터 정밀 변속 제어</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" />
                일평균 실사용 시간
              </span>
              <strong className="text-base font-extrabold font-mono text-foreground block">
                {dailyHours}
              </strong>
              <span className="text-[10px] text-muted-foreground block">생활 패턴 표준 가중치</span>
            </div>
          </div>

          {formulaReason && (
            <div className="p-3 rounded-2xl bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
              <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground text-[11px] block">전력 추론 알고리즘 근거</strong>
                <p className="text-[11px] mt-0.5 opacity-90">{formulaReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. ★ 에너지 효율 등급 (출시 당시 vs 현행 강화 기준 환산) ★ ── */}
        <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">
              에너지소비효율등급 비교 & 환산
            </h3>
            <span className="text-[11px] text-muted-foreground">
              한국에너지공단 고시 기준
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-muted border border-border space-y-3">
            <div className="grid grid-cols-2 gap-4 items-center text-center">
              {/* 출시 당시 등급 */}
              <div className="p-3 rounded-xl bg-card border border-border flex flex-col items-center">
                <span className="text-[11px] text-muted-foreground mb-1">
                  출시 당시 ({device.releaseYear}년)
                </span>
                <span className="font-extrabold text-xl text-foreground font-mono">
                  {releaseGrade}등급
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  공식 라벨 표기 기준
                </span>
              </div>

              {/* 현재 기준 환산 등급 */}
              <div className={`p-3 rounded-xl border flex flex-col items-center ${
                isGradeDowngraded
                  ? "bg-amber-100 border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30"
                  : "bg-blue-100 border-blue-300 dark:bg-blue-500/15 dark:border-blue-500/30"
              }`}>
                <span className="text-[11px] text-muted-foreground mb-1">
                  현행 ({device.currentGradeYear || currentYear}년) 재환산
                </span>
                <span className={`font-extrabold text-xl font-mono ${
                  isGradeDowngraded ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"
                }`}>
                  {currentGrade}등급
                </span>
                <span className={`text-[10px] font-semibold mt-0.5 ${
                  isGradeDowngraded ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"
                }`}>
                  {isGradeDowngraded ? "기준 강화로 등급 하향" : "고효율 1등급 유지"}
                </span>
              </div>
            </div>

            {/* 등급 하락 시 전기세 손실액 경고 배너 */}
            {isGradeDowngraded && annualLoss > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  현행 1등급 대비 추가 누수액
                </span>
                <strong className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  연간 약 +{annualLoss.toLocaleString()}원
                </strong>
              </div>
            )}

            <div className="text-[11px] text-muted-foreground pt-1 border-t border-border">
              {device.energyGradeDesc || "한국에너지공단 효율관리기자재 운용규정 개정안에 따라 실시간 매핑되었습니다."}
            </div>
          </div>
        </div>

        {/* ── 4. ★ 상세 하드웨어 스펙 & 사양 (확장된 전체 가전 키 지원) ★ ── */}
        {device.specs && Object.keys(device.specs).length > 0 && (
          <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">
                상세 기기 사양 (스펙)
              </h3>
              <span className="text-[11px] text-muted-foreground">
                제조사 공식 등록 사양
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(device.specs)
                .filter(([k]) => !["formulaReason", "inferredDutyCycle", "inferredDailyHours"].includes(k))
                .map(([key, value]) => {
                  const SPEC_LABELS = {
                    area: "냉방/적용 면적",
                    coolingCapacity: "정격 냉방능력",
                    powerConsumption: "소비전력 / 에너지",
                    color: "색상 및 마감",
                    releaseYear: "출시 연도",
                    capacity: "정격 용량 / 평형",
                    screenSize: "화면 크기",
                    resolution: "해상도",
                    battery: "배터리 용량",
                    suction: "최대 흡입력",
                    coolingType: "냉각 방식",
                    waterCapacity: "수조 / 정수 용량",
                    warrantyPeriod: "보증 기간",
                    keaSource: "데이터 출처",
                  };

                  return (
                    <div
                      key={key}
                      className="p-3 rounded-2xl bg-muted border border-border flex flex-col justify-center text-xs"
                    >
                      <span className="text-[10px] text-muted-foreground block mb-0.5">
                        {SPEC_LABELS[key] || key}
                      </span>
                      <span className="font-bold text-foreground font-mono truncate">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── 5. 소모품 & 최저가 구매 링크 ── */}
        {device.consumables && device.consumables.length > 0 && (
          <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">
                소모품 교체 주기 및 구매
              </h3>
              <span className="text-[11px] text-muted-foreground">공식 소모품</span>
            </div>

            {device.consumables.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-muted border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-foreground block">{item.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    교체 권장: {item.cycle || "정기 점검"} • {item.price || "정가"}
                  </span>
                </div>

                <a
                  href={item.buyUrl || device.asInfo?.siteUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>구매 이동</span>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── 6. 공식 매뉴얼 & A/S 지원 ── */}
        <div className="rounded-3xl bg-card border border-border p-5 backdrop-blur-xl space-y-3">
          <h3 className="font-bold text-sm text-foreground">
            사용설명서 & 공식 A/S
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={device.manualUrl || device.asInfo?.siteUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-muted border border-border hover:border-primary/50 flex flex-col justify-between transition-colors text-xs"
            >
              <FileText className="w-5 h-5 text-primary mb-2" />
              <div>
                <span className="font-bold text-foreground block">공식 매뉴얼</span>
                <span className="text-[10px] text-muted-foreground">온라인 설명서 확인 &gt;</span>
              </div>
            </a>

            <a
              href={device.asInfo?.siteUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-muted border border-border hover:border-primary/50 flex flex-col justify-between transition-colors text-xs"
            >
              <Phone className="w-5 h-5 text-primary mb-2" />
              <div>
                <span className="font-bold text-foreground block">출장 A/S 예약</span>
                <span className="text-[10px] text-muted-foreground">{device.asInfo?.phone || "1588-3366"} &gt;</span>
              </div>
            </a>
          </div>
        </div>

        {/* ── 7. 기기 관리 및 삭제 액션 ── */}
        <div className="pt-2">
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            className="w-full h-11 rounded-2xl border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold text-xs gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>이 가전 등록 삭제</span>
          </Button>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-base font-extrabold text-foreground">
                  가전을 삭제하시겠습니까?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">{device.name}</strong>({device.model}) 기기와 관련된 모든 실시간 전력 데이터 및 스펙 설정이 제거됩니다.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="rounded-xl text-xs h-10 border-border"
                >
                  취소
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-10 font-bold"
                >
                  {isDeleting ? "삭제 중..." : "삭제하기"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}