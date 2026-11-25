
import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  ListTodo,
  CheckCircle2,
} from "lucide-react";

import { useStudy } from "../context/StudyContext";
import { useLanguage } from "../App";

import Calendar from "../components/planner/Calendar";
import WeeklySchedule from "../components/planner/WeeklySchedule";
import TaskList from "../components/subjects/TaskList";

const translations = {
  en: {
    title: "Study Planner 📅",
    subtitle: "Plan your tasks, follow your weekly rhythm, and stay ahead of deadlines.",
    close: "Close form",
    add: "+ Add Task",
    create: "Create a study task",
    formHint: "Give it a subject, deadline, and realistic time estimate.",
    taskTitle: "Task title",
    titlePlaceholder: "e.g. Review chapter 4",
    description: "Description",
    descriptionPlaceholder: "Add a few details or subtasks",
    subject: "Subject",
    selectSubject: "Select a subject",
    dueDate: "Due date",
    priority: "Priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    estimatedHours: "Estimated study hours",
    save: "Save task",
    cancel: "Cancel",
    selectSubjectAlert: "Please select a subject.",
    total: "Total tasks",
    completed: "Completed",
    pending: "Still to do",
    weekly: "Weekly schedule",
    hours: "hrs",
    dayGlance: "DAY AT A GLANCE",
    nextSteps: "YOUR NEXT STEPS",
    stayOnTrack: "Stay on track this week",
    tasksDue: "tasks due",
    recurring: "recurring sessions",
    openTasks: "open tasks",
    across: "across",
    review: "Review the deadline and break each task into a focused session.",
    selectDate: "Select a date on the calendar to see what is due.",
    showAll: "Show all tasks",
    selectedDate: "SELECTED DATE",
    workload: "YOUR WORKLOAD",
    tasksFor: "Tasks for",
    studyTasks: "Study tasks",
    task: "task",
    tasks: "tasks",
    nothingDue: "Nothing due on this day",
    noTasks: "No study tasks yet",
    chooseAnother: "Choose another day or add a task with this deadline.",
    startPlan: "Add a task to start building your study plan.",
  },

  ar: {
    title: "مخطط المذاكرة 📅",
    subtitle: "نظّمي مهامك الدراسية وتابعي جدولك الأسبوعي ومواعيد التسليم.",
    close: "إغلاق النموذج",
    add: "+ إضافة مهمة",
    create: "إنشاء مهمة دراسية",
    formHint: "حددي المادة وموعد التسليم والوقت المناسب للمذاكرة.",
    taskTitle: "عنوان المهمة",
    titlePlaceholder: "مثال: مراجعة الفصل الرابع",
    description: "الوصف",
    descriptionPlaceholder: "أضيفي تفاصيل أو مهام فرعية",
    subject: "المادة الدراسية",
    selectSubject: "اختاري مادة",
    dueDate: "موعد التسليم",
    priority: "الأولوية",
    low: "منخفضة",
    medium: "متوسطة",
    high: "مرتفعة",
    estimatedHours: "ساعات المذاكرة المتوقعة",
    save: "حفظ المهمة",
    cancel: "إلغاء",
    selectSubjectAlert: "من فضلك اختاري المادة الدراسية.",
    total: "إجمالي المهام",
    completed: "المهام المكتملة",
    pending: "المهام المتبقية",
    weekly: "الجدول الأسبوعي",
    hours: "ساعة",
    dayGlance: "نظرة سريعة على اليوم",
    nextSteps: "خطواتك القادمة",
    stayOnTrack: "حافظي على تقدمك هذا الأسبوع",
    tasksDue: "مهام مستحقة",
    recurring: "جلسات متكررة",
    openTasks: "مهام متبقية",
    across: "في",
    review: "راجعي موعد التسليم وقسّمي كل مهمة إلى جلسات مذاكرة مركزة.",
    selectDate: "اختاري يومًا من التقويم لمعرفة المهام المستحقة.",
    showAll: "عرض كل المهام",
    selectedDate: "التاريخ المحدد",
    workload: "مهامك الدراسية",
    tasksFor: "مهام يوم",
    studyTasks: "المهام الدراسية",
    task: "مهمة",
    tasks: "مهام",
    nothingDue: "لا توجد مهام مستحقة في هذا اليوم",
    noTasks: "لا توجد مهام دراسية حتى الآن",
    chooseAnother: "اختاري يومًا آخر أو أضيفي مهمة بهذا الموعد.",
    startPlan: "أضيفي مهمة لبدء تنظيم خطة مذاكرتك.",
  },
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function StudyPlanner() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const t = translations[isArabic ? "ar" : "en"];

  const {
    subjects = [],
    tasks = [],
    schedule = [],
    addTask,
    toggleTask,
    deleteTask,
    addSchedule,
    deleteSchedule,
  } = useStudy();

  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    dueDate: "",
    priority: "medium",
    hours: 1,
  });

  const formatDate = (date) =>
    date.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const selectedDateKey = selectedDate
    ? toDateKey(selectedDate)
    : null;

  const selectedDay = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
      })
    : null;

  const tasksForSelectedDate = selectedDateKey
    ? tasks.filter(
        (task) =>
          (task.dueDate || task.date) === selectedDateKey
      )
    : [];

  const sessionsForSelectedDate = selectedDay
    ? schedule.filter(
        (session) => session.day === selectedDay
      )
    : [];

  const visibleTasks = tasks
    .filter((task) =>
      selectedDateKey
        ? (task.dueDate || task.date) === selectedDateKey
        : true
    )
    .sort((first, second) => {
      const firstDate =
        first.dueDate || first.date || "9999-12-31";

      const secondDate =
        second.dueDate || second.date || "9999-12-31";

      return firstDate.localeCompare(secondDate);
    });

  const weeklyHours = schedule.reduce(
    (total, session) =>
      total + (Number(session.hours) || 0),
    0
  );

  const selectDate = (date) => {
    setSelectedDate(date);

    if (showForm) {
      setFormData((previous) => ({
        ...previous,
        dueDate: toDateKey(date),
      }));
    }
  };

  const toggleForm = () => {
    if (!showForm && selectedDate) {
      setFormData((previous) => ({
        ...previous,
        dueDate: toDateKey(selectedDate),
      }));
    }

    setShowForm((previous) => !previous);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.subjectId) {
      window.alert(t.selectSubjectAlert);
      return;
    }

    addTask(formData);

    setFormData({
      title: "",
      description: "",
      subjectId: "",
      dueDate: selectedDateKey || "",
      priority: "medium",
      hours: 1,
    });

    setShowForm(false);
  };

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.length - completedTasks;

  const taskCount = (count) =>
    `${count} ${
      isArabic
        ? t.tasks
        : count === 1
          ? t.task
          : t.tasks
    }`;

  return (
    <div
      className="planner-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <button
          className="primary-btn"
          type="button"
          onClick={toggleForm}
        >
          {showForm ? t.close : t.add}
        </button>
      </div>

      {/* CREATE TASK FORM */}
      {showForm && (
        <form
          className="task-form"
          onSubmit={handleSubmit}
        >
          <div className="task-form-heading">
            <span className="task-form-icon">
              <ListTodo size={19} />
            </span>

            <div>
              <h2>{t.create}</h2>
              <p>{t.formHint}</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-title">
              {t.taskTitle}
            </label>

            <input
              id="task-title"
              type="text"
              placeholder={t.titlePlaceholder}
              value={formData.title}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  title: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">
              {t.description}
            </label>

            <textarea
              id="task-description"
              placeholder={t.descriptionPlaceholder}
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-subject">
              {t.subject}
            </label>

            <select
              id="task-subject"
              value={formData.subjectId}
              onChange={(event) =>
                setFormData({
                  ...formData,
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
          </div>

          <div className="form-group">
            <label htmlFor="task-due-date">
              {t.dueDate}
            </label>

            <input
              id="task-due-date"
              type="date"
              value={formData.dueDate}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  dueDate: event.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">
              {t.priority}
            </label>

            <select
              id="task-priority"
              value={formData.priority}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  priority: event.target.value,
                })
              }
            >
              <option value="low">{t.low}</option>
              <option value="medium">{t.medium}</option>
              <option value="high">{t.high}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-hours">
              {t.estimatedHours}
            </label>

            <input
              id="task-hours"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.hours}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  hours: event.target.value,
                })
              }
            />
          </div>

          <div className="task-form-actions">
            <button type="submit">
              {t.save}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {/* PLANNER SUMMARY */}
      <section
        className="planner-summary"
        aria-label={isArabic ? "ملخص المخطط" : "Planner overview"}
      >
        <div>
          <span className="planner-summary-icon">
            <ListTodo size={17} />
          </span>
          <p>{t.total}</p>
          <h3>{tasks.length}</h3>
        </div>

        <div>
          <span className="planner-summary-icon completed">
            <CheckCircle2 size={17} />
          </span>
          <p>{t.completed}</p>
          <h3>{completedTasks}</h3>
        </div>

        <div>
          <span className="planner-summary-icon pending">
            <Clock3 size={17} />
          </span>
          <p>{t.pending}</p>
          <h3>{pendingTasks}</h3>
        </div>

        <div>
          <span className="planner-summary-icon">
            <CalendarDays size={17} />
          </span>
          <p>{t.weekly}</p>
          <h3>
            {weeklyHours % 1
              ? weeklyHours.toFixed(1)
              : weeklyHours}
            <small> {t.hours}</small>
          </h3>
        </div>
      </section>

      {/* CALENDAR AND DATE SUMMARY */}
      <div className="planner-calendar-layout">
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={selectDate}
          tasks={tasks}
          isArabic={isArabic}
        />

        <aside className="planner-date-summary">
          <span className="planner-summary-eyebrow">
            {selectedDate ? t.dayGlance : t.nextSteps}
          </span>

          <h2>
            {selectedDate
              ? formatDate(selectedDate)
              : t.stayOnTrack}
          </h2>

          <p>
            {selectedDate
              ? `${taskCount(tasksForSelectedDate.length)} ${t.tasksDue} · ${sessionsForSelectedDate.length} ${t.recurring}`
              : `${pendingTasks} ${t.openTasks} ${t.across} ${subjects.length} ${isArabic ? "مواد دراسية" : subjects.length === 1 ? "subject" : "subjects"}`}
          </p>

          <div className="planner-date-highlight">
            <CalendarDays size={18} />

            <span>
              {selectedDate && tasksForSelectedDate.length
                ? t.review
                : t.selectDate}
            </span>
          </div>

          {selectedDate && (
            <button
              className="planner-clear-filter"
              type="button"
              onClick={() => setSelectedDate(null)}
            >
              {t.showAll}
            </button>
          )}
        </aside>
      </div>

      {/* WEEKLY SCHEDULE */}
      <WeeklySchedule
        schedule={schedule}
        subjects={subjects}
        selectedDate={selectedDate}
        onSelectDay={selectDate}
        onAddSchedule={addSchedule}
        onDeleteSchedule={deleteSchedule}
      />

      {/* TASK LIST */}
      <section className="planner-task-section">
        <div className="planner-task-heading">
          <div>
            <span className="planner-summary-eyebrow">
              {selectedDate ? t.selectedDate : t.workload}
            </span>

            <h2>
              {selectedDate
                ? `${t.tasksFor} ${formatDate(selectedDate)}`
                : t.studyTasks}
            </h2>
          </div>

          <span className="planner-task-count">
            {taskCount(visibleTasks.length)}
          </span>
        </div>

        <TaskList
          tasks={visibleTasks}
          subjects={subjects}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          emptyTitle={
            selectedDate ? t.nothingDue : t.noTasks
          }
          emptyMessage={
            selectedDate
              ? t.chooseAnother
              : t.startPlan
          }
        />
      </section>
    </div>
  );
}

export default StudyPlanner;
