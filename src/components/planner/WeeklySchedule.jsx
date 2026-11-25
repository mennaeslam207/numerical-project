
import { useState } from "react";
import {
  CalendarRange,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";

import { useLanguage } from "../../App";

const days = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const translations = {
  en: {
    title: "Weekly study schedule",
    subtitle: "Recurring sessions to give your week a steady rhythm.",
    close: "Close",
    add: "Add session",
    hours: "hrs / week",
    day: "Day",
    subject: "Subject",
    selectSubject: "Select a subject",
    starts: "Starts",
    ends: "Ends",
    save: "Save session",
    chooseSubject: "Choose a subject for this study session.",
    invalidTime: "The end time must be later than the start time.",
    planned: "planned",
    openDay: "Open day",
    freeTime: "Keep this day flexible for review or rest.",
    studySession: "Study session",
    select: "Select",
    sessions: "study sessions",
    remove: "Remove",
    dayNames: {
      Saturday: "Saturday",
      Sunday: "Sunday",
      Monday: "Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
      Thursday: "Thursday",
      Friday: "Friday",
    },
  },
  ar: {
    title: "الجدول الدراسي الأسبوعي",
    subtitle: "نظّمي جلسات المذاكرة المتكررة لتحافظي على روتين أسبوعي منتظم.",
    close: "إغلاق",
    add: "إضافة جلسة",
    hours: "ساعة / أسبوع",
    day: "اليوم",
    subject: "المادة الدراسية",
    selectSubject: "اختاري مادة",
    starts: "وقت البداية",
    ends: "وقت النهاية",
    save: "حفظ الجلسة",
    chooseSubject: "اختاري مادة دراسية لهذه الجلسة.",
    invalidTime: "يجب أن يكون وقت النهاية بعد وقت البداية.",
    planned: "مخطط",
    openDay: "يوم متاح",
    freeTime: "يمكنك تخصيص هذا اليوم للمراجعة أو الراحة.",
    studySession: "جلسة مذاكرة",
    select: "اختيار",
    sessions: "جلسات مذاكرة",
    remove: "حذف",
    dayNames: {
      Saturday: "السبت",
      Sunday: "الأحد",
      Monday: "الاثنين",
      Tuesday: "الثلاثاء",
      Wednesday: "الأربعاء",
      Thursday: "الخميس",
      Friday: "الجمعة",
    },
  },
};

const getDayName = (date) =>
  date.toLocaleDateString("en-US", { weekday: "long" });

const weekStartsOnSaturday = (date) => {
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 1) % 7));
  return start;
};

const formatTime = (time, locale) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes || 0, 0, 0);

  return date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDuration = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  return (
    endHour * 60 +
    endMinute -
    startHour * 60 -
    startMinute
  ) / 60;
};

function WeeklySchedule({
  schedule = [],
  subjects = [],
  selectedDate,
  onSelectDay,
  onAddSchedule,
  onDeleteSchedule,
}) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const t = translations[isArabic ? "ar" : "en"];
  const locale = isArabic ? "ar-EG" : "en-US";

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [draft, setDraft] = useState({
    day: selectedDate ? getDayName(selectedDate) : "Saturday",
    subjectId: "",
    startTime: "09:00",
    endTime: "10:00",
  });

  const weekStart = weekStartsOnSaturday(selectedDate || new Date());

  const subjectNames = new Map(
    subjects.map((subject) => [subject.id, subject.name])
  );

  const totalHours = schedule.reduce(
    (total, session) =>
      total + (Number(session.hours) || 0),
    0
  );

  const openForm = () => {
    setDraft((previous) => ({
      ...previous,
      day: selectedDate
        ? getDayName(selectedDate)
        : previous.day,
    }));

    setFormError("");
    setShowForm((previous) => !previous);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const hours = getDuration(
      draft.startTime,
      draft.endTime
    );

    if (!draft.subjectId) {
      setFormError(t.chooseSubject);
      return;
    }

    if (!Number.isFinite(hours) || hours <= 0) {
      setFormError(t.invalidTime);
      return;
    }

    onAddSchedule?.({ ...draft, hours });
    setFormError("");
    setShowForm(false);
  };

  return (
    <section
      className="weekly-schedule"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="weekly-schedule-heading">
        <div className="weekly-schedule-title">
          <span className="weekly-schedule-icon">
            <CalendarRange size={19} />
          </span>

          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="weekly-schedule-actions">
          <span className="weekly-hours">
            <Clock size={14} />

            {totalHours % 1
              ? totalHours.toFixed(1)
              : totalHours}{" "}
            {t.hours}
          </span>

          <button
            type="button"
            className="schedule-add-button"
            onClick={openForm}
          >
            <Plus size={15} />
            {showForm ? t.close : t.add}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          className="schedule-form"
          onSubmit={handleSubmit}
        >
          <label>
            {t.day}

            <select
              value={draft.day}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  day: event.target.value,
                })
              }
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {t.dayNames[day]}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t.subject}

            <select
              value={draft.subjectId}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  subjectId: event.target.value,
                })
              }
              required
            >
              <option value="">
                {t.selectSubject}
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t.starts}

            <input
              type="time"
              value={draft.startTime}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  startTime: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            {t.ends}

            <input
              type="time"
              value={draft.endTime}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  endTime: event.target.value,
                })
              }
              required
            />
          </label>

          <button
            type="submit"
            disabled={!subjects.length}
          >
            {t.save}
          </button>

          {formError && (
            <p
              className="schedule-form-error"
              role="alert"
            >
              {formError}
            </p>
          )}
        </form>
      )}

      <div className="weekly-grid">
        {days.map((day, index) => {
          const date = new Date(weekStart);

          date.setDate(weekStart.getDate() + index);

          const dateKey = formatDateKey(date);

          const sessions = schedule
            .filter((session) => session.day === day)
            .sort((first, second) =>
              (first.startTime || "").localeCompare(
                second.startTime || ""
              )
            );

          const hours = sessions.reduce(
            (total, session) =>
              total + (Number(session.hours) || 0),
            0
          );

          const selected =
            selectedDate &&
            formatDateKey(selectedDate) === dateKey;

          return (
            <div
              className={`weekly-day${selected ? " selected" : ""}`}
              key={day}
            >
              <button
                type="button"
                className="weekly-day-select"
                onClick={() => onSelectDay?.(date)}
                aria-pressed={Boolean(selected)}
                aria-label={`${t.select} ${t.dayNames[day]}, ${sessions.length} ${t.sessions}`}
              >
                <span className="weekly-day-heading">
                  <span>
                    {isArabic
                      ? t.dayNames[day]
                      : day.slice(0, 3)}
                  </span>

                  <strong>
                    {date.toLocaleDateString(locale, {
                      day: "numeric",
                    })}
                  </strong>
                </span>

                <span className="weekly-day-total">
                  {sessions.length
                    ? `${hours % 1 ? hours.toFixed(1) : hours}h ${t.planned}`
                    : t.openDay}
                </span>
              </button>

              <div className="weekly-sessions">
                {sessions.length ? (
                  sessions.map((session) => (
                    <div
                      className="weekly-session"
                      key={session.id}
                    >
                      <time>
                        {formatTime(session.startTime, locale)}
                      </time>

                      <span>
                        {subjectNames.get(session.subjectId) ||
                          session.subject ||
                          t.studySession}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onDeleteSchedule?.(session.id)
                        }
                        aria-label={`${t.remove} ${session.subject || t.studySession} ${t.dayNames[day]}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="weekly-free-time">
                    {t.freeTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WeeklySchedule;
