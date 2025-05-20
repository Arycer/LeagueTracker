import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline";
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({variant = "primary", children, ...props}) => {
    let base =
        "font-inter px-5 py-2 rounded-full font-semibold text-base transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-white/40 select-none backdrop-blur-sm";
    let style = "";
    if (variant === "primary") {
        style = "bg-white/60 text-[#232946] hover:bg-white/80 shadow-lg hover:shadow-xl";
    } else if (variant === "outline") {
        style = "bg-white/20 border border-white/40 text-white hover:bg-white/30 hover:text-[#232946] shadow";
    }
    return (
        <button
            {...props}
            className={`${base} ${style} ${props.className || ""}`.trim()}
            style={{fontFamily: 'var(--font-inter, "Inter", Arial, Helvetica, sans-serif)', ...props.style}}
        >
            {children}
        </button>
    );
};
