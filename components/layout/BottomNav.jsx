"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Bot, Home, Zap, Users, LayoutGrid } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // 사용자 요청 순서 + 제품 관리 추가
  const navItems = [
    { href: "/dashboard", label: "홈", icon: Home },
    { href: "/devices", label: "제품 관리", icon: LayoutGrid },
    { href: "/coaching", label: "AI 진단", icon: Bot },
    { href: "/energy", label: "전력 모니터링", icon: Zap },
    { href: "/social", label: "소셜", icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-t border-border md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                isActive
                  ? "text-foreground font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.2] text-foreground" : "stroke-[1.6]"}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
