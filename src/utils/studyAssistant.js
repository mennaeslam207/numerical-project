const priorityOrder = { high: 0, medium: 1, low: 2 };
const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const subjectAliases = {
  Mathematics: ["math", "maths"],
  "Computer Science": ["cs", "computing"],
  "Web Development": ["web development", "web dev"],
};
const ignoredTaskWords = new Set([
  "a", "an", "and", "complete", "completed", "do", "finish", "for", "i",
  "it", "mark", "my", "of", "please", "task", "the", "this", "to", "with",
]);

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12);
};

const formatDate = (value) => {
  const date = parseLocalDate(value);
  return date
    ? date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "No deadline";
};

const formatHours = (hours) => {
  const value = Number(hours) || 0;
  return `${value % 1 ? value.toFixed(1) : value} ${value === 1 ? "hour" : "hours"}`;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRelativeDate = (value, today) => {
  if (!value) return "no deadline";
  const difference = Math.round(
    (parseLocalDate(value) - parseLocalDate(today)) / 86400000
  );
  if (difference < 0) return `${Math.abs(difference)} day${difference === -1 ? "" : "s"} overdue`;
  if (difference === 0) return "due today";
  if (difference === 1) return "due tomorrow";
  return `due ${formatDate(value)}`;
};

const parseRequestedDate = (input, now) => {
  const normalized = input.toLowerCase();
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);

  const addDays = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return dateKey(date);
  };

  const explicitDate = normalized.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (explicitDate) return explicitDate[0];
  if (/\btoday\b/.test(normalized)) return dateKey(today);
  if (/\btomorrow\b/.test(normalized)) return addDays(1);

  const relativeDays = normalized.match(/\bin\s+(\d+)\s+days?\b/);
  if (relativeDays) return addDays(Number(relativeDays[1]));

  const weekdayMatch = normalized.match(
    /\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/
  );
  if (weekdayMatch) {
    const targetDay = dayNames.indexOf(
      weekdayMatch[2][0].toUpperCase() + weekdayMatch[2].slice(1)
    );
    let daysAhead = (targetDay - today.getDay() + 7) % 7;
    if (daysAhead === 0 && weekdayMatch[1]) daysAhead = 7;
    return addDays(daysAhead);
  }

  return null;
};

const parseTimeRange = (input) => {
  const twelveHourRange = input.match(
    /\b(?:from\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:to|until|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i
  );
  const twentyFourHourRange = input.match(
    /\b(?:from\s+)?([01]?\d|2[0-3]):([0-5]\d)\s*(?:to|until|-)\s*([01]?\d|2[0-3]):([0-5]\d)\b/i
  );

  const to24Hour = (hourText, minuteText, meridiem) => {
    let hour = Number(hourText);
    const minute = Number(minuteText || 0);

    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (meridiem.toLowerCase() === "am") {
      if (hour === 12) hour = 0;
    } else if (hour !== 12) {
      hour += 12;
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  if (twelveHourRange) {
    const startTime = to24Hour(
      twelveHourRange[1],
      twelveHourRange[2],
      twelveHourRange[3]
    );
    const endTime = to24Hour(
      twelveHourRange[4],
      twelveHourRange[5],
      twelveHourRange[6]
    );
    return startTime && endTime ? { startTime, endTime } : null;
  }

  if (twentyFourHourRange) {
    return {
      startTime: `${twentyFourHourRange[1].padStart(2, "0")}:${twentyFourHourRange[2]}`,
      endTime: `${twentyFourHourRange[3].padStart(2, "0")}:${twentyFourHourRange[4]}`,
    };
  }

  return null;
};

const findSubject = (input, subjects) => {
  const normalized = input.toLowerCase();
  return [...subjects]
    .sort((first, second) => second.name.length - first.name.length)
    .find((subject) => {
      const names = [subject.name, ...(subjectAliases[subject.name] || [])];
      return names.some((name) =>
        new RegExp(`\\b${escapeRegex(name)}\\b`, "i").test(normalized)
      );
    });
};

const normalizeWords = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !ignoredTaskWords.has(word));

const findTask = (input, tasks, pendingOnly = false) => {
  const query = input.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const queryWords = new Set(normalizeWords(query));
  const candidates = tasks
    .filter((task) => !pendingOnly || !task.completed)
    .map((task) => {
      const title = task.title.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
      const titleWords = normalizeWords(title);
      const overlap = titleWords.filter((word) => queryWords.has(word)).length;
      const score = query.includes(title.trim())
        ? 100
        : overlap / Math.max(1, titleWords.length);
      return { task, score };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((first, second) => second.score - first.score);

  if (!candidates.length) return null;
  if (
    candidates.length > 1 &&
    candidates[0].score === candidates[1].score &&
    candidates[0].score < 100
  ) {
    return null;
  }

  return candidates[0].task;
};

const formatTask = (task, subjects, today) => {
  const subject = subjects.find((item) => item.id === task.subjectId);
  const deadline = task.dueDate
    ? `${getRelativeDate(task.dueDate, today)} (${formatDate(task.dueDate)})`
    : "no deadline set";
  const status = task.completed ? "completed" : "open";
  return `${task.title} — ${subject?.name || "General"}, ${task.priority || "medium"} priority, ${formatHours(task.hours)}; ${deadline}; ${status}.`;
};

const sortPendingTasks = (tasks, today) =>
  tasks
    .filter((task) => !task.completed)
    .sort((first, second) => {
      const firstOverdue = first.dueDate && first.dueDate < today ? 0 : 1;
      const secondOverdue = second.dueDate && second.dueDate < today ? 0 : 1;
      if (firstOverdue !== secondOverdue) return firstOverdue - secondOverdue;

      const firstDate = first.dueDate || "9999-12-31";
      const secondDate = second.dueDate || "9999-12-31";
      if (firstDate !== secondDate) return firstDate.localeCompare(secondDate);

      return (
        (priorityOrder[first.priority] ?? 3) -
        (priorityOrder[second.priority] ?? 3)
      );
    });

const platformInstructions = (input) => {
  if (/\b(subject|course)\b/.test(input)) {
    return "To add a subject:\n1. Open My Subjects from the sidebar.\n2. Select Add Subject.\n3. Enter its name, weekly hours, and optional description, then save.\n\nYou can edit or remove a subject from its card. Removing it also removes its linked tasks and recurring sessions.";
  }
  if (/\b(task|assignment|deadline|planner|calendar)\b/.test(input)) {
    return "To plan a task:\n1. Open Study Planner and select Add Task.\n2. Add a title, subject, due date, priority, and time estimate.\n3. Save it. The task appears in the planner list and its deadline is marked on the calendar.\n4. Select a calendar date to filter the list; mark tasks complete to update your progress.";
  }
  if (/\b(schedule|session|timetable|weekly)\b/.test(input)) {
    return "In Study Planner, use the weekly schedule to review recurring sessions. Select a day to connect it to the calendar, choose Add session to create a subject/time slot, and use the remove icon on a session to delete it. Study tasks and recurring sessions are stored separately, but share the same subjects.";
  }
  if (/\b(note|vault|resource)\b/.test(input)) {
    return "Open Study Vault to create a note. Add a title and content, then save it. Use the search field to find notes; each note can be edited or deleted.";
  }
  if (/\b(analytics|progress|performance)\b/.test(input)) {
    return "Open Analytics for your task completion rate, completed and pending totals, study hours, and subject-by-subject progress. Completing a task in Study Planner updates these figures immediately.";
  }
  if (/\b(numerical|calculator|bisection|secant|root)\b/.test(input)) {
    return "Open Numerical Lab, choose Bisection or Secant, enter two starting values and a positive tolerance, then select Calculate Root. The result includes the approximate root and iteration table.";
  }
  if (/\b(setting|goal|notification|account|logout)\b/.test(input)) {
    return "Open Settings to review your profile, set a weekly study-hour goal, change app preferences, or sign out.";
  }

  return null;
};

const buildStudyPlan = (input, tasks, subjects, schedule, today) => {
  const pending = sortPendingTasks(tasks, today);
  const requestedHours = Number(
    input.match(/\b(\d+(?:\.\d+)?)\s*hours?\b/)?.[1]
  ) || 0;
  const availableHours = requestedHours || 2;
  const picked = [];
  let plannedHours = 0;

  for (const task of pending) {
    if (picked.length && plannedHours >= availableHours) break;
    picked.push(task);
    plannedHours += Number(task.hours) || 1;
  }

  const todayName = dayNames[new Date(`${today}T12:00:00`).getDay()];
  const todaySessions = schedule
    .filter((session) => session.day === todayName)
    .sort((first, second) =>
      (first.startTime || "").localeCompare(second.startTime || "")
    );

  if (!picked.length) {
    return "You have no open tasks right now. Use a short review block for a subject that needs attention, or add a task in Study Planner to make the next step concrete.";
  }

  const taskSteps = picked.map((task, index) => {
    const subject = subjects.find((item) => item.id === task.subjectId);
    return `${index + 1}. ${task.title} (${subject?.name || "General"}): ${formatHours(task.hours)}, ${getRelativeDate(task.dueDate, today)}, ${task.priority || "medium"} priority.`;
  });
  const sessionLines = todaySessions.map((session) => {
    const subject =
      subjects.find((item) => item.id === session.subjectId)?.name ||
      session.subject ||
      "Study session";
    return `• ${session.startTime}–${session.endTime}: ${subject}`;
  });

  return [
    `Here is a focused ${requestedHours ? `${requestedHours}-hour` : "next"} study plan, ordered by deadline and priority:`,
    ...taskSteps,
    "Use 45–50 minutes of focused work, then take a 10-minute break. If a task needs longer, split it into smaller blocks and leave time to check your work.",
    ...(sessionLines.length
      ? ["Your recurring sessions today:", ...sessionLines]
      : []),
  ].join("\n");
};

export function getStudyAssistantReply(
  question,
  study = {},
  actions = {}
) {
  const input = String(question || "").trim();
  const normalized = input.toLowerCase();
  const subjects = study.subjects || [];
  const tasks = study.tasks || [];
  const schedule = study.schedule || [];
  const now = study.now ? new Date(study.now) : new Date();
  const today = dateKey(now);
  const pending = sortPendingTasks(tasks, today);
  const completed = tasks.filter((task) => task.completed);
  const progress = tasks.length
    ? Math.round((completed.length / tasks.length) * 100)
    : 0;

  if (!input) {
    return "Ask me about your progress, a subject, deadlines, your weekly schedule, or what to study next. I can also add tasks and update completion or priority when you name the task.";
  }

  if (/\b(hello|hi|hey)\b/.test(normalized)) {
    return `Hi! I’m your StudyFlow study coach. I can see ${subjects.length} subjects, ${pending.length} open tasks, and ${schedule.length} recurring study sessions. Ask for a deadline review, a study plan, or help with any platform feature.`;
  }

  const instructions = platformInstructions(normalized);
  const asksHowTo =
    /\b(how do i|how can i|where do i|show me how|steps to)\b/.test(normalized);
  if (asksHowTo && instructions) return instructions;

  const isCreateTask =
    /\b(add|create|schedule|make)\b/.test(normalized) &&
    /\b(task|assignment|homework|reminder)\b/.test(normalized) &&
    !asksHowTo;
  if (isCreateTask) {
    if (!subjects.length) {
      return "I can create that task as soon as you have a subject. Open My Subjects, add a subject, then ask me again with the task title and deadline.";
    }

    const subject = findSubject(input, subjects);
    if (!subject) {
      return `Which subject should I use? Your current subjects are: ${subjects.map((item) => item.name).join(", ")}. Include one of those names in your request and I’ll add the task.`;
    }
    const subjectMention = [subject.name, ...(subjectAliases[subject.name] || [])]
      .sort((first, second) => second.length - first.length)
      .find((name) =>
        new RegExp(`\\b${escapeRegex(name)}\\b`, "i").test(input)
      );

    const requestedDate = parseRequestedDate(input, now);
    const priority = normalized.match(/\b(high|medium|low)\s+priority\b/)?.[1]
      || normalized.match(/\bpriority\s+(?:to\s+)?(high|medium|low)\b/)?.[1]
      || "medium";
    const requestedHours = normalized.match(
      /\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/
    );
    let title = input
      .replace(/^(?:please\s+)?(?:can you\s+)?(?:add|create|schedule|make)\s+/i, "")
      .replace(/^(?:me\s+)?(?:(?:a|an|new|study)\s+)*(?:task|assignment|homework|reminder)\s*:?\s*/i, "")
      .replace(new RegExp(`\\b(?:for|in|under)\\s+${escapeRegex(subjectMention)}\\b`, "ig"), " ")
      .replace(new RegExp(`\\b${escapeRegex(subjectMention)}\\b`, "ig"), " ")
      .replace(/\b(?:due|by|on)\s+(?:today|tomorrow|next\s+\w+|(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)|20\d{2}-\d{2}-\d{2}|in\s+\d+\s+days?)\b/ig, " ")
      .replace(/\b(?:today|tomorrow|next\s+week|next\s+(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)|(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)|in\s+\d+\s+days?)\b/ig, " ")
      .replace(/\b(?:high|medium|low)\s+priority\b|\bpriority\s+(?:to\s+)?(?:high|medium|low)\b/ig, " ")
      .replace(/\b(?:for\s+)?\d+(?:\.\d+)?\s*(?:hours?|hrs?|h)\b/ig, " ")
      .replace(/^(?:to|about|please)\s+/i, "")
      .replace(/\b(?:due|priority|with)\b/ig, " ")
      .replace(/^[\s:,-]+|[\s,.-]+$/g, "")
      .replace(/\s+/g, " ");

    const titledTask = input.match(
      /\b(?:called|titled|named)\s+["“]?(.+?)["”]?(?=\s+\b(?:for|due|by|priority|with)\b|$)/i
    );
    if (titledTask) title = titledTask[1].trim();

    if (title.length < 3) {
      return `What should I call the ${subject.name} task? For example: “Add a task to review chapter 3 for ${subject.name} due tomorrow, high priority, 2 hours.”`;
    }

    const task = actions.addTask?.({
      title,
      description: "Created with StudyFlow Assistant.",
      subjectId: subject.id,
      dueDate: requestedDate || "",
      priority,
      hours: requestedHours ? Number(requestedHours[1]) : 1,
    });

    if (!task) {
      return "I couldn’t add the task because task creation is unavailable right now. Please use Add Task in Study Planner.";
    }

    return `Added “${title}” to ${subject.name} in Study Planner.\n• Deadline: ${requestedDate ? formatDate(requestedDate) : "not set"}\n• Priority: ${priority}\n• Estimate: ${formatHours(requestedHours ? Number(requestedHours[1]) : 1)}\n\nIt will appear on the calendar when it has a due date. Mark it complete in the planner to update your progress.`;
  }

  const isCreateSession =
    /\b(?:add|create|schedule|plan)\b/.test(normalized) &&
    /\b(?:session|study block|weekly slot|weekly session)\b/.test(normalized) &&
    !asksHowTo;
  if (isCreateSession) {
    const subject = findSubject(input, subjects);
    const day = dayNames.find((name) =>
      new RegExp(`\\b${name.toLowerCase()}\\b`, "i").test(normalized)
    );
    const timeRange = parseTimeRange(input);

    if (!subject || !day || !timeRange) {
      return `To add a recurring session, include a subject, weekday, and time range. For example: “Schedule a Physics session on Wednesday from 3 PM to 4 PM.” Subjects: ${subjects.map((item) => item.name).join(", ")}.`;
    }

    if (!actions.addSchedule) {
      return "I understand the session details, but can’t save a schedule from this screen. Use Add session in Study Planner.";
    }

    const startMinutes = timeRange.startTime
      .split(":")
      .reduce((hours, value, index) => hours + Number(value) * (index ? 1 : 60), 0);
    const endMinutes = timeRange.endTime
      .split(":")
      .reduce((hours, value, index) => hours + Number(value) * (index ? 1 : 60), 0);
    if (endMinutes <= startMinutes) {
      return "That time range ends before it starts. Give me a later end time, such as “from 3 PM to 4 PM.”";
    }

    const hours = (endMinutes - startMinutes) / 60;
    actions.addSchedule({
      day,
      subjectId: subject.id,
      startTime: timeRange.startTime,
      endTime: timeRange.endTime,
      hours,
    });

    return `Added a recurring ${subject.name} session every ${day}, ${timeRange.startTime}–${timeRange.endTime} (${formatHours(hours)}). It is now in Weekly Study Schedule and updates your weekly planned hours.`;
  }

  const isCompletionCommand =
    /\b(?:mark|complete|finish|finished|done)\b/.test(normalized) &&
    /\b(?:task|assignment|todo|complete|finish|finished|done)\b/.test(normalized) &&
    !/\b(completed tasks|tasks completed|how many.*complete)\b/.test(normalized);
  if (isCompletionCommand) {
    const task = findTask(input, tasks, true);
    if (!task) {
      return pending.length
        ? `I couldn’t confidently match that to one open task. Please include more of its title. Open tasks include: ${pending.slice(0, 5).map((item) => item.title).join("; ")}.`
        : "There are no open tasks to complete. Add one in Study Planner whenever you’re ready.";
    }

    if (!actions.toggleTask) {
      return "I found the task, but can’t update it from this screen. Mark it complete in Study Planner.";
    }

    actions.toggleTask?.(task.id);
    return `Marked “${task.title}” complete. Your planner progress and Analytics totals update automatically.`;
  }

  const priorityCommand =
    /\b(?:set|make|change|update|raise|lower)\b/.test(normalized) &&
    /\bpriority\b/.test(normalized);
  if (priorityCommand) {
    const requestedPriority = normalized.match(
      /\b(high|medium|low)(?:\s+priority)?\b/
    )?.[1];
    const task = findTask(input, tasks);
    if (!requestedPriority) {
      return "Which priority should I set? Choose high, medium, or low, and include the task title.";
    }
    if (!task) {
      return "I couldn’t confidently match that task. Include more of its title so I don’t change the wrong item.";
    }

    if (!actions.updateTask) {
      return "I found the task, but can’t change its priority from this screen. Update it in Study Planner.";
    }

    actions.updateTask?.(task.id, { priority: requestedPriority });
    return `Updated “${task.title}” to ${requestedPriority} priority in Study Planner.`;
  }

  const mentionedSubject = findSubject(input, subjects);
  if (
    mentionedSubject &&
    /\b(subject|course|task|assignment|deadline|due|progress|study)\b/.test(normalized)
  ) {
    const subjectTasks = tasks.filter(
      (task) => task.subjectId === mentionedSubject.id
    );
    const openTasks = subjectTasks.filter((task) => !task.completed);
    const upcoming = sortPendingTasks(openTasks, today).slice(0, 3);
    return [
      `${mentionedSubject.name}: ${mentionedSubject.hoursPerWeek || 0} planned study hours per week; ${subjectTasks.length} task${subjectTasks.length === 1 ? "" : "s"} total, ${openTasks.length} still open.`,
      ...(upcoming.length
        ? ["Next steps:", ...upcoming.map((task, index) => `${index + 1}. ${formatTask(task, subjects, today)}`)]
        : ["There are no open tasks for this subject."]),
    ].join("\n");
  }

  if (/\b(subjects|courses)\b/.test(normalized)) {
    if (!subjects.length) return "You haven’t added any subjects yet. Open My Subjects and choose Add Subject to get started.";
    return `You have ${subjects.length} subjects:\n${subjects.map((subject) => {
      const count = tasks.filter((task) => task.subjectId === subject.id).length;
      return `• ${subject.name} — ${subject.hoursPerWeek || 0} hrs/week, ${count} task${count === 1 ? "" : "s"}`;
    }).join("\n")}`;
  }

  if (
    /\b(overdue|deadline|deadlines|due|upcoming|this week)\b/.test(normalized)
  ) {
    let matchingTasks = pending;
    if (/\boverdue\b/.test(normalized)) {
      matchingTasks = pending.filter((task) => task.dueDate && task.dueDate < today);
    } else if (/\btoday\b/.test(normalized)) {
      matchingTasks = pending.filter((task) => task.dueDate === today);
    } else if (/\btomorrow\b/.test(normalized)) {
      matchingTasks = pending.filter(
        (task) => task.dueDate === parseRequestedDate("tomorrow", now)
      );
    } else if (/\bthis week\b/.test(normalized)) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      matchingTasks = pending.filter(
        (task) => task.dueDate && task.dueDate >= today && task.dueDate <= dateKey(weekEnd)
      );
    }

    if (!matchingTasks.length) {
      return /\boverdue\b/.test(normalized)
        ? "Good news: you have no overdue open tasks."
        : "There are no open tasks matching that deadline window. You can review all tasks in Study Planner.";
    }

    return `Here are ${matchingTasks.length} open task${matchingTasks.length === 1 ? "" : "s"}, ordered by urgency:\n${matchingTasks.slice(0, 8).map((task) => `• ${formatTask(task, subjects, today)}`).join("\n")}`;
  }

  if (
    /\b(progress|analytics|performance|how am i doing|completed tasks|completion)\b/.test(normalized)
  ) {
    const completedHours = completed.reduce(
      (total, task) => total + (Number(task.hours) || 0),
      0
    );
    return `Your current study snapshot:\n• ${progress}% task completion (${completed.length} of ${tasks.length})\n• ${pending.length} open task${pending.length === 1 ? "" : "s"} and ${subjects.length} subject${subjects.length === 1 ? "" : "s"}\n• ${formatHours(completedHours)} recorded in completed tasks\n• ${schedule.length} recurring weekly sessions\n\nCompleting tasks in Study Planner updates this snapshot and the Analytics page.`;
  }

  const asksForPlan =
    /\b(what should i|what do i|prioriti[sz]|plan my|study today|study first|where should i start|focus on|study plan)\b/.test(normalized);
  if (asksForPlan) return buildStudyPlan(input, tasks, subjects, schedule, today);

  const asksForSchedule =
    /\b(schedule|timetable|weekly sessions|study sessions|what am i studying)\b/.test(normalized);
  if (asksForSchedule) {
    const requestedDay = dayNames.find((day) =>
      new RegExp(`\\b${day.toLowerCase()}\\b`).test(normalized)
    );
    const sessions = schedule
      .filter((session) => !requestedDay || session.day === requestedDay)
      .sort((first, second) =>
        first.day.localeCompare(second.day) ||
        (first.startTime || "").localeCompare(second.startTime || "")
      );

    if (!sessions.length) {
      return requestedDay
        ? `There are no recurring sessions on ${requestedDay}. You can add one from Weekly Study Schedule in Study Planner.`
        : "Your weekly schedule is empty. Add recurring subject sessions from Weekly Study Schedule in Study Planner.";
    }

    const lines = sessions.map((session) => {
      const subject =
        subjects.find((item) => item.id === session.subjectId)?.name ||
        session.subject ||
        "Study session";
      return `• ${session.day}, ${session.startTime}–${session.endTime}: ${subject}`;
    });
    return `${requestedDay ? `${requestedDay}'s study sessions` : "Your recurring weekly sessions"}:\n${lines.join("\n")}\n\nSelect a day in the planner schedule to filter its deadline tasks in the calendar.`;
  }

  if (/\b(task|tasks|todo|assignment|assignments)\b/.test(normalized)) {
    if (!tasks.length) {
      return "You have no tasks yet. Create one in Study Planner with a subject, deadline, priority, and time estimate.";
    }
    const nextTask = pending[0];
    return `You have ${tasks.length} tasks: ${completed.length} completed and ${pending.length} open. ${
      nextTask
        ? `Your next priority is “${nextTask.title}” (${nextTask.priority || "medium"} priority, ${getRelativeDate(nextTask.dueDate, today)}).`
        : "Everything is complete—nice work."
    }\n\nAsk “what should I study first?” for a ranked plan, or name a task to change its priority or mark it complete.`;
  }

  if (instructions) return instructions;

  return `I can help with your current StudyFlow data: ${subjects.length} subjects, ${pending.length} open tasks, and ${schedule.length} weekly sessions. Try asking “What should I study first?”, “Show my upcoming deadlines”, “What’s on my schedule Monday?”, or “How do I add a task?”`;
}
