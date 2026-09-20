"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { deviceService } from "@/services/deviceService";
import { useAuth } from "@/contexts/AuthContext";
import {
  syncDevicesWithStandards,
  evaluateDeviceGrade,
  getActiveRevision,
  fetchServerYear,
  getDefaultYear,
} from "@/lib/energyGrade";

// 기기 데이터에서 실제 정격 소비전력(W 단위 정수)을 안전하게 추출하는 유틸
function parseWatt(device) {
  if (!device) return 100;
  const rawPower = device.power || device.specs?.powerConsumption || "";
  
  if (typeof rawPower === "number" && rawPower > 0) return rawPower;

  const wattMatch = String(rawPower).match(/(\d+)\s*W/i);
  if (wattMatch && wattMatch[1]) {
    return parseInt(wattMatch[1], 10);
  }

  const fallbackNum = parseInt(String(rawPower).replace(/[^0-9]/g, ""), 10);
  if (!isNaN(fallbackNum) && fallbackNum > 0 && fallbackNum < 10000) {
    return fallbackNum;
  }

  const defaultWatts = {
    air_conditioner: 1450,
    refrigerator: 130,
    washer: 450,
    dryer: 800,
    tv: 140,
    cooker: 1090,
    air_purifier: 65,
    robot_cleaner: 65,
  };

  return defaultWatts[device.category] || 100;
}

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
    releaseYear: "2018",
    isPinned: true,
    createdAt: 1700000001000,
    specs: {
      area: "23평형 (75.9㎡)",
      powerConsumption: "1600W",
      releaseYear: "2018",
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
    releaseYear: "2023",
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
    releaseYear: "2024",
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
    releaseYear: "2024",
    isPinned: true,
    createdAt: 1700000004000,
    specs: {
      screenSize: "75인치 (189cm)",
      resolution: "4K UHD",
      powerConsumption: "140W",
      releaseYear: "2024",
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
    releaseYear: "2021",
    isSmartControl: false,
    isPinned: false,
    createdAt: 1700000005000,
    specs: {
      capacity: "10인용",
      powerConsumption: "1455W",
      releaseYear: "2021",
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
    releaseYear: "2024",
    isSmartControl: true,
    isPinned: false,
    createdAt: 1700000006000,
    specs: {
      area: "30평형",
      powerConsumption: "70W",
      releaseYear: "2024",
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
    releaseYear: "2023",
    isSmartControl: true,
    isPinned: false,
    createdAt: 1700000007000,
    specs: {
      battery: "5200mAh",
      suction: "6000Pa",
      releaseYear: "2023",
    },
    asInfo: {
      center: "로보락 고객센터",
      phone: "1588-0000",
      siteUrl: "https://roborock.co.kr",
    },
    isProtectedGuardrail: false,
  },
];

// IoT 지원 기기 최우선 + 등록 순서(createdAt) 정렬 함수
export const sortDevices = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const aIsIoT = (a.isSmartControl !== false) && a.category !== "refrigerator" && !a.isProtectedGuardrail;
    const bIsIoT = (b.isSmartControl !== false) && b.category !== "refrigerator" && !b.isProtectedGuardrail;
    
    if (aIsIoT && !bIsIoT) return -1;
    if (!aIsIoT && bIsIoT) return 1;

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
  
  const defaultSpaceName = user?.user_metadata?.name || "우리집";
  const [spaces, setSpaces] = useState([defaultSpaceName]);
  const [currentSpace, setCurrentSpaceState] = useState(defaultSpaceName);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(getDefaultYear());

  useEffect(() => {
    fetchServerYear().then((year) => {
      if (year && typeof year === "number") {
        setCurrentYear(year);
      }
    });
  }, []);

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

  const setCurrentSpace = useCallback((spaceName) => {
    setCurrentSpaceState(spaceName);
  }, []);

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

  const getUserSpaceStorageKey = useCallback((uid, space = currentSpace) => {
    const userPart = uid || "guest";
    const spacePart = encodeURIComponent(space || "우리집");
    return `hsgm_devices_${userPart}_${spacePart}`;
  }, [currentSpace]);

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

  useEffect(() => {
    setDevices((prev) => {
      if (!prev || prev.length === 0) return prev;
      const { list, hasChanges } = syncDevicesWithStandards(prev, currentYear);
      if (hasChanges) {
        saveLocalDevices(list, user?.id, currentSpace);
        return list;
      }
      return prev;
    });
  }, [currentYear, saveLocalDevices, user?.id, currentSpace]);

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

    if (hasCache && Array.isArray(cached)) {
      const { list, hasChanges } = syncDevicesWithStandards(cached, currentYear);
      if (hasChanges) {
        saveLocalDevices(list, user.id, currentSpace);
      }
      setDevices(sortDevices(list));
      setLoading(false);
      return;
    }

    if (isDemoUser && (currentSpace === "우리집" || currentSpace === defaultSpaceName)) {
      const { list } = syncDevicesWithStandards(DEFAULT_PRESET_DEVICES, currentYear);
      const sortedPreset = sortDevices(list);
      setDevices(sortedPreset);
      saveLocalDevices(sortedPreset, user.id, currentSpace);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await deviceService.getDevices(user.id);
      const spaceDevices = Array.isArray(data)
        ? data.filter((d) => (d.space || d.specs?.space || defaultSpaceName) === currentSpace)
        : [];

      if (spaceDevices.length > 0) {
        const { list, hasChanges } = syncDevicesWithStandards(spaceDevices, currentYear);
        if (hasChanges) {
          saveLocalDevices(list, user.id, currentSpace);
        }
        const sorted = sortDevices(list);
        setDevices(sorted);
      } else {
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

  // 전원 On/Off 제어
  const toggleDeviceStatus = async (id) => {
    const target = devices.find((d) => d.id === id);
    if (!target) return;

    if (target.category === "refrigerator" || target.isProtectedGuardrail) {
      return;
    }

    const nextStatus = !target.status;
    const nextPower = nextStatus ? parseWatt(target) : 0;

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

  const togglePinDevice = (id) => {
    setDevices((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, isPinned: !d.isPinned } : d));
      saveLocalDevices(next);
      return next;
    });
  };

  // 가전 추가
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
        const item = evaluateDeviceGrade(
          { ...newDevice, space: currentSpace, createdAt: nowTime, isPinned: true },
          getActiveRevision(currentYear)
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
      const localDevice = evaluateDeviceGrade(
        {
          id: "local-" + nowTime,
          ...enriched,
          status: false,
          currentPower: 0,
        },
        getActiveRevision(currentYear)
      );
      setDevices((prev) => {
        const next = sortDevices([...prev, localDevice]);
        saveLocalDevices(next, targetUserId, currentSpace);
        return next;
      });
      return localDevice;
    }
  };

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

  const restoreDefaultDevices = () => {
    const { list } = syncDevicesWithStandards(DEFAULT_PRESET_DEVICES, currentYear);
    const sortedPreset = sortDevices(list);
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
        evaluateDeviceGrade,
        syncDevicesWithStandards,
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