"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { deviceService } from "@/services/deviceService";

// 심사위원 무마찰 체험 및 RLS 차단 대비 기본 고품질 프리셋 데이터 (총 7종)
export const DEFAULT_PRESET_DEVICES = [
  {
    id: "preset-aircon-01",
    name: "LG 휘센 아트 스탠드 에어컨 23평형",
    brand: "LG전자",
    category: "air_conditioner",
    model: "LP-C235PG",
    icon: "AirVent",
    status: true,
    currentPower: 1600,
    monthlyUsageKWh: 142.5,
    monthlyCost: 35600,
    annualEstimatedCost: 142000,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isPinned: true,
    createdAt: 1700000001000,
    specs: {
      area: "23평형 (75.9㎡)",
      powerConsumption: "1600W",
      releaseYear: "2024",
    },
    consumables: [
      {
        name: "극세필터 & 초미세먼지 플러스 필터",
        status: "교체 필요 (D-12)",
        price: 28900,
        buyUrl: "https://www.lge.co.kr/care-accessories/air-conditioner-filters",
        lowestPrice: "24,800원",
      },
    ],
    manualUrl: "https://www.lge.co.kr/support/manuals",
    asInfo: {
      center: "LG전자 서비스센터",
      phone: "1544-7777",
      siteUrl: "https://www.lge.co.kr/support/service-engineer-request",
      warrantyPeriod: "컴프레서 10년 / 일반 2년",
    },
    isProtectedGuardrail: false,
  },
  {
    id: "preset-fridge-02",
    name: "삼성 비스포크 4도어 냉장고",
    brand: "삼성전자",
    category: "refrigerator",
    model: "RF85C9001AP",
    icon: "Refrigerator",
    status: true,
    currentPower: 130,
    monthlyUsageKWh: 48.2,
    monthlyCost: 11800,
    annualEstimatedCost: 61200,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isPinned: true,
    createdAt: 1700000002000,
    specs: {
      capacity: "875L",
      powerConsumption: "35.3kWh/월",
      releaseYear: "2023",
    },
    consumables: [
      {
        name: "청정제균탈취기 필터",
        status: "양호 (65% 잔여)",
        price: 19000,
        buyUrl: "https://www.samsung.com/sec/accessories",
        lowestPrice: "16,500원",
      },
    ],
    manualUrl: "https://www.samsung.com/sec/support",
    asInfo: {
      center: "삼성전자 서비스",
      phone: "1588-3366",
      siteUrl: "https://www.samsungsvc.co.kr/reserve/engineer",
      warrantyPeriod: "컴프레서 평생보증",
    },
    isProtectedGuardrail: true,
  },
  {
    id: "preset-washer-03",
    name: "LG 트롬 드럼 세탁기",
    brand: "LG전자",
    category: "washer",
    model: "FX24GNB",
    icon: "WashingMachine",
    status: false,
    currentPower: 0,
    monthlyUsageKWh: 24.8,
    monthlyCost: 6200,
    annualEstimatedCost: 28000,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isPinned: true,
    createdAt: 1700000003000,
    specs: {
      capacity: "24kg",
      powerConsumption: "450W",
      releaseYear: "2024",
    },
    consumables: [
      {
        name: "배수 펌프 거름망 & 세제함",
        status: "세척 권장 (D-5)",
        price: 12000,
        buyUrl: "https://www.lge.co.kr/care-accessories/washing-machine-accessories",
        lowestPrice: "9,800원",
      },
    ],
    manualUrl: "https://www.lge.co.kr/support/manuals",
    asInfo: {
      center: "LG전자 서비스센터",
      phone: "1544-7777",
      siteUrl: "https://www.lge.co.kr/support/service-engineer-request",
      warrantyPeriod: "모터 10년",
    },
    isProtectedGuardrail: false,
  },
  {
    id: "preset-tv-04",
    name: "삼성 네오 QLED 75인치 TV",
    brand: "삼성전자",
    category: "tv",
    model: "KQ75QND90AFXKR",
    icon: "Tv",
    status: false,
    currentPower: 0,
    monthlyUsageKWh: 38.5,
    monthlyCost: 9400,
    annualEstimatedCost: 48000,
    energyGrade: 2,
    releaseEnergyGrade: 2,
    isPinned: true,
    createdAt: 1700000004000,
    specs: {
      screenSize: "75인치 (189cm)",
      resolution: "4K UHD",
      powerConsumption: "140W",
      releaseYear: "2023",
    },
    consumables: [],
    manualUrl: "https://www.samsung.com/sec/support",
    asInfo: {
      center: "삼성전자 서비스",
      phone: "1588-3366",
      siteUrl: "https://www.samsungsvc.co.kr/reserve/engineer",
      warrantyPeriod: "패널 2년",
    },
    isProtectedGuardrail: false,
  },
  {
    id: "preset-cooker-05",
    name: "쿠쿠 트윈프레셔 IH 전기밥솥",
    brand: "쿠쿠전자",
    category: "cooker",
    model: "CRP-LHTR1010FW",
    icon: "Utensils",
    status: false,
    currentPower: 0,
    monthlyUsageKWh: 32.4,
    monthlyCost: 8100,
    annualEstimatedCost: 39500,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isSmartControl: false,
    isPinned: false,
    createdAt: 1700000005000,
    specs: {
      capacity: "10인용",
      powerConsumption: "1455W",
      releaseYear: "2022",
    },
    asInfo: {
      center: "쿠쿠 고객만족센터",
      phone: "1588-8899",
      siteUrl: "https://www.cuckoo.co.kr",
    },
    isProtectedGuardrail: false,
  },
  {
    id: "preset-purifier-06",
    name: "LG 퓨리케어 360˚ 공기청정기",
    brand: "LG전자",
    category: "air_purifier",
    model: "AS304DWFA",
    icon: "Wind",
    status: false,
    currentPower: 0,
    monthlyUsageKWh: 16.2,
    monthlyCost: 4100,
    annualEstimatedCost: 19800,
    energyGrade: 2,
    releaseEnergyGrade: 2,
    isSmartControl: true,
    isPinned: false,
    createdAt: 1700000006000,
    specs: {
      area: "30평형",
      powerConsumption: "70W",
      releaseYear: "2023",
    },
    asInfo: {
      center: "LG전자 서비스센터",
      phone: "1544-7777",
      siteUrl: "https://www.lge.co.kr",
    },
    isProtectedGuardrail: false,
  },
  {
    id: "preset-robot-07",
    name: "로보락 S8 Pro Ultra 로봇청소기",
    brand: "로보락",
    category: "robot_cleaner",
    model: "S8PU-01",
    icon: "Disc",
    status: false,
    currentPower: 0,
    monthlyUsageKWh: 8.4,
    monthlyCost: 2100,
    annualEstimatedCost: 9800,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isSmartControl: true,
    isPinned: false,
    createdAt: 1700000007000,
    specs: {
      battery: "5200mAh",
      suction: "6000Pa",
      releaseYear: "2024",
    },
    asInfo: {
      center: "로보락 고객센터",
      phone: "1588-0000",
      siteUrl: "https://roborock.co.kr",
    },
    isProtectedGuardrail: false,
  },
];

// IoT 지원 기기 최우선 + 그 안에서 등록 순서(createdAt) 정렬 함수
export const sortDevices = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const aIsIoT = (a.isSmartControl !== false) && a.category !== "refrigerator" && !a.isProtectedGuardrail;
    const bIsIoT = (b.isSmartControl !== false) && b.category !== "refrigerator" && !b.isProtectedGuardrail;
    
    // 1순위: IoT 지원 모델 최상단 우선
    if (aIsIoT && !bIsIoT) return -1;
    if (!aIsIoT && bIsIoT) return 1;

    // 2순위: 등록 순서 (createdAt 기준)
    const aTime = a.createdAt || (a.created_at ? new Date(a.created_at).getTime() : 0);
    const bTime = b.createdAt || (b.created_at ? new Date(b.created_at).getTime() : 0);
    if (aTime && bTime && aTime !== bTime) {
      return aTime - bTime;
    }
    return 0;
  });
};

const STORAGE_KEY = "hsgm_devices_v4";

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 로컬 스토리지 헬퍼
  const saveLocalDevices = (updatedList) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      } catch (e) {
        console.warn("로컬 스토리지 저장 실패:", e);
      }
    }
  };

  // 1. 초기 가전 목록 로드
  const fetchDevices = useCallback(async () => {
    // 1-A: 로컬 캐시가 있고 데이터가 2개 이상 유효하면 로드
    let cached = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          cached = JSON.parse(raw);
        }
      } catch (e) {
        console.warn("로컬 캐시 파싱 에러:", e);
      }
    }

    if (cached && Array.isArray(cached) && cached.length > 1) {
      setDevices(sortDevices(cached));
      setLoading(false);
      return;
    }

    // 1-B: 캐시가 없거나 1개 이하일 때 기본 프리셋 데모 데이터 주입
    try {
      const data = await deviceService.getDevices();
      if (data && data.length > 1) {
        const sorted = sortDevices(data);
        setDevices(sorted);
        saveLocalDevices(sorted);
      } else {
        const sortedPreset = sortDevices(DEFAULT_PRESET_DEVICES);
        setDevices(sortedPreset);
        saveLocalDevices(sortedPreset);
      }
    } catch (err) {
      console.warn("Supabase 연결 제한 - 데모 프리셋으로 구동합니다:", err);
      const sortedPreset = sortDevices(DEFAULT_PRESET_DEVICES);
      setDevices(sortedPreset);
      saveLocalDevices(sortedPreset);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();

    // 2. Supabase Realtime 웹소켓 실시간 구독
    const unsubscribe = deviceService.subscribeDevices((payload) => {
      const { eventType, new: newDevice, old: oldDevice } = payload;

      setDevices((prev) => {
        let next = prev;
        if (eventType === "INSERT") {
          if (prev.some((d) => d.id === newDevice.id)) return prev;
          next = sortDevices([...prev, newDevice]);
        } else if (eventType === "UPDATE") {
          next = sortDevices(prev.map((d) => (d.id === newDevice.id ? { ...d, ...newDevice } : d)));
        } else if (eventType === "DELETE") {
          next = prev.filter((d) => d.id !== oldDevice?.id);
        }
        saveLocalDevices(next);
        return next;
      });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [fetchDevices]);

  // 3. 전원 온/오프 토글 함수
  const toggleDeviceStatus = async (id) => {
    const target = devices.find((d) => d.id === id);
    if (!target) return;

    if (target.category === "refrigerator" || target.isProtectedGuardrail) {
      return;
    }

    const nextStatus = !target.status;
    const nextPower = nextStatus
      ? parseInt(target.specs?.powerConsumption) || (target.category === "air_conditioner" ? 1450 : 80)
      : 0;

    setDevices((prev) => {
      const next = prev.map((d) =>
        d.id === id ? { ...d, status: nextStatus, currentPower: nextPower } : d
      );
      saveLocalDevices(next);
      return next;
    });

    try {
      await deviceService.updateDeviceStatus(id, nextStatus, target.category);
    } catch (err) {
      console.warn("서버 상태 동기화 실패 (로컬 상태 유지):", err);
    }
  };

  // 4. 가전 세부 상태 수정 함수
  const updateDeviceState = async (id, statePatch) => {
    setDevices((prev) => {
      const next = prev.map((d) =>
        d.id === id ? { ...d, state: { ...(d.state || {}), ...statePatch } } : d
      );
      saveLocalDevices(next);
      return next;
    });

    try {
      await deviceService.updateDeviceState(id, statePatch);
    } catch (err) {
      console.warn("상태 제어 로컬 유지:", err);
    }
  };

  // 5. 홈 화면 표시(핀 고정) 토글 함수
  const togglePinDevice = (id) => {
    setDevices((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, isPinned: !d.isPinned } : d));
      saveLocalDevices(next);
      return next;
    });
  };

  // 6. 가전 추가
  const addDevice = async (deviceData, userId) => {
    const nowTime = Date.now();
    const enriched = {
      ...deviceData,
      createdAt: nowTime,
      isPinned: true,
    };

    try {
      const newDevice = await deviceService.addDevice(enriched, userId);
      if (newDevice) {
        const item = { ...newDevice, createdAt: nowTime, isPinned: true };
        setDevices((prev) => {
          const next = sortDevices([...prev.filter((d) => d.id !== item.id), item]);
          saveLocalDevices(next);
          return next;
        });
        return item;
      }
    } catch (err) {
      console.warn("DB 등록 제한(게스트/RLS) - 로컬 세션 기기로 등록합니다:", err);
      const localDevice = {
        id: "local-" + nowTime,
        ...enriched,
        status: false,
        currentPower: 0,
      };
      setDevices((prev) => {
        const next = sortDevices([...prev, localDevice]);
        saveLocalDevices(next);
        return next;
      });
      return localDevice;
    }
  };

  // 7. 가전 삭제 (기기 상세 페이지 등에서 호출)
  const deleteDevice = async (id) => {
    setDevices((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveLocalDevices(next);
      return next;
    });
    try {
      await deviceService.deleteDevice(id);
    } catch (err) {
      console.warn("DB 삭제 통신 오류 (로컬 삭제 완료):", err);
    }
  };

  // 8. 시연 기본 프리셋 데이터 원상 복구
  const restoreDefaultDevices = () => {
    const sortedPreset = sortDevices(DEFAULT_PRESET_DEVICES);
    setDevices(sortedPreset);
    saveLocalDevices(sortedPreset);
    return sortedPreset;
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        loading,
        fetchDevices,
        toggleDeviceStatus,
        updateDeviceState,
        togglePinDevice,
        addDevice,
        deleteDevice,
        restoreDefaultDevices,
        sortDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevices must be used within a DeviceProvider");
  }
  return context;
}