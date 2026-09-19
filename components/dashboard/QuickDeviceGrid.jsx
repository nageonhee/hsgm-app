"use client";

import React from "react";
import Link from "next/link";
import {
  AirVent,
  Utensils,
  Refrigerator,
  Tv,
  WashingMachine,
  Wind,
  Disc,
  Power,
  Plus,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { useDevices } from "@/contexts/DeviceContext";

const ICON_MAP = {
  AirVent: AirVent,
  Utensils: Utensils,
  Refrigerator: Refrigerator,
  Tv: Tv,
  WashingMachine: WashingMachine,
  Wind: Wind,
  Disc: Disc,
};

export function QuickDeviceGrid() {
  const { devices, toggleDeviceStatus } = useDevices();
  const displayDevices = devices.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-sm text-foreground">
          연결된 가전 ({devices.length})
        </h3>
        <span className="text-xs text-muted-foreground">
          월 예상 요금 기준
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayDevices.map((device) => {
          const Icon = ICON_MAP[device.icon] || Zap;
          const isOn = device.status;
          const isControlSupported = device.isSmartControl;

          return (
            <div
              key={device.id}
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                isOn
                  ? "bg-card border-border shadow-md"
                  : "bg-muted border-border opacity-60 hover:opacity-100"
              }`}
            >
              {/* Header: Icon + Control Switch */}
              <div className="flex items-center justify-between mb-3">
                <Link
                  href={`/devices/${device.id}`}
                  className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </Link>

                {isControlSupported && device.category !== "refrigerator" ? (
                  <button
                    onClick={() => toggleDeviceStatus(device.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isOn
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                        : "bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Power className="w-4 h-4 stroke-[2.2]" />
                  </button>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground">
                    모니터링
                  </span>
                )}
              </div>

              {/* Title & Brand */}
              <Link href={`/devices/${device.id}`} className="block">
                <h4 className="font-bold text-xs text-foreground truncate">
                  {device.name}
                </h4>
                <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                  {device.brand}
                </span>
              </Link>

              {/* Footer: ★ 사용량 금액(원, ₩) 기준 표시 ★ */}
              <div className="mt-3 pt-2.5 border-t border-border flex items-baseline justify-between">
                <span className={`text-[11px] ${isOn ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {isOn ? "가동 중" : "꺼짐"}
                </span>

                <div className="text-right font-mono">
                  <span className="text-xs sm:text-sm font-extrabold text-foreground">
                    ₩{device.monthlyCost ? device.monthlyCost.toLocaleString() : "0"}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-0.5">
                    /월
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* View All / Devices Page Link */}
        <Link
          href="/devices"
          className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-border bg-muted/50 hover:bg-accent hover:border-border transition-all text-center min-h-[130px]"
        >
          <div className="w-9 h-9 rounded-full bg-accent/50 flex items-center justify-center text-foreground mb-1.5">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-foreground">
            전체 제품 관리
          </span>
          {devices.length > 3 && (
            <span className="text-[10px] text-muted-foreground mt-0.5">
              +{devices.length - 3}대 더보기
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
