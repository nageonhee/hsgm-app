/**
 * 한국에너지공단(KEA) 효율관리기자재 운용규정 기반
 * 가전제품 에너지 소비효율 등급 동적 최신화 엔진
 */

// 기본 기준 연도 (클라이언트 기본값)
export const getDefaultYear = () => {
  return typeof window !== "undefined" ? new Date().getFullYear() : 2026;
};

// 서버 시간 및 기준 연도 동기화
export async function fetchServerYear() {
  try {
    const res = await fetch("/api/time", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.currentYear) {
        return data.currentYear;
      }
    }
  } catch (err) {
    // 네트워크 실패 시 로컬 시스템 연도 사용
  }
  return new Date().getFullYear();
}

/**
 * 품목 및 경과 연수(출시연도 vs 현재연도)에 따른 등급 하락폭 산출
 * 한국에너지공단 효율관리기자재 고시 개정 주기(3~4년) 반영
 */
function calculateGradeDowngrade(category, yearsElapsed) {
  if (yearsElapsed <= 1) return 0;

  // 고소비전력 가전 (냉장고, 에어컨, 세탁기, 밥솥, 김치냉장고, TV 등)
  const heavyAppliances = [
    "air_conditioner",
    "refrigerator",
    "washer",
    "dryer",
    "cooker",
    "kimchi_fridge",
    "dehumidifier",
    "tv",
    "dishwasher",
  ];

  if (heavyAppliances.includes(category)) {
    if (yearsElapsed >= 9) return 3; // 9년 이상 경과: 3단계 하락 (ex. 1등급 -> 4등급)
    if (yearsElapsed >= 5) return 2; // 5~8년 경과: 2단계 하락 (ex. 1등급 -> 3등급)
    if (yearsElapsed >= 2) return 1; // 2~4년 경과: 1단계 하락 (ex. 1등급 -> 2등급)
    return 0;
  }

  // 중소형 가전 (공기청정기, 청소기 등)
  if (category === "air_purifier") {
    if (yearsElapsed >= 6) return 1;
    return 0;
  }

  // IT/로봇청소기/스마트홈 디바이스 등은 기준 유지
  return 0;
}

/**
 * 단일 기기 효율 등급 최신화 계산
 * @param {Object} device - 기기 데이터 객체
 * @param {number} [targetYear] - 적용할 기준 연도 (기본값: 현재 연도)
 */
export function recalculateDeviceGrade(device, targetYear = getDefaultYear()) {
  if (!device) return device;

  // 1. 출시 연도 파출 (specs 내부 또는 최상위 필드)
  const rawReleaseYear =
    device.releaseYear ||
    device.specs?.releaseYear ||
    (device.createdAt ? new Date(device.createdAt).getFullYear() : targetYear);
  const releaseYear = parseInt(rawReleaseYear, 10) || targetYear;

  // 2. 출시 당시 등급 파출 (기존 명시된 releaseEnergyGrade 또는 초기 energyGrade)
  const rawReleaseGrade =
    device.releaseEnergyGrade ||
    (device.currentEnergyGrade && !device.releaseEnergyGrade ? device.energyGrade : device.energyGrade) ||
    1;
  const releaseGrade = Math.min(5, Math.max(1, parseInt(rawReleaseGrade, 10) || 1));

  // 3. 경과 연수 계산
  const yearsElapsed = Math.max(0, targetYear - releaseYear);

  // 4. 카테고리별 등급 하락폭 산출
  const downgradeSteps = calculateGradeDowngrade(device.category, yearsElapsed);

  // 5. 현행 기준 환산 등급 계산 (최대 5등급)
  const currentGrade = Math.min(5, Math.max(1, releaseGrade + downgradeSteps));
  const isGradeDowngraded = currentGrade > releaseGrade;
  const gradeDiff = currentGrade - releaseGrade;

  // 6. 상태 설명 문구 생성
  let desc = device.energyGradeDesc;
  if (!desc || desc.includes("기준") || desc.includes("등급")) {
    if (isGradeDowngraded) {
      desc = `${targetYear}년 현행 강화 기준 적용 시 ${currentGrade}등급 환산 (출시 대비 ${gradeDiff}단계 하향)`;
    } else {
      desc = `${targetYear}년 현행 고효율 ${currentGrade}등급 기준 만족`;
    }
  }

  return {
    ...device,
    releaseYear: String(releaseYear),
    releaseEnergyGrade: releaseGrade,
    currentEnergyGrade: currentGrade,
    currentGradeYear: targetYear,
    energyGrade: currentGrade, // 최신 유효 등급 반영
    energyGradeDesc: desc,
    isGradeDowngraded,
    gradeDiff,
  };
}

/**
 * 기기 목록 전체 일괄 등급 최신화
 */
export function enrichDevicesList(deviceList, targetYear = getDefaultYear()) {
  if (!Array.isArray(deviceList)) return [];
  return deviceList.map((dev) => recalculateDeviceGrade(dev, targetYear));
}
