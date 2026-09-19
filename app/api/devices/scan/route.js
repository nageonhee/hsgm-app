import { keaService } from "@/services/keaService";
import { evaluateDeviceGrade } from "@/lib/energyGrade";
import { inferDevicePowerUsage } from "@/lib/energyCalculator";

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
        try {
          controller.close();
        } catch (e) {}
      };

      try {
        // 프록시(Vercel, Nginx) 버퍼 강제 비우기용 패딩 전송
        controller.enqueue(encoder.encode(`: ${" ".repeat(4096)}\n\n`));

        sendEvent("progress", { message: "서버 초기화 및 가전 이미지 디코딩 중..." });

        const difyKey = process.env.DIFY_API_KEY;
        const difyUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

        if (!difyKey) {
          return sendError("DIFY_API_KEY가 설정되지 않았습니다. .env.local 설정을 확인해주세요.");
        }
        if (!image || !image.includes("base64,")) {
          return sendError("유효한 이미지 데이터가 없습니다.");
        }

        const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
        const base64Data = image.split(",")[1];

        // Edge Runtime 호환 Base64 바이너리 변환
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });

        sendEvent("progress", { message: "Dify 비전 서버로 제품 사진 전송 중..." });

        // 1. Dify 파일 업로드 API 호출
        const formData = new FormData();
        formData.append("file", blob, "device_scan.jpg");
        formData.append("user", "hsgm-user");

        const uploadRes = await fetch(`${difyUrl}/files/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${difyKey}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          return sendError(err.message || "Dify 파일 업로드에 실패했습니다.");
        }

        const uploadData = await uploadRes.json();
        const fileId = uploadData.id;

        sendEvent("progress", { message: "멀티모달 AI 비전 모델 분석 시작..." });

        // 2. Dify 워크플로우 실행 API 호출 (Streaming 모드)
        const runRes = await fetch(`${difyUrl}/workflows/run`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${difyKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: {
              user_answers: JSON.stringify(answers || {}),
              image: {
                transfer_method: "local_file",
                upload_file_id: fileId,
                type: "image",
              },
            },
            response_mode: "streaming",
            user: "hsgm-user",
          }),
        });

        if (!runRes.ok) {
          const err = await runRes.json().catch(() => ({}));
          return sendError(err.message || "Dify 워크플로우 실행에 실패했습니다.");
        }

        // SSE 스트림 파싱
        const reader = runRes.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let bufferStr = "";
        let finalOutputs = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          bufferStr += decoder.decode(value, { stream: true });
          const lines = bufferStr.split("\n");
          bufferStr = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (!dataStr) continue;

              try {
                const eventData = JSON.parse(dataStr);

                // Dify 세부 노드 진행 로그 스트리밍 (체감 대기시간 단축)
                if (eventData.event === "node_started") {
                  const nodeTitle = eventData.data?.title || "분석";
                  if (nodeTitle.includes("Vision") || nodeTitle.includes("사진") || nodeTitle.includes("판독")) {
                    sendEvent("progress", { message: "가전 외관 디자인 및 제조사 엠블럼 판독 중..." });
                  } else if (nodeTitle.includes("검색") || nodeTitle.includes("웹")) {
                    sendEvent("progress", { message: "네이버·다나와·쿠팡 15개 포털에서 제품 제원표 실시간 검색 중..." });
                  } else if (nodeTitle.includes("정리") || nodeTitle.includes("Consultant") || nodeTitle.includes("판정")) {
                    sendEvent("progress", { message: "수집된 제원 검증 및 세부 사양 추출 중..." });
                  } else {
                    sendEvent("progress", { message: `${nodeTitle} 단계 처리 중...` });
                  }
                }

                if (eventData.event === "workflow_finished") {
                  if (eventData.data?.status === "failed") {
                    const rawError = eventData.data?.error || "Dify 워크플로우가 실패했습니다.";
                    return sendError(`[Dify 에러] ${rawError}`);
                  }
                  sendEvent("progress", { message: "분석 결과 수신 완료 및 에너지 환산 준비 중..." });
                  finalOutputs = eventData.data?.outputs;
                }

                if (eventData.event === "error" || eventData.event === "workflow_failed") {
                  const rawError =
                    eventData.error ||
                    eventData.data?.error ||
                    eventData.message ||
                    "Dify 실행 중 에러가 발생했습니다.";
                  return sendError(`[Dify 에러] ${rawError}`);
                }
              } catch (e) {
                // 불완전한 청크 무시
              }
            }
          }
        }

        if (!finalOutputs) {
          return sendError("Dify 분석 워크플로우 응답 결과가 비어 있습니다.");
        }

        let result = {};

        // 3. Dify 출력값 판정 (모델 확정 vs 추가 질문 필요)
        const isSuccess =
          finalOutputs.is_success === "true" ||
          finalOutputs.is_success === true ||
          finalOutputs.is_model_found === true ||
          finalOutputs.is_model_found === "true" ||
          Boolean(finalOutputs.success_data || finalOutputs.model_data);

        if (isSuccess) {
          let modelDataText = finalOutputs.model_data || finalOutputs.success_data || finalOutputs;

          let parsed = {};
          try {
            if (typeof modelDataText === "string") {
              const cleaned = modelDataText.replace(/```json/gi, "").replace(/```/g, "").trim();
              parsed = JSON.parse(cleaned);
            } else {
              parsed = modelDataText;
            }
          } catch (err) {
            return sendError("제원 데이터를 파싱할 수 없습니다: " + err.message);
          }

          result = {
            ...parsed,
            isFinal: true,
            name: parsed.exact_model_name || parsed.model_name || parsed.name || "스마트 가전",
            brand: parsed.manufacturer || parsed.brand || "제조사",
            model: parsed.model || parsed.exact_model_name || "",
            category: parsed.category || "water_dispenser",
            power: parsed.power_consumption || parsed.power || "",
            energyGrade: Number(parsed.energy_efficiency || parsed.energyGrade) || 2,
            releaseEnergyGrade: Number(parsed.energy_efficiency || parsed.releaseEnergyGrade) || 2,
            releaseYear: String(parsed.purchase_year || parsed.releaseYear || "2023"),
            consumables: parsed.consumables || [],
            asInfo: {
              center: parsed.as_info?.center_name || `${parsed.manufacturer || "제조사"} 고객지원센터`,
              phone: parsed.as_info?.phone || "1544-7777",
              siteUrl: parsed.as_info?.site_url || "https://www.lge.co.kr",
            },
            manualUrl: parsed.manual_url || "",
          };
        } else {
          // 추가 질문이 필요한 경우 분기
          let failDataText = finalOutputs.question_data || finalOutputs.fail_data || finalOutputs;

          let parsed = {};
          try {
            if (typeof failDataText === "string") {
              const cleaned = failDataText.replace(/```json/gi, "").replace(/```/g, "").trim();
              parsed = JSON.parse(cleaned);
            } else {
              parsed = failDataText;
            }
          } catch (err) {
            return sendError("추가 질문 데이터를 파싱할 수 없습니다: " + err.message);
          }

          result = {
            isFinal: false,
            success: true,
            nextQuestion: parsed.next_question || "기기의 세부 구분을 위해 추가 확인이 필요합니다.",
            options: parsed.candidate_options || [],
            category: parsed.category || "",
            brand: parsed.manufacturer || "",
            reason: parsed.reason_if_failed || "",
          };

          sendEvent("final", { result });
          return controller.close();
        }

        // 4. 에너지공단 KEA 대조 & 제원표 기반 전력 추론 엔진 가동
        if (result.isFinal) {
          sendEvent("progress", { message: "한국에너지공단 표준 데이터 대조 중..." });

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
              console.warn("KEA 대조 패스:", e.message);
            }
          }

          sendEvent("progress", { message: "에너지 제원표 바탕 실제 전력 소비량 및 누진요금 추론 중..." });

          // ★ [핵심] 제원표 기반 전력 사용량 및 요금 추론 엔진 호출 ★
          const inferredPower = inferDevicePowerUsage({
            category: result.category,
            name: result.name,
            powerConsumption: result.power || result.specs?.powerConsumption,
            specs: result.specs || { powerConsumption: result.power },
            energyGrade: result.energyGrade,
            releaseEnergyGrade: result.releaseEnergyGrade,
          });

          // 에너지공단 개정 기준 등급 평가
          const evaluated = evaluateDeviceGrade({
            name: result.name,
            brand: result.brand,
            model: result.model,
            category: result.category,
            icon: result.icon || "Zap",
            status: false,
            currentPower: inferredPower.currentPower, // 실시간 추정 W (센서 대체)
            monthlyUsageKWh: inferredPower.monthlyUsageKWh, // 월간 추정 kWh
            monthlyCost: inferredPower.estimatedMonthlyBill, // 월간 예상 청구 요금(₩)
            annualEstimatedCost: inferredPower.estimatedMonthlyBill * 12,
            energyGrade: result.energyGrade,
            releaseEnergyGrade: result.releaseEnergyGrade,
            releaseYear: result.releaseYear,
            specs: {
              ...(result.specs || {}),
              powerConsumption: result.power || `${inferredPower.ratedWatt}W`,
              inferredDutyCycle: `${inferredPower.dutyCyclePercent}%`,
              inferredDailyHours: `${inferredPower.dailyAverageHours}시간`,
              formulaReason: inferredPower.formulaReason,
            },
            asInfo: result.asInfo,
            consumables: result.consumables,
          });

          result = {
            ...result,
            ...evaluated,
            powerInference: inferredPower,
            success: true,
            isFinal: true,
          };
        }

        sendEvent("progress", { message: "가전 등록 카드 완성!" });
        sendEvent("final", { result });
        controller.close();
      } catch (err) {
        console.error("Device Scan Route Error:", err);
        sendError(err.message || "서버 처리 중 오류가 발생했습니다.");
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}