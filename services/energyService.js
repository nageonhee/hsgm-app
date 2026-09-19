import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// DB 스네이크 케이스 데이터를 차트 라이브러리(카멜 케이스) 호환 규격으로 변환
const normalizeEnergyLog = (log) => {
  if (!log) return log;

  // 기록 시각을 "14:00" 형태의 레이블로 변환
  const date = new Date(log.recorded_at);
  const timeLabel = `${String(date.getHours()).padStart(2, "0")}:00`;

  return {
    id: log.id,
    recordedAt: log.recorded_at,
    time: timeLabel,
    totalPowerKw: Number(log.total_power_kw || 0),
    breakdown: log.device_power_breakdown || {},
    // 가전별 세부 전력 분해 (차트 스택용)
    airConditioner: Number(log.device_power_breakdown?.air_conditioner || 0),
    refrigerator: Number(log.device_power_breakdown?.refrigerator || 0),
    washer: Number(log.device_power_breakdown?.washer || 0),
    tv: Number(log.device_power_breakdown?.tv || 0),
    others: Number(log.device_power_breakdown?.others || 0),
  };
};

export const energyService = {
  // 1. 최근 24시간 전력 로그 조회 (차트 렌더링용)
  async getRecentLogs(limit = 24) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("energy_logs")
          .select("*")
          .order("recorded_at", { ascending: true })
          .limit(limit);

        if (!error && data) {
          return data.map(normalizeEnergyLog);
        }
        if (error) console.error("Supabase getEnergyLogs error:", error.message || error);
      } catch (e) {
        console.error("Energy logs connection error:", e);
      }
    }
    return [];
  },

  // 2. 가장 최신 전력 상태 1건 조회
  async getLatestLog() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("energy_logs")
          .select("*")
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          return normalizeEnergyLog(data);
        }
      } catch (e) {
        console.error("Latest energy log error:", e);
      }
    }
    return null;
  },
};