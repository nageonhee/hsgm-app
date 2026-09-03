"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useDevices } from "@/contexts/DeviceContext";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  Plus,
  MoreVertical,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 직관적인 스마트 만능 리모컨 커스텀 아이콘
function RemoteIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      {...props}
    >
      <rect x="7" y="2" width="10" height="20" rx="3" />
      <circle cx="12" cy="6" r="1" fill="currentColor" />
      <circle cx="12" cy="11" r="2" />
      <line x1="9.5" y1="16" x2="10.5" y2="16" />
      <line x1="13.5" y1="16" x2="14.5" y2="16" />
      <line x1="9.5" y1="18.5" x2="10.5" y2="18.5" />
      <line x1="13.5" y1="18.5" x2="14.5" y2="18.5" />
    </svg>
  );
}

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Left: Home Name */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-foreground hover:opacity-80 transition-opacity outline-none cursor-pointer">
              <span className="font-bold text-base tracking-tight">
                {user?.user_metadata?.name || "우리집"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-popover border-border p-1">
              <DropdownMenuLabel>공간 선택</DropdownMenuLabel>
              <DropdownMenuItem className="text-foreground font-semibold bg-accent cursor-pointer">
                ✓ {user?.user_metadata?.name || "우리집"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground cursor-pointer">
                + 새 공간 추가
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Actions: Theme, Remote, Plus, More */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="다크/라이트 모드 전환"
              className="flex items-center justify-center h-9 w-9 text-foreground hover:bg-accent rounded-full transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Real Remote Controller Icon */}
          <Link
            href="/remote"
            title="통합 스마트 리모컨"
            className="flex items-center justify-center h-9 w-9 text-foreground hover:bg-accent rounded-full transition-colors"
          >
            <RemoteIcon />
          </Link>

          <Link
            href="/devices/add"
            title="새 기기 추가"
            className="flex items-center justify-center h-9 w-9 text-foreground hover:bg-accent rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 text-foreground hover:bg-accent rounded-full transition-colors outline-none cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border p-1">
              <DropdownMenuLabel>{user?.email || "사용자"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = "/auth/login";
                }}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" /> 계정 전환
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" /> 로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
