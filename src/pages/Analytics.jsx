
import React from "react";
import { useStudy } from "../context/StudyContext";
import { useLanguage } from "../App";

const translations = {
  en: {
    title: "Study Analytics 📊",
    subtitle: "Analyze your academic performance and real study progress.",
    overview: "Academic Overview",
    subjects: "Total Subjects",
    completed: "Completed Tasks",
    pending: "Pending Tasks",
    hours: "Task Study Hours",
    completion: "Overall Completion",
    completedOut: "completed out of",
    tasks: "tasks",
    realPerformance: "Real Study Performance 📈",
    realSubtitle: "Statistics collected from your recorded study sessions.",
    refresh: "Refresh Data",
    refreshing: "Refreshing...",
    loading: "Loading your real study data...",
    recorded: "Recorded Sessions",
    actual: "Actual Study Time",
    expected: "Expected Study Time",
    average: "Average Session Time",
    comparison: "Expected vs Actual Study Time",
    actualTime: "Actual time",
    expectedTime: "Expected time",
    spentMore: "You spent",
    moreExpected: "more than expected.",
    finishedEarlier: "You finished",
    earlier: "earlier than expected.",
    exact: "You finished exactly within the expected time.",
    accuracy: "Time Estimation Accuracy",
    accuracyNote: "This is a comparison of recorded time, not a validated measure of prediction accuracy.",
    history: "Study Session History 📚",
    noSessions: "No study sessions recorded yet. Analyze a lecture and save your study session to see your progress here.",
    pages: "pages",
    words: "words",
    difference: "Difference",
    knowledge: "Knowledge Level",
    unknown: "Unknown",
    subjectPerformance: "Subject Performance",
    noSubjects: "No subjects added yet.",
    min: "min",
    hour: "h",
    minute: "m",
  },

  ar: {
    title: "تحليلات المذاكرة 📊",
    subtitle: "تابعي أداءك الدراسي وتقدمك الفعلي في المذاكرة.",
    overview: "نظرة عامة على الأداء الدراسي",
    subjects: "إجمالي المواد",
    completed: "المهام المكتملة",
    pending: "المهام المتبقية",
    hours: "ساعات المذاكرة",
    completion: "نسبة الإنجاز الإجمالية",
    completedOut: "مهمة مكتملة من أصل",
    tasks: "مهام",
    realPerformance: "الأداء الفعلي للمذاكرة 📈",
    realSubtitle: "إحصائيات تم جمعها من جلسات المذاكرة المسجلة.",
    refresh: "تحديث البيانات",
    refreshing: "جاري التحديث...",
    loading: "جاري تحميل بيانات المذاكرة...",
    recorded: "جلسات المذاكرة المسجلة",
    actual: "وقت المذاكرة الفعلي",
    expected: "وقت المذاكرة المتوقع",
    average: "متوسط وقت الجلسة",
    comparison: "مقارنة الوقت المتوقع بالفعلي",
    actualTime: "الوقت الفعلي",
    expectedTime: "الوقت المتوقع",
    spentMore: "استغرقتِ",
    moreExpected: "أكثر من الوقت المتوقع.",
    finishedEarlier: "أنهيتِ المذاكرة قبل الموعد المتوقع بـ",
    earlier: ".",
    exact: "أنهيتِ المذاكرة في نفس الوقت المتوقع تمامًا.",
    accuracy: "دقة تقدير وقت المذاكرة",
    accuracyNote: "هذه مقارنة بين الوقت المسجل والمتوقع، وليست مقياسًا معتمدًا لدقة التنبؤ.",
    history: "سجل جلسات المذاكرة 📚",
    noSessions: "لا توجد جلسات مذاكرة مسجلة حتى الآن. حللي محاضرة واحفظي جلسة المذاكرة لعرض تقدمك هنا.",
    pages: "صفحات",
    words: "كلمة",
    difference: "الفرق",
    knowledge: "مستوى المعرفة",
    unknown: "غير محدد",
    subjectPerformance: "أداء المواد الدراسية",
    noSubjects: "لم تتم إضافة أي مواد دراسية حتى الآن.",
    min: "دقيقة",
    hour: "س",
    minute: "د",
  },
};

function formatMinutes(minutes, language, t) {
  const value = Number(minutes) || 0;

  if (value < 60) {
    return language === "ar"
      ? `${value.toFixed(1)} ${t.min}`
      : `${value.toFixed(1)} ${t.min}`;
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = Math.round(value % 60);

  if (language === "ar") {
    return remainingMinutes > 0
      ? `${hours} ${t.hour} ${remainingMinutes} ${t.minute}`
      : `${hours} ${t.hour}`;
  }

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

function Analytics() {
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

    studySessions = [],
    sessionsLoading,
    sessionsError,
    refreshStudySessions,

    studySessionCount,
    actualStudyMinutes,
    expectedStudyMinutes,
    averageSessionMinutes,
    studyTimeDifference,
    studyTimeAccuracy,
  } = useStudy();

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const safeProgress = Math.min(
    100,
    Math.max(0, Number(progress) || 0)
  );

  const sortedSessions = [...studySessions].sort(
    (a, b) =>
      new Date(b.session_date) - new Date(a.session_date)
  );

  const stats = [
    {
      icon: "📚",
      value: subjects.length,
      label: t.subjects,
    },
    {
      icon: "✅",
      value: completedTasks,
      label: t.completed,
    },
    {
      icon: "⏳",
      value: pendingTasks,
      label: t.pending,
    },
    {
      icon: "⏱️",
      value: `${totalStudyHours}h`,
      label: t.hours,
    },
  ];

  return (
    <div className="analytics-page" dir={isArabic ? "rtl" : "ltr"}>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      {/* ACADEMIC OVERVIEW */}
      <h2>{t.overview}</h2>

      <div className="analytics-grid">
        {stats.map((stat, index) => (
          <div className="analytics-card" key={index}>
            <span>{stat.icon}</span>
            <h2>{stat.value}</h2>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* TASK COMPLETION */}
      <div className="analytics-panel">
        <h2>{t.completion}</h2>

        <div className="progress-bar">
          <div
            style={{
              width: `${safeProgress}%`,
            }}
          />
        </div>

        <h3>{safeProgress}%</h3>

        <p>
          {completedTasks} {t.completedOut} {totalTasks} {t.tasks}.
        </p>
      </div>

      {/* REAL STUDY STATISTICS */}
      <div className="analytics-panel">

        <div className="page-header">
          <div>
            <h2>{t.realPerformance}</h2>
            <p>{t.realSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={refreshStudySessions}
            disabled={sessionsLoading}
          >
            {sessionsLoading ? t.refreshing : t.refresh}
          </button>
        </div>

        {sessionsLoading ? (
          <p>{t.loading}</p>
        ) : sessionsError ? (
          <p role="alert">{sessionsError}</p>
        ) : (
          <>
            {/* SESSION STATISTICS */}
            <div className="analytics-grid">

              <div className="analytics-card">
                <span>📖</span>
                <h2>{studySessionCount}</h2>
                <p>{t.recorded}</p>
              </div>

              <div className="analytics-card">
                <span>⏱️</span>
                <h2>
                  {formatMinutes(actualStudyMinutes, language, t)}
                </h2>
                <p>{t.actual}</p>
              </div>

              <div className="analytics-card">
                <span>🎯</span>
                <h2>
                  {formatMinutes(expectedStudyMinutes, language, t)}
                </h2>
                <p>{t.expected}</p>
              </div>

              <div className="analytics-card">
                <span>📊</span>
                <h2>
                  {formatMinutes(averageSessionMinutes, language, t)}
                </h2>
                <p>{t.average}</p>
              </div>

            </div>

            {/* STUDY TIME COMPARISON */}
            <div className="analytics-panel">

              <h2>{t.comparison}</h2>

              <p>
                {t.actualTime}:{" "}
                {formatMinutes(actualStudyMinutes, language, t)}
              </p>

              <p>
                {t.expectedTime}:{" "}
                {formatMinutes(expectedStudyMinutes, language, t)}
              </p>

              <p>
                {studyTimeDifference > 0
                  ? `${t.spentMore} ${formatMinutes(studyTimeDifference, language, t)} ${t.moreExpected}`
                  : studyTimeDifference < 0
                  ? `${t.finishedEarlier} ${formatMinutes(Math.abs(studyTimeDifference), language, t)}${t.earlier}`
                  : t.exact}
              </p>

              {studyTimeAccuracy !== null && (
                <div>
                  <h3>
                    {t.accuracy}:{" "}
                    {studyTimeAccuracy.toFixed(1)}%
                  </h3>

                  <div className="progress-bar">
                    <div
                      style={{
                        width: `${Math.min(studyTimeAccuracy, 100)}%`,
                      }}
                    />
                  </div>

                  <p>{t.accuracyNote}</p>
                </div>
              )}
            </div>

            {/* SESSION HISTORY */}
            <div className="analytics-panel">

              <h2>{t.history}</h2>

              {sortedSessions.length === 0 ? (
                <p>{t.noSessions}</p>
              ) : (
                <div className="session-history">

                  {sortedSessions.map((session, index) => {
                    const actual =
                      Number(session.actual_minutes) || 0;

                    const expected =
                      Number(session.expected_minutes) || 0;

                    const difference = actual - expected;

                    return (
                      <div
                        className="subject-analytics"
                        key={`${session.session_date}-${session.material_name}-${index}`}
                      >
                        <div>
                          <strong>{session.material_name}</strong>
                          <span>{session.session_date}</span>
                        </div>

                        <p>
                          {session.pages_count} {t.pages}
                          {" • "}
                          {session.word_count} {t.words}
                        </p>

                        <p>
                          {t.actualTime}:{" "}
                          {formatMinutes(actual, language, t)}
                          {" | "}
                          {t.expectedTime}:{" "}
                          {formatMinutes(expected, language, t)}
                        </p>

                        <p>
                          {t.difference}:{" "}
                          {difference > 0 ? "+" : ""}
                          {formatMinutes(difference, language, t)}
                        </p>

                        <p>
                          {t.knowledge}:{" "}
                          {session.knowledge_level || t.unknown}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* SUBJECT PERFORMANCE */}
      <div className="analytics-panel">

        <h2>{t.subjectPerformance}</h2>

        {subjects.length === 0 ? (
          <p>{t.noSubjects}</p>
        ) : (
          subjects.map((subject) => {
            const subjectTasks = tasks.filter(
              (task) => task.subjectId === subject.id
            );

            const completed = subjectTasks.filter(
              (task) => task.completed
            ).length;

            const percentage =
              subjectTasks.length > 0
                ? Math.round(
                    (completed / subjectTasks.length) * 100
                  )
                : 0;

            return (
              <div
                className="subject-analytics"
                key={subject.id}
              >
                <div>
                  <strong>{subject.name}</strong>
                  <span>{percentage}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: subject.color,
                    }}
                  />
                </div>

                <p>
                  {completed} {t.completedOut}{" "}
                  {subjectTasks.length} {t.tasks}.
                </p>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default Analytics;
