
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

const translations = {
  en: {
    title: "Study Calendar",
    subtitle: "Choose a day to see its tasks.",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    previous: "Previous month",
    next: "Next month",
    today: "Today",
    tasksDue: "Tasks due",
    task: "task",
    tasks: "tasks",
  },
  ar: {
    title: "التقويم الدراسي",
    subtitle: "اختاري يومًا لعرض مهامه الدراسية.",
    days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
    previous: "الشهر السابق",
    next: "الشهر التالي",
    today: "اليوم",
    tasksDue: "مهام مستحقة",
    task: "مهمة",
    tasks: "مهام",
  },
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Calendar({
  selectedDate,
  onDateSelect,
  tasks = [],
  isArabic = false,
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const t = translations[isArabic ? "ar" : "en"];
  const locale = isArabic ? "ar-EG" : "en-US";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayKey = toDateKey(new Date());
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;

  const changeMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  return (
    <section
      className="planner-calendar"
      aria-label={t.title}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="calendar-header">
        <div className="calendar-title">
          <span className="calendar-icon">
            <CalendarDays size={19} />
          </span>

          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="calendar-controls">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label={t.previous}
          >
            {isArabic
              ? <ChevronRight size={17} />
              : <ChevronLeft size={17} />}
          </button>

          <span>
            {currentDate.toLocaleString(locale, {
              month: "long",
              year: "numeric",
            })}
          </span>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label={t.next}
          >
            {isArabic
              ? <ChevronLeft size={17} />
              : <ChevronRight size={17} />}
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {t.days.map((day) => (
          <div className="calendar-weekday" key={day}>
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }, (_, index) => (
          <div
            className="calendar-empty-day"
            key={`empty-${year}-${month}-${index}`}
          />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const dateKey = toDateKey(date);

          const taskCount = tasks.filter(
            (task) => (task.dueDate || task.date) === dateKey
          ).length;

          const isSelected = selectedKey === dateKey;

          const dateLabel = date.toLocaleDateString(locale, {
            weekday: "long",
            month: "long",
            day: "numeric",
          });

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => onDateSelect?.(date)}
              className={`calendar-day${isSelected ? " selected" : ""}${
                todayKey === dateKey ? " today" : ""
              }`}
              aria-label={`${dateLabel}${
                taskCount
                  ? `, ${taskCount} ${taskCount === 1 ? t.task : t.tasks}`
                  : ""
              }`}
              aria-pressed={isSelected}
            >
              <span>{day}</span>

              {taskCount > 0 && (
                <span className="calendar-task-indicator">
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span>
          <i className="calendar-legend-dot today-dot" />
          {t.today}
        </span>

        <span>
          <i className="calendar-legend-dot task-dot" />
          {t.tasksDue}
        </span>
      </div>
    </section>
  );
}
