import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  return NextResponse.json({
    serverTime: now.toISOString(),
    currentYear,
    currentMonth,
    currentDay,
    standards: {
      agency: "한국에너지공단 (KEA)",
      standardName: "효율관리기자재 운용규정",
      activeRevisionYear: currentYear,
      description: `${currentYear}년 현행 고효율 가전 소비효율등급 강화 기준`,
    },
  });
}
