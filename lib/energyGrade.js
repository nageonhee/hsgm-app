/**
 * 한국에너지공단(KEA) 효율관리기자재 운용규정 고시 개정 주기 기준
 * 가전제품 에너지 소비효율 등급 서버 동기화 엔진
 */

// 한국에너지공단 공식 고시 개정 연도 및 버전 관리 테이블
export const ENERGY_STANDARDS_REVISIONS = [
  {
    revisionYear: 2018,
    version: "KEA-2018",
    effectiveDate: "2018-04-01",
    desc: "2018년 효율관리기자재 고시 개정",
  },
  {
    revisionYear: 2021,
    version: "KEA-2021",
    effectiveDate: "2021-10-01",
    desc: "2021년 냉장고/에어컨 1등급 기준 1차 강화",
  },
  {
    revisionYear: 2024,
    version: "KEA-2024",
    effectiveDate: "2024-01-01",
    desc: "2024년 가전 대기전력 및 복합 소비효율 고시",
  },
  {
    revisionYear: 2026,
    version: "KEA-2026",
    effectiveDate: "2026-01-01",
    desc: "2026년 고효율 인버터 및 에너지 소비효율 강화 기준",
  },
];

// 현재 서버 연도에 부합하는 활성 고시 개정판 조회
export function getActiveRevision(currentYear = new Date().getFullYear()) {
  const eligible = ENERGY_STANDARDS_REVISIONS.filter(
    (rev) => rev.revisionYear <= currentYear
  );
  if (eligible.length > 0) {
    return eligible[eligible.length - 1];
  }
  return ENERGY_STANDARDS_REVISIONS[ENERGY_STANDARDS_REVISIONS.length - 1];
}

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
    // 네트워크 오류 시 시스템 연도 사용
  }
  return new Date().getFullYear();
}

/**
 * 품목 및 경과 연수(출시연도 vs 고시 개정 연도)에 따른 등급 하락폭 산출
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
    if (yearsElapsed >= 9) return 3; // 9년 이상 경과 (4~5등급)
    if (yearsElapsed >= 5) return 2; // 5~8년 경과 (2단계 하락)
    if (yearsElapsed >= 2) return 1; // 2~4년 경과 (1단계 하락)
    return 0;
  }

  // 중소형 가전
  if (category === "air_purifier") {
    if (yearsElapsed >= 6) return 1;
    return 0;
  }

  // IT/로봇청소기/스마트홈 디바이스 등은 기준 유지
  return 0;
}

/**
 * 단일 기기 등급 평가 및 레코드 생성 (개정 시기에 맞춰 1회만 계산)
 */
export function evaluateDeviceGrade(device, activeRevision = getActiveRevision()) {
  if (!device) return device;

  const targetYear = activeRevision.revisionYear;

  // 1. 출시 연도 파출 (불변 속성)
  const rawReleaseYear =
    device.releaseYear ||
    device.specs?.releaseYear ||
    (device.createdAt ? new Date(device.createdAt).getFullYear() : targetYear);
  const releaseYear = parseInt(rawReleaseYear, 10) || targetYear;

  // 2. 출시 당시 등급 파출 (불변 속성)
  const rawReleaseGrade =
    device.releaseEnergyGrade ||
    device.energyGrade ||
    1;
  const releaseGrade = Math.min(5, Math.max(1, parseInt(rawReleaseGrade, 10) || 1));

  // 3. 경과 연수 계산
  const yearsElapsed = Math.max(0, targetYear - releaseYear);

  // 4. 등급 하락폭 계산
  const downgradeSteps = calculateGradeDowngrade(device.category, yearsElapsed);

  // 5. 현행 개정 기준 환산 등급
  const currentGrade = Math.min(5, Math.max(1, releaseGrade + downgradeSteps));
  const isGradeDowngraded = currentGrade > releaseGrade;
  const gradeDiff = currentGrade - releaseGrade;

  // 6. 상태 설명 생성
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
    standardsVersion: activeRevision.version,
    evaluatedAt: new Date().toISOString(),
    energyGrade: currentGrade,
    energyGradeDesc: desc,
    isGradeDowngraded,
    gradeDiff,
  };
}

/**
 * ★ 등급표 개정 시기 맞춤형 1회 확인 & 서버 동기화 함수 ★
 * 매번 계산하지 않고, 기기에 기록된 기준 연도/버전이 최신 개정판과 다를 때만 1회 갱신합니다.
 * @param {Array} deviceList - 기기 목록
 * @param {number|Object} currentYearOrRevision - 현재 연도 또는 활성 리비전 객체
 * @returns {{ list: Array, hasChanges: boolean }}
 */
export function syncDevicesWithStandards(deviceList, currentYearOrRevision) {
  if (!Array.isArray(deviceList) || deviceList.length === 0) {
    return { list: [], hasChanges: false };
  }

  const activeRevision =
    typeof currentYearOrRevision === "object" && currentYearOrRevision?.version
      ? currentYearOrRevision
      : getActiveRevision(
          typeof currentYearOrRevision === "number"
            ? currentYearOrRevision
            : new Date().getFullYear()
        );

  let hasChanges = false;

  const updatedList = deviceList.map((dev) => {
    // 이미 최신 개정판 기준으로 서버에 기록 완료된 기기는 재계산 없이 그대로 보존
    if (
      dev.currentEnergyGrade &&
      dev.currentGradeYear === activeRevision.revisionYear &&
      dev.standardsVersion === activeRevision.version
    ) {
      return dev;
    }

    // 개정 시기가 도래하여 기준이 바뀐 경우에만 1회 새로 평가 및 서버 기록용 데이터 생성
    hasChanges = true;
    return evaluateDeviceGrade(dev, activeRevision);
  });

  return { list: updatedList, hasChanges };
}
