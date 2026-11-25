import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  const variants = {
    primary:
      "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30",
    secondary:
      "bg-[#25213A] hover:bg-[#30294A] text-purple-200 border border-purple-500/20",
    outline:
      "border border-purple-500/40 text-purple-300 hover:bg-purple-500/10",
    danger:
      "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20",
    ghost:
      "text-gray-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-semibold transition-all duration-300
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
};

export default Button;