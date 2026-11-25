import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
  headerClassName = "",
}) => {
  return (
    <div
      className={`
        bg-[#171426]
        border border-purple-500/10
        rounded-2xl
        p-5
        shadow-xl shadow-black/20
        hover:border-purple-500/25
        transition-all duration-300
        ${className}
      `}
    >
      {(title || subtitle || Icon || action) && (
        <div className={`flex items-center justify-between mb-5 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Icon size={20} className="text-purple-400" />
              </div>
            )}

            <div>
              {title && (
                <h3 className="text-white font-semibold text-base">
                  {title}
                </h3>
              )}

              {subtitle && (
                <p className="text-gray-500 text-xs mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action}
        </div>
      )}

      {children}
    </div>
  );
};

export default Card;