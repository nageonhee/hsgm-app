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
    const buffer = Buffer.from(base64Data, "base64");

    const difyKey = process.env.DIFY_API_KEY;
    const difyUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    if (!difyKey) {
      return new Response(
        JSON.stringify({ success: false, error: "DIFY_API_KEY가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // 1. Dify 파일 업로드 API 호출
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
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
      const err = await uploadRes.json();
      throw new Error(err.message || "Dify 파일 업로드 실패");
    }

    const uploadData = await uploadRes.json();
    const fileId = uploadData.id;

    // 2. Dify 워크플로우 실행 API 호출
    const runRes = await fetch(`${difyUrl}/workflows/run`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${difyKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: {
          user_answers: JSON.stringify(answers || {})
        },
        response_mode: "blocking",
        user: "web-user",
        files: [
          {
            type: "image",
            transfer_method: "local_file",
            upload_file_id: fileId
          }
        ]
      })
    });

    if (!runRes.ok) {
      const err = await runRes.json();
      throw new Error(err.message || "Dify 워크플로우 실행 실패");
    }

    const runData = await runRes.json();
    const outputs = runData.data?.outputs;

    if (!outputs) {
      throw new Error("Dify 워크플로우 결과값이 없습니다.");
    }

    let result = {};

    // 3. Dify 출력값 파싱 (is_success 여부에 따른 분기)
    // 성공 시 model_data, 실패 시 question_data가 반환되는 아키텍처
    if (outputs.is_success === "true" || outputs.is_success === true || outputs.success_data || outputs.model_data) {
      const modelDataText = outputs.model_data || outputs.success_data;
      const parsed = typeof modelDataText === "string" ? JSON.parse(modelDataText) : modelDataText;
      
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
      const failDataText = outputs.question_data || outputs.fail_data;
      const parsed = typeof failDataText === "string" ? JSON.parse(failDataText) : failDataText;
      
      result = {
        isFinal: false,
        success: true,
        nextQuestion: parsed.next_question || "추가 정보가 필요합니다.",
        options: parsed.candidate_options || [],
        category: parsed.category || "",
        brand: parsed.manufacturer || "",
        reason: parsed.reason_if_failed || ""
      };

      // 실패 시 질문 데이터 즉시 반환
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

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