"use client";
import React, { useEffect, useRef, useState } from "react";
import { PlayerSearch } from "@/components/PlayerSearch";
import { ToastProvider } from "@/context/ToastContext";

export default function ProfilesLayout({ children }: { children: React.ReactNode }) {
  const [showHeader, setShowHeader] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currScroll = window.scrollY;
      if (currScroll > lastScroll.current && currScroll > 40) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScroll.current = currScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen h-full bg-gray-50 flex flex-col">
        <header
        className={`w-full shadow sticky top-0 z-20 bg-gradient-to-r from-[#232946] to-[#393e6e] border-b border-[#232946]/40 text-white transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-4xl mx-auto px-4 py-2">
          <PlayerSearch />
        </div>
      </header>
      <main className="flex-1 w-full h-full px-0">
        {children}
      </main>
    </div>
    </ToastProvider>
  );
}

