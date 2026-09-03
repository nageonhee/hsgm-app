export const runtime = "edge";

export async function POST(req) {
  try {
    const { image } = await req.json();
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

    // 엄격한 사실 기반 Vision OCR 지침 (환각 유발 예시문구 완전 배제)
    const systemPrompt = `당신은 대한민국 가전제품 및 에너지효율등급 라벨을 사진으로 정확히 판독하는 실무 Vision OCR 엔진입니다.
제공된 이미지를 정밀 분석하여 '실제 사진 속에 존재하는 내용'만 사실대로 추출하세요.

[절대 규칙 - 환각(Hallucination) 금지]
1. 사진에 없는 내용이나 특정 가전(에어컨 등)을 임의로 지어내지 마세요.
2. 사진 속 가전이 냉장고면 냉장고, 전자레인지면 전자레인지, 선풍기면 선풍기, 모니터면 모니터로 실제 보이는 물체를 있는 그대로 인식하세요.
3. 라벨이나 제품에 인쇄된 텍스트(OCR)를 직접 읽어 브랜드(제조사)와 모델명을 식별하세요. 글자가 흐릿하여 모델명을 알 수 없다면 브랜드와 외형만 기재하고 모델명은 "미확인"으로 표기하세요.
4. 카테고리는 다음 중 가장 알맞은 하나로 분류하세요:
   air_conditioner, refrigerator, washer, tv, cooker, air_purifier, robot_cleaner, microwave, computer, other
5. 아이콘은 다음 중 매칭하세요:
   AirVent, Refrigerator, WashingMachine, Tv, Utensils, Wind, Disc, Zap, Monitor, Cpu
6. 에너지소비효율등급은 라벨에 숫자로 '1~5'가 명시되어 있을 때만 해당 등급을 숫자로 넣고, 라벨이 없거나 식별 불가시 0으로 표기하세요.

반드시 다른 부가 설명 없이 오직 순수한 JSON 객체 하나만 반환하세요:
{
  "success": true,
  "name": "사진 속 가전의 실제 명칭",
  "brand": "사진 속 제조사/브랜드",
  "model": "사진에서 추출된 실제 모델명",
  "category": "분류된 카테고리 영문키",
  "icon": "매칭된 아이콘 영문키",
  "energyGrade": 1,
  "releaseYear": "라벨에 표기된 제조년도 또는 미확인",
  "power": "소비전력 표기치",
  "monthlyUsageKWh": 0,
  "monthlyCost": 0,
  "specs": {
    "feature": "사진에서 실제로 식별된 외형적 특징"
  },
  "asInfo": {
    "center": "해당 브랜드 공식 서비스센터명",
    "phone": "해당 브랜드 대표 전화번호",
    "siteUrl": "공식 홈페이지"
  },
  "visionSummary": "사진에서 AI가 실제로 보고 판독한 시각적 근거 요약 (예: 회색 외형의 전자레인지 전면 도어와 다이얼 감지됨)"
}`;

    const targetModels = [
      "gemini-3.6-flash",
      "gemini-2.0-flash",
    ];

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
                    { text: systemPrompt },
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
            console.log(`[Gemini Vision ${model} 실제 판독 성공]:\n`, rawText);
            break;
          }
        } else {
          const err = await res.json();
          console.warn(`[Gemini Vision ${model} 호출 실패]:`, err?.error?.message);
        }
      } catch (e) {
        console.error(`[Gemini Vision ${model} 통신 오류]:`, e.message);
      }
    }

    if (!rawText) {
      return new Response(
        JSON.stringify({ success: false, error: "이미지 분석에 실패했습니다. 사진을 확인해 주세요." }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

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