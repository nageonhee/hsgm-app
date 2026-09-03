// 대한민국 한국전력공사(KEPCO) 주택용(저압) 전력 요금표 기준
export const KEPCO_STAGES = [
  { stage: 1, range: "200 kWh 이하", limit: 200, baseRate: 910, ratePerKWh: 120.0 },
  { stage: 2, range: "201 ~ 400 kWh", limit: 400, baseRate: 1600, ratePerKWh: 214.6 },
  { stage: 3, range: "400 kWh 초과", limit: Infinity, baseRate: 7300, ratePerKWh: 307.3 },
];

/**
 * 전력 소비량(kWh)에 따른 한전 공식 전기요금 계산기
 */
export function calculateKepcoBill(kwh) {
  if (!kwh || kwh <= 0) return 0;
  const usage = Math.round(Number(kwh) * 10) / 10;

  // 1. 기본요금 결정
  let baseRate = 910;
  if (usage > 400) baseRate = 7300;
  else if (usage > 200) baseRate = 1600;

  // 2. 누진 구간별 전력량요금 계산
  let energyRate = 0;
  if (usage <= 200) {
    energyRate = usage * 120.0;
  } else if (usage <= 400) {
    energyRate = 200 * 120.0 + (usage - 200) * 214.6;
  } else {
    energyRate = 200 * 120.0 + 200 * 214.6 + (usage - 400) * 307.3;
  }

  // 3. 기후환경요금(9.0원/kWh) & 연료비조정액(5.0원/kWh)
  const climateRate = usage * 9.0;
  const fuelRate = usage * 5.0;

  // 4. 전기요금계
  const subtotal = baseRate + energyRate + climateRate + fuelRate;

  // 5. 부가가치세(10%) 및 전력산업기반기금(3.7%, 10원 미만 절사)
  const vat = Math.round(subtotal * 0.1);
  const fund = Math.floor((subtotal * 0.037) / 10) * 10;

  // 6. 최종 청구금액 (10원 미만 절사)
  return Math.floor((subtotal + vat + fund) / 10) * 10;
}