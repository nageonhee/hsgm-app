"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { deviceService } from "@/services/deviceService";
import { useAuth } from "@/contexts/AuthContext";
import {
  enrichDevicesList,
  recalculateDeviceGrade,
  fetchServerYear,
  getDefaultYear,
} from "@/lib/energyGrade";

// 심사위원 무마찰 체험 및 데모 계정 전용 프리셋 데이터 (총 7종)
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

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const { user, isDemoUser } = useAuth();
  
  // 0. 계정별 공간(Space) 목록 및 현재 선택된 공간 관리
  const defaultSpaceName = user?.user_metadata?.name || "우리집";
  const [spaces, setSpaces] = useState([defaultSpaceName]);
  const [currentSpace, setCurrentSpaceState] = useState(defaultSpaceName);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(getDefaultYear());

  // 서버 시간 및 기준 연도 동기화 (연도 변경 시 자동 감지)
  useEffect(() => {
    fetchServerYear().then((year) => {
      if (year && typeof year === "number") {
        setCurrentYear(year);
      }
    });
  }, []);

  // 계정별 공간 목록 로드 및 초기화
  useEffect(() => {
    if (!user) {
      setSpaces(["우리집"]);
      setCurrentSpaceState("우리집");
      return;
    }

    const spacesKey = `hsgm_spaces_${user.id}`;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(spacesKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSpaces(parsed);
            setCurrentSpaceState(parsed[0]);
            return;
          }
        }
      } catch (e) {
        console.warn("공간 목록 파싱 오류:", e);
      }
    }
    const initial = [user?.user_metadata?.name || "우리집"];
    setSpaces(initial);
    setCurrentSpaceState(initial[0]);
  }, [user]);

  // 공간 전환 함수
  const setCurrentSpace = useCallback((spaceName) => {
    setCurrentSpaceState(spaceName);
  }, []);

  // 새 공간 추가 함수 (추가 시 해당 공간으로 자동 전환 및 독립 기기 DB 생성)
  const addSpace = useCallback((newSpaceName) => {
    if (!newSpaceName || !newSpaceName.trim()) return false;
    const trimmed = newSpaceName.trim();
    
    setSpaces((prev) => {
      const next = prev.includes(trimmed) ? prev : [...prev, trimmed];
      if (user && typeof window !== "undefined") {
        try {
          localStorage.setItem(`hsgm_spaces_${user.id}`, JSON.stringify(next));
        } catch (e) {
          console.warn("공간 저장 실패:", e);
        }
      }
      return next;
    });

    setCurrentSpaceState(trimmed);
    return true;
  }, [user]);

  // 계정 및 공간별 고유 스토리지 키 생성
  const getUserSpaceStorageKey = useCallback((uid, space = currentSpace) => {
    const userPart = uid || "guest";
    const spacePart = encodeURIComponent(space || "우리집");
    return `hsgm_devices_${userPart}_${spacePart}`;
  }, [currentSpace]);

  // 로컬 스토리지 헬퍼
  const saveLocalDevices = useCallback((updatedList, uid = user?.id, space = currentSpace) => {
    if (typeof window !== "undefined") {
      try {
        const key = getUserSpaceStorageKey(uid, space);
        localStorage.setItem(key, JSON.stringify(updatedList));
      } catch (e) {
        console.warn("로컬 스토리지 저장 실패:", e);
      }
    }
  }, [getUserSpaceStorageKey, user?.id, currentSpace]);

  // 기준 연도 변경 시 현재 로드된 기기들의 에너지 등급 실시간 일괄 재계산
  useEffect(() => {
    setDevices((prev) => {
      if (!prev || prev.length === 0) return prev;
      const updated = enrichDevicesList(prev, currentYear);
      saveLocalDevices(updated, user?.id, currentSpace);
      return updated;
    });
  }, [currentYear, saveLocalDevices, user?.id, currentSpace]);

  // 1. 유저 계정 및 공간별 가전 목록 로드
  const fetchDevices = useCallback(async () => {
    if (!user) {
      setDevices([]);
      setLoading(false);
      return;
    }

    const key = getUserSpaceStorageKey(user.id, currentSpace);
    let cached = null;
    let hasCache = false;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          cached = JSON.parse(raw);
          hasCache = true;
        }
      } catch (e) {
        console.warn("로컬 캐시 파싱 에러:", e);
      }
    }

    // 1-A: 유효한 계정+공간별 캐시가 존재하면 즉시 로드 (최신 연도 등급 적용)
    if (hasCache && Array.isArray(cached)) {
      const enrichedCached = enrichDevicesList(cached, currentYear);
      setDevices(sortDevices(enrichedCached));
      setLoading(false);
      return;
    }

    // 1-B: 데모 계정(demo-user-101)의 기본 "우리집" 공간에만 데모 프리셋 7종 제공 (최신 연도 등급 적용)
    if (isDemoUser && (currentSpace === "우리집" || currentSpace === defaultSpaceName)) {
      const enrichedPresets = enrichDevicesList(DEFAULT_PRESET_DEVICES, currentYear);
      const sortedPreset = sortDevices(enrichedPresets);
      setDevices(sortedPreset);
      saveLocalDevices(sortedPreset, user.id, currentSpace);
      setLoading(false);
      return;
    }

    // 1-C: 신규 생성된 공간 또는 실제 사용자 계정 -> Supabase DB에서 해당 user.id 기기 조회
    try {
      setLoading(true);
      const data = await deviceService.getDevices(user.id);
      // DB 기기 중 현재 공간과 일치하는 기기 필터링 (기본 공간이거나 space 속성이 일치)
      const spaceDevices = Array.isArray(data)
        ? data.filter((d) => (d.space || d.specs?.space || defaultSpaceName) === currentSpace)
        : [];

      if (spaceDevices.length > 0) {
        const enriched = enrichDevicesList(spaceDevices, currentYear);
        const sorted = sortDevices(enriched);
        setDevices(sorted);
        saveLocalDevices(sorted, user.id, currentSpace);
      } else {
        // 새 공간이거나 등록 기기가 없는 경우: 정확히 0개(빈 목록)로 시작
        setDevices([]);
        saveLocalDevices([], user.id, currentSpace);
      }
    } catch (err) {
      console.warn("기기 목록 로드 완료 (0대):", err);
      setDevices([]);
      saveLocalDevices([], user.id, currentSpace);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoUser, currentSpace, defaultSpaceName, currentYear, getUserSpaceStorageKey, saveLocalDevices]);

  useEffect(() => {
    fetchDevices();

    if (!user || isDemoUser) return;

    // 2. Supabase Realtime 웹소켓 실시간 구독
    const unsubscribe = deviceService.subscribeDevices((payload) => {
      const { eventType, new: newDevice, old: oldDevice } = payload;
      if (newDevice?.user_id && newDevice.user_id !== user.id) return;
      if (oldDevice?.user_id && oldDevice.user_id !== user.id) return;

      const deviceSpace = newDevice?.space || newDevice?.specs?.space || defaultSpaceName;
      if (deviceSpace !== currentSpace && oldDevice?.specs?.space !== currentSpace) return;

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
        saveLocalDevices(next, user.id, currentSpace);
        return next;
      });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [fetchDevices, user, isDemoUser, currentSpace, defaultSpaceName, saveLocalDevices]);

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

  // 6. 가전 추가 (현재 선택된 공간에 귀속)
  const addDevice = async (deviceData, explicitUserId = user?.id) => {
    const targetUserId = explicitUserId || user?.id;
    const nowTime = Date.now();
    const enriched = {
      ...deviceData,
      space: currentSpace,
      specs: {
        ...(deviceData.specs || {}),
        space: currentSpace,
      },
      createdAt: nowTime,
      isPinned: true,
    };

    try {
      const newDevice = await deviceService.addDevice(enriched, targetUserId);
      if (newDevice) {
        const item = recalculateDeviceGrade(
          { ...newDevice, space: currentSpace, createdAt: nowTime, isPinned: true },
          currentYear
        );
        setDevices((prev) => {
          const next = sortDevices([...prev.filter((d) => d.id !== item.id), item]);
          saveLocalDevices(next, targetUserId, currentSpace);
          return next;
        });
        return item;
      }
    } catch (err) {
      console.warn("DB 등록 제한(게스트/RLS) - 로컬 세션 기기로 등록합니다:", err);
      const localDevice = recalculateDeviceGrade(
        {
          id: "local-" + nowTime,
          ...enriched,
          status: false,
          currentPower: 0,
        },
        currentYear
      );
      setDevices((prev) => {
        const next = sortDevices([...prev, localDevice]);
        saveLocalDevices(next, targetUserId, currentSpace);
        return next;
      });
      return localDevice;
    }
  };

  // 7. 가전 삭제
  const deleteDevice = async (id) => {
    setDevices((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveLocalDevices(next, user?.id, currentSpace);
      return next;
    });
    try {
      await deviceService.deleteDevice(id);
    } catch (err) {
      console.warn("DB 삭제 통신 오류 (로컬 삭제 완료):", err);
    }
  };

  // 8. 시연 기본 프리셋 데이터 원상 복구 (데모 모드 또는 명시적 복원 시)
  const restoreDefaultDevices = () => {
    const enrichedPresets = enrichDevicesList(DEFAULT_PRESET_DEVICES, currentYear);
    const sortedPreset = sortDevices(enrichedPresets);
    setDevices(sortedPreset);
    saveLocalDevices(sortedPreset, user?.id, currentSpace);
    return sortedPreset;
  };

  return (
    <DeviceContext.Provider
      value={{
        spaces,
        currentSpace,
        setCurrentSpace,
        addSpace,
        devices,
        loading,
        currentYear,
        fetchDevices,
        toggleDeviceStatus,
        updateDeviceState,
        togglePinDevice,
        addDevice,
        deleteDevice,
        restoreDefaultDevices,
        sortDevices,
        recalculateDeviceGrade,
        enrichDevicesList,
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