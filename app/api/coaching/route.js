import fs from 'fs';
import path from 'path';

// Node.js 환경에서 fs 모듈을 사용해 프롬프트 파일을 읽어오기 위해 edge 런타임을 제거합니다.
// export const runtime = "edge";

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

    // 2. 시스템 프롬프트 지침 동적 로딩
    const promptPath = path.join(process.cwd(), 'prompts', 'coaching_prompt.md');
    let systemPrompt = fs.readFileSync(promptPath, 'utf8');
    
    // 플레이스홀더 치환
    systemPrompt = systemPrompt
      .replace('{{DEVICE_SUMMARY}}', deviceSummary)
      .replace('{{TOTAL_WATTS}}', totalWatts)
      .replace('{{ACTIVE_COUNT}}', activeDevices.length);

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