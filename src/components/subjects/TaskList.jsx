
import React from "react";
import { useLanguage } from "../../App";

function TaskList({
  tasks = [],
  subjects = [],
  onToggleTask,
  onDeleteTask,
  emptyTitle,
  emptyMessage,
}) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const t = {
    title: isArabic ? "المهام الدراسية" : "Study Tasks",
    completed: isArabic ? "مكتملة" : "Completed",
    subject: isArabic ? "المادة الدراسية" : "Subject",
    hours: isArabic ? "ساعات" : "Hours",
    delete: isArabic ? "حذف المهمة" : "Delete Task",
    priorities: {
      low: isArabic ? "منخفضة" : "Low",
      medium: isArabic ? "متوسطة" : "Medium",
      high: isArabic ? "مرتفعة" : "High",
    },
    emptyTitle:
      emptyTitle || (isArabic ? "لا توجد مهام حتى الآن" : "No Tasks Yet"),
    emptyMessage:
      emptyMessage ||
      (isArabic
        ? "ابدئي بإضافة مهام لتنظيم جدول مذاكرتك."
        : "Start adding tasks to organize your study schedule."),
  };

  if (tasks.length === 0) {
    return (
      <div
        className="empty-tasks"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="empty-icon">📝</div>
        <h3>{t.emptyTitle}</h3>
        <p>{t.emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="task-list"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="task-list-header">
        <h3>{t.title}</h3>

        <span className="task-count">
          {tasks.filter((task) => task.completed).length}
          {" / "}
          {tasks.length} {t.completed}
        </span>
      </div>

      {tasks.map((task) => (
        <div
          key={task.id}
          className={`task-item ${
            task.completed ? "completed" : ""
          }`}
        >
          <div className="task-checkbox">
            <input
              type="checkbox"
              checked={Boolean(task.completed)}
              onChange={() =>
                onToggleTask && onToggleTask(task.id)
              }
              aria-label={
                isArabic
                  ? `تحديد المهمة ${task.title} كمكتملة`
                  : `Mark ${task.title} as completed`
              }
            />
          </div>

          <div className="task-details">
            <h4>{task.title}</h4>

            {task.description && (
              <p>{task.description}</p>
            )}

            <div className="task-meta">
              {task.subjectId && (
                <span>
                  📚{" "}
                  {subjects.find(
                    (subject) => subject.id === task.subjectId
                  )?.name || t.subject}
                </span>
              )}

              {task.dueDate && (
                <span>
                  📅 {task.dueDate}
                </span>
              )}

              {task.priority && (
                <span className={`priority ${task.priority}`}>
                  {t.priorities[task.priority] || task.priority}
                </span>
              )}

              {task.hours && (
                <span>
                  ⏱️ {task.hours} {t.hours}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="delete-task-btn"
            onClick={() =>
              onDeleteTask && onDeleteTask(task.id)
            }
            title={t.delete}
            aria-label={t.delete}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
