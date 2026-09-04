"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, RotateCcw, FileSearch, Wrench, RefreshCw, X } from "lucide-react";

export function DiagnosisScannerModal({ isOpen, onClose, onDiagnose }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

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
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
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
      startCamera();
    } else {
      stopCamera();
      setIsScanning(false);
    }
    return () => stopCamera();
  }, [isOpen]);

  const handleCapture = (demoIdx = 0) => {
    setIsScanning(true);
    
    // Simulate RAG scanning time
    setTimeout(() => {
      setIsScanning(false);
      onDiagnose(demoErrors[demoIdx]);
      onClose(); // Auto close on finish
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> 실시간 고장 진단
          </h2>
          <button onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-accent">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Scanner View */}
          <div className="relative w-full h-56 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-border">
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
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center space-y-2 z-10">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-xs text-white font-bold">RAG 매뉴얼 분석 중...</span>
              </div>
            )}

            {/* Overlays */}
            {!isScanning && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" />
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] text-muted-foreground font-semibold shrink-0">에러 시뮬레이션:</span>
            {demoErrors.map((err, idx) => (
              <button
                key={idx}
                disabled={isScanning}
                onClick={() => handleCapture(idx)}
                className="px-2.5 py-1 rounded-full bg-muted border border-border hover:border-primary text-xs text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {err.code} ({err.device.split(" ")[1]})
              </button>
            ))}
          </div>

          {/* Shutter Controls */}
          <div className="flex items-center justify-between px-4 pt-2 pb-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent border border-border flex items-center justify-center text-foreground transition-colors disabled:opacity-50"
              title="사진/영상 앨범에서 선택"
            >
              <ImageIcon className="w-5 h-5 text-primary" />
            </button>
            <input type="file" ref={fileInputRef} accept="image/*,video/*" className="hidden" onChange={() => handleCapture(0)} />

            <button
              onClick={() => handleCapture(0)}
              disabled={isScanning}
              className="w-16 h-16 rounded-full border-4 border-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-50"
              title="사진 촬영 / 길게 눌러 영상 녹화"
            >
              <Camera className="w-6 h-6 stroke-[2.2]" />
            </button>

            <button
              onClick={startCamera}
              disabled={isScanning}
              className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent border border-border flex items-center justify-center text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
