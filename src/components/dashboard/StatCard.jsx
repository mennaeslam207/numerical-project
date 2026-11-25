import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "purple",
}) => {
  const colors = {
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <div className="group bg-[#171426] border border-purple-500/10 rounded-2xl p-5 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-white mt-3">
            {value}
          </h2>

          {subtitle && (
            <p className="text-gray-500 text-xs mt-2">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colors[color] || colors.purple}`}>
          {Icon && <Icon size={23} />}
        </div>
      </div>

      {trendValue && (
        <div className="flex items-center gap-2 mt-5">
          {trend === "down" ? (
            <TrendingDown size={16} className="text-red-400" />
          ) : (
            <TrendingUp size={16} className="text-emerald-400" />
          )}

          <span className={`text-xs font-semibold ${trend === "down" ? "text-red-400" : "text-emerald-400"}`}>
            {trendValue}
          </span>

          <span className="text-gray-600 text-xs">
            vs last week
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;