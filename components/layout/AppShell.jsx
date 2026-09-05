"use client";

import React, { useRef } from "react";
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

export function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // 현재 페이지 인덱스 구하기
  const currentIndex = PAGE_ROUTES.findIndex((r) =>
    r === "/dashboard" ? pathname === "/" || pathname === "/dashboard" : pathname.startsWith(r)
  );

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // 수평 스와이프 판정 (70px 이상 이동 및 수직 이동 대비 1.4배 이상 수평 이동 시)
    if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0 && currentIndex >= 0 && currentIndex < PAGE_ROUTES.length - 1) {
        // 왼쪽으로 스와이프 (손가락을 오른쪽에서 왼쪽으로) -> 다음 탭 페이지로 이동
        router.push(PAGE_ROUTES[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        // 오른쪽으로 스와이프 (손가락을 왼쪽에서 오른쪽으로) -> 이전 탭 페이지로 이동
        router.push(PAGE_ROUTES[currentIndex - 1]);
      }
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden flex bg-background text-foreground">
      {/* Desktop Fixed Side Navigation */}
      <SideNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
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
