/**
 * 한국에너지공단(KEA) 공공데이터 OpenAPI 통합 클라이언트
 * 1. 고효율 에너지기자재 인증제품 정보 (B553530/CRTIF)
 * 2. 효율관리기자재 신고제품 정보 (B553530/eep)
 */

export const keaService = {
  /**
   * 한국에너지공단 공공 API에서 모델명/제조사로 제품 효율 및 소비전력 제원 검색
   * @param {string} modelName - 검색할 가전 모델명
   */
  async searchDeviceByModel(modelName) {
    if (!modelName || modelName.trim().length < 2) return null;

    const rawKey = process.env.KEA_API_KEY;
    if (!rawKey) {
      return null;
    }

    try {
      const cleanKey = decodeURIComponent(rawKey);
      const encodedKey = encodeURIComponent(cleanKey);
      const cleanQuery = encodeURIComponent(modelName.trim());

      // 한국에너지공단 공식 OpenAPI 엔드포인트 목록
      const candidateUrls = [
        // 1. 고효율 에너지기자재 인증제품 정보 (CRTIF)
        `https://apis.data.go.kr/B553530/CRTIF/getCrtifList?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&modelNm=${cleanQuery}&_type=json`,
        `https://apis.data.go.kr/B553530/CRTIF/search?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&keyword=${cleanQuery}&_type=json`,
        `https://apis.data.go.kr/B553530/CRTIF/getCrtifSearchList?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&model=${cleanQuery}&_type=json`,
        // 2. 효율관리기자재 운용규정 신고제품 정보 (eep)
        `https://apis.data.go.kr/B553530/eep/search?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&keyword=${cleanQuery}&_type=json`,
        `https://apis.data.go.kr/B553530/eep/getEepSearchList?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&modelNm=${cleanQuery}&_type=json`,
        `https://apis.data.go.kr/B553530/eep/getEepList?serviceKey=${encodedKey}&pageNo=1&numOfRows=5&model=${cleanQuery}&_type=json`,
      ];

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            headers: { Accept: "application/json" },
            next: { revalidate: 3600 },
          });

          if (!res.ok) continue;

          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            continue;
          }

          const items =
            data?.response?.body?.items?.item ||
            data?.body?.items?.item ||
            data?.items ||
            data?.data ||
            [];

          const list = Array.isArray(items) ? items : items ? [items] : [];

          if (list.length > 0) {
            const item = list[0];
            const effGrade = parseInt(item.effLvl || item.grade || item.gradeNm || item.crtifGrade || "1", 10) || 1;
            const power = item.csmPwr || item.powerConsumption || item.capa || item.ratedPwr || "";
            const monUsage = parseFloat(item.monCsmPwr || item.monthlyUsage || "0") || 35.0;
            const isCertified = url.includes("CRTIF") || item.crtifNo != null;

            return {
              brand: item.entrpsNm || item.makerNm || item.brand || item.coNm || "국내 공인 제조사",
              model: item.modelNm || item.model || modelName,
              name: `${item.entrpsNm || item.makerNm || ""} ${item.modelNm || modelName}`.trim(),
              category: item.prdlstNm || item.category || item.itemNm || "고효율 가전",
              energyGrade: effGrade,
              releaseEnergyGrade: effGrade,
              powerConsumption: power ? `${power}W` : "공인 표준 전력",
              monthlyUsageKWh: monUsage,
              monthlyCost: Math.round(monUsage * 250),
              releaseYear: item.authDate ? item.authDate.slice(0, 4) : item.crtifDate ? item.crtifDate.slice(0, 4) : "2024",
              isHighEfficiencyCertified: isCertified,
              source: isCertified
                ? "한국에너지공단(KEA) 고효율 에너지기자재 공식 인증"
                : "한국에너지공단(KEA) 효율관리기자재 공공데이터",
            };
          }
        } catch (subErr) {
          // 다음 URL 순차 시도
        }
      }
    } catch (e) {
      console.warn("한국에너지공단 OpenAPI 연동 에러:", e.message);
    }

    return null;
  },
};
