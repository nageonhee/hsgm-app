"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { deviceService } from "@/services/deviceService";

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 초기 가전 목록 로드
  const fetchDevices = useCallback(async () => {
    try {
      const data = await deviceService.getDevices();
      setDevices(data || []);
    } catch (err) {
      console.error("가전 목록 로드 실패:", err);
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
        if (eventType === "INSERT") {
          if (prev.some((d) => d.id === newDevice.id)) return prev;
          return [...prev, newDevice];
        }

        if (eventType === "UPDATE") {
          return prev.map((d) => (d.id === newDevice.id ? { ...d, ...newDevice } : d));
        }

        if (eventType === "DELETE") {
          return prev.filter((d) => d.id !== oldDevice?.id);
        }

        return prev;
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

    const nextStatus = !target.status;

    // 낙관적 UI 업데이트
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    );

    try {
      await deviceService.updateDeviceStatus(id, nextStatus, target.category);
    } catch (err) {
      console.error("전원 제어 실패:", err);
      fetchDevices();
    }
  };

  // 4. 가전 세부 상태(온도, 모드 등) 수정 함수
  const updateDeviceState = async (id, statePatch) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, state: { ...(d.state || {}), ...statePatch } } : d
      )
    );

    try {
      await deviceService.updateDeviceState(id, statePatch);
    } catch (err) {
      console.error("상태 제어 실패:", err);
      fetchDevices();
    }
  };

  // 5. 홈 화면 표시(즐겨찾기/별표) 토글 함수
  const togglePinDevice = (id) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isPinned: !d.isPinned } : d))
    );
  };

  // 6. 가전 추가 (Supabase INSERT 및 목록 반영)
  const addDevice = async (deviceData, userId) => {
    try {
      const newDevice = await deviceService.addDevice(deviceData, userId);
      if (newDevice) {
        setDevices((prev) => {
          if (prev.some((d) => d.id === newDevice.id)) return prev;
          return [...prev, newDevice];
        });
      }
      return newDevice;
    } catch (err) {
      console.error("가전 추가 실패:", err);
      throw err;
    }
  };

  // 7. 가전 삭제 (Supabase DELETE)
  const deleteDevice = async (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    try {
      await deviceService.deleteDevice(id);
    } catch (err) {
      console.error("가전 삭제 실패:", err);
      fetchDevices();
      throw err;
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