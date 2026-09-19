"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, RotateCcw, Wrench, RefreshCw, X, Loader2, AlertCircle } from "lucide-react";

export function DiagnosisScannerModal({ isOpen, onClose, onDiagnose }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusText, setScanStatusText] = useState("AI 비전 모델 분석 중...");
  const [errorMessage, setErrorMessage] = useState("");

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // 시연용 프리셋 에러 데이터 (시뮬레이션 유지)
  const demoErrors = [
    {
      code: "dE",
      device: "LG 트롬 세탁기",
      brand: "LG전자",
      phone: "1544-7777",
      asUrl: "https://www.lge.co.kr/support/service-engineer-request",
      cause: "도어 열림 감지 (Door Error)",
      solution: "빨랫감 끼임을 확인하고 도어를 딸깍 소리 나게 닫아주세요.",
    },
    {
      code: "CH05",
      device: "LG 휘센 에어컨",
      brand: "LG전자",
      phone: "1544-7777",
      asUrl: "https://www.lge.co.kr/support/service-engineer-request",
      cause: "통신 신호 일시 지연",
      solution: "에어컨 차단기를 내린 후 5분 뒤 다시 올려 리셋해 주세요.",
    },
    {
      code: "5C",
      device: "삼성 비스포크 세탁기",
      brand: "삼성전자",
      phone: "1588-3366",
      asUrl: "https://www.samsungsvc.co.kr/reserve/engineer",
      cause: "배수 필터 이물질 막힘",
      solution: "하단 잔수 호스로 물을 빼고 배수 필터를 세척해 주세요.",
    },
  ];

  const startCamera = async () => {
    if (!isOpen) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraError(false);
    } catch (err) {
      console.warn("Camera access denied:", err);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      startCamera();
    } else {
      stopCamera();
      setIsScanning(false);
    }
    return () => stopCamera();
  }, [isOpen]);

  // 이미지 리사이징 (전송 경량화)
  const resizeImage = (source, maxWidth = 1000) => {
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

  // 실시간 AI 고장 진단 API 호출
  const analyzeErrorImage = async (base64Image) => {
    setIsScanning(true);
    setErrorMessage("");
    setScanStatusText("기기 에러코드 및 고장 증상 판독 중...");

    try {
      const res = await fetch("/api/coaching/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!res.ok) {
        throw new Error("서버 진단 응답 실패");
      }

      const data = await res.json();
      if (data.success && data.diagnosisResult) {
        onDiagnose(data.diagnosisResult);
        onClose();
        return;
      }

      throw new Error(data.error || "에러코드를 식별하지 못했습니다.");
    } catch (err) {
      console.warn("실시간 진단 실패, 데모 fallback 전환 고려:", err);
      // 에러 시 사용자에게 안내하거나 재촬영 유도
      setErrorMessage("사진에서 명확한 에러코드를 찾지 못했습니다. 디스플레이 화면을 가까이 비춰주세요.");
    } finally {
      setIsScanning(false);
    }
  };

  // 셔터 클릭: 카메라 캡처
  const handleRealCapture = async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      setErrorMessage("카메라가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawData = canvas.toDataURL("image/jpeg", 0.9);
    const optimized = await resizeImage(rawData);
    analyzeErrorImage(optimized);
  };

  // 파일 업로드
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const optimized = await resizeImage(event.target.result);
        analyzeErrorImage(optimized);
      };
      reader.readAsDataURL(file);
    }
  };

  // 시뮬레이션 프리셋 클릭
  const handleDemoPreset = (demoIdx = 0) => {
    setIsScanning(true);
    setScanStatusText("RAG 매뉴얼 데이터베이스 매칭 중...");
    setTimeout(() => {
      setIsScanning(false);
      onDiagnose(demoErrors[demoIdx]);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> 실시간 고장 진단 스캐너
          </h2>
          <button onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 에러 피드백 */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scanner View */}
          <div className="relative w-full h-64 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-border shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive && !isScanning ? "block" : "hidden"}`}
            />

            {!cameraActive && !isScanning && (
              <div className="text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-muted-foreground mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs text-muted-foreground block">
                  {cameraError ? "카메라 권한을 허용해 주세요" : "카메라 연결 중..."}
                </span>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center space-y-3 z-10 px-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs text-white font-bold">{scanStatusText}</span>
              </div>
            )}

            {/* Overlays */}
            {!isScanning && (
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="w-7 h-7 border-t-2 border-r-2 border-primary rounded-tr" />
                </div>
                <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full mx-auto text-primary text-[11px] font-semibold border border-primary/30">
                  가전 조작부의 에러코드(LED)를 사각 안에 비춰주세요
                </div>
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="w-7 h-7 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
            )}
          </div>

          {/* Presets (시뮬레이션 원클릭 테스트) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] text-muted-foreground font-semibold shrink-0">에러 시뮬레이션:</span>
            {demoErrors.map((err, idx) => (
              <button
                key={idx}
                disabled={isScanning}
                onClick={() => handleDemoPreset(idx)}
                className="px-2.5 py-1 rounded-full bg-muted border border-border hover:border-primary text-xs text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0 disabled:opacity-50 transition-colors"
              >
                {err.code} ({err.device.split(" ")[1]})
              </button>
            ))}
          </div>

          {/* Shutter Controls */}
          <div className="flex items-center justify-between px-4 pt-1 pb-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent border border-border flex items-center justify-center text-foreground transition-colors disabled:opacity-50"
              title="사진 앨범에서 선택"
            >
              <ImageIcon className="w-5 h-5 text-emerald-400" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={handleRealCapture}
              disabled={isScanning}
              className="w-16 h-16 rounded-full border-4 border-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-50"
              title="실시간 에러코드 촬영"
            >
              <Camera className="w-6 h-6 stroke-[2.2]" />
            </button>

            <button
              onClick={startCamera}
              disabled={isScanning}
              className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent border border-border flex items-center justify-center text-foreground transition-colors disabled:opacity-50"
              title="카메라 재연결"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}