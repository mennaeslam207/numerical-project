
import React from "react";
import { Link } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../App";

import {
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CalendarDays,
  Plus,
  BarChart3,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const translations = {
  en: {
    welcome: "Welcome Back,",
    subtitle: "Stay focused, keep learning, and make every study session count.",
    personalSpace: "YOUR PERSONAL LEARNING SPACE",
    activity: "YOUR ACTIVITY",
    overview: "Academic Overview",
    progress: "Your progress",
    subjects: "Total Subjects",
    subjectsDesc: "Your learning subjects",
    tasks: "Total Tasks",
    tasksDesc: "Tasks in your planner",
    completed: "Completed Tasks",
    completedDesc: "Successfully completed",
    hours: "Study Hours",
    hoursDesc: "Your study time",
    performance: "PERFORMANCE",
    overall: "Overall Progress",
    goals: "Keep moving towards your academic goals.",
    completedLabel: "Completed",
    pending: "Pending Tasks",
    total: "Total Tasks",
    start: "Start by adding your first study task!",
    encouragement: "Great work! Every completed task brings you closer to your goals.",
    organized: "STAY ORGANIZED",
    upcoming: "Upcoming Tasks",
    nextActivities: "Your next study activities.",
    caughtUp: "You're all caught up!",
    noTasks: "No pending tasks. Great job!",
    addTask: "Add New Task",
    noDate: "No due date",
    medium: "Medium",
    viewAll: "View All Tasks",
    quick: "GET THINGS DONE",
    quickActions: "Quick Actions",
    addSubject: "Add New Subject",
    addSubjectDesc: "Organize a new learning subject.",
    createPlan: "Create Study Plan",
    createPlanDesc: "Plan your upcoming study tasks.",
    viewAnalytics: "View Analytics",
    analyticsDesc: "Track your academic performance.",
    student: "Student",
    high: "High",
    low: "Low",
  },

  ar: {
    welcome: "مرحبًا بعودتك،",
    subtitle: "حافظي على تركيزك، وواصلي التعلم، واجعلي كل جلسة مذاكرة مهمة.",
    personalSpace: "مساحتك التعليمية الشخصية",
    activity: "نشاطك الدراسي",
    overview: "نظرة عامة على أدائك الدراسي",
    progress: "مستوى تقدمك",
    subjects: "إجمالي المواد",
    subjectsDesc: "المواد الدراسية الخاصة بك",
    tasks: "إجمالي المهام",
    tasksDesc: "المهام الموجودة في مخططك",
    completed: "المهام المكتملة",
    completedDesc: "المهام التي أنجزتها",
    hours: "ساعات المذاكرة",
    hoursDesc: "إجمالي وقت المذاكرة",
    performance: "الأداء الدراسي",
    overall: "التقدم الإجمالي",
    goals: "واصلي التقدم نحو أهدافك الدراسية.",
    completedLabel: "مكتملة",
    pending: "المهام المتبقية",
    total: "إجمالي المهام",
    start: "ابدئي بإضافة أول مهمة للمذاكرة!",
    encouragement: "عمل رائع! كل مهمة تنجزينها تقربك من أهدافك.",
    organized: "نظّمي وقتك",
    upcoming: "المهام القادمة",
    nextActivities: "أنشطتك الدراسية القادمة.",
    caughtUp: "أحسنتِ! لا توجد مهام متبقية.",
    noTasks: "ليس لديك مهام معلقة حاليًا.",
    addTask: "إضافة مهمة جديدة",
    noDate: "لا يوجد موعد محدد",
    medium: "متوسط",
    viewAll: "عرض كل المهام",
    quick: "ابدئي الإنجاز",
    quickActions: "اختصارات سريعة",
    addSubject: "إضافة مادة جديدة",
    addSubjectDesc: "نظّمي مادة دراسية جديدة.",
    createPlan: "إنشاء خطة مذاكرة",
    createPlanDesc: "خططي لمهام المذاكرة القادمة.",
    viewAnalytics: "عرض التحليلات",
    analyticsDesc: "تابعي أداءك الدراسي.",
    student: "طالبة",
    high: "مرتفع",
    low: "منخفض",
  },
};

function Dashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const t = translations[language] || translations.en;
  const isArabic = language === "ar";

  const {
    subjects = [],
    tasks = [],
    completedTasks = 0,
    totalTasks = 0,
    progress = 0,
    totalStudyHours = 0,
  } = useStudy();

  const pendingTasks = tasks.filter((task) => !task.completed);

  const safeProgress = Math.min(
    100,
    Math.max(0, Number(progress) || 0)
  );

  const stats = [
    {
      title: t.subjects,
      value: subjects.length,
      icon: BookOpen,
      color: "blue",
      description: t.subjectsDesc,
    },
    {
      title: t.tasks,
      value: totalTasks,
      icon: ClipboardList,
      color: "cyan",
      description: t.tasksDesc,
    },
    {
      title: t.completed,
      value: completedTasks,
      icon: CheckCircle2,
      color: "green",
      description: t.completedDesc,
    },
    {
      title: t.hours,
      value: `${totalStudyHours}h`,
      icon: Clock,
      color: "orange",
      description: t.hoursDesc,
    },
  ];

  const actions = [
    {
      title: t.addSubject,
      description: t.addSubjectDesc,
      icon: Plus,
      path: "/subjects",
    },
    {
      title: t.createPlan,
      description: t.createPlanDesc,
      icon: CalendarDays,
      path: "/planner",
    },
    {
      title: t.viewAnalytics,
      description: t.analyticsDesc,
      icon: BarChart3,
      path: "/analytics",
    },
  ];

  const getPriority = (priority) => {
    const value = String(priority || "medium").toLowerCase();

    if (value === "high") return t.high;
    if (value === "low") return t.low;

    return t.medium;
  };

  return (
    <div className="dashboard-page" dir={isArabic ? "rtl" : "ltr"}>
      {/* WELCOME */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <div className="welcome-badge">
            <Sparkles size={14} />
            {t.personalSpace}
          </div>

          <h2>
            {t.welcome}{" "}
            <span>{user?.name || t.student}</span> 👋
          </h2>

          <p>{t.subtitle}</p>
        </div>

        <div className="welcome-decoration">
          <div className="welcome-decoration-circle">
            <Sparkles size={46} />
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="dashboard-stats">
        <div className="dashboard-section-heading">
          <div>
            <span className="section-eyebrow">{t.activity}</span>
            <h3>{t.overview}</h3>
          </div>

          <span className="overview-tag">
            <TrendingUp size={14} />
            {t.progress}
          </span>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className={`stat-card dashboard-stat-card ${stat.color}`}
                key={stat.title}
              >
                <div className="stat-card-top">
                  <div className="stat-icon">
                    <Icon size={22} />
                  </div>
                </div>

                <h3>{stat.value}</h3>
                <p>{stat.title}</p>

                <span className="stat-description">
                  {stat.description}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* PROGRESS AND TASKS */}
      <section className="dashboard-content">
        {/* OVERALL PROGRESS */}
        <div className="dashboard-panel progress-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">
                {t.performance}
              </span>

              <h2>{t.overall}</h2>
              <p>{t.goals}</p>
            </div>

            <div className="panel-icon">
              <Target size={23} />
            </div>
          </div>

          <div className="progress-overview">
            <div className="progress-circle">
              <svg viewBox="0 0 120 120">
                <circle
                  className="progress-circle-bg"
                  cx="60"
                  cy="60"
                  r="48"
                />

                <circle
                  className="progress-circle-value"
                  cx="60"
                  cy="60"
                  r="48"
                  style={{
                    strokeDasharray: `${(safeProgress / 100) * 301.6} 301.6`,
                  }}
                />
              </svg>

              <div className="progress-circle-text">
                <strong>{safeProgress}%</strong>
                <span>{t.completedLabel}</span>
              </div>
            </div>

            <div className="progress-details">
              <div className="progress-detail-item">
                <span className="progress-dot completed-dot"></span>

                <div>
                  <strong>{completedTasks}</strong>
                  <span>{t.completed}</span>
                </div>
              </div>

              <div className="progress-detail-item">
                <span className="progress-dot pending-dot"></span>

                <div>
                  <strong>{pendingTasks.length}</strong>
                  <span>{t.pending}</span>
                </div>
              </div>

              <div className="progress-detail-item">
                <span className="progress-dot total-dot"></span>

                <div>
                  <strong>{totalTasks}</strong>
                  <span>{t.total}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="progress-bottom-message">
            <Zap size={16} />

            {totalTasks === 0
              ? t.start
              : t.encouragement}
          </div>
        </div>

        {/* UPCOMING TASKS */}
        <div className="dashboard-panel upcoming-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">
                {t.organized}
              </span>

              <h2>{t.upcoming}</h2>
              <p>{t.nextActivities}</p>
            </div>

            <div className="panel-icon">
              <CalendarDays size={22} />
            </div>
          </div>

          <div className="upcoming-task-list">
            {pendingTasks.length === 0 ? (
              <div className="empty-tasks">
                <div className="empty-task-icon">
                  <CheckCircle2 size={28} />
                </div>

                <h3>{t.caughtUp}</h3>
                <p>{t.noTasks}</p>

                <Link to="/planner">
                  {t.addTask} <ArrowUpRight size={15} />
                </Link>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task) => (
                <div className="dashboard-task" key={task.id}>
                  <div className="task-indicator"></div>

                  <div className="dashboard-task-info">
                    <h4>{task.title}</h4>

                    <span>
                      <CalendarDays size={13} />
                      {task.dueDate || t.noDate}
                    </span>
                  </div>

                  <span
                    className={`priority ${String(
                      task.priority || "medium"
                    ).toLowerCase()}`}
                  >
                    {getPriority(task.priority)}
                  </span>
                </div>
              ))
            )}
          </div>

          {pendingTasks.length > 0 && (
            <Link
              to="/planner"
              className="view-all-tasks"
            >
              {t.viewAll} <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="quick-actions dashboard-quick-actions">
        <div className="dashboard-section-heading">
          <div>
            <span className="section-eyebrow">{t.quick}</span>
            <h3>{t.quickActions}</h3>
          </div>
        </div>

        <div className="quick-actions-grid">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                to={action.path}
                className="quick-action-card"
                key={action.title}
              >
                <div className="quick-action-icon">
                  <Icon size={23} />
                </div>

                <div className="quick-action-info">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>

                <ArrowUpRight
                  size={19}
                  className="quick-action-arrow"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
