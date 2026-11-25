import React from "react";
import { Sparkles } from "lucide-react";

const PageHeader = ({
  title,
  description,
  icon: Icon,
  action,
  badge,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          {Icon ? (
            <Icon size={24} className="text-purple-400" />
          ) : (
            <Sparkles size={24} className="text-purple-400" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {title}
            </h1>

            {badge && (
              <span className="px-3 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {badge}
              </span>
            )}
          </div>

          {description && (
            <p className="text-gray-500 text-sm mt-2 max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;