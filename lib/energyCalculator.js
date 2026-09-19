/**
 * 한전 주택용(저압) 전력요금 계산 엔진 & 제원표 기반 가전 실사용량 추론 엔진
 */

// 1. 계절별 누진 구간 기준치 판별 함수
export function getTariffTiers(targetMonth = new Date().getMonth() + 1) {
  const isSummer = targetMonth === 7 || targetMonth === 8;
  return {
    isSummer,
    seasonName: isSummer ? "하계 누진 완화(7~8월)" : "기타계절(표준)",
    tier1Limit: isSummer ? 300 : 200,
    tier2Limit: isSummer ? 450 : 400,
  };
}

// 2. 한전 공식 세부 산정 내역 반환
export function calculateDetailedBill(usageKWh = 0, targetMonth = new Date().getMonth() + 1) {
  const kwh = Math.max(0, Number(usageKWh) || 0);
  const { isSummer, seasonName, tier1Limit, tier2Limit } = getTariffTiers(targetMonth);

  let baseRate = 0;
  let energyCharge = 0;

  if (kwh <= tier1Limit) {
    baseRate = 910;
    energyCharge = kwh * 120.0;
  } else if (kwh <= tier2Limit) {
    baseRate = 1600;
    energyCharge = tier1Limit * 120.0 + (kwh - tier1Limit) * 214.6;
  } else {
    baseRate = 7300;
    energyCharge =
      tier1Limit * 120.0 +
      (tier2Limit - tier1Limit) * 214.6 +
      (kwh - tier2Limit) * 307.3;
  }

  const climateCharge = Math.round(kwh * 9.0);
  const fuelAdjustmentCharge = Math.round(kwh * 5.0);
  const subtotal = Math.floor(baseRate + energyCharge + climateCharge + fuelAdjustmentCharge);
  const vat = Math.round(subtotal * 0.1);
  const powerFund = Math.floor((subtotal * 0.037) / 10) * 10;
  const totalBill = Math.floor((subtotal + vat + powerFund) / 10) * 10;
  const currentTier = kwh > tier2Limit ? 3 : kwh > tier1Limit ? 2 : 1;

  return {
    totalBill,
    subtotal,
    baseRate,
    energyCharge: Math.round(energyCharge),
    climateCharge,
    fuelAdjustmentCharge,
    vat,
    powerFund,
    currentTier,
    isSummer,
    seasonName,
    tier1Limit,
    tier2Limit,
  };
}

// 3. 단일 최종 요금 반환
export function calculateKepcoBill(usageKWh = 0, targetMonth = new Date().getMonth() + 1) {
  return calculateDetailedBill(usageKWh, targetMonth).totalBill;
}

// 4. 기기 목록 기반 종합 집계
export function calculateDevicesSummary(devices = [], targetMonth = new Date().getMonth() + 1) {
  if (!Array.isArray(devices) || devices.length === 0) {
    return {
      activeCount: 0,
      totalActiveWatts: 0,
      totalMonthlyKWh: 0,
      billDetails: calculateDetailedBill(0, targetMonth),
    };
  }

  const activeDevices = devices.filter((d) => d.status);
  const totalActiveWatts = activeDevices.reduce(
    (sum, d) => sum + (Number(d.currentPower) || 0),
    0
  );

  const totalMonthlyKWh = devices.reduce(
    (sum, d) => sum + (Number(d.monthlyUsageKWh) || 0),
    0
  );

  const billDetails = calculateDetailedBill(totalMonthlyKWh, targetMonth);

  return {
    activeCount: activeDevices.length,
    totalActiveWatts,
    totalMonthlyKWh: Math.round(totalMonthlyKWh * 10) / 10,
    billDetails,
  };
}

// 5. 등급 하락 페널티 차액 계산
export function calculateGradeSavings(monthlyUsageKWh = 35, gradeDiff = 1) {
  const kwh = Number(monthlyUsageKWh) || 35;
  const penaltyRatio = Math.max(0.1, gradeDiff * 0.15);
  const excessKWh = kwh * penaltyRatio;
  const annualLoss = Math.round(excessKWh * 260 * 12);
  return {
    excessKWh: Math.round(excessKWh * 10) / 10,
    annualLoss,
  };
}

// 6. 카테고리별 사용 패턴 프로파일
const APPLIANCE_PROFILES = {
  water_dispenser: {
    name: "냉온수기/정수기",
    defaultRatedWatt: 450,
    dailyHours: 24,
    dutyCycle: 0.22,
    idleWatt: 8,
    activeMultiplier: 0.35,
  },
  refrigerator: {
    name: "냉장고",
    defaultRatedWatt: 160,
    dailyHours: 24,
    dutyCycle: 0.32,
    idleWatt: 5,
    activeMultiplier: 0.45,
  },
  air_conditioner: {
    name: "에어컨",
    defaultRatedWatt: 1800,
    dailyHours: 7,
    dutyCycle: 0.55,
    idleWatt: 3,
    activeMultiplier: 0.60,
  },
  washer: {
    name: "세탁기",
    defaultRatedWatt: 1200,
    dailyHours: 0.8,
    dutyCycle: 0.45,
    idleWatt: 2,
    activeMultiplier: 0.50,
  },
  tv: {
    name: "TV",
    defaultRatedWatt: 140,
    dailyHours: 5,
    dutyCycle: 0.95,
    idleWatt: 1,
    activeMultiplier: 0.90,
  },
  cooker: {
    name: "전기밥솥",
    defaultRatedWatt: 1100,
    dailyHours: 12,
    dutyCycle: 0.15,
    idleWatt: 40,
    activeMultiplier: 0.25,
  },
  air_purifier: {
    name: "공기청정기",
    defaultRatedWatt: 45,
    dailyHours: 16,
    dutyCycle: 0.70,
    idleWatt: 2,
    activeMultiplier: 0.65,
  },
  robot_cleaner: {
    name: "로봇청소기",
    defaultRatedWatt: 60,
    dailyHours: 2,
    dutyCycle: 0.80,
    idleWatt: 3,
    activeMultiplier: 0.75,
  },
  default: {
    name: "일반가전",
    defaultRatedWatt: 150,
    dailyHours: 4,
    dutyCycle: 0.5,
    idleWatt: 3,
    activeMultiplier: 0.5,
  },
};

function normalizeCategoryKey(cat = "") {
  const c = String(cat).toLowerCase().trim();
  if (c.includes("냉온수기") || c.includes("정수기") || c.includes("water")) return "water_dispenser";
  if (c.includes("에어컨") || c.includes("air_conditioner")) return "air_conditioner";
  if (c.includes("냉장고") || c.includes("refrigerator")) return "refrigerator";
  if (c.includes("세탁기") || c.includes("washer")) return "washer";
  if (c.includes("tv") || c.includes("티비") || c.includes("텔레비전")) return "tv";
  if (c.includes("밥솥") || c.includes("cooker")) return "cooker";
  if (c.includes("청정기") || c.includes("purifier")) return "air_purifier";
  if (c.includes("로봇") || c.includes("cleaner")) return "robot_cleaner";
  return "default";
}

// 7. 제원표 기반 전력 추론 함수 (Export 필수)
export function inferDevicePowerUsage(input = {}, targetMonth = new Date().getMonth() + 1) {
  const categoryKey = normalizeCategoryKey(input.category || input.name);
  const profile = APPLIANCE_PROFILES[categoryKey] || APPLIANCE_PROFILES.default;

  let ratedWatt = profile.defaultRatedWatt;
  const rawPower = input.specs?.powerConsumption || input.powerConsumption || input.ratedWatt;

  if (rawPower) {
    if (typeof rawPower === "number") {
      ratedWatt = rawPower;
    } else {
      const matches = String(rawPower).match(/\d+(\.\d+)?/g);
      if (matches && matches.length > 0) {
        if (matches.length >= 2 && (categoryKey === "water_dispenser" || String(rawPower).includes("가열"))) {
          ratedWatt = Number(matches[0]) + Number(matches[1]);
        } else {
          ratedWatt = Number(matches[0]);
        }
      }
    }
  }

  const grade = Number(input.energyGrade || input.releaseEnergyGrade) || 2;
  const gradePenalty = 1 + Math.max(0, (grade - 1) * 0.08);

  const simulatedCurrentPower = Math.round(
    ratedWatt * profile.activeMultiplier * gradePenalty
  );

  const activeHours = profile.dailyHours;
  const idleHours = Math.max(0, 24 - activeHours);
  const dailyActiveWh = ratedWatt * activeHours * profile.dutyCycle * gradePenalty;
  const dailyIdleWh = profile.idleWatt * idleHours;
  const dailyKWh = (dailyActiveWh + dailyIdleWh) / 1000;

  const monthlyUsageKWh = Math.round(dailyKWh * 30 * 10) / 10;
  const singleDeviceBill = calculateKepcoBill(monthlyUsageKWh, targetMonth);

  return {
    categoryKey,
    categoryName: profile.name,
    ratedWatt,
    currentPower: simulatedCurrentPower,
    monthlyUsageKWh,
    estimatedMonthlyBill: singleDeviceBill,
    dailyAverageHours: profile.dailyHours,
    dutyCyclePercent: Math.round(profile.dutyCycle * 100),
    formulaReason: `정격 ${ratedWatt}W 기준 하루 약 ${profile.dailyHours}시간 가동(가동률 ${Math.round(profile.dutyCycle * 100)}%) 및 ${grade}등급 효율 모델링 적용`,
  };
}