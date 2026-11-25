// ==========================================
// HELPERS - SMART STUDY PLANNER
// ==========================================

// Generate Unique ID
export const generateId = () => {
  return crypto.randomUUID();
};

// Format Date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get Today's Date
export const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

// Calculate Task Progress
export const calculateProgress = (tasks = []) => {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return Math.round(
    (completedTasks / tasks.length) * 100
  );
};

// Calculate Total Study Hours
export const calculateStudyHours = (tasks = []) => {
  return tasks
    .filter((task) => task.completed)
    .reduce(
      (total, task) => total + (Number(task.hours) || 0),
      0
    );
};

// Get Pending Tasks
export const getPendingTasks = (tasks = []) => {
  return tasks.filter((task) => !task.completed);
};

// Get Completed Tasks
export const getCompletedTasks = (tasks = []) => {
  return tasks.filter((task) => task.completed);
};

// Sort Tasks By Due Date
export const sortTasksByDate = (tasks = []) => {
  return [...tasks].sort(
    (a, b) =>
      new Date(a.dueDate || "9999-12-31") -
      new Date(b.dueDate || "9999-12-31")
  );
};

// Sort Tasks By Priority
export const sortTasksByPriority = (tasks = []) => {
  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...tasks].sort(
    (a, b) =>
      (priorityOrder[a.priority] || 4) -
      (priorityOrder[b.priority] || 4)
  );
};

// Get Tasks By Subject
export const filterTasksBySubject = (
  tasks = [],
  subjectId
) => {
  return tasks.filter(
    (task) => task.subjectId === subjectId
  );
};

// Calculate Remaining Hours
export const calculateRemainingHours = (
  totalHours,
  completedHours
) => {
  return Math.max(0, totalHours - completedHours);
};

// Calculate Weekly Study Hours
export const calculateWeeklyHours = (
  schedule = []
) => {
  return schedule.reduce(
    (total, item) => total + (Number(item.hours) || 0),
    0
  );
};

// Get Tasks Due Today
export const getTodayTasks = (tasks = []) => {
  const today = getToday();

  return tasks.filter(
    (task) =>
      task.dueDate === today && !task.completed
  );
};

// Get Overdue Tasks
export const getOverdueTasks = (tasks = []) => {
  const today = getToday();

  return tasks.filter(
    (task) =>
      task.dueDate &&
      task.dueDate < today &&
      !task.completed
  );
};

// Calculate Time Difference
export const calculateTimeDifference = (
  startTime,
  endTime
) => {
  const [startHour, startMinute] = startTime
    .split(":")
    .map(Number);

  const [endHour, endMinute] = endTime
    .split(":")
    .map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  return Math.max(0, (end - start) / 60);
};

// Format Study Time
export const formatStudyTime = (hours) => {
  const totalMinutes = Math.round(
    (Number(hours) || 0) * 60
  );

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;

  return `${h} hr ${m} min`;
};

// Search Tasks
export const searchTasks = (tasks = [], query = "") => {
  const searchValue = query.toLowerCase().trim();

  if (!searchValue) return tasks;

  return tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchValue) ||
      task.description?.toLowerCase().includes(searchValue)
  );
};

// Get Priority Color
export const getPriorityColor = (priority) => {
  const colors = {
    high: "#E57373",
    medium: "#FFB74D",
    low: "#81C784",
  };

  return colors[priority] || "#999999";
};

// Get Greeting Based On Time
export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";

  return "Good Evening";
};

// Calculate Completion Percentage
export const calculateCompletionPercentage = (
  completed,
  total
) => {
  if (total <= 0) return 0;

  return Math.round((completed / total) * 100);
};

// Validate Subject Name
export const validateSubjectName = (name) => {
  return (
    typeof name === "string" &&
    name.trim().length >= 2
  );
};

// Validate Study Hours
export const validateStudyHours = (hours) => {
  return (
    Number.isFinite(Number(hours)) &&
    Number(hours) >= 0 &&
    Number(hours) <= 168
  );
};