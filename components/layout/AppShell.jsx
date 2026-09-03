"use client";

import React from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";

export function AppShell({ children }) {
  return (
    <div className="fixed inset-0 overflow-hidden flex bg-background text-foreground">
      {/* Desktop Fixed Side Navigation */}
      <SideNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 flex flex-col min-h-0 pb-20 md:pb-8 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto relative overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
