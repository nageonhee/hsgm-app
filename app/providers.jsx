"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import { CacheCleaner } from "@/components/common/CacheCleaner";

export function Providers({ children }) {
  useEffect(() => {
    // 1. 서비스 워커 등록
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // 2. PWA 설치 프롬프트 이벤트 가로채기 (선택적 커스텀 설치 버튼용)
    const handleBeforeInstallPrompt = (e) => {
      // 브라우저의 기본 설치 배너가 자동으로 뜨는 것을 막고 싶다면 e.preventDefault(); 사용
      // 지금은 기본 배너를 허용하되, 이벤트만 로깅해둡니다.
      console.log("PWA beforeinstallprompt 이벤트 발생!");
      window.deferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <DeviceProvider>
          <CacheCleaner />
          {children}
        </DeviceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
