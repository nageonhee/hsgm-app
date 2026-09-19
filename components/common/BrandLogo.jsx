"use client";

import React from "react";
import Image from "next/image";

export function BrandLogo({ size = "md", showText = true, className = "" }) {
  const sizeMap = {
    sm: { box: "w-7 h-7 rounded-xl", px: 28, text: "text-sm", sub: "text-[9px]" },
    md: { box: "w-8 h-8 rounded-2xl", px: 32, text: "text-base", sub: "text-[10px]" },
    lg: { box: "w-12 h-12 rounded-3xl", px: 48, text: "text-2xl", sub: "text-xs" },
    xl: { box: "w-16 h-16 rounded-[22px]", px: 64, text: "text-3xl", sub: "text-xs" },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official HSGM Logo from app/icon.png */}
      <div
        className={`${current.box} bg-black flex items-center justify-center shadow-lg shadow-black/30 border border-white/10 shrink-0 relative overflow-hidden group`}
      >
        <Image
          src="/icon.png"
          alt="HSGM 로고"
          width={current.px}
          height={current.px}
          priority
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-black ${current.text} tracking-tight text-foreground leading-none flex items-center gap-1.5`}>
            HSGM
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </span>
          {size === "xl" || size === "lg" ? (
            <span className="text-[11px] font-semibold text-muted-foreground mt-1 tracking-tight">
              스마트 가전 에너지 매니저
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
