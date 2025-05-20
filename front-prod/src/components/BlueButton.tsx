import React from "react";

interface BlueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const BlueButton: React.FC<BlueButtonProps> = ({children, ...props}) => (
    <button
        {...props}
        className={`px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 text-white font-bold shadow-lg hover:from-sky-600 hover:to-indigo-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300 tracking-wide select-none` + ` ${props.className || ''}`}
        style={{fontFamily: 'var(--font-inter, "Inter", Arial, Helvetica, sans-serif)'}}
    >
        {children}
    </button>
);
