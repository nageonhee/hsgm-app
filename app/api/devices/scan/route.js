import fs from 'fs';
import path from 'path';

// Node.js 환경에서 fs 모듈을 사용해 프롬프트 파일을 읽어오기 위해 edge 런타임을 제거합니다.
// export const runtime = "edge";

export async function POST(req) {
  try {
    const { image, answers } = await req.json();
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

    // 대화형 계층 탐색(Narrow-down) 프롬프트 로드
    const promptPath = path.join(process.cwd(), 'prompts', 'device_scan_prompt.md');
    let promptContent = fs.readFileSync(promptPath, 'utf8');

    // 사용자의 이전 단계 응답이 있으면 프롬프트에 컨텍스트로 추가 주입
    if (answers && Object.keys(answers).length > 0) {
      promptContent += `\n\n[사용자의 이전 단계 답변 내역 (User Answers)]:\n${JSON.stringify(answers, null, 2)}\n\n위 답변들을 바탕으로 다음으로 좁힐 세부 질문(nextQuestion)을 만들거나, 충분히 특정되었다면 isFinal: true로 최종 상세 제원과 성능을 완성하세요.`;
    }

    const envModel = process.env.GEMINI_MODEL;
    const targetModels = [
      ...(envModel ? [envModel] : []),
      "gemini-3.6-flash",
      "gemini-3.6",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
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