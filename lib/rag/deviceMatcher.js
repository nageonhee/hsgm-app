import catalogData from "@/data/appliance_catalog.json";
import { keaService } from "@/services/keaService";
import { evaluateDeviceGrade } from "@/lib/energyGrade";

/**
 * 키워드 정규화 및 정리
 */
function cleanText(str) {
  if (!str) return "";
  return String(str).toUpperCase().replace(/[^A-Z0-9가-힣]/g, "");
}

export const deviceMatcher = {
  /**
   * 1단계: 내부 공인 카탈로그 + KEA 공공 API 하이브리드 매칭
   */
  async matchAppliance(extractedInfo) {
    const rawModel = extractedInfo.model || "";
    const rawBrand = extractedInfo.brand || "";
    const rawCategory = extractedInfo.category || "";
    const rawName = extractedInfo.name || "";

    const cleanM = cleanText(rawModel);
    const cleanB = cleanText(rawBrand);
    const cleanN = cleanText(rawName);

    // 1-A. 내부 카탈로그에서 모델 프리픽스 매칭 (0ms)
    for (const item of catalogData) {
      // 1) modelPrefix 배열 매칭
      if (item.modelPrefix && Array.isArray(item.modelPrefix)) {
        for (const prefix of item.modelPrefix) {
          const cleanP = cleanText(prefix);
          if (cleanM.includes(cleanP) || cleanN.includes(cleanP)) {
            return { matchType: "catalog_prefix", item };
          }
        }
      }

      // 2) 브랜드 + 카테고리 일치 매칭
      const itemBrand = cleanText(item.brand);
      const itemCat = cleanText(item.category);
      if (
        (cleanB.includes(itemBrand) || cleanN.includes(itemBrand)) &&
        (cleanCategoryMatch(rawCategory, item.category) || cleanN.includes(cleanText(item.name)))
      ) {
        return { matchType: "catalog_brand_category", item };
      }
    }

    // 1-B. 한국에너지공단(KEA) 실시간 OpenAPI 조회
    if (rawModel && rawModel.length >= 3) {
      try {
        const keaResult = await keaService.searchDeviceByModel(rawModel);
        if (keaResult) {
          return { matchType: "kea_api", item: keaResult };
        }
      } catch (e) {
        // 무시
      }
    }

    return null;
  },

  /**
   * 2단계: 누락/모호한 슬롯 감지 및 대화형 역질문 생성
   */
  generateClarificationOrFinal(extractedInfo, matchedResult) {
    // 매칭된 카탈로그 항목이 있는 경우
    if (matchedResult && matchedResult.item) {
      const item = matchedResult.item;

      // 하위 파생 모델(용량/평형/형태 등)이 복수 개 존재하는 경우 ➔ 역질문 생성
      if (item.subModels && Array.isArray(item.subModels) && item.subModels.length > 1) {
        // 이미 사용자가 답변에서 특정 서브모델을 확정했는지 검사
        const userAnswersStr = cleanText(JSON.stringify(extractedInfo.answers || ""));
        const matchedSub = item.subModels.find(
          (sub) =>
            userAnswersStr.includes(cleanText(sub.id)) ||
            userAnswersStr.includes(cleanText(sub.capacity)) ||
            userAnswersStr.includes(cleanText(sub.label))
        );

        if (matchedSub) {
          // 사용자가 역질문 선택지를 선택하여 확정된 경우
          return {
            status: "complete",
            device: this.buildFinalDevice(item, matchedSub, extractedInfo),
          };
        }

        // 역질문과 퀵 선택지 칩 생성
        return {
          status: "needs_clarification",
          matchedBrand: item.brand,
          matchedName: item.name,
          category: item.category,
          question: `${item.brand} ${item.name} 라인업을 확인했습니다! 세부 모델/용량을 선택해주세요:`,
          options: item.subModels.map((sub) => ({
            id: sub.id,
            label: sub.label,
            capacity: sub.capacity,
            powerConsumption: sub.powerConsumption,
            monthlyUsageKWh: sub.monthlyUsageKWh,
            monthlyCost: sub.monthlyCost,
            releaseEnergyGrade: sub.releaseEnergyGrade,
          })),
          partialDevice: {
            brand: item.brand,
            name: item.name,
            model: extractedInfo.model || item.modelPrefix?.[0] || "MODEL-SCAN",
            category: item.category,
            icon: item.icon,
            asInfo: item.asInfo,
            consumables: item.consumables,
          },
        };
      }

      // 단일 모델이거나 KEA API 직접 결과인 경우 ➔ 즉시 완성
      const sub = item.subModels?.[0] || {};
      return {
        status: "complete",
        device: this.buildFinalDevice(item, sub, extractedInfo),
      };
    }

    // 매칭 실패 시 ➔ Gemini Vision 추출 데이터를 바탕으로 기본 완성
    const defaultGrade = extractedInfo.energyGrade || 1;
    const finalDev = evaluateDeviceGrade({
      name: extractedInfo.name || "스마트 가전",
      brand: extractedInfo.brand || "기타",
      model: extractedInfo.model || "MODEL-" + Date.now().toString().slice(-4),
      category: extractedInfo.category || "air_conditioner",
      icon: extractedInfo.icon || "Zap",
      status: false,
      currentPower: 0,
      monthlyUsageKWh: Number(extractedInfo.monthlyUsageKWh || 35),
      monthlyCost: Number(extractedInfo.monthlyCost || 8500),
      annualEstimatedCost: Number(extractedInfo.monthlyCost || 8500) * 12,
      energyGrade: defaultGrade,
      releaseEnergyGrade: defaultGrade,
      releaseYear: extractedInfo.releaseYear || "2024",
      specs: {
        powerConsumption: extractedInfo.power || extractedInfo.powerConsumption || "공인 표준",
        releaseYear: extractedInfo.releaseYear || "2024",
        ...(extractedInfo.specs || {}),
      },
      asInfo: extractedInfo.asInfo || {
        center: "공식 서비스센터",
        phone: "1544-7777",
        siteUrl: "https://www.lge.co.kr",
      },
      consumables: extractedInfo.consumables || [],
    });

    return {
      status: "complete",
      device: finalDev,
    };
  },

  /**
   * 최종 확정된 기기 객체 빌드 (에너지 효율 등급 자동 동기화 포함)
   */
  buildFinalDevice(item, subModel, extractedInfo) {
    const rawReleaseGrade = subModel.releaseEnergyGrade || item.releaseEnergyGrade || extractedInfo.energyGrade || 1;
    const rawReleaseYear = subModel.releaseYear || item.releaseYear || extractedInfo.releaseYear || "2024";

    const baseDev = {
      name: `${item.brand} ${item.name} (${subModel.capacity || subModel.label || ""})`.trim(),
      brand: item.brand || extractedInfo.brand || "제조사",
      model: extractedInfo.model || item.modelPrefix?.[0] || "MODEL-" + Date.now().toString().slice(-4),
      category: item.category || extractedInfo.category || "air_conditioner",
      icon: item.icon || "Zap",
      status: false,
      currentPower: 0,
      monthlyUsageKWh: subModel.monthlyUsageKWh || item.monthlyUsageKWh || 35.0,
      monthlyCost: subModel.monthlyCost || item.monthlyCost || 8800,
      annualEstimatedCost: (subModel.monthlyCost || item.monthlyCost || 8800) * 12,
      releaseEnergyGrade: rawReleaseGrade,
      energyGrade: rawReleaseGrade,
      releaseYear: rawReleaseYear,
      specs: {
        capacity: subModel.capacity || "표준 용량",
        powerConsumption: subModel.powerConsumption || item.powerConsumption || "공인 표준 전력",
        coolingCapacity: subModel.coolingCapacity,
        warrantyPeriod: subModel.warrantyPeriod || "제조사 무상 보증 10년",
        releaseYear: rawReleaseYear,
      },
      asInfo: item.asInfo || {
        center: "공식 고객센터",
        phone: "1544-7777",
        siteUrl: "https://www.lge.co.kr",
      },
      consumables: item.consumables || [],
    };

    return evaluateDeviceGrade(baseDev);
  },
};

function cleanCategoryMatch(cat1, cat2) {
  if (!cat1 || !cat2) return false;
  const c1 = cat1.toLowerCase().replace(/_/g, "");
  const c2 = cat2.toLowerCase().replace(/_/g, "");
  return c1 === c2 || c1.includes(c2) || c2.includes(c1);
}
