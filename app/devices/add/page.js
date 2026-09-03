"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  Camera,
  Image as ImageIcon,
  Scan,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Zap,
  Wrench,
  Loader2,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AddDevicePage() {
  const router = useRouter();
  const { addDevice } = useDevices();

  const [step, setStep] = useState("select_scan");
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanProgressText, setScanProgressText] = useState("AI 비전 모델 초기화 중...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [analyzedDevice, setAnalyzedDevice] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // 카메라 구동
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("카메라 접근 제한:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // 이미지 리사이징 (전송 속도 극대화 및 토큰 절약)
  const resizeImage = (source, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = source;
    });
  };

  // 실시간 비디오 프레임 캡처
  const handleCapture = async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      alert("카메라 영상이 아직 준비되지 않았습니다. 잠시 후 다시 눌러주세요.");
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawData = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    const optimized = await resizeImage(rawData);
    setCapturedImage(optimized);
    runRealAiScan(optimized);
  };

  // 갤러리 업로드
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = async (event) => {
        const optimized = await resizeImage(event.target.result);
        setCapturedImage(optimized);
        runRealAiScan(optimized);
      };
      reader.readAsDataURL(file);
    }
  };

  // 실제 Gemini Vision API 통신
  const runRealAiScan = async (base64Image) => {
    setStep("scanning");
    setErrorMessage("");
    setScanProgressText("이미지 전송 및 Google Gemini Vision 모델 연결 중...");

    const timer = setTimeout(() => {
      setScanProgressText("사진 속 가전 외형 및 라벨 텍스트(OCR) 정밀 판독 중...");
    }, 1200);

    try {
      const res = await fetch("/api/devices/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      clearTimeout(timer);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "가전 정보를 식별하지 못했습니다.");
      }

      setAnalyzedDevice(data);
      setStep("final_confirm");
    } catch (err) {
      clearTimeout(timer);
      console.error("Scan Error:", err);
      setErrorMessage(err.message || "이미지 분석에 실패했습니다.");
      setStep("select_scan");
      startCamera();
    }
  };

  // 실제 Supabase DB 저장
  const handleFinalSave = async () => {
    if (!analyzedDevice || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await addDevice({
        name: analyzedDevice.name,
        brand: analyzedDevice.brand || "기타",
        model: analyzedDevice.model || "MODEL-" + Date.now().toString().slice(-4),
        category: analyzedDevice.category || "air_conditioner",
        icon: analyzedDevice.icon || "Zap",
        currentPower: 0,
        monthlyUsageKWh: Number(analyzedDevice.monthlyUsageKWh || 0),
        monthlyCost: Number(analyzedDevice.monthlyCost || 0),
        annualEstimatedCost: Number(analyzedDevice.monthlyCost || 0) * 12,
        energyGrade: Number(analyzedDevice.energyGrade || 1),
        releaseEnergyGrade: Number(analyzedDevice.energyGrade || 1),
        specs: {
          powerConsumption: analyzedDevice.power || "미표기",
          releaseYear: analyzedDevice.releaseYear || "2024",
          ...(analyzedDevice.specs || {}),
        },
        asInfo: {
          center: analyzedDevice.asInfo?.center || "공식 서비스센터",
          phone: analyzedDevice.asInfo?.phone || "1544-7777",
          siteUrl: analyzedDevice.asInfo?.siteUrl || "https://www.lge.co.kr",
        },
      });

      router.push("/devices");
    } catch (err) {
      console.error("DB 등록 실패:", err);
      alert("DB 저장 오류: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
        {/* 상단 바 */}
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
          <span className="text-xs text-muted-foreground">실시간 Vision AI 연동</span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            가전제품 사진 등록
          </h1>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">인식 오류</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ── STEP 1: 촬영 또는 갤러리 업로드 ── */}
        {step === "select_scan" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                가전 사진 스캔 등록
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  Gemini Vision OCR
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                실제 가전제품의 **전체 모습** 또는 **에너지소비효율등급 라벨(명판 스티커)**을 비추거나 사진을 선택해 주세요.
              </p>
            </div>

            {/* 카메라 뷰파인더 */}
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[4/3] sm:aspect-video border border-border shadow-2xl flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-6 sm:inset-10 border-2 border-primary/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <span className="w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl" />
                  <span className="w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr" />
                </div>
                <div className="text-center bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full mx-auto text-primary text-xs font-semibold border border-primary/30">
                  라벨 명판 또는 가전 외형을 중앙에 맞춰주세요
                </div>
                <div className="flex justify-between">
                  <span className="w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl" />
                  <span className="w-5 h-5 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleCapture}
                className="w-full h-13 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-5 h-5 stroke-[2.2]" />
                <span>현장 촬영 & 실시간 AI 판독</span>
              </button>

              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-12 rounded-2xl border-border bg-accent/50 hover:bg-accent text-foreground font-semibold text-sm gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  실제 가전/라벨 사진 앨범에서 선택하기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: 판독 중 애니메이션 ── */}
        {step === "scanning" && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-40 h-40 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/20">
              <Scan className="w-16 h-16 text-primary animate-pulse" />
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#3B82F6] animate-bounce top-1/2" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                Google Gemini Vision 실제 판독 중
              </h3>
              <p className="text-xs sm:text-sm text-primary font-mono animate-pulse">
                {scanProgressText}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-4 py-2 rounded-full border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              사진 속 텍스트(OCR)와 실제 시각적 특징을 실시간 분석하고 있습니다
            </div>
          </div>
        )}

        {/* ── STEP 3: 실제 사진 vs AI 판독 결과 투명 대조 ── */}
        {step === "final_confirm" && analyzedDevice && (
          <div className="space-y-6">
            <div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-xs mb-2">
                실제 사진 판독 완료
              </Badge>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                AI 판독 결과 및 제원 대조
              </h2>
            </div>

            {/* 실제 촬영/업로드된 사진 원본 미리보기 */}
            {capturedImage && (
              <div className="p-4 rounded-3xl bg-card/80 border border-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>전송된 실제 사진 원본</span>
                </div>
                <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-black border border-border">
                  <img
                    src={capturedImage}
                    alt="Captured Appliance"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* AI가 사진에서 무엇을 보고 판단했는지 근거 요약 */}
            {analyzedDevice.visionSummary && (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-1">
                <span className="font-bold text-primary block">AI 시각 분석 근거:</span>
                <p className="text-muted-foreground">{analyzedDevice.visionSummary}</p>
              </div>
            )}

            {/* 제원 카드 요약 */}
            <div className="rounded-3xl bg-card/80 border border-border p-6 backdrop-blur-xl space-y-5">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">
                    {analyzedDevice.brand}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {analyzedDevice.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    추출 모델명: {analyzedDevice.model}
                  </p>
                </div>
                {analyzedDevice.energyGrade > 0 && (
                  <Badge className="bg-primary text-primary-foreground font-bold text-xs">
                    에너지 {analyzedDevice.energyGrade}등급
                  </Badge>
                )}
              </div>

              {/* 제원 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-accent/50 border border-border">
                  <span className="text-muted-foreground block text-[11px]">소비전력</span>
                  <strong className="text-foreground font-bold text-sm">
                    {analyzedDevice.power || "미표기"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-accent/50 border border-border">
                  <span className="text-muted-foreground block text-[11px]">월간 소비전력량</span>
                  <strong className="text-foreground font-bold text-sm">
                    {analyzedDevice.monthlyUsageKWh > 0 ? `${analyzedDevice.monthlyUsageKWh} kWh` : "측정 대기"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-accent/50 border border-border">
                  <span className="text-muted-foreground block text-[11px]">월 예상 전기요금</span>
                  <strong className="text-primary font-bold text-sm">
                    {analyzedDevice.monthlyCost > 0
                      ? `₩ ${Number(analyzedDevice.monthlyCost).toLocaleString()}`
                      : "가동 후 산정"}
                  </strong>
                </div>
              </div>

              {/* A/S 및 자동 매칭 정보 */}
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wrench className="w-4 h-4 text-primary" />
                  <span>
                    {analyzedDevice.asInfo?.center} (전화: {analyzedDevice.asInfo?.phone}) 자동 매칭
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>스마트홈 전력 대시보드 및 원격 제어 자동 바인딩</span>
                </div>
              </div>
            </div>

            {/* 최종 저장 / 재촬영 버튼 */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setStep("select_scan");
                  startCamera();
                }}
                className="flex-1 h-12 rounded-2xl border-border gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                다시 촬영
              </Button>
              <Button
                onClick={handleFinalSave}
                disabled={isSubmitting}
                className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm rounded-2xl shadow-xl shadow-primary/25 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    실제 DB 등록 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    실제 DB에 기기 최종 등록
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}