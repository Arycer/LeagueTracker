import React from "react";
import { BaseSidebar } from "./BaseSidebar";

export const LeftSidebar: React.FC = () => (
    <BaseSidebar className="border-r border-l-0">
        <div className="text-blue-200 font-bold text-lg mb-4">Acceso Rápido</div>
        <ul className="text-gray-300 text-sm space-y-2 w-full px-4">
            <li className="opacity-70">Perfiles visitados recientemente</li>
            <li className="opacity-70">Perfiles favoritos</li>
        </ul>
    </BaseSidebar>
);
