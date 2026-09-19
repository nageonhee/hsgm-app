import { keaService } from "@/services/keaService";
import { evaluateDeviceGrade } from "@/lib/energyGrade";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(req) {
  let requestData;
  try {
    requestData = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request payload" }), { status: 400 });
  }

  const { image, answers = {} } = requestData;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (type, data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`));
        } catch (e) {}
      };
      
      const sendError = (errorMsg) => {
        sendEvent("error", { error: errorMsg });
        try { controller.close(); } catch (e) {}
      };

      try {
        // 프록시(Vercel, Nginx) 버퍼 강제 비우기용 패딩 전송
        controller.enqueue(encoder.encode(`: ${" ".repeat(4096)}\n\n`));
        
        sendEvent("progress", { message: "서버 초기 설정 및 이미지 디코딩 중..." });

        const apiKey = process.env.GEMINI_API_KEY;
        const difyKey = process.env.DIFY_API_KEY;
        const difyUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

        if (!difyKey) return sendError("DIFY_API_KEY가 설정되지 않았습니다.");
        if (!image || !image.includes("base64,")) return sendError("유효한 이미지 데이터가 없습니다.");

        const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
        const base64Data = image.split(",")[1];
        
        // Edge Runtime compatible base64 decoding
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });

        sendEvent("progress", { message: "Dify 서버로 이미지 업로드 중..." });

        // 1. Dify 파일 업로드 API 호출
        const formData = new FormData();
        formData.append("file", blob, "image.jpg");
        formData.append("user", "web-user");

        const uploadRes = await fetch(`${difyUrl}/files/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${difyKey}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          return sendError(err.message || "Dify 파일 업로드 실패");
        }

        const uploadData = await uploadRes.json();
        const fileId = uploadData.id;

        sendEvent("progress", { message: "AI 비전 모델 초기화 중..." });

        // 2. Dify 워크플로우 실행 API 호출 (Streaming 모드)
        const runRes = await fetch(`${difyUrl}/workflows/run`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${difyKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: {
              user_answers: JSON.stringify(answers || {}),
              image: {
                transfer_method: "local_file",
                upload_file_id: fileId,
                type: "image"
              }
            },
            response_mode: "streaming",
            user: "web-user"
          })
        });

        if (!runRes.ok) {
          const err = await runRes.json().catch(() => ({}));
          return sendError(err.message || "Dify 워크플로우 실행 실패");
        }

        // SSE 스트림 리더
        const reader = runRes.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let bufferStr = "";
        let finalOutputs = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          bufferStr += decoder.decode(value, { stream: true });
          const lines = bufferStr.split('\n');
          bufferStr = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (!dataStr) continue;
              
              try {
                const eventData = JSON.parse(dataStr);
                
                if (eventData.event === "node_started") {
                  let title = eventData.data?.title || "분석";
                  // 사용자에게 보여줄 노드명 정제
                  if (title.includes("Vision") || title.includes("Start")) title = "가전제품 정밀 시각 판독";
                  else if (title.includes("Fact")) title = "스펙 팩트 체크 및 수집";
                  else if (title.includes("Consultant") || title.includes("Question")) title = "추가 좁혀가기 질문 생성";
                  else if (title.includes("Condition") || title.includes("Branch")) title = "결과 분기 판정";
                  
                  sendEvent("progress", { message: `${title} 중...` });
                }
                
                if (eventData.event === "workflow_finished") {
                  sendEvent("progress", { message: "결과 데이터 취합 중..." });
                  finalOutputs = eventData.data?.outputs;
                }
                
                if (eventData.event === "error" || eventData.event === "workflow_failed") {
                  const errorMsg = eventData.error || eventData.data?.error || eventData.message || "Dify 내부 실행 중 에러가 발생했습니다.";
                  return sendError(errorMsg);
                }
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }

        if (!finalOutputs) {
          return sendError("Dify 워크플로우가 종료되었으나 결과값이 없습니다.");
        }

        let result = {};

        // 3. Dify 출력값 파싱
        if (finalOutputs.is_success === "true" || finalOutputs.is_success === true || finalOutputs.success_data || finalOutputs.model_data) {
          let modelDataText = finalOutputs.model_data || finalOutputs.success_data;
          
          if (!modelDataText) return sendError("분석에 성공했으나 스펙 데이터가 없습니다.");

          let parsed = {};
          try {
            if (typeof modelDataText === "string") {
              modelDataText = modelDataText.replace(/```json/gi, "").replace(/```/g, "").trim();
              parsed = JSON.parse(modelDataText);
            } else {
              parsed = modelDataText;
            }
          } catch(err) {
            return sendError("스펙 데이터를 파싱할 수 없습니다: " + err.message);
          }
          
          result = {
            ...parsed,
            isFinal: true,
            name: parsed.exact_model_name || "",
            brand: parsed.manufacturer || "",
            category: parsed.category || "air_conditioner",
            power: parsed.power_consumption || "",
            energyGrade: Number(parsed.energy_efficiency) || 1,
            consumables: parsed.consumables || [],
            asInfo: {
              center: parsed.as_info?.center_name || `${parsed.manufacturer || "제조사"} 고객센터`,
              phone: parsed.as_info?.phone || "",
              siteUrl: parsed.as_info?.site_url || ""
            },
            manualUrl: parsed.manual_url || "",
            releaseYear: parsed.purchase_year || "2024",
          };
        } else {
          let failDataText = finalOutputs.question_data || finalOutputs.fail_data;
          
          if (!failDataText) return sendError("분석에 실패했거나 반환된 결과가 없습니다. 사진을 다시 찍어주세요.");

          let parsed = {};
          try {
            if (typeof failDataText === "string") {
              failDataText = failDataText.replace(/```json/gi, "").replace(/```/g, "").trim();
              parsed = JSON.parse(failDataText);
            } else {
              parsed = failDataText;
            }
          } catch (err) {
            return sendError("질문 데이터를 파싱할 수 없습니다: " + err.message);
          }
          
          result = {
            isFinal: false,
            success: true,
            nextQuestion: parsed.next_question || "추가 정보가 필요합니다.",
            options: parsed.candidate_options || [],
            category: parsed.category || "",
            brand: parsed.manufacturer || "",
            reason: parsed.reason_if_failed || ""
          };

          sendEvent("final", { result });
          return controller.close();
        }

        // 4. 에너지 공단 연동 및 최종 보정
        if (result.isFinal) {
          sendEvent("progress", { message: "한국에너지공단 표준 데이터 실시간 대조 중..." });
          
          const modelName = result.model || result.name || "";
          if (modelName.length >= 3) {
            try {
              const keaData = await keaService.searchDeviceByModel(modelName);
              if (keaData) {
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

          sendEvent("progress", { message: "최종 예상 전기요금 시뮬레이션 중..." });

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
            asInfo: result.asInfo,
            consumables: result.consumables || [],
          });

          result = {
            ...result,
            ...evaluated,
            success: true,
            isFinal: true,
          };
        }

        sendEvent("final", { result });
        controller.close();
      } catch (err) {
        console.error("Device Scan API Error:", err);
        sendError(err.message || "서버 처리 오류가 발생했습니다.");
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}