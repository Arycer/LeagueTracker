"use client";
import React from "react";
import { BaseSidebar } from "./BaseSidebar";

import Link from "next/link";
import {
  useRecentProfilesList,
  clearRecentProfiles,
} from "../hooks/useRecentProfiles";
import FavoritesSidebar from "./FavoritesSidebar";
import { FaClock } from "react-icons/fa";

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
        <FavoritesSidebar />
        
        <li className="opacity-70 flex items-center gap-1 mt-4">
          <FaClock className="text-blue-400" /> Visitados recientemente
        </li>
        {isMounted && recent.length === 0 && (
          <li className="text-gray-400 text-sm pl-2">No hay perfiles recientes</li>
        )}
        {isMounted && recent.map((p, i) => (
          <li key={i} className="truncate border-b border-gray-700 py-2">
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
              className="w-full text-xs text-red-400 hover:text-red-600 transition-colors text-left mt-1"
            >
              Borrar historial
            </button>
          </li>
        )}
      </ul>
    </BaseSidebar>
  );
};
