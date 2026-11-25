import assert from "node:assert/strict";
import test from "node:test";
import { getStudyAssistantReply } from "../src/utils/studyAssistant.js";

const study = {
  now: "2026-11-22T12:00:00",
  subjects: [
    { id: "physics", name: "Physics", hoursPerWeek: 5 },
    { id: "cs", name: "Computer Science", hoursPerWeek: 8 },
  ],
  tasks: [
    {
      id: "urgent",
      title: "Review momentum",
      subjectId: "physics",
      dueDate: "2026-11-23",
      priority: "high",
      hours: 2,
      completed: false,
    },
    {
      id: "later",
      title: "Implement graph traversal",
      subjectId: "cs",
      dueDate: "2026-11-27",
      priority: "medium",
      hours: 3,
      completed: false,
    },
    {
      id: "done",
      title: "Read lecture notes",
      subjectId: "physics",
      dueDate: "2026-11-21",
      priority: "low",
      hours: 1,
      completed: true,
    },
  ],
  schedule: [
    {
      id: "monday-physics",
      day: "Monday",
      subjectId: "physics",
      startTime: "09:00",
      endTime: "10:30",
      hours: 1.5,
    },
  ],
};

test("upcoming-deadline answers are grounded in open tasks", () => {
  const response = getStudyAssistantReply("Show my upcoming deadlines", study);

  assert.match(response, /Review momentum/);
  assert.match(response, /due tomorrow/);
  assert.doesNotMatch(response, /Read lecture notes/);
});

test("study plans prioritize the closest, highest-priority work", () => {
  const response = getStudyAssistantReply(
    "What should I study first today? I have 4 hours",
    study
  );

  assert.ok(response.indexOf("Review momentum") < response.indexOf("Implement graph traversal"));
  assert.match(response, /break/);
});

test("weekly schedule answers include the requested day's actual sessions", () => {
  const response = getStudyAssistantReply("What is my schedule Monday?", study);

  assert.match(response, /Monday, 09:00–10:30: Physics/);
  assert.doesNotMatch(response, /Tuesday/);
});

test("assistant creates a task with the requested subject, date, priority, and estimate", () => {
  let createdTask;
  const response = getStudyAssistantReply(
    "Add a task to review waves for Physics tomorrow, high priority, 2 hours",
    study,
    { addTask: (task) => (createdTask = task) }
  );

  assert.equal(createdTask.title, "review waves");
  assert.equal(createdTask.subjectId, "physics");
  assert.equal(createdTask.dueDate, "2026-11-23");
  assert.equal(createdTask.priority, "high");
  assert.equal(createdTask.hours, 2);
  assert.match(response, /Added “review waves” to Physics/);
});

test("assistant asks for clarification instead of creating a task for an unknown subject", () => {
  let wasCreated = false;
  const response = getStudyAssistantReply(
    "Add a task to revise for Chemistry tomorrow",
    study,
    { addTask: () => (wasCreated = true) }
  );

  assert.equal(wasCreated, false);
  assert.match(response, /Which subject should I use/);
});

test("assistant recognizes subject aliases when creating a task", () => {
  let createdTask;
  getStudyAssistantReply(
    "Add a task to review algorithms for CS tomorrow",
    study,
    { addTask: (task) => (createdTask = task) }
  );

  assert.equal(createdTask.title, "review algorithms");
  assert.equal(createdTask.subjectId, "cs");
});

test("assistant adds valid recurring sessions to the shared schedule", () => {
  let createdSession;
  const response = getStudyAssistantReply(
    "Schedule a Physics session on Wednesday from 3 PM to 4:30 PM",
    study,
    { addSchedule: (session) => (createdSession = session) }
  );

  assert.deepEqual(createdSession, {
    day: "Wednesday",
    subjectId: "physics",
    startTime: "15:00",
    endTime: "16:30",
    hours: 1.5,
  });
  assert.match(response, /updates your weekly planned hours/);
});

test("assistant does not save invalid recurring session times", () => {
  let wasCreated = false;
  const response = getStudyAssistantReply(
    "Schedule a Physics session on Wednesday from 4 PM to 3 PM",
    study,
    { addSchedule: () => (wasCreated = true) }
  );

  assert.equal(wasCreated, false);
  assert.match(response, /ends before it starts/);
});

test("task completion and priority requests update the shared task state", () => {
  let toggledTask;
  let priorityUpdate;
  getStudyAssistantReply("Mark Review momentum complete", study, {
    toggleTask: (taskId) => (toggledTask = taskId),
  });
  getStudyAssistantReply("Set Review momentum to low priority", study, {
    updateTask: (taskId, update) => (priorityUpdate = { taskId, update }),
  });

  assert.equal(toggledTask, "urgent");
  assert.deepEqual(priorityUpdate, {
    taskId: "urgent",
    update: { priority: "low" },
  });
});

test("platform questions return step-by-step guidance", () => {
  const response = getStudyAssistantReply("How do I add a task?", study);

  assert.match(response, /1\. Open Study Planner/);
  assert.match(response, /calendar/);
  assert.match(response, /mark tasks complete/);
});
