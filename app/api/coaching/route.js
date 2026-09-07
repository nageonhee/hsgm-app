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

    // 4. env 파일 지정 모델 사용 (기본값 gemini-2.0-flash)
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    // 5. 구글 Gemini API 실시간 SSE 스트리밍 호출
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => null);
      const errMsg = errData?.error?.message || `Gemini API 호출 실패 (${geminiRes.status})`;
      throw new Error(errMsg);
    }

    // 6. Gemini SSE 응답을 실시간으로 디코딩하여 프론트엔드로 파이프 전달
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                const jsonStr = trimmed.slice(6);
                if (jsonStr === "[DONE]") continue;
                try {
                  const data = JSON.parse(jsonStr);
                  const textChunk = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textChunk) {
                    controller.enqueue(encoder.encode(textChunk));
                  }
                } catch (e) {
                  // 파싱 미완성 잔여 조각 무시
                }
              }
            }
          }

          if (buffer.trim().startsWith("data: ")) {
            const jsonStr = buffer.trim().slice(6);
            if (jsonStr !== "[DONE]") {
              try {
                const data = JSON.parse(jsonStr);
                const textChunk = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  controller.enqueue(encoder.encode(textChunk));
                }
              } catch (e) {}
            }
          }
        } catch (streamErr) {
          console.error("Gemini Streaming Error:", streamErr);
        } finally {
          controller.close();
        }
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