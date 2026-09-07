import fs from "fs";
import path from "path";
import { keaService } from "@/services/keaService";
import { evaluateDeviceGrade } from "@/lib/energyGrade";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { image, answers = {} } = await req.json();

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

    // 1. 전문 계층형 AI Vision 프롬프트 로드
    const promptPath = path.join(process.cwd(), "prompts", "device_scan_prompt.md");
    let promptContent = fs.readFileSync(promptPath, "utf8");

    // 사용자의 이전 답변 주입
    if (answers && Object.keys(answers).length > 0) {
      promptContent += `\n\n[사용자의 이전 단계 답변 내역 (User Answers)]:\n${JSON.stringify(
        answers,
        null,
        2
      )}\n\n위 답변들을 바탕으로 다음으로 좁힐 세부 질문(nextQuestion)을 만들거나, 충분히 특정되었다면 isFinal: true로 최종 상세 제원과 성능을 완성하세요.`;
    }

    const envModel = process.env.GEMINI_MODEL;
    const targetModels = [
      ...(envModel ? [envModel] : []),
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ].filter((v, i, a) => a.indexOf(v) === i);

    let rawText = "";

    for (const modelName of targetModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: promptContent },
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
            console.log(`[Gemini Vision ${modelName} 판독 성공]:`, rawText.slice(0, 150));
            break;
          }
        } else {
          const err = await res.json();
          console.warn(`[Gemini Vision ${modelName} 호출 실패]:`, err?.error?.message);
        }
      } catch (e) {
        console.warn(`[Gemini Vision ${modelName} 통신 오류]:`, e.message);
      }
    }

    if (!rawText) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "이미지 분석에 실패했습니다. 사진을 다시 촬영해 주세요.",
        }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    let result = JSON.parse(cleanJson);

    // 2. 최종 모델이 확정된 경우 (isFinal: true), 한국에너지공단 실시간 OpenAPI로 제원 정밀 검증
    if (result.isFinal) {
      const modelName = result.model || result.name || "";
      if (modelName.length >= 3) {
        try {
          const keaData = await keaService.searchDeviceByModel(modelName);
          if (keaData) {
            // 공단 실측 데이터가 있으면 공식 제원으로 정밀 보정
            result.energyGrade = keaData.energyGrade || result.energyGrade;
            result.releaseEnergyGrade = keaData.releaseEnergyGrade || result.energyGrade;
            result.specs = {
              ...(result.specs || {}),
              powerConsumption: keaData.powerConsumption || result.power,
              keaSource: keaData.source,
            };
          }
        } catch (e) {
          console.warn("KEA 정밀 보정 패스:", e.message);
        }
      }

      // 3. 한국에너지공단 고시 기준 에너지 효율 등급 평가 적용
      const evaluated = evaluateDeviceGrade({
        name: result.name,
        brand: result.brand,
        model: result.model,
        category: result.category || "air_conditioner",
        icon: result.icon || "Zap",
        status: false,
        currentPower: 0,
        monthlyUsageKWh: Number(result.monthlyUsageKWh || 35),
        monthlyCost: Number(result.monthlyCost || 8500),
        annualEstimatedCost: Number(result.monthlyCost || 8500) * 12,
        energyGrade: result.energyGrade || 1,
        releaseEnergyGrade: result.releaseEnergyGrade || result.energyGrade || 1,
        releaseYear: result.releaseYear || result.specs?.releaseYear || "2024",
        specs: result.specs || {},
        asInfo: result.asInfo || {
          center: `${result.brand || "제조사"} 공식 서비스센터`,
          phone: "1544-7777",
          siteUrl: "https://www.lge.co.kr",
        },
        consumables: result.consumables || [],
      });

      result = {
        ...result,
        ...evaluated,
        success: true,
        isFinal: true,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    console.error("Device Scan API Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "서버 처리 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}