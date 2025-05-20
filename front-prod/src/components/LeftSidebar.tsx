"use client";
import React from "react";
import { BaseSidebar } from "./BaseSidebar";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useRecentProfilesList,
  RecentProfile,
  clearRecentProfiles,
} from "../hooks/useRecentProfiles";

export const LeftSidebar: React.FC = () => {
  const recent = useRecentProfilesList();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <BaseSidebar className="border-r border-l-0">
      <div className="text-blue-200 font-bold text-lg mb-4">Acceso Rápido</div>
      <ul className="text-gray-300 text-sm space-y-2 w-full px-4">
        <li className="opacity-70">Perfiles visitados recientemente</li>
        {isMounted && recent.map((p, i) => (
          <li key={i} className="truncate">
            <Link
              className="hover:text-blue-300 transition-colors"
              href={`/profiles/${p.region}/${encodeURIComponent(p.name)}/${encodeURIComponent(p.tagline)}`}
            >
              {decodeURIComponent(p.name)}#{decodeURIComponent(p.tagline)}{" "}
              <span className="text-xs text-gray-400 ml-1">[{p.region}]</span>
            </Link>
          </li>
        ))}
        {isMounted && recent.length > 0 && (
          <li>
            <button
              type="button"
              onClick={clearRecentProfiles}
              className="w-full text-xs text-red-400 hover:text-red-600 transition-colors text-left"
            >
              Borrar historial
            </button>
          </li>
        )}
        <li className="opacity-70">Perfiles favoritos</li>
      </ul>
    </BaseSidebar>
  );
};
