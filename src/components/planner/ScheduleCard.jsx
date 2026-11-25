import {
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  MoreVertical,
} from "lucide-react";

export default function ScheduleCard({
  task,
  onToggle,
  onDelete,
}) {
  const completed = task.completed;

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151326] p-4 transition hover:border-purple-500/40">
      <button
        onClick={() => onToggle?.(task.id)}
        className={`shrink-0 ${
          completed ? "text-purple-400" : "text-gray-500"
        }`}
        aria-label="Toggle task completion"
      >
        {completed ? (
          <CheckCircle2 size={23} />
        ) : (
          <Circle size={23} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={`truncate font-semibold ${
            completed
              ? "text-gray-500 line-through"
              : "text-white"
          }`}
        >
          {task.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <BookOpen size={14} />
            {task.subject || "General"}
          </span>

          <span className="flex items-center gap-1">
            <Clock size={14} />
            {task.duration || 1} hour(s)
          </span>
        </div>
      </div>

      <span
        className={`rounded-lg px-3 py-1 text-xs font-medium ${
          task.difficulty === "Hard"
            ? "bg-red-500/10 text-red-400"
            : task.difficulty === "Medium"
            ? "bg-yellow-500/10 text-yellow-400"
            : "bg-green-500/10 text-green-400"
        }`}
      >
        {task.difficulty || "Easy"}
      </span>

      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
          aria-label="Delete task"
        >
          <MoreVertical size={20} />
        </button>
      )}
    </div>
  );
}