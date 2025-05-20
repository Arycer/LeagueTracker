import React from "react";

interface BaseSidebarProps {
    className?: string;
    children?: React.ReactNode;
}

export const BaseSidebar: React.FC<BaseSidebarProps> = ({ className = "", children }) => (
    <aside
        className={`w-64 min-h-screen bg-gradient-to-b from-[#232946] to-[#393e6e] border-l border-[#232946]/40 shadow-inner flex flex-col items-center pt-8 text-gray-100 ${className}`}
    >
        {children}
    </aside>
);
