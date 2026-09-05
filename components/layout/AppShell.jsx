"use client";

import React, { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";

const PAGE_ROUTES = [
  "/dashboard",
  "/devices",
  "/coaching",
  "/energy",
  "/social",
];

const PAGE_NAMES = {
  "/dashboard": "메인 홈",
  "/devices": "제품 관리",
  "/coaching": "AI 절전 코칭",
  "/energy": "전력 모니터링",
  "/social": "소셜 리포트",
};

export function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [pageDragX, setPageDragX] = useState(0);
  const [isPageDragging, setIsPageDragging] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // 현재 페이지 인덱스 구하기
  const currentIndex = PAGE_ROUTES.findIndex((r) =>
    r === "/dashboard" ? pathname === "/" || pathname === "/dashboard" : pathname.startsWith(r)
  );

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPageDragging(true);
    setPageDragX(0);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // 수평 이동이 우세할 때 실시간 드래그 변위 적용
    if (Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      setPageDragX(diffX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    setIsPageDragging(false);

    const threshold = 70;
    if (pageDragX < -threshold && currentIndex >= 0 && currentIndex < PAGE_ROUTES.length - 1) {
      // 왼쪽으로 스와이프 (다음 탭으로 이동)
      router.push(PAGE_ROUTES[currentIndex + 1]);
    } else if (pageDragX > threshold && currentIndex > 0) {
      // 오른쪽으로 스와이프 (이전 탭으로 이동)
      router.push(PAGE_ROUTES[currentIndex - 1]);
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setPageDragX(0);
  };

  // 페이지 스와이프 중간 실시간 목표 계산
  const pageThreshold = 70;
  let targetRoute = null;
  if (isPageDragging && Math.abs(pageDragX) > 5 && currentIndex >= 0) {
    if (pageDragX < 0 && currentIndex < PAGE_ROUTES.length - 1) {
      targetRoute = PAGE_ROUTES[currentIndex + 1];
    } else if (pageDragX > 0 && currentIndex > 0) {
      targetRoute = PAGE_ROUTES[currentIndex - 1];
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex bg-background text-foreground">
      {/* 스와이프 중간 실시간 페이지 인식 고정 뱃지 */}
      {isPageDragging && Math.abs(pageDragX) > 5 && targetRoute && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`px-4 py-2 rounded-full text-xs font-extrabold shadow-2xl border backdrop-blur-md flex items-center gap-2 transition-all animate-in slide-in-from-top-2 duration-150 ${
              Math.abs(pageDragX) >= pageThreshold
                ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/40 ring-2 ring-blue-400/50"
                : "bg-background/95 text-foreground border-border shadow-lg"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>
              {Math.abs(pageDragX) >= pageThreshold
                ? `✨ 손을 떼면 '${PAGE_NAMES[targetRoute]}' 페이지로 이동합니다!`
                : `👉 '${PAGE_NAMES[targetRoute]}' 이동 중... (${Math.min(
                    100,
                    Math.round((Math.abs(pageDragX) / pageThreshold) * 100)
                  )}%)`}
            </span>
          </div>
        </div>
      )}

      {/* Desktop Fixed Side Navigation */}
      <SideNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${pageDragX * 0.7}px)`,
            opacity: isPageDragging ? Math.max(0.6, 1 - Math.abs(pageDragX) / 600) : 1,
            transition: isPageDragging ? "none" : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease",
          }}
          className="flex-1 flex flex-col min-h-0 pt-2 pb-24 md:pb-8 px-3 sm:px-6 md:px-8 max-w-7xl w-full mx-auto relative overflow-y-auto"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
