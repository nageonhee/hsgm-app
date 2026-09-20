"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import { useAuth } from "@/contexts/AuthContext";
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
  Tag,
  Maximize2,
  TrendingDown,
  Info,
  Clock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AddDevicePage() {
  const router = useRouter();
  const { addDevice } = useDevices();
  const { isDemoUser, user } = useAuth();

  // step: "select_scan" | "scanning" | "refining" | "final_confirm"
  const [step, setStep] = useState("select_scan");
  const [scanMode, setScanMode] = useState("auto"); // "auto" | "label"
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

  // 이미지 리사이징 및 Base64 최적화
  const resizeImage = (source, maxDimension = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(source);
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
    const optimized = await resizeImage(rawData, 1024, 0.8);
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
      const objectUrl = URL.createObjectURL(file);
      resizeImage(objectUrl, 1024, 0.8).then((optimized) => {
        URL.revokeObjectURL(objectUrl);
        setCapturedImage(optimized);
        setAccumulatedAnswers({});
        setRefineHistory([]);
        runAiScan(optimized, {});
      });
    }
  };

  // [시연용 원클릭 테스트 샘플]
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
    ctx.fillText("에너지소비효율등급 라벨", canvas.width / 2, 70);

    if (type === "laptop") {
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
      ctx.fillText("Samsung Galaxy Book4 Pro", canvas.width / 2, 280);
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
      ctx.fillText("모델명: AF18DX936WFN (스탠드 에어컨)", 50, 310);
      ctx.fillText("제조자명: 삼성전자(주)", 50, 360);
      ctx.fillText("정격 냉방 소비전력: 1450 W", 50, 410);
      ctx.fillText("월간 소비전력량: 142.5 kWh/월", 50, 460);
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

  // Dify 스트리밍 기반 실시간 AI 스캔 및 제원 좁혀가기
  const runAiScan = async (base64Image, answers = {}) => {
    const isFirstScan = Object.keys(answers).length === 0;
    setStep("scanning");
    setErrorMessage("");

    if (isFirstScan) {
      setScanProgressText("이미지 전송 및 멀티모달 AI 비전 파이프라인 가동 중...");
    } else {
      setScanProgressText("사용자 선택을 반영하여 세부 제원표 역산 중...");
    }

    try {
      const res = await fetch("/api/devices/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, answers }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "가전 정보를 식별하지 못했습니다.");
      }

      // 건희 님이 구축한 SSE 스트림 리더 가동
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let bufferStr = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bufferStr += decoder.decode(value, { stream: true });
        const lines = bufferStr.split("\n");
        bufferStr = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (!dataStr) continue;

            try {
              const eventData = JSON.parse(dataStr);

              // 1. 실시간 단계별 진행 로그 갱신 (20~30초 체감 대기시간 단축)
              if (eventData.type === "progress") {
                setScanProgressText(eventData.message);
              } else if (eventData.type === "error") {
                throw new Error(eventData.error || "분석 중 오류가 발생했습니다.");
              } else if (eventData.type === "final") {
                const data = eventData.result;

                // 2. 모델 특정 완료 (isFinal: true) -> 제원표 추론 결과 포함
                if (data.isFinal || (data.status === "complete" && data.device)) {
                  setAnalyzedDevice(data.device || data);
                  setIsManualMode(false);
                  setStep("final_confirm");
                  return;
                }

                // 3. 추가 역질문이 있는 경우 (Narrow-down)
                if (data.nextQuestion) {
                  const options = Array.isArray(data.options) && data.options.length > 0 ? [...data.options] : [];
                  if (!options.includes("잘 모르겠음")) {
                    options.push("잘 모르겠음");
                  }

                  let catKo = "스마트 기기";
                  if (data.category?.includes("냉온수기") || data.category?.includes("water")) catKo = "냉온수기/정수기";
                  else if (data.category?.includes("에어컨")) catKo = "에어컨";
                  else if (data.category?.includes("냉장고")) catKo = "냉장고";
                  else if (data.category?.includes("세탁기")) catKo = "세탁기";
                  else if (data.category?.includes("TV") || data.category?.includes("tv")) catKo = "TV";
                  else if (data.category) catKo = data.category;

                  const brandName = data.brand || "해당";

                  setCurrentQuestion({
                    title: data.nextQuestion,
                    description: data.reason || `${brandName} ${catKo}의 후보군을 감지했습니다. 정확한 제원표 매핑을 위해 아래 항목을 선택해 주세요.`,
                    options: options,
                    candidates: data.candidates || [],
                  });
                  setAnalyzedDevice(data.temporaryDevice || data);
                  setShowCustomInput(false);
                  setCustomInputText("");
                  setStep("refining");
                  return;
                }

                // 기본 fallback
                setAnalyzedDevice(data.device || data);
                setStep("final_confirm");
                return;
              }
            } catch (e) {
              if (e.message !== "Unexpected end of JSON input" && !e.message.includes("Unexpected token")) {
                throw e;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Scan Error:", err);
      setErrorMessage(
        err.message || "이미지 분석에 실패했습니다. 아래 [수동 입력]을 통해 바로 등록하실 수 있습니다."
      );
      setStep("select_scan");
    }
  };

  // 객관식 선택 시 질문 좁혀가기
  const handleSelectAnswer = async (optionText) => {
    if (!currentQuestion) return;

    const questionKey = currentQuestion.title || currentQuestion.key || "choice";

    const newAnswers = {
      ...accumulatedAnswers,
      [questionKey]: optionText,
    };

    // 실시간 후보군을 Dify 컨텍스트에 주입하여 다음 추론에 활용하도록 함
    if (currentQuestion.candidates && currentQuestion.candidates.length > 0) {
      const candidatesText = currentQuestion.candidates
        .map(c => `[${c.probability}] ${c.model_name}`)
        .join(", ");
      newAnswers["[현재 압축된 유력 후보군]"] = candidatesText;
    }

    const newHistory = [
      ...refineHistory,
      {
        key: questionKey,
        title: currentQuestion.title,
        answer: optionText,
      },
    ];

    setAccumulatedAnswers(newAnswers);
    setRefineHistory(newHistory);
    runAiScan(capturedImage, newAnswers);
  };

  // 직접 입력 제출
  const handleCustomSubmit = (e) => {
    e?.preventDefault();
    if (!customInputText.trim()) return;
    handleSelectAnswer(customInputText.trim());
  };

  // 수동 입력 Fallback
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
      releaseEnergyGrade: 1,
      specs: { releaseYear: "2024", powerConsumption: "1500W" },
      asInfo: { center: "삼성전자 서비스센터", phone: "1588-3366", siteUrl: "https://www.samsungsvc.co.kr" },
    });
    setIsManualMode(true);
    setStep("final_confirm");
  };

  // 최종 DB 저장 (DeviceContext 연동)
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
        currentPower: Number(analyzedDevice.currentPower || 0),
        monthlyUsageKWh: Number(analyzedDevice.monthlyUsageKWh || 0),
        monthlyCost: Number(analyzedDevice.monthlyCost || 0),
        annualEstimatedCost: Number(analyzedDevice.monthlyCost || 0) * 12,
        energyGrade: Number(analyzedDevice.energyGrade || 1),
        releaseEnergyGrade: Number(analyzedDevice.releaseEnergyGrade || analyzedDevice.energyGrade || 1),
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
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground tracking-tight">신규 기기 추가</h1>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI 멀티모달 & 제원 추론 스캔
          </Badge>
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

        {/* ── STEP 1: 촬영 / 모드 전환 뷰파인더 ── */}
        {step === "select_scan" && (
          <div className="space-y-4">
            {/* 촬영 모드 선택 탭 */}
            <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl border border-border">
              <button
                onClick={() => setScanMode("auto")}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  scanMode === "auto"
                    ? "bg-background text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                가전 외형 촬영 (스펙 자동 유추)
              </button>
              <button
                onClick={() => setScanMode("label")}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  scanMode === "label"
                    ? "bg-background text-emerald-500 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                에너지 라벨 촬영 (정밀 확정)
              </button>
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

              {/* 가이드 오버레이 */}
              <div
                className={`absolute pointer-events-none flex flex-col justify-between transition-all duration-300 ${
                  scanMode === "label"
                    ? "inset-12 sm:inset-16 border-2 border-dashed border-emerald-400/80 rounded-3xl p-3"
                    : "inset-6 sm:inset-10 border-2 border-primary/70 rounded-2xl p-3"
                }`}
              >
                <div className="flex justify-between">
                  <span className={`w-5 h-5 border-t-2 border-l-2 rounded-tl ${scanMode === "label" ? "border-emerald-400" : "border-primary"}`} />
                  <span className={`w-5 h-5 border-t-2 border-r-2 rounded-tr ${scanMode === "label" ? "border-emerald-400" : "border-primary"}`} />
                </div>

                <div className="text-center bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full mx-auto text-xs font-semibold border border-white/10 shadow-lg">
                  {scanMode === "label" ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      원형/사각형 에너지 라벨(효율등급 마크)을 맞춰주세요
                    </span>
                  ) : (
                    <span className="text-primary flex items-center gap-1.5">
                      <Maximize2 className="w-3 h-3" />
                      제품 전체 모습이 네모 안에 잘 보이도록 비춰주세요
                    </span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className={`w-5 h-5 border-b-2 border-l-2 rounded-bl ${scanMode === "label" ? "border-emerald-400" : "border-primary"}`} />
                  <span className={`w-5 h-5 border-b-2 border-r-2 rounded-br ${scanMode === "label" ? "border-emerald-400" : "border-primary"}`} />
                </div>
              </div>
            </div>

            {/* 촬영 컨트롤 */}
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

            {/* 시연용 원클릭 테스트 배너 */}
            {(isDemoUser || user?.id?.startsWith("demo-")) && (
              <div className="p-4 rounded-3xl bg-muted/40 border border-border space-y-2.5 shadow-sm mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    시연용 원클릭 테스트
                  </span>
                  <span className="text-[10px] text-muted-foreground">실물 사진 없이 테스트</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  <button
                    onClick={() => handleSampleTest("laptop")}
                    className="px-2.5 py-2 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Laptop className="w-3.5 h-3.5 text-sky-500" />
                    <span>노트북 외형</span>
                  </button>
                  <button
                    onClick={() => handleSampleTest("aircon")}
                    className="px-2.5 py-2 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    <span>무풍에어컨</span>
                  </button>
                  <button
                    onClick={() => handleSampleTest("washer")}
                    className="px-2.5 py-2 rounded-xl bg-background hover:bg-accent border border-border text-foreground text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AI세탁기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: 판독 중 스트리밍 애니메이션 ── */}
        {step === "scanning" && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-36 h-36 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden shadow-xl shadow-primary/20">
              <Scan className="w-14 h-14 text-primary animate-pulse" />
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#3B82F6] animate-bounce top-1/2" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-foreground">
                AI 스마트 비전 & 전력 추론 분석 중
              </h3>
              <p className="text-xs sm:text-sm text-primary font-mono animate-pulse min-h-[1.5rem]">
                {scanProgressText}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-4 py-2 rounded-full border border-border">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              웹 검색 15개 제원표 및 에너지공단 데이터와 실시간 대조 중입니다
            </div>
          </div>
        )}

        {/* ── STEP 2.5: 대화형 점진적 좁혀가기 (Narrow-down) ── */}
        {step === "refining" && currentQuestion && (
          <div className="space-y-6 pt-2 animate-in slide-in-from-bottom-6 duration-500">
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

            <div className="bg-card border border-border p-6 sm:p-7 rounded-3xl shadow-xl space-y-6">
              <div className="text-center space-y-2 pb-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[11px] font-bold">
                    {currentQuestion.step ? `Step ${currentQuestion.step}` : "AI 제원 탐색"}
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

              {/* 1.5. 후보 모델 리스트 (Dify 응답 기반) */}
              {currentQuestion.candidates && currentQuestion.candidates.length > 0 && (
                <div className="space-y-3 pb-2">
                  <span className="text-[11px] font-bold text-muted-foreground block px-1">분석된 유력 후보 모델</span>
                  <div className="flex flex-col gap-2">
                    {currentQuestion.candidates.map((cand, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 border border-border rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground">{cand.model_name}</span>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                            {cand.probability}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          <strong className="text-foreground/80">차이점:</strong> {cand.differences}
                        </p>
                        <p className="text-[11px] text-primary/90 leading-relaxed font-semibold">
                          <strong className="text-primary">확인 필요:</strong> {cand.what_to_check}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 객관식 추천 선택지 */}
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

              {/* 직접 타이핑 입력 폼 */}
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
                    placeholder="예: 클로버 B19, 삼성 무풍클래식, 16인치..."
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

        {/* ── STEP 3: 제원 확인 및 제원표 기반 전력 추론 결과 (최종 확인) ── */}
        {step === "final_confirm" && analyzedDevice && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold">
                  에너지 소비 제원 역산 및 등급 매핑 완료
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

            {/* 메인 비주얼 카드 */}
            <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
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

                <div className={`${capturedImage ? "md:col-span-7" : "col-span-12"} p-5 sm:p-6 flex flex-col justify-between space-y-4`}>
                  {/* 기본 헤더 & 2026 개정 등급 배지 */}
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

                    <div className="text-right space-y-1">
                      <Badge className="bg-emerald-500 text-white font-extrabold text-xs px-2.5 py-0.5 shadow-xs">
                        {analyzedDevice.energyGrade ? `현행 ${analyzedDevice.energyGrade}등급` : "표준 등급"}
                      </Badge>
                      {analyzedDevice.isGradeDowngraded && (
                        <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 justify-end">
                          <TrendingDown className="w-3 h-3" />
                          출시 {analyzedDevice.releaseEnergyGrade}등급 대비 하향
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 세부 데이터 그리드 */}
                  {!isManualMode ? (
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-muted/50 border border-border/50">
                        <span className="text-muted-foreground text-[11px] block">정격 소비전력</span>
                        <strong className="text-foreground text-sm font-bold mt-0.5 block">
                          {analyzedDevice.power || analyzedDevice.specs?.powerConsumption || "공칭 표준"}
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
                          한전 누진 요율 기반 월 예상 청구액
                        </span>
                        <strong className="text-base font-extrabold text-primary font-mono">
                          ₩ {Number(analyzedDevice.monthlyCost || 0).toLocaleString()}원
                        </strong>
                      </div>

                      {/* ★ 제원표 기반 추론 근거 카드 ★ */}
                      {analyzedDevice.powerInference && (
                        <div className="col-span-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-blue-500">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5" />
                              제원표 기반 실사용 추론 데이터
                            </span>
                            <span>실시간 가동: ~{analyzedDevice.powerInference.currentPower}W</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {analyzedDevice.powerInference.formulaReason}
                          </p>
                        </div>
                      )}

                      {/* 2026 고시 기준 안내 문구 */}
                      {analyzedDevice.energyGradeDesc && (
                        <div className="col-span-2 p-2.5 rounded-xl bg-muted/30 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{analyzedDevice.energyGradeDesc}</span>
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

                  {/* A/S 안내 */}
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