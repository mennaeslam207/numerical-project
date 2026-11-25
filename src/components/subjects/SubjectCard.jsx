
import React from "react";
import { useLanguage } from "../../App";

function SubjectCard({ subject, onEdit, onDelete, onViewTasks }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const t = {
    edit: isArabic ? "تعديل المادة" : "Edit Subject",
    delete: isArabic ? "حذف المادة" : "Delete Subject",
    noDescription: isArabic
      ? "لا يوجد وصف متاح"
      : "No description available",
    tasks: isArabic ? "مهام" : "Tasks",
    hours: isArabic ? "ساعة / أسبوع" : "Hours / Week",
    viewTasks: isArabic ? "عرض المهام" : "View Tasks",
  };

  return (
    <div
      className="subject-card"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="subject-card-header">
        <div
          className="subject-icon"
          style={{
            backgroundColor: subject.color || "#2563EB",
          }}
        >
          📚
        </div>

        <div className="subject-actions">
          <button
            type="button"
            onClick={() => onEdit && onEdit(subject)}
            title={t.edit}
            aria-label={t.edit}
          >
            ✏️
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(subject.id)}
            title={t.delete}
            aria-label={t.delete}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="subject-card-content">
        <h3>{subject.name}</h3>

        <p>
          {subject.description || t.noDescription}
        </p>

        <div className="subject-info">
          <span>
            📋 {subject.tasks?.length || 0} {t.tasks}
          </span>

          <span>
            ⏱️ {subject.hoursPerWeek || 0} {t.hours}
          </span>
        </div>

        <button
          type="button"
          className="view-tasks-btn"
          onClick={() => onViewTasks && onViewTasks(subject)}
        >
          {t.viewTasks} {isArabic ? "←" : "→"}
        </button>
      </div>
    </div>
  );
}

export default SubjectCard;
