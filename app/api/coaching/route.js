export const runtime = "edge";

export async function POST(req) {
  try {
    const { messages, image, devices = [] } = await req.json();
    const lastMessage = messages?.[messages.length - 1]?.content || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response("⚠️ `.env.local`에 `GEMINI_API_KEY`가 설정되지 않았습니다.", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 1. Supabase 가전 현황 텍스트 조합
    const activeDevices = devices.filter((d) => d.status);
    const totalWatts = activeDevices.reduce(
      (sum, d) => sum + Number(d.currentPower || 0),
      0
    );
    const deviceSummary =
      devices.length > 0
        ? devices
            .map(
              (d) =>
                `- ${d.name} (${d.category}): ${d.status ? "가동 중" : "꺼짐"}, 소비전력 ${d.currentPower || 0}W, 월 예상요금 ₩${Number(d.monthlyCost || 0).toLocaleString()}`
            )
            .join("\n")
        : "등록된 가전 없음";

    // 2. 시스템 프롬프트 지침
    const systemPrompt = `당신은 HSGM 스마트홈 가전 에너지 관리 및 A/S AI 어시스턴트입니다.
현재 우리집 가전 실시간 현황:
${deviceSummary}
(실시간 총 소비전력: ${totalWatts}W / 가동 중인 기기: ${activeDevices.length}대)

[규칙]
1. 위 가전 현황 데이터를 기반으로 전기요금 질문에 구체적인 수치(원, W, kWh)를 들어 2~3문장으로 간결하고 전문적인 조언을 마크다운으로 작성하세요.
2. 사용자가 고장/에러코드 진단을 요청하거나 에러 사진을 보내면 아래 JSON 포맷으로만 응답하세요:
{"isDiagnosis": true, "diagnosisResult": {"code": "에러코드", "device": "기기명", "cause": "원인", "solution": "조치법", "phone": "1544-7777", "asUrl": "https://www.lge.co.kr/support"}}
3. 사용자가 제품 명판/라벨 스캔을 요청하면 아래 JSON 포맷으로만 응답하세요:
{"isRegistration": true, "registrationData": {"name": "기기명", "category": "air_conditioner", "brand": "제조사", "model": "모델명", "icon": "AirVent", "releaseEnergyGrade": 1, "releaseYear": "2024", "isSmartControl": true, "controlType": "wifi", "specs": {"powerConsumption": "1750W"}, "asInfo": {"phone": "1544-7777"}}}`;

    // 3. 컨텐츠 구성
    const parts = [];
    if (image && image.includes("base64,")) {
      const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
      const base64Data = image.split(",")[1];
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    parts.push({
      text: `${systemPrompt}\n\n사용자 질문: ${lastMessage || "현재 가전 상태를 점검해줘."}`,
    });

    // 4. 구글 최신 권장 모델 순차 시도 (gemini-3.6-flash 우선 호출)
    const targetModels = [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-2.0-flash",
    ];

    let replyText = "";
    let lastError = "";

    for (const model of targetModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
            }),
          }
        );

        const data = await res.json();
        if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          replyText = data.candidates[0].content.parts[0].text;
          break;
        } else {
          lastError = data?.error?.message || "응답 생성 실패";
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!replyText) {
      throw new Error(lastError || "모든 Gemini 모델 호출에 실패했습니다.");
    }

    // 5. 프론트엔드로 스트리밍 타이핑 전달
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = replyText.split("");
        for (let i = 0; i < chunks.length; i++) {
          controller.enqueue(encoder.encode(chunks[i]));
          await new Promise((r) => setTimeout(r, 6));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Coaching API Error:", error);
    return new Response(
      `⚠️ AI 통신 중 오류가 발생했습니다: ${error.message}`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}