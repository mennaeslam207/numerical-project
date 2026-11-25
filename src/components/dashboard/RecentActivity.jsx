import React from "react";
import {
  CheckCircle2,
  BookOpen,
  Clock,
  Trophy,
  Sparkles,
} from "lucide-react";

const RecentActivity = ({ activities = [] }) => {
  const sampleActivities = [
    {
      id: 1,
      title: "Completed React Chapter 4",
      description: "Web Development",
      time: "10 minutes ago",
      type: "completed",
    },
    {
      id: 2,
      title: "Started Numerical Methods",
      description: "Bisection Method",
      time: "1 hour ago",
      type: "study",
    },
    {
      id: 3,
      title: "Study goal achieved",
      description: "5 hours of focused study",
      time: "Yesterday",
      type: "achievement",
    },
  ];

  const data = activities.length ? activities : sampleActivities;

  const icons = {
    completed: CheckCircle2,
    study: BookOpen,
    achievement: Trophy,
  };

  const colors = {
    completed: "text-emerald-400 bg-emerald-500/10",
    study: "text-purple-400 bg-purple-500/10",
    achievement: "text-yellow-400 bg-yellow-500/10",
  };

  return (
    <div className="bg-[#171426] border border-purple-500/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">
            Recent Activity
          </h3>

          <p className="text-gray-500 text-xs mt-1">
            Your latest study updates
          </p>
        </div>

        <Sparkles size={20} className="text-purple-400" />
      </div>

      <div className="space-y-5">
        {data.map((activity) => {
          const Icon = icons[activity.type] || Clock;

          return (
            <div key={activity.id} className="flex gap-3">
              <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${colors[activity.type] || "bg-purple-500/10 text-purple-400"}`}>
                <Icon size={19} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium">
                  {activity.title}
                </h4>

                <p className="text-gray-500 text-xs mt-1">
                  {activity.description}
                </p>

                <p className="text-gray-600 text-[11px] mt-2">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;