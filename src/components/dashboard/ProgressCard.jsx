import React from "react";
import { Target, Trophy, Sparkles } from "lucide-react";

const ProgressCard = ({
  title = "Weekly Study Goal",
  completed = 18,
  target = 25,
}) => {
  const percentage = Math.min(
    Math.round((completed / target) * 100),
    100
  );

  return (
    <div className="bg-[#171426] border border-purple-500/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Target className="text-purple-400" size={22} />
          </div>

          <div>
            <h3 className="text-white font-semibold">
              {title}
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              Keep pushing forward!
            </p>
          </div>
        </div>

        <Sparkles className="text-purple-400" size={20} />
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="text-3xl font-bold text-white">
            {completed}
          </span>
          <span className="text-gray-500 text-sm ml-2">
            / {target} hours
          </span>
        </div>

        <span className="text-purple-400 font-bold text-xl">
          {percentage}%
        </span>
      </div>

      <div className="w-full h-3 bg-[#0D0B16] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-700 to-violet-400 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-2 mt-5 text-gray-400 text-xs">
        <Trophy size={16} className="text-yellow-400" />
        {percentage >= 100
          ? "Amazing! You achieved your weekly goal!"
          : `${target - completed} more hours to reach your goal.`}
      </div>
    </div>
  );
};

export default ProgressCard;