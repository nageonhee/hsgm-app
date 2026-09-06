"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { deviceService } from "@/services/deviceService";

// 심사위원 무마찰 체험 및 RLS 차단 대비 기본 고품질 프리셋 데이터 (총 4종)
export const DEFAULT_PRESET_DEVICES = [
  {
    id: "preset-aircon-01",
    name: "거실 무풍 갤러리 에어컨",
    brand: "삼성전자",
    category: "air_conditioner",
    model: "AF19TX772VFN",
    icon: "AirVent",
    status: true,
    currentPower: 1450,
    monthlyUsageKWh: 165,
    monthlyCost: 38200,
    annualEstimatedCost: 458400,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isPinned: true,
    createdAt: 1700000001000,
    specs: {
      releaseYear: "2024",
      powerConsumption: "1750W",
    },
    asInfo: {
      center: "삼성전자 서비스센터",
      phone: "1588-3366",
      siteUrl: "https://www.samsungsvc.co.kr",
    },
  },
  {
    id: "preset-washer-03",
    name: "인공지능 트롬 세탁기",
    brand: "LG전자",
    category: "washer",
    model: "F24VDD",
    icon: "WashingMachine",
    status: false,
    currentPower: 0,
    monthlyUsageKWh: 32,
    monthlyCost: 7200,
    annualEstimatedCost: 86400,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isPinned: true,
    createdAt: 1700000002000,
    specs: {
      releaseYear: "2024",
      powerConsumption: "450W",
    },
    asInfo: {
      center: "LG전자 서비스센터",
      phone: "1544-7777",
      siteUrl: "https://www.lge.co.kr",
    },
  },
  {
    id: "preset-tv-04",
    name: "스마트 4K OLED TV",
    brand: "LG전자",
    category: "tv",
    model: "OLED65C3",
    icon: "Tv",
    status: false,
    currentPower: 0,
    monthlyUsageKWh: 28,
    monthlyCost: 6300,
    annualEstimatedCost: 75600,
    energyGrade: 2,
    releaseEnergyGrade: 2,
    isPinned: false,
    createdAt: 1700000003000,
    specs: {
      releaseYear: "2023",
      powerConsumption: "120W",
    },
    asInfo: {
      center: "LG전자 서비스센터",
      phone: "1544-7777",
      siteUrl: "https://www.lge.co.kr",
    },
  },
  {
    id: "preset-fridge-02",
    name: "키친 오브제 4도어 냉장고",
    brand: "LG전자",
    category: "refrigerator",
    model: "M874AAA451",
    icon: "Refrigerator",
    status: true, // 절전 루틴 실행 시에도 안전 가드레일로 켜짐 유지
    currentPower: 52,
    monthlyUsageKWh: 36,
    monthlyCost: 8100,
    annualEstimatedCost: 97200,
    energyGrade: 1,
    releaseEnergyGrade: 1,
    isPinned: true,
    createdAt: 1700000004000,
    specs: {
      releaseYear: "2024",
      powerConsumption: "52W",
    },
    asInfo: {
      center: "LG전자 서비스센터",
      phone: "1544-7777",
      siteUrl: "https://www.lge.co.kr",
    },
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

const STORAGE_KEY = "hsgm_devices_v1";

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
    // 1-A: 로컬 캐시가 있으면 먼저 즉시 로드
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

    if (cached && Array.isArray(cached) && cached.length >= 0) {
      // 캐시가 존재하면 (0개인 경우 포함) 캐시 우선 설정
      setDevices(sortDevices(cached));
      setLoading(false);
      return;
    }

    // 1-B: 캐시가 없을 때 DB 조회 시도
    try {
      const data = await deviceService.getDevices();
      if (data && data.length > 0) {
        const sorted = sortDevices(data);
        setDevices(sorted);
        saveLocalDevices(sorted);
      } else {
        // 첫 방문 시 프리셋 데이터 주입
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