import fs from "fs";
import path from "path";
import { deviceMatcher } from "@/lib/rag/deviceMatcher";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { image, answers, selectedOption, partialDevice } = await req.json();

    // 1. 사용자가 이미 역질문 선택지를 클릭하여 최종 확정하는 경우 (API 호출 0회, 0ms 즉시 응답)
    if (selectedOption && partialDevice) {
      const mergedDev = deviceMatcher.buildFinalDevice(
        { ...partialDevice, name: partialDevice.name || "스마트 가전" },
        selectedOption,
        { ...partialDevice, ...selectedOption }
      );

      return new Response(
        JSON.stringify({
          success: true,
          status: "complete",
          device: mergedDev,
        }),
        { headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "GEMINI_API_KEY가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    if (!image || !image.includes("base64,")) {
      return new Response(
        JSON.stringify({ success: false, error: "유효한 이미지 데이터가 없습니다." }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
    const base64Data = image.split(",")[1];

    // OCR 추출 프롬프트
    const promptText = `
너는 대한민국 가전제품 에너지 라벨 및 명판 OCR 전문가야.
업로드된 사진에서 다음 항목을 JSON으로 정확히 추출해줘:
1. brand: 제조사명 (예: 삼성전자, LG전자, 쿠쿠전자, 로보락, 다이슨 등)
2. model: 모델명 (예: RF85C9001AP, FQ18VBDWC2, FX24GNB, CRP-LHTR1010FW, KQ75QND90AFXKR 등 명판에 적힌 정확한 영문/숫자 코드)
3. name: 제품명 (예: 비스포크 4도어 냉장고, 휘센 타워 에어컨 등)
4. category: air_conditioner | refrigerator | washer | tv | cooker | air_purifier | robot_cleaner 중 하나
5. power: 정격 소비전력 (예: 1600W, 35.3kWh/월 등)
6. energyGrade: 에너지소비효율등급 숫자 (1~5)
7. releaseYear: 제조년월 또는 출시연도 (예: 2024)

반드시 순수 JSON 포맷으로만 응답해:
{
  "brand": "...",
  "model": "...",
  "name": "...",
  "category": "...",
  "power": "...",
  "energyGrade": 1,
  "releaseYear": "2024"
}
`;

    const envModel = process.env.GEMINI_MODEL;
    const targetModels = [
      ...(envModel ? [envModel] : []),
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.5-flash",
    ].filter((v, i, a) => a.indexOf(v) === i);

    let rawText = "";

    for (const model of targetModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: promptText },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            console.log(`[Gemini OCR ${model} 판독 성공]:`, rawText);
            break;
          }
        }
      } catch (e) {
        console.warn(`[Gemini Vision ${model} 통신 실패]:`, e.message);
      }
    }

    let extractedInfo = {};
    if (rawText) {
      try {
        const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        extractedInfo = JSON.parse(cleanJson);
      } catch (e) {
        console.warn("JSON 파싱 오류:", e);
      }
    }

    // 2. 한국에너지공단(KEA) + 공인 카탈로그 RAG 매칭 실행
    const matched = await deviceMatcher.matchAppliance(extractedInfo);

    // 3. 누락 슬롯 검사 및 역질문/선택지 생성
    const result = deviceMatcher.generateClarificationOrFinal(extractedInfo, matched);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err) {
    console.error("Device Scan API Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "서버 처리 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}