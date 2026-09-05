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
  FileText,
  Sliders,
  ChevronRight,
  HelpCircle,
  Laptop,
  Check,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AddDevicePage() {
  const router = useRouter();
  const { addDevice } = useDevices();

  // step: "select_scan" | "scanning" | "refining" | "final_confirm"
  const [step, setStep] = useState("select_scan");
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanProgressText, setScanProgressText] = useState("AI 비전 모델 초기화 중...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 대화형 계층 탐색(Narrow-down) 상태
  const [accumulatedAnswers, setAccumulatedAnswers] = useState({});
  const [refineHistory, setRefineHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [customInputText, setCustomInputText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // AI 분석 결과 및 수동 편집 상태
  const [analyzedDevice, setAnalyzedDevice] = useState(null);
  const [isManualMode, setIsManualMode] = useState(false);

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
      console.warn("카메라 접근 불가 또는 비활성화:", err);
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

  // 이미지 리사이징 (전송 속도 최적화)
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
    setAccumulatedAnswers({});
    setRefineHistory([]);
    runAiScan(optimized, {});
  };

  // 갤러리 파일 업로드
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = async (event) => {
        const optimized = await resizeImage(event.target.result);
        setCapturedImage(optimized);
        setAccumulatedAnswers({});
        setRefineHistory([]);
        runAiScan(optimized, {});
      };
      reader.readAsDataURL(file);
    }
  };

  // [심사위원 평가용] 샘플 라벨/외형 실시간 테스트
  const handleSampleTest = (type) => {
    stopCamera();
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("스마트 기기 외형 / 에너지 라벨", canvas.width / 2, 70);

    if (type === "laptop") {
      // 노트북 외형 샘플
      ctx.beginPath();
      ctx.roundRect(80, 150, 440, 260, 16);
      ctx.fillStyle = "#1E293B";
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(100, 170, 400, 220, 8);
      ctx.fillStyle = "#38BDF8";
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(50, 420, 500, 180, 12);
      ctx.fillStyle = "#64748B";
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("Samsung / LG Laptop Visual", canvas.width / 2, 280);
    } else if (type === "aircon") {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 170, 70, 0, Math.PI * 2);
      ctx.fillStyle = "#10B981";
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 65px sans-serif";
      ctx.fillText("1", canvas.width / 2, 192);
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("등급", canvas.width / 2, 220);

      ctx.fillStyle = "#1E293B";
      ctx.textAlign = "left";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("모델명: AF19TX772VFN (스탠드 에어컨)", 50, 310);
      ctx.fillText("제조자명: 삼성전자(주)", 50, 360);
      ctx.fillText("정격 냉방 소비전력: 1750 W", 50, 410);
      ctx.fillText("월간 소비전력량: 165.4 kWh/월", 50, 460);
      ctx.fillText("출시년월: 2024.03", 50, 510);
    } else {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 170, 70, 0, Math.PI * 2);
      ctx.fillStyle = "#10B981";
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 65px sans-serif";
      ctx.fillText("1", canvas.width / 2, 192);
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("등급", canvas.width / 2, 220);

      ctx.fillStyle = "#1E293B";
      ctx.textAlign = "left";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("모델명: F24VDD (인공지능 세탁기)", 50, 310);
      ctx.fillText("제조자명: LG전자(주)", 50, 360);
      ctx.fillText("정격 소비전력: 450 W", 50, 410);
      ctx.fillText("월간 소비전력량: 32.5 kWh/월", 50, 460);
      ctx.fillText("출시년월: 2024.01", 50, 510);
    }

    const sampleBase64 = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(sampleBase64);
    setAccumulatedAnswers({});
    setRefineHistory([]);
    runAiScan(sampleBase64, {});
  };

  // AI 분석 및 계층적 좁혀가기 API 호출
  const runAiScan = async (base64Image, answers = {}) => {
    const isFirstScan = Object.keys(answers).length === 0;
    setStep("scanning");
    setErrorMessage("");

    if (isFirstScan) {
      setScanProgressText("이미지 전송 및 Google Gemini Vision 모델 연결 중...");
    } else {
      setScanProgressText("사용자 선택을 반영하여 세부 모델 및 성능 스펙을 좁혀가는 중...");
    }

    try {
      const res = await fetch("/api/devices/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, answers }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "가전 정보를 식별하지 못했습니다.");
      }

      // 1. 모델이 특정되어 최종 확정된 경우 (isFinal === true)
      if (data.isFinal || (!data.nextQuestion && !data.needsMoreInfo)) {
        setAnalyzedDevice(data);
        setIsManualMode(false);
        setStep("final_confirm");
        return;
      }

      // 2. 추가 질문이 있는 경우 (isFinal === false && nextQuestion)
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setAnalyzedDevice(data.temporaryDevice || data);
        setShowCustomInput(false);
        setCustomInputText("");
        setStep("refining");
        return;
      }

      // 3. 레거시 needsMoreInfo 포맷 호환
      if (data.needsMoreInfo && data.needsMoreInfo.length > 0) {
        const firstQ = data.needsMoreInfo[0];
        setCurrentQuestion({
          key: firstQ.key,
          step: 1,
          totalExpectedSteps: data.needsMoreInfo.length,
          title: firstQ.question,
          description: "정확한 모델을 특정하기 위해 세부 사양을 선택해주세요.",
          options: firstQ.options,
        });
        setAnalyzedDevice(data);
        setStep("refining");
        return;
      }

      // 기본 fallback: 최종 확인 이동
      setAnalyzedDevice(data);
      setStep("final_confirm");
    } catch (err) {
      console.error("Scan Error:", err);
      setErrorMessage(
        err.message || "이미지 분석에 실패했습니다. 아래 [수동 입력]을 통해 바로 등록하실 수 있습니다."
      );
      setStep("select_scan");
    }
  };

  // 질문에 대한 답변 선택 시 -> 누적 후 다음 단계 질의 실행
  const handleSelectAnswer = (optionText) => {
    if (!currentQuestion) return;

    const newAnswers = {
      ...accumulatedAnswers,
      [currentQuestion.key]: optionText,
    };

    const newHistory = [
      ...refineHistory,
      {
        key: currentQuestion.key,
        title: currentQuestion.title,
        answer: optionText,
      },
    ];

    setAccumulatedAnswers(newAnswers);
    setRefineHistory(newHistory);

    // 다음 좁혀가기 단계 실행
    runAiScan(capturedImage, newAnswers);
  };

  // 직접 입력 제출
  const handleCustomSubmit = (e) => {
    e?.preventDefault();
    if (!customInputText.trim()) return;
    handleSelectAnswer(customInputText.trim());
  };

  // 수동 Fallback 폼 활성화
  const handleOpenManualForm = () => {
    stopCamera();
    setErrorMessage("");
    setAnalyzedDevice({
      name: "스마트 기기",
      brand: "삼성전자",
      model: "CUSTOM-" + Math.floor(1000 + Math.random() * 9000),
      category: "air_conditioner",
      icon: "AirVent",
      power: "1500W",
      monthlyUsageKWh: 120,
      monthlyCost: 28000,
      energyGrade: 1,
      visionSummary: "사용자가 수동으로 직접 스펙을 입력하여 등록 중입니다.",
      specs: { releaseYear: "2024", powerConsumption: "1500W" },
      asInfo: { center: "삼성전자 서비스센터", phone: "1588-3366", siteUrl: "https://www.samsungsvc.co.kr" },
    });
    setIsManualMode(true);
    setStep("final_confirm");
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
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
        {/* 상단 네비게이션 */}
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
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI 대화형 스마트 스캔
          </Badge>
        </div>

        {/* 타이틀 */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            스마트 가전/기기 사진 등록
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            사진을 찍으면 AI가 큰 범주에서 세부 모델명까지 좁혀가며 정확한 성능과 전기요금을 자동 조회합니다.
          </p>
        </div>

        {/* 에러 및 Fallback 배너 */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">사진 분석 안내</p>
                <p className="mt-0.5 opacity-90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <Button
              onClick={handleOpenManualForm}
              size="sm"
              className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs gap-1.5 h-9 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              수동 입력 폼으로 즉시 작성하여 등록하기
            </Button>
          </div>
        )}

        {/* ── STEP 1: 촬영 / 업로드 / 심사위원 원클릭 테스트 ── */}
        {step === "select_scan" && (
          <div className="space-y-4">
            {/* 심사위원 전용 1초 샘플 테스트 배너 */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  심사위원 평가용 실시간 AI 계층 탐색 원클릭 테스트
                </span>
                <span className="text-[10px] text-muted-foreground">실물 불필요</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                실물 기기가 없으신 경우, 아래 버튼을 눌러 노트북/가전 외형을 즉시 분석하고 제조사-라인업-세부모델로 좁혀가는 AI 대화형 탐색을 바로 체험해보실 수 있습니다.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleSampleTest("laptop")}
                  className="px-2.5 py-2 rounded-xl bg-background/80 hover:bg-background border border-primary/40 text-foreground text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Laptop className="w-3.5 h-3.5 text-sky-500" />
                  <span>노트북 외형 테스트</span>
                </button>
                <button
                  onClick={() => handleSampleTest("aircon")}
                  className="px-2.5 py-2 rounded-xl bg-background/80 hover:bg-background border border-primary/40 text-foreground text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  <span>무풍에어컨 테스트</span>
                </button>
                <button
                  onClick={() => handleSampleTest("washer")}
                  className="px-2.5 py-2 rounded-xl bg-background/80 hover:bg-background border border-primary/40 text-foreground text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>AI세탁기 테스트</span>
                </button>
              </div>
            </div>

            {/* 카메라 뷰파인더 */}
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] sm:aspect-[4/3] w-full border border-border shadow-2xl flex flex-col items-center justify-center">
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
                  라벨 명판 또는 제품 외형을 사각 영역에 맞춰주세요
                </div>
                <div className="flex justify-between">
                  <span className="w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl" />
                  <span className="w-5 h-5 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
            </div>

            {/* 촬영 / 파일 업로드 / 수동 입력 버튼 */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCapture}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 stroke-[2.2]" />
                <span>현장 촬영 & 실시간 AI 판독</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
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
                  className="h-11 rounded-2xl border-border bg-accent/50 hover:bg-accent text-foreground font-semibold text-xs gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  앨범 사진 선택
                </Button>

                <Button
                  variant="outline"
                  onClick={handleOpenManualForm}
                  className="h-11 rounded-2xl border-border bg-accent/50 hover:bg-accent text-foreground font-semibold text-xs gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  직접 수동 입력
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: 판독 중 애니메이션 ── */}
        {step === "scanning" && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-36 h-36 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden shadow-xl shadow-primary/20">
              <Scan className="w-14 h-14 text-primary animate-pulse" />
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#3B82F6] animate-bounce top-1/2" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Google Gemini AI 실시간 분석 & 추론 중
              </h3>
              <p className="text-xs sm:text-sm text-primary font-mono animate-pulse">
                {scanProgressText}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-4 py-2 rounded-full border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              외형 특징과 사용자 응답을 조합해 실제 모델명과 성능을 좁혀갑니다
            </div>
          </div>
        )}

        {/* ── STEP 2.5: 대화형 점진적 좁혀가기 (Interactive Narrow-down) ── */}
        {step === "refining" && currentQuestion && (
          <div className="space-y-6 pt-2 animate-in slide-in-from-bottom-6 duration-500">
            {/* 상단 브레드크럼 (지금까지 좁혀온 단계 요약) */}
            {refineHistory.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-muted-foreground shrink-0">좁혀온 내역:</span>
                {refineHistory.map((hist, idx) => (
                  <React.Fragment key={idx}>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs px-2.5 py-0.5 gap-1 font-bold">
                      <Check className="w-3 h-3" />
                      {hist.answer}
                    </Badge>
                    {idx < refineHistory.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* 메인 질문 카드 (한 번에 1개의 질문만 순차 제시) */}
            <div className="bg-card border border-border p-6 sm:p-7 rounded-3xl shadow-xl space-y-6">
              <div className="text-center space-y-2 pb-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[11px] font-bold">
                    {currentQuestion.step ? `Step ${currentQuestion.step}` : "AI 탐색"}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-semibold">1단계씩 세부 좁혀가기</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {/* 1. 객관식 선택지 그리드 */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground block px-1">객관식 추천 선택지</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion.options
                    ?.filter((opt) => !opt.includes("직접 입력"))
                    .map((opt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="h-13 justify-start text-left font-bold text-xs sm:text-sm px-4 border-border hover:border-primary hover:bg-primary/10 transition-all shadow-xs group"
                        onClick={() => handleSelectAnswer(opt)}
                      >
                        <CornerDownRight className="w-4 h-4 text-primary mr-2.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                        <span className="truncate">{opt}</span>
                      </Button>
                    ))}
                </div>
              </div>

              {/* 2. 상시 직접 타이핑 가능한 입력 칸 */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    원하는 항목이 목록에 없나요? 직접 타이핑하기
                  </span>
                </div>
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="예: 삼성전자, 갤럭시북4 프로, 16인치..."
                    value={customInputText}
                    onChange={(e) => setCustomInputText(e.target.value)}
                    className="flex-1 h-11 px-3.5 rounded-xl bg-background border border-border text-foreground text-xs font-bold focus:border-primary outline-none"
                  />
                  <Button
                    type="submit"
                    disabled={!customInputText.trim()}
                    className="h-11 px-5 rounded-xl font-bold text-xs shrink-0"
                  >
                    입력 완료
                  </Button>
                </form>
              </div>

              {/* 하단 다시 스캔 / 수동 폼 버튼 */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <button
                  onClick={() => {
                    setStep("select_scan");
                    setAccumulatedAnswers({});
                    setRefineHistory([]);
                    startCamera();
                  }}
                  className="hover:text-foreground flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  처음부터 다시 촬영
                </button>
                <button
                  onClick={handleOpenManualForm}
                  className="hover:text-primary font-semibold"
                >
                  수동으로 전체 스펙 입력 ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: 정돈된 AI 판독 결과 & 제원 대조 (최종 확인) ── */}
        {step === "final_confirm" && analyzedDevice && (
          <div className="space-y-5">
            {/* 상단 타이틀 & 모드 전환 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold">
                  AI 비전 & 스펙 매핑 완료
                </Badge>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  제원 확인 및 에너지 진단
                </h2>
              </div>

              <Button
                variant={isManualMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsManualMode(!isManualMode)}
                className="rounded-xl text-xs gap-1.5 h-8 font-semibold shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                {isManualMode ? "수정 완료" : "스펙 직접 수정"}
              </Button>
            </div>

            {/* 메인 비주얼 카드: 원본 라벨(좌) + AI 제원 요약(우) 콤팩트 2단 배치 */}
            <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* 좌측: 원본 라벨/사진 이미지 */}
                {capturedImage && (
                  <div className="md:col-span-5 bg-muted/40 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border">
                    <span className="text-[11px] font-bold text-muted-foreground self-start mb-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      스캔된 원본 사진
                    </span>
                    <div className="w-full max-w-[200px] md:max-w-[220px] rounded-2xl overflow-hidden border border-border/80 shadow-md bg-white">
                      <img
                        src={capturedImage}
                        alt="Captured Device"
                        className="w-full h-auto object-contain block"
                      />
                    </div>
                  </div>
                )}

                {/* 우측: 핵심 스펙 요약 / 수정 폼 */}
                <div className={`${capturedImage ? "md:col-span-7" : "col-span-12"} p-5 sm:p-6 flex flex-col justify-between space-y-4`}>
                  {/* 기기 기본 정보 헤더 */}
                  <div className="border-b border-border/70 pb-3 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-primary tracking-wider uppercase">
                        {analyzedDevice.brand || "제조사 미확인"}
                      </span>
                      <h3 className="text-lg font-black text-foreground">
                        {analyzedDevice.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        모델명: {analyzedDevice.model || "식별 완료"}
                      </p>
                    </div>

                    <Badge className="bg-emerald-500 text-white font-extrabold text-xs px-2.5 py-0.5 shadow-xs">
                      {analyzedDevice.energyGrade ? `에너지 ${analyzedDevice.energyGrade}등급` : "표준 등급"}
                    </Badge>
                  </div>

                  {/* 세부 데이터 그리드 */}
                  {!isManualMode ? (
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-muted/50 border border-border/50">
                        <span className="text-muted-foreground text-[11px] block">정격 소비전력</span>
                        <strong className="text-foreground text-sm font-bold mt-0.5 block">
                          {analyzedDevice.power || "공칭 표준"}
                        </strong>
                      </div>

                      <div className="p-3 rounded-2xl bg-muted/50 border border-border/50">
                        <span className="text-muted-foreground text-[11px] block">월간 예상 사용량</span>
                        <strong className="text-foreground text-sm font-bold mt-0.5 block">
                          {analyzedDevice.monthlyUsageKWh || 0} kWh
                        </strong>
                      </div>

                      <div className="col-span-2 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          한전 기준 월 예상 청구액
                        </span>
                        <strong className="text-base font-extrabold text-primary font-mono">
                          ₩ {Number(analyzedDevice.monthlyCost || 0).toLocaleString()}원
                        </strong>
                      </div>

                      {analyzedDevice.specs && (
                        <div className="col-span-2 p-3 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground block">매핑된 주요 사양</span>
                          {Object.entries(analyzedDevice.specs).slice(0, 3).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground capitalize">{k}:</span>
                              <span className="font-semibold text-foreground truncate ml-2">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">기기 명칭</label>
                          <input
                            type="text"
                            value={analyzedDevice.name}
                            onChange={(e) => setAnalyzedDevice({ ...analyzedDevice, name: e.target.value })}
                            className="w-full h-9 px-2.5 rounded-xl bg-background border border-border text-foreground font-bold text-xs focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">제조사 브랜드</label>
                          <input
                            type="text"
                            value={analyzedDevice.brand}
                            onChange={(e) => setAnalyzedDevice({ ...analyzedDevice, brand: e.target.value })}
                            className="w-full h-9 px-2.5 rounded-xl bg-background border border-border text-foreground font-bold text-xs focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">정격 소비전력</label>
                          <input
                            type="text"
                            value={analyzedDevice.power || ""}
                            onChange={(e) => setAnalyzedDevice({ ...analyzedDevice, power: e.target.value })}
                            className="w-full h-9 px-2.5 rounded-xl bg-background border border-border text-foreground font-bold text-xs focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-muted-foreground">월간 사용량 (kWh)</label>
                          <input
                            type="number"
                            value={analyzedDevice.monthlyUsageKWh || 0}
                            onChange={(e) =>
                              setAnalyzedDevice({
                                ...analyzedDevice,
                                monthlyUsageKWh: Number(e.target.value),
                                monthlyCost: Math.round(Number(e.target.value) * 230),
                              })
                            }
                            className="w-full h-9 px-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* A/S 센터 안내 */}
                  <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/60">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-primary" />
                      {analyzedDevice.asInfo?.center || "공식 A/S 센터"} 자동 연동
                    </span>
                    <span className="font-mono">{analyzedDevice.asInfo?.phone || "1588-3366"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setStep("select_scan");
                  setAccumulatedAnswers({});
                  setRefineHistory([]);
                  startCamera();
                }}
                className="flex-1 h-12 rounded-2xl border-border gap-1.5 font-bold text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                다시 스캔하기
              </Button>

              <Button
                onClick={handleFinalSave}
                disabled={isSubmitting}
                className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-sm rounded-2xl shadow-xl shadow-primary/25 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    DB 등록 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
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