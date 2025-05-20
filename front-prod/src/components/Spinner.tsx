import React from "react";

interface SpinnerProps {
  size?: number | string; // px or tailwind size
  className?: string;
  text?: string;
  overlay?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 48,
  className = "",
  text = "",
  overlay = false,
}) => {
  const spinner = (
    <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent bg-blue-900/30 shadow-lg ${typeof size === 'number' ? '' : size} ${className}`}
         style={typeof size === 'number' ? { width: size, height: size } : {}}>
    </div>
  );
  if (overlay) {
    return (
      <div className="absolute inset-0 flex flex-col justify-center items-center min-h-[400px] bg-[#232b3acc] z-50">
        {spinner}
        {text && (
          <span className="text-blue-100 text-base font-medium mt-4">{text}</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {text && (
        <span className="text-blue-100 text-base font-medium mt-4">{text}</span>
      )}
    </div>
  );
};

export default Spinner;
