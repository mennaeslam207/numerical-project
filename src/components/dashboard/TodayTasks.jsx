import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
} from "lucide-react";

const initialTasks = [
  {
    id: 1,
    title: "Study Bisection Method",
    subject: "Numerical Methods",
    duration: "1.5 hours",
    completed: true,
  },
  {
    id: 2,
    title: "Complete React Components",
    subject: "Web Development",
    duration: "2 hours",
    completed: false,
  },
  {
    id: 3,
    title: "Review SQL Queries",
    subject: "Database Systems",
    duration: "1 hour",
    completed: false,
  },
  {
    id: 4,
    title: "Solve Practice Questions",
    subject: "Mathematics",
    duration: "45 minutes",
    completed: false,
  },
];

const TodayTasks = ({ tasks: externalTasks, onTaskToggle }) => {
  const [localTasks, setLocalTasks] = useState(initialTasks);

  const tasks = externalTasks || localTasks;

  const handleToggle = (id) => {
    if (!externalTasks) {
      setLocalTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, completed: !task.completed }
            : task
        )
      );
    }

    onTaskToggle?.(id);
  };

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const percentage = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="bg-[#171426] border border-purple-500/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">
            Today's Tasks
          </h3>

          <p className="text-gray-500 text-xs mt-1">
            Your daily study checklist
          </p>
        </div>

        <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-2 rounded-lg">
          {completedCount}/{tasks.length} Done
        </span>
      </div>

      <div className="w-full h-2 bg-[#0D0B16] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-700 to-violet-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              task.completed
                ? "bg-purple-500/5 border-purple-500/10"
                : "bg-[#0F0D1A] border-white/5 hover:border-purple-500/20"
            }`}
          >
            <button
              onClick={() => handleToggle(task.id)}
              aria-label={
                task.completed
                  ? "Mark as incomplete"
                  : "Mark as completed"
              }
              className="shrink-0"
            >
              {task.completed ? (
                <CheckCircle2
                  size={21}
                  className="text-purple-400"
                />
              ) : (
                <Circle
                  size={21}
                  className="text-gray-600 hover:text-purple-400 transition"
                />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h4
                className={`text-sm font-medium ${
                  task.completed
                    ? "text-gray-500 line-through"
                    : "text-white"
                }`}
              >
                {task.title}
              </h4>

              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <BookOpen size={12} />
                  {task.subject}
                </span>

                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock size={12} />
                  {task.duration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayTasks;