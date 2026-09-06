"use client";

import React, { useState } from "react";
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
  Settings,
  Moon,
  Sun,
  Check,
  Building,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const PRESET_SPACES = ["거실", "안방", "주방", "서재", "부모님 댁", "원룸/오피스텔", "사무실"];

export function Header() {
  const { user, signOut } = useAuth();
  const { spaces = ["우리집"], currentSpace = "우리집", setCurrentSpace, addSpace } = useDevices();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateSpace = (e) => {
    e?.preventDefault();
    if (!newSpaceName.trim()) return;
    addSpace(newSpaceName.trim());
    setNewSpaceName("");
    setIsAddSpaceOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Left: Space Dropdown */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-foreground hover:opacity-80 transition-opacity outline-none cursor-pointer">
                <span className="font-bold text-base tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
                  {currentSpace || "우리집"}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-popover border-border p-1.5 shadow-xl">
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  관리 공간 선택
                </DropdownMenuLabel>
                {spaces.map((space) => {
                  const isSelected = (currentSpace || "우리집") === space;
                  return (
                    <DropdownMenuItem
                      key={space}
                      onClick={() => setCurrentSpace(space)}
                      className={`cursor-pointer flex items-center justify-between text-xs py-2 px-2.5 rounded-lg ${
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <span className="truncate">{space}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setIsAddSpaceOpen(true)}
                  className="text-primary font-semibold text-xs cursor-pointer flex items-center gap-1.5 py-2 px-2.5 rounded-lg hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>새 공간 추가</span>
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
                <DropdownMenuLabel className="truncate">{user?.email || "사용자"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-xs">
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="w-4 h-4 mr-2" /> 설정 및 계정 관리
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer text-xs">
                  <LogOut className="w-4 h-4 mr-2" /> 로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* 새 공간 추가 다이얼로그 모달 */}
      <Dialog open={isAddSpaceOpen} onOpenChange={setIsAddSpaceOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border p-5 rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              새 스마트 관리 공간 추가
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              추가된 공간별로 독립적인 가전 등록 및 실시간 전력 DB가 분리 관리됩니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSpace} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">공간 이름 입력</label>
              <Input
                placeholder="예: 거실, 안방, 부모님 댁, 세컨하우스"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                autoFocus
                className="h-11 rounded-2xl bg-accent/50 border-border text-xs focus-visible:ring-primary"
              />
            </div>

            {/* 추천 프리셋 칩 */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                추천 공간 명칭
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SPACES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewSpaceName(preset)}
                    className="px-2.5 py-1 rounded-xl bg-accent/50 hover:bg-accent border border-border text-[11px] font-medium text-foreground transition-all hover:scale-105 active:scale-95"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddSpaceOpen(false)}
                className="h-10 rounded-xl text-xs font-semibold"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!newSpaceName.trim()}
                className="h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
              >
                새 공간 생성하기
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
