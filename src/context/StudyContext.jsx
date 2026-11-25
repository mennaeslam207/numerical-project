
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  mockSchedule,
  mockSubjects,
  mockTasks,
} from "../data/mockData";

const StudyContext = createContext();

const demoSeedKey = "studyDemoSeeded";
const STUDENT_ID = "Student1";
const API_URL = "http://127.0.0.1:8000";

const readStoredCollection = (key) => {
  try {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) return null;

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return [];
  }
};

const loadInitialData = () => {
  const storedSubjects = readStoredCollection("studySubjects");
  const storedTasks = readStoredCollection("studyTasks");
  const storedSchedule = readStoredCollection("studySchedule");

  const collections = [
    storedSubjects,
    storedTasks,
    storedSchedule,
  ];

  const shouldSeed =
    localStorage.getItem(demoSeedKey) !== "true" &&
    collections.every(
      (collection) => !collection || collection.length === 0
    );

  return {
    subjects: shouldSeed ? mockSubjects : storedSubjects || [],
    tasks: shouldSeed ? mockTasks : storedTasks || [],
    schedule: shouldSeed ? mockSchedule : storedSchedule || [],
  };
};

export const StudyProvider = ({ children }) => {

  // =========================
  // Existing Application Data
  // =========================

  const [initialData] = useState(loadInitialData);

  const [subjects, setSubjects] = useState(initialData.subjects);
  const [tasks, setTasks] = useState(initialData.tasks);
  const [schedule, setSchedule] = useState(initialData.schedule);

  const [studyHours, setStudyHours] = useState(() => {
    const savedGoal = Number(
      localStorage.getItem("studyWeeklyGoal")
    );

    return Number.isFinite(savedGoal) && savedGoal > 0
      ? savedGoal
      : 25;
  });

  // =========================
  // Real Study Sessions
  // =========================

  const [studySessions, setStudySessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const refreshStudySessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError("");

    try {
      const response = await fetch(
        `${API_URL}/api/study-sessions?student_id=${encodeURIComponent(STUDENT_ID)}`
      );

      if (!response.ok) {
        throw new Error("Could not load study sessions.");
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.sessions)) {
        throw new Error("Invalid study sessions response.");
      }

      setStudySessions(result.sessions);

    } catch (error) {
      console.error("Study sessions loading error:", error);

      setSessionsError(
        "Unable to load study sessions. Make sure the backend is running."
      );

    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStudySessions();
  }, [refreshStudySessions]);

  // =========================
  // Save Existing Data
  // =========================

  useEffect(() => {
    localStorage.setItem(demoSeedKey, "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "studySubjects",
      JSON.stringify(subjects)
    );
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(
      "studyTasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      "studySchedule",
      JSON.stringify(schedule)
    );
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(
      "studyWeeklyGoal",
      String(studyHours)
    );
  }, [studyHours]);

  // =========================
  // Subject Management
  // =========================

  const addSubject = (subject) => {
    const newSubject = {
      id: crypto.randomUUID(),
      name: subject.name,
      description: subject.description || "",
      hoursPerWeek: Number(subject.hoursPerWeek) || 0,
      color: subject.color || "#8B6F91",
    };

    setSubjects((prev) => [...prev, newSubject]);

    return newSubject;
  };

  const updateSubject = (id, updatedData) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === id
          ? { ...subject, ...updatedData }
          : subject
      )
    );
  };

  const deleteSubject = (id) => {
    setSubjects((prev) =>
      prev.filter((subject) => subject.id !== id)
    );

    setTasks((prev) =>
      prev.filter((task) => task.subjectId !== id)
    );

    setSchedule((prev) =>
      prev.filter((item) => item.subjectId !== id)
    );
  };

  // =========================
  // Task Management
  // =========================

  const addTask = (task) => {
    const newTask = {
      id: crypto.randomUUID(),
      title: task.title,
      description: task.description || "",
      subjectId: task.subjectId,
      dueDate: task.dueDate || "",
      priority: task.priority || "medium",
      hours: Number(task.hours) || 0,
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);

    return newTask;
  };

  const updateTask = (id, updatedData) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updatedData }
          : task
      )
    );
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) =>
      prev.filter((task) => task.id !== id)
    );
  };

  // =========================
  // Schedule Management
  // =========================

  const addSchedule = (item) => {
    const newItem = {
      id: crypto.randomUUID(),
      day: item.day,
      subjectId: item.subjectId,

      subject:
        item.subject ||
        subjects.find(
          (subject) => subject.id === item.subjectId
        )?.name ||
        "",

      startTime: item.startTime,
      endTime: item.endTime,
      hours: Number(item.hours) || 0,
    };

    setSchedule((prev) => [...prev, newItem]);

    return newItem;
  };

  const updateSchedule = (id, updatedData) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updatedData }
          : item
      )
    );
  };

  const deleteSchedule = (id) => {
    setSchedule((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // =========================
  // Get Tasks By Subject
  // =========================

  const getTasksBySubject = (subjectId) => {
    return tasks.filter(
      (task) => task.subjectId === subjectId
    );
  };

  // =========================
  // Existing Task Statistics
  // =========================

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const progress =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0;

  const totalStudyHours = tasks
    .filter((task) => task.completed)
    .reduce(
      (total, task) => total + (Number(task.hours) || 0),
      0
    );

  // =========================
  // Real Study Session Statistics
  // =========================

  const actualStudyMinutes = studySessions.reduce(
    (total, session) =>
      total + (Number(session.actual_minutes) || 0),
    0
  );

  const expectedStudyMinutes = studySessions.reduce(
    (total, session) =>
      total + (Number(session.expected_minutes) || 0),
    0
  );

  const studySessionCount = studySessions.length;

  const averageSessionMinutes =
    studySessionCount > 0
      ? actualStudyMinutes / studySessionCount
      : 0;

  const studyTimeDifference =
    actualStudyMinutes - expectedStudyMinutes;

  const studyTimeAccuracy =
    expectedStudyMinutes > 0
      ? Math.max(
          0,
          100 -
            (Math.abs(studyTimeDifference) /
              expectedStudyMinutes) *
              100
        )
      : null;

  const totalActualStudyHours = actualStudyMinutes / 60;

  // =========================
  // Context Value
  // =========================

  const value = {
    subjects,
    tasks,
    schedule,
    studyHours,
    setStudyHours,

    addSubject,
    updateSubject,
    deleteSubject,

    addTask,
    updateTask,
    toggleTask,
    deleteTask,

    addSchedule,
    updateSchedule,
    deleteSchedule,

    getTasksBySubject,

    completedTasks,
    totalTasks,
    progress,
    totalStudyHours,

    // Real study sessions
    studySessions,
    sessionsLoading,
    sessionsError,
    refreshStudySessions,

    // Study statistics
    studySessionCount,
    actualStudyMinutes,
    expectedStudyMinutes,
    averageSessionMinutes,
    studyTimeDifference,
    studyTimeAccuracy,
    totalActualStudyHours,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);

  if (!context) {
    throw new Error(
      "useStudy must be used inside StudyProvider"
    );
  }

  return context;
};

export default StudyContext;
