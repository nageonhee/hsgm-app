import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import DynamicDashboard from "@/components/dashboard/DynamicDashboard";

export const metadata = {
  title: "홈 | HSGM 스마트 가전",
  description: "제조사 통합 스마트 가전 에너지 관리",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="w-full flex-1 flex flex-col items-center justify-center my-auto">
        <DynamicDashboard />
      </div>
    </AppShell>
  );
}
