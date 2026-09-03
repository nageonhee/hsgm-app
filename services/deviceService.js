import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// UUID 형식 검증 함수
const isValidUUID = (str) => {
  if (!str || typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// DB 데이터(스네이크 케이스)를 프론트엔드 호환 규격(카멜 케이스)으로 자동 변환
const normalizeDevice = (d) => {
  if (!d) return d;
  return {
    ...d,
    isSmartControl: d.is_smart_control ?? d.isSmartControl ?? true,
    currentPower: d.current_power ?? d.currentPower ?? 0,
    monthlyCost: d.monthly_cost ?? d.monthlyCost ?? 0,
    monthlyUsage: d.monthly_usage_kwh ?? d.monthlyUsage ?? 0,
    energyGrade: d.energy_grade ?? d.energyGrade ?? 1,
    controlType: d.control_type ?? d.controlType ?? "wifi",
    asInfo: d.asInfo || {
      center: d.as_center_name,
      phone: d.as_phone,
      siteUrl: d.as_site_url,
    },
  };
};

// IoT 가전 카테고리별 가동 전력
const DEFAULT_POWER_WATTS = {
  air_conditioner: 1600,
  refrigerator: 140,
  washer: 800,
  tv: 120,
  cooker: 1000,
  air_purifier: 45,
  robot_cleaner: 35,
};

export const deviceService = {
  // 1. 가전 목록 조회 (가져오면서 프론트엔드 변수명으로 자동 정규화)
  async getDevices(userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from("devices")
          .select("*")
          .order("created_at", { ascending: true });

        if (userId && isValidUUID(userId)) {
          query = query.eq("user_id", userId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(normalizeDevice);
        }
        if (error) console.error("Supabase getDevices error:", error.message || error);
      } catch (e) {
        console.error("Database connection error:", e);
      }
    }
    return [];
  },

  // 2. 가전 추가
  async addDevice(deviceData, userId) {
    if (isSupabaseConfigured && supabase) {
      const payload = {
        name: deviceData.name,
        brand: deviceData.brand || "기타",
        model: deviceData.model || "MODEL-" + Date.now().toString().slice(-4),
        category: deviceData.category || "air_conditioner",
        icon: deviceData.icon || "Zap",
        status: false,
        current_power: 0,
        energy_grade: deviceData.releaseEnergyGrade || deviceData.energyGrade || 1,
        is_smart_control: true,
        control_type: deviceData.controlType || "wifi",
        specs: deviceData.specs || {},
        as_center_name: deviceData.asInfo?.center || deviceData.as_center_name,
        as_phone: deviceData.asInfo?.phone || deviceData.as_phone,
        as_site_url: deviceData.asInfo?.siteUrl || deviceData.as_site_url,
        state: deviceData.state || { temperature: 24, mode: "cool", fanSpeed: "auto" },
        user_id: isValidUUID(userId) ? userId : null,
      };

      const { data, error } = await supabase
        .from("devices")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return normalizeDevice(data);
    }
    return { id: "dev-" + Date.now(), ...deviceData };
  },

  // 3. 전원 토글 제어
  async updateDeviceStatus(id, newStatus, category) {
    const activeWatt = DEFAULT_POWER_WATTS[category] || 100;
    const currentPower = newStatus ? activeWatt : (category === "tv" ? 1 : 0);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("devices")
        .update({ status: newStatus, current_power: currentPower })
        .eq("id", id)
        .select()
        .single();

      if (error) console.error("Supabase updateStatus error:", error.message || error);
      return normalizeDevice(data);
    }
  },

  // 4. 세부 상태 제어
  async updateDeviceState(id, newStatePatch) {
    if (isSupabaseConfigured && supabase) {
      const { data: current } = await supabase
        .from("devices")
        .select("state")
        .eq("id", id)
        .single();

      const updatedState = { ...(current?.state || {}), ...newStatePatch };

      const { data, error } = await supabase
        .from("devices")
        .update({ state: updatedState })
        .eq("id", id)
        .select()
        .single();

      if (error) console.error("Supabase updateState error:", error.message || error);
      return normalizeDevice(data);
    }
  },

  // 5. 실시간 웹소켓 구독 (실시간 데이터도 정규화 처리)
  subscribeDevices(onUpdate) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const channel = supabase
      .channel("realtime-devices-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "devices" },
        (payload) => {
          if (payload.new) {
            payload.new = normalizeDevice(payload.new);
          }
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 6. 가전 삭제
  async deleteDevice(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("devices").delete().eq("id", id);
      if (error) console.error("Supabase delete error:", error.message || error);
    }
  },
};