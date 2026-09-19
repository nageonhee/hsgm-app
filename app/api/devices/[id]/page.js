"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  ArrowLeft,
  Power,
  Phone,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Zap,
  Wrench,
  Calendar,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AirVent,
  Refrigerator,
  WashingMachine,
  Tv,
  Utensils,
  Wind,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 카테고리별 아이콘 매핑
const ICON_MAP = {
  AirVent,
  Refrigerator,
  WashingMachine,
  Tv,
  Utensils,
  Wind,
  Disc,
  Zap,
};

// 브랜드별 대표 공식 A/S 정보 백업 테이블
const BRAND_HOTLINES = {
  LG전자: { phone: "1544-7777", siteUrl: "https://www.lge.co.kr/support", center: "LG전자 공식 서비스센터" },
  삼성전자: { phone: "1588-3366", siteUrl: "https://www.samsungsvc.co.kr", center: "삼성전자 서비스센터" },
  동부대우전자: { phone: "1588-1588", siteUrl: "https://www.winiaaid.com", center: "위니아에이드 고객지원센터" },
  위니아: { phone: "1588-9588", siteUrl: "https://www.winiaaid.com", center: "위니아 공식 서비스센터" },
  쿠쿠전자: { phone: "1588-8899", siteUrl: "https://www.cuckoo.co.kr", center: "쿠쿠 고객만족센터" },
  다이슨: { phone: "1588-4253", siteUrl: "https://www.dyson.co.kr", center: "다이슨 코리아 고객센터" },
  로보락: { phone: "1588-6220", siteUrl: "https://roborock.co.kr", center: "로보락 공식 고객지원" },
};

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params?.id;

  const { devices, loading, toggleDeviceStatus, deleteDevice } = useDevices();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 1. URL 파라미터(id)와 일치하는 실제 DB 가전 검색
  const device = useMemo(() => {
    return devices.find((d) => String(d.id) === String(deviceId));
  }, [devices, deviceId]);

  // 2. A/S 공식 정보 정규화
  const asInfo = useMemo(() => {
    if (!device) return null;
    const defaultInfo = BRAND_HOTLINES[device.brand] || {
      phone: "1544-7777",
      siteUrl: "https://www.lge.co.kr",
      center: `${device.brand || "제조사"} 공식 고객센터`,
    };

    return {
      center: device.asInfo?.center || defaultInfo.center,
      phone: device.asInfo?.phone || defaultInfo.phone,
      siteUrl: device.asInfo?.siteUrl || defaultInfo.siteUrl,
    };
  }, [device]);

  // 3. Supabase DB 영구 삭제 핸들러
  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      await deleteDevice(device.id);
      router.push("/devices");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("기기 삭제 중 오류가 발생했습니다: " + err.message);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <AppShell>
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">가전 제원 정보 불러오는 중...</p>
        </div>
      </AppShell>
    );
  }

  // 기기를 찾을 수 없을 때
  if (!device) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">기기를 찾을 수 없습니다</h2>
            <p className="text-xs text-muted-foreground">
              삭제되었거나 잘못된 접근 경로입니다.
            </p>
          </div>
          <Button asChild size="sm" className="rounded-xl text-xs font-bold">
            <Link href="/devices">가전 목록으로 돌아가기</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const IconComponent = ICON_MAP[device.icon] || Zap;
  const isOn = Boolean(device.status);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16">
        {/* 1. 상단 네비게이션 & 삭제 버튼 */}
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 p-0"
          >
            <Link href="/devices">
              <ArrowLeft className="w-4 h-4" />
              <span>가전 목록</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 text-xs gap-1.5 rounded-xl h-8 px-2.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>기기 삭제</span>
          </Button>
        </div>

        {/* 2. 기기 히어로 카드 (전원 토글 및 주요 명칭) */}
        <div
          className={`relative rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 ${
            isOn
              ? "bg-gradient-to-b from-blue-500/10 via-card to-card border-blue-500/40 shadow-xl shadow-blue-500/10"
              : "bg-card/70 border-border opacity-90"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                  isOn
                    ? "bg-blue-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/30"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <IconComponent className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {device.brand}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-accent/60 border-border px-1.5 py-0 font-medium"
                  >
                    에너지 {device.energyGrade || 1}등급
                  </Badge>
                  {device.releaseEnergyGrade && (
                    <span className="text-[11px] text-muted-foreground">
                      (출시 기준 {device.releaseEnergyGrade}등급)
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {device.name}
                </h1>

                <p className="text-xs font-mono text-muted-foreground">
                  모델명: {device.model}
                </p>
              </div>
            </div>

            {/* 원클릭 전원 스위치 */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
              <Button
                onClick={() => toggleDeviceStatus(device.id)}
                className={`rounded-2xl h-11 px-5 font-extrabold text-xs gap-2 transition-all shadow-md ${
                  isOn
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <Power className="w-4 h-4 stroke-[2.5]" />
                <span>{isOn ? "전원 가동 중 (끄기)" : "가전 전원 켜기"}</span>
              </Button>
              <span className="text-[11px] font-mono text-muted-foreground mt-1.5">
                {isOn ? `실시간 ${device.currentPower || 0}W 소비` : "대기전력 0W"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. 에너지 & 요금 지표 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              월 예상 청구 요금
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <strong className="text-xl font-extrabold text-foreground">
                ₩ {Number(device.monthlyCost || 0).toLocaleString()}
              </strong>
              <span className="text-xs text-muted-foreground">/월</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">월간 예상 전력량</span>
            <div className="flex items-baseline gap-1 font-mono">
              <strong className="text-xl font-extrabold text-foreground">
                {device.monthlyUsageKWh || device.monthly_usage_kwh || 0}
              </strong>
              <span className="text-xs text-muted-foreground">kWh</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">연간 누적 예상비용</span>
            <div className="flex items-baseline gap-1 font-mono">
              <strong className="text-xl font-extrabold text-foreground">
                ₩ {Number((device.monthlyCost || 0) * 12).toLocaleString()}
              </strong>
              <span className="text-xs text-muted-foreground">/년</span>
            </div>
          </div>
        </div>

        {/* 4. Vision OCR 제원 스펙 상세 카드 */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            라벨 및 Vision OCR 상세 제원
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-accent/40 border border-border space-y-0.5">
              <span className="text-muted-foreground text-[11px]">카테고리</span>
              <p className="font-bold text-foreground capitalize">{device.category}</p>
            </div>
            <div className="p-3 rounded-xl bg-accent/40 border border-border space-y-0.5">
              <span className="text-muted-foreground text-[11px]">제조/출시년도</span>
              <p className="font-bold text-foreground">
                {device.specs?.releaseYear || device.releaseYear || "2024년"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-accent/40 border border-border space-y-0.5">
              <span className="text-muted-foreground text-[11px]">정격 소비전력</span>
              <p className="font-bold text-foreground">
                {device.specs?.powerConsumption || `${device.currentPower || 0}W`}
              </p>
            </div>

            {/* AI가 추출한 추가 스펙 동적 렌더링 */}
            {device.specs &&
              Object.entries(device.specs)
                .filter(([k]) => !["releaseYear", "powerConsumption"].includes(k))
                .map(([key, value]) => (
                  <div key={key} className="p-3 rounded-xl bg-accent/40 border border-border space-y-0.5">
                    <span className="text-muted-foreground text-[11px] capitalize">{key}</span>
                    <p className="font-bold text-foreground truncate">{String(value)}</p>
                  </div>
                ))}
          </div>
        </div>

        {/* 5. 공식 A/S 핫라인 및 제조사 공식 지원 */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-card via-card to-primary/5 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              제조사 공식 A/S 핫라인
            </h3>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
              정품 공식 채널
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-accent/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground">{asInfo.center}</span>
              <p className="text-xs text-muted-foreground font-mono">고객지원 대표번호: {asInfo.phone}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="rounded-xl h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
              >
                <a href={`tel:${asInfo.phone.replace(/[^0-9]/g, "")}`}>
                  <Phone className="w-3.5 h-3.5" />
                  원클릭 전화 상담
                </a>
              </Button>

              {asInfo.siteUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-10 px-3.5 border-border text-xs gap-1.5"
                >
                  <a href={asInfo.siteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    공식 센터 방문
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-card border border-border p-6 rounded-3xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">기기를 삭제하시겠습니까?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Supabase DB에서 영구 삭제되며 전력 모니터링 및 요금 예측 계산에서 즉시 제외됩니다.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-xl text-xs h-10 border-border"
                >
                  취소
                </Button>
                <Button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 rounded-xl text-xs h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold gap-1.5"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  영구 삭제
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}