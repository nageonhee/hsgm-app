"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useDevices } from "@/contexts/DeviceContext";
import {
  Bot,
  Send,
  Sliders,
  User,
  Plus,
  Wrench,
  CheckCircle2,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MarkdownMessage } from "@/components/coaching/MarkdownMessage";
import { DiagnosisScannerModal } from "@/components/coaching/DiagnosisScannerModal";

export default function CoachingPage() {
  const { devices = [] } = useDevices();
  const [messages, setMessages] = useState([
    {
      id: "msg-0",
      role: "assistant",
      content: "가전 에너지 절약 질문을 입력해 보세요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const sampleChips = [
    "에어컨 1도 올리면?",
    "주말 종일 틀면 요금은?",
    "🔧 에어컨 CH05 에러 조치법",
    "전기 하마 1위는?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDiagnose = (result) => {
    const userMessageId = "user-" + Date.now();
    const assistantMessageId = "asst-" + Date.now();

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: "📷 기기 에러 사진/영상을 전송했습니다." },
      { id: assistantMessageId, role: "assistant", content: "", diagnosisResult: result },
    ]);
  };

  const handleSubmit = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage = { id: "user-" + Date.now(), role: "user", content: query };
    const assistantMessageId = "asst-" + Date.now();

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          devices: devices,
        }),
      });

      if (!response.body) throw new Error("No stream");

      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: fullText } : msg
          )
        );
      }

      // 스트리밍 완료 후 JSON 응답(진단/등록) 여부 확인 및 카드 데이터 파싱
      try {
        let cleanText = fullText.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
          const parsed = JSON.parse(cleanText);

          if (parsed.isDiagnosis && parsed.diagnosisResult) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: parsed.content || "",
                      diagnosisResult: parsed.diagnosisResult,
                    }
                  : msg
              )
            );
          } else if (parsed.isRegistration && parsed.registrationData) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: parsed.content || "",
                      registrationData: parsed.registrationData,
                    }
                  : msg
              )
            );
          }
        }
      } catch (jsonErr) {
        // 일반 마크다운 응답일 경우 그대로 유지
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "다시 시도해 주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="absolute top-4 sm:top-6 md:top-8 bottom-20 md:bottom-8 left-4 right-4 sm:left-6 sm:right-6 md:left-0 md:right-0 max-w-2xl mx-auto flex flex-col animate-in fade-in duration-300">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-base text-foreground">AI 진단</h1>
          </div>

          <Link
            href="/coaching/routines"
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-full border border-border shrink-0 transition-colors"
          >
            <Sliders className="w-3 h-3 text-primary" />
            <span>루틴</span>
          </Link>
        </div>

        {/* 대화 메시지 영역 */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 no-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-primary border border-border"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-none shadow-md"
                      : "bg-muted border border-border text-foreground rounded-tl-none shadow-sm"
                  }`}
                >
                  {/* 1. 고장 진단 카드 */}
                  {msg.diagnosisResult ? (
                    <div className="space-y-3">
                      <p className="font-bold text-sm text-destructive flex items-center gap-1.5">
                        <Wrench className="w-4 h-4" /> 에러코드 {msg.diagnosisResult.code} 발견
                      </p>
                      <div className="p-2.5 bg-background rounded-xl border border-border space-y-1 shadow-sm">
                        <span className="text-[10px] text-muted-foreground">
                          {msg.diagnosisResult.device}
                        </span>
                        <h4 className="font-bold text-[13px]">{msg.diagnosisResult.cause}</h4>
                      </div>
                      <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
                        <div className="flex items-center gap-1 text-primary font-bold mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 1차 조치법
                        </div>
                        <p className="text-foreground leading-relaxed">
                          {msg.diagnosisResult.solution}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <a
                          href={msg.diagnosisResult.asUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 shadow-md shadow-primary/20 transition-colors"
                        >
                          A/S 예약 <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`tel:${msg.diagnosisResult.phone}`}
                          className="flex-1 bg-background hover:bg-accent border border-border text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-primary" />{" "}
                          {msg.diagnosisResult.phone}
                        </a>
                      </div>
                    </div>
                  ) : msg.registrationData ? (
                    /* 2. 명판 스캔 등록 카드 */
                    <div className="space-y-3">
                      <p className="font-bold text-sm text-primary flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> 가전 명판 스캔 완료
                      </p>
                      <div className="p-2.5 bg-background rounded-xl border border-border space-y-1 shadow-sm">
                        <span className="text-[10px] text-muted-foreground">
                          {msg.registrationData.brand} • {msg.registrationData.releaseYear}년형
                        </span>
                        <h4 className="font-bold text-[13px]">{msg.registrationData.name}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          모델명: {msg.registrationData.model}
                        </p>
                      </div>
                      <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-primary">제원 및 전력 정보</div>
                        <p className="text-foreground leading-relaxed text-[11px]">
                          소비전력: {msg.registrationData.specs?.powerConsumption || "확인 중"} | 효율등급: {msg.registrationData.releaseEnergyGrade}등급
                        </p>
                      </div>
                      <Link
                        href="/devices"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 shadow-md shadow-primary/20 transition-colors"
                      >
                        인벤토리에서 확인하기 <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : msg.content?.trim().startsWith("{") && isLoading ? (
                    /* 3. JSON 로딩 */
                    <div className="flex items-center gap-2 text-muted-foreground py-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span>AI 진단 결과 분석 중...</span>
                    </div>
                  ) : (
                    /* 4. 마크다운 메시지 */
                    <MarkdownMessage content={msg.content} isUser={isUser} />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 추천 질문 칩 */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 shrink-0 no-scrollbar">
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSubmit(chip)}
              className="px-3 py-1 rounded-full bg-muted border border-border hover:border-primary hover:text-foreground text-xs text-muted-foreground whitespace-nowrap transition-all shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 하단 입력 폼 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="pt-1 pb-2 shrink-0 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-11 h-11 rounded-full bg-muted border border-border hover:bg-accent flex items-center justify-center text-primary shrink-0 transition-colors shadow-sm"
            title="고장 진단 스캐너 열기"
          >
            <Plus className="w-5 h-5" />
          </button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="증상이나 에너지 관련 질문을 입력하세요..."
            className="flex-1 h-11 rounded-full bg-muted border-border px-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <DiagnosisScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onDiagnose={handleDiagnose}
        />
      </div>
    </AppShell>
  );
}