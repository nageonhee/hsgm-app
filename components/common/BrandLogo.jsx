"use client";

import React from "react";

export function BrandLogo({ size = "md", showText = true, className = "" }) {
  const sizeMap = {
    sm: { box: "w-7 h-7 rounded-lg", icon: "w-4 h-4", text: "text-sm", sub: "text-[9px]" },
    md: { box: "w-8 h-8 rounded-xl", icon: "w-4.5 h-4.5", text: "text-base", sub: "text-[10px]" },
    lg: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6", text: "text-2xl", sub: "text-xs" },
    xl: { box: "w-14 h-14 rounded-3xl", icon: "w-8 h-8", text: "text-3xl", sub: "text-xs" },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium Smart Home Energy Logo Icon */}
      <div
        className={`${current.box} bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0 relative overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${current.icon} text-white drop-shadow-sm`}
        >
          {/* Smart Home Outline */}
          <path
            d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Energy Dynamic Lightning Bolt inside Home */}
          <path
            d="M13 8.5L9.5 13.5H14.5L11 18.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            className="text-cyan-200 fill-cyan-200"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-black ${current.text} tracking-tight text-foreground leading-none flex items-center gap-1`}>
            HSGM
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </span>
          {size === "xl" || size === "lg" ? (
            <span className="text-[11px] font-semibold text-muted-foreground mt-0.5 tracking-tight">
              스마트 가전 에너지 매니저
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
