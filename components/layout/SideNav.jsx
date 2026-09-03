"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Zap,
  Bot,
  Wrench,
  Users,
  Plus,
  ChevronLeft,
  Menu
} from "lucide-react";

let globalSidebarCollapsed = false;

export function SideNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(globalSidebarCollapsed);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    globalSidebarCollapsed = nextState;
    setIsCollapsed(nextState);
  };

  const navItems = [
    { href: "/dashboard", label: "홈", icon: Home },
    { href: "/devices", label: "제품 관리", icon: LayoutGrid },
    { href: "/coaching", label: "AI 진단", icon: Bot },
    { href: "/energy", label: "전력 모니터링", icon: Zap },
    { href: "/social", label: "소셜 리포트", icon: Users },
  ];

  return (
    <aside className={`hidden md:flex flex-col border-r border-border bg-sidebar p-4 shrink-0 select-none transition-all duration-300 ${
      isCollapsed ? "w-20 items-center" : "w-56"
    }`}>
      {/* Brand Logo & Toggle */}
      <div className={`flex items-center mb-6 w-full ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-md shadow-primary/20 shrink-0">
              H
            </div>
            <span className="font-extrabold text-base tracking-tight text-foreground whitespace-nowrap">
              HSGM
            </span>
          </div>
        )}
        <button 
          onClick={toggleCollapse}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
          title="메뉴 접기/펴기"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>


      {/* Navigation List */}
      <div className="flex-1 space-y-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center rounded-xl text-sm font-medium transition-all ${
                isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-accent text-accent-foreground font-bold"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
