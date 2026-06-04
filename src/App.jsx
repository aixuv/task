import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Columns3,
  Flag,
  GanttChartSquare,
  Home,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Table2,
  Tag,
  Trash2,
  Users,
  LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";

const initialStatuses = ["Backlog", "Open", "In Progress", "Blocked", "Done"];
const initialGroups = ["Personal", "Work", "Project A", "Learning"];
const initialTags = ["urgent", "design", "meeting", "coding", "follow-up", "idea"];
const priorityOptions = ["High", "Medium", "Low"];

const defaultStatusColors = {
  Backlog: "#e5e5e5",
  Open: "#bfdbfe",
  "In Progress": "#fde68a",
  Blocked: "#fecaca",
  Done: "#bbf7d0",
};

const defaultPriorityColors = {
  High: "#991b1b",
  Medium: "#f59e0b",
  Low: "#525252",
};

const defaultTagColors = {
  urgent: "#bae6fd",
  design: "#a7f3d0",
  meeting: "#ddd6fe",
  coding: "#a5f3fc",
  "follow-up": "#c7d2fe",
  idea: "#99f6e4",
};

const tableColumnOptions = [
  { key: "task", label: "Task / Description" },
  { key: "status", label: "Status" },
  { key: "group", label: "Group" },
  { key: "priority", label: "Priority" },
  { key: "tags", label: "Tags" },
  { key: "deadline", label: "Deadline" },
  { key: "completion", label: "Completion" },
  { key: "dependency", label: "Dependency" },
  { key: "progress", label: "Progress" },
  { key: "remark", label: "Remark" },
  { key: "action", label: "Action" },
];

const initialTasks = [
  {
    id: 1,
    title: "Create homepage quick note flow",
    description: "Capture task or note directly from homepage.",
    group: "Project A",
    status: "In Progress",
    priority: "High",
    tags: ["design", "coding"],
    deadline: "2026-06-02",
    completedAt: "",
    dependency: "",
    remarks: "Need very low-friction input.",
    subtasks: [
      { id: 101, title: "Add title input", done: true },
      { id: 102, title: "Add remark field", done: false },
      { id: 103, title: "Save to task list", done: false },
    ],
  },
  {
    id: 2,
    title: "Prepare vendor follow-up notes",
    description: "Summarize last call and list next actions.",
    group: "Work",
    status: "Open",
    priority: "Medium",
    tags: ["meeting", "follow-up"],
    deadline: "2026-06-05",
    completedAt: "",
    dependency: "Create homepage quick note flow",
    remarks: "Waiting for updated quotation.",
    subtasks: [
      { id: 201, title: "Review call notes", done: false },
      { id: 202, title: "Send action items", done: false },
    ],
  },
  {
    id: 3,
    title: "Collect ideas for note templates",
    description: "Make reusable templates for recurring notes and tasks.",
    group: "Learning",
    status: "Backlog",
    priority: "Low",
    tags: ["idea"],
    deadline: "2026-06-10",
    completedAt: "",
    dependency: "",
    remarks: "Include meeting, project, issue, and checklist templates.",
    subtasks: [{ id: 301, title: "List template types", done: false }],
  },
  {
    id: 4,
    title: "Blocked sample task",
    description: "Example task blocked by dependency.",
    group: "Project A",
    status: "Blocked",
    priority: "High",
    tags: ["urgent"],
    deadline: "2026-06-01",
    completedAt: "",
    dependency: "Prepare vendor follow-up notes",
    remarks: "Cannot continue until dependency is finished.",
    subtasks: [{ id: 401, title: "Wait for dependency", done: false }],
  },
  {
    id: 5,
    title: "Design compact minimal task row",
    description: "Improve dense home view for faster daily review.",
    group: "Project A",
    status: "Open",
    priority: "High",
    tags: ["design"],
    deadline: "2026-06-03",
    completedAt: "",
    dependency: "Create homepage quick note flow",
    remarks: "Keep only task, remark, and status visible.",
    subtasks: [
      { id: 501, title: "Reduce row height", done: true },
      { id: 502, title: "Move filters to toolbar", done: false },
    ],
  },
  {
    id: 6,
    title: "Add keyboard shortcut for quick add",
    description: "Allow task creation without mouse interaction.",
    group: "Project A",
    status: "Backlog",
    priority: "Medium",
    tags: ["coding", "idea"],
    deadline: "2026-06-07",
    completedAt: "",
    dependency: "",
    remarks: "Shortcut could be Ctrl + K or N.",
    subtasks: [{ id: 601, title: "Decide shortcut", done: false }],
  },
  {
    id: 7,
    title: "Review weekly supplier commitments",
    description: "Check open supplier promises and expected dates.",
    group: "Work",
    status: "In Progress",
    priority: "High",
    tags: ["meeting", "urgent"],
    deadline: "2026-06-04",
    completedAt: "",
    dependency: "Prepare vendor follow-up notes",
    remarks: "Need to confirm delivery for two pending items.",
    subtasks: [
      { id: 701, title: "Check last email", done: true },
      { id: 702, title: "Call supplier", done: false },
    ],
  },
  {
    id: 8,
    title: "Draft client meeting agenda",
    description: "Prepare agenda before next client review meeting.",
    group: "Work",
    status: "Open",
    priority: "Medium",
    tags: ["meeting"],
    deadline: "2026-06-06",
    completedAt: "",
    dependency: "",
    remarks: "Add decisions needed and open questions.",
    subtasks: [
      { id: 801, title: "List topics", done: false },
      { id: 802, title: "Share agenda", done: false },
    ],
  },
  {
    id: 9,
    title: "Clean up old personal notes",
    description: "Archive outdated notes and keep useful references.",
    group: "Personal",
    status: "Open",
    priority: "Low",
    tags: ["idea"],
    deadline: "2026-06-12",
    completedAt: "",
    dependency: "",
    remarks: "Do not delete anything important.",
    subtasks: [
      { id: 901, title: "Review inbox notes", done: false },
      { id: 902, title: "Archive old notes", done: false },
    ],
  },
  {
    id: 10,
    title: "Plan personal finance checklist",
    description: "Create a small recurring checklist for monthly review.",
    group: "Personal",
    status: "Backlog",
    priority: "Medium",
    tags: ["follow-up"],
    deadline: "2026-06-15",
    completedAt: "",
    dependency: "Clean up old personal notes",
    remarks: "Include bills, investments, and pending reimbursements.",
    subtasks: [{ id: 1001, title: "List monthly items", done: false }],
  },
  {
    id: 11,
    title: "Watch React state management lesson",
    description: "Continue learning app structure and state patterns.",
    group: "Learning",
    status: "Open",
    priority: "Low",
    tags: ["coding"],
    deadline: "2026-06-08",
    completedAt: "",
    dependency: "",
    remarks: "Focus on useMemo, reducers, and derived state.",
    subtasks: [
      { id: 1101, title: "Watch lesson", done: false },
      { id: 1102, title: "Take notes", done: false },
    ],
  },
  {
    id: 12,
    title: "Make table column preferences persistent",
    description: "Save selected columns so they remain after refresh.",
    group: "Project A",
    status: "Backlog",
    priority: "High",
    tags: ["coding"],
    deadline: "2026-06-09",
    completedAt: "",
    dependency: "",
    remarks: "Can use localStorage in next version.",
    subtasks: [{ id: 1201, title: "Add localStorage", done: false }],
  },
  {
    id: 13,
    title: "Create onboarding checklist",
    description: "Checklist for new users to understand the app quickly.",
    group: "Project A",
    status: "Open",
    priority: "Medium",
    tags: ["design", "idea"],
    deadline: "2026-06-11",
    completedAt: "",
    dependency: "Collect ideas for note templates",
    remarks: "Show quick add, group by, kanban, and table settings.",
    subtasks: [
      { id: 1301, title: "Write steps", done: false },
      { id: 1302, title: "Add sample data", done: true },
    ],
  },
  {
    id: 14,
    title: "Follow up on design approval",
    description: "Confirm whether latest layout is approved.",
    group: "Work",
    status: "Blocked",
    priority: "High",
    tags: ["urgent", "follow-up", "design"],
    deadline: "2026-06-03",
    completedAt: "",
    dependency: "Draft client meeting agenda",
    remarks: "Waiting for client response.",
    subtasks: [{ id: 1401, title: "Send reminder", done: false }],
  },
  {
    id: 15,
    title: "Prepare monthly learning summary",
    description: "Summarize what was learned this month.",
    group: "Learning",
    status: "In Progress",
    priority: "Medium",
    tags: ["idea", "follow-up"],
    deadline: "2026-06-14",
    completedAt: "",
    dependency: "Watch React state management lesson",
    remarks: "Keep it short and actionable.",
    subtasks: [
      { id: 1501, title: "Collect notes", done: true },
      { id: 1502, title: "Write summary", done: false },
    ],
  },
  {
    id: 16,
    title: "Test calendar date grouping",
    description: "Verify tasks appear under correct deadline dates.",
    group: "Project A",
    status: "Done",
    priority: "Low",
    tags: ["coding"],
    deadline: "2026-05-30",
    completedAt: "2026-05-28",
    dependency: "",
    remarks: "Calendar grouping works with sample deadlines.",
    subtasks: [{ id: 1601, title: "Check date cards", done: true }],
  },
  {
    id: 17,
    title: "Review pending messages",
    description: "Check unread messages and convert action items to tasks.",
    group: "Personal",
    status: "Open",
    priority: "Medium",
    tags: ["follow-up"],
    deadline: "2026-06-04",
    completedAt: "",
    dependency: "",
    remarks: "Add anything urgent to Work or Project A.",
    subtasks: [{ id: 1701, title: "Scan messages", done: false }],
  },
  {
    id: 18,
    title: "Create saved filter presets",
    description: "Allow common filter combinations to be reused.",
    group: "Project A",
    status: "Backlog",
    priority: "Medium",
    tags: ["coding", "idea"],
    deadline: "2026-06-18",
    completedAt: "",
    dependency: "Make table column preferences persistent",
    remarks: "Example presets: Today, Urgent, Blocked, Work.",
    subtasks: [{ id: 1801, title: "Define preset model", done: false }],
  },
  {
    id: 19,
    title: "Document master data workflow",
    description: "Explain groups, tags, statuses, ordering, and table columns.",
    group: "Learning",
    status: "Open",
    priority: "Low",
    tags: ["idea", "design"],
    deadline: "2026-06-16",
    completedAt: "",
    dependency: "Create onboarding checklist",
    remarks: "This can become help content later.",
    subtasks: [
      { id: 1901, title: "Write short guide", done: false },
      { id: 1902, title: "Add screenshots later", done: false },
    ],
  },
  {
    id: 20,
    title: "Finalize V1 review list",
    description: "Prepare final checklist before moving to V2.",
    group: "Work",
    status: "In Progress",
    priority: "High",
    tags: ["urgent", "follow-up"],
    deadline: "2026-06-13",
    completedAt: "",
    dependency: "Document master data workflow",
    remarks: "Review responsive behavior, sorting, grouping, and compact mode.",
    subtasks: [
      { id: 2001, title: "Test Home", done: true },
      { id: 2002, title: "Test Table", done: false },
      { id: 2003, title: "Test Kanban", done: false },
    ],
  },
];

function classNames(...items) {
  return items.filter(Boolean).join(" ");
}

function getReadableTextColor(hexColor) {
  const hex = String(hexColor || "#e5e5e5").replace("#", "");
  const fullHex = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex.padEnd(6, "0").slice(0, 6);
  const r = parseInt(fullHex.slice(0, 2), 16) || 0;
  const g = parseInt(fullHex.slice(2, 4), 16) || 0;
  const b = parseInt(fullHex.slice(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#171717" : "#ffffff";
}

function chipStyleFromColor(color) {
  const backgroundColor = color || "#e5e5e5";
  const textColor = getReadableTextColor(backgroundColor);
  return {
    backgroundColor,
    color: textColor,
    borderColor: backgroundColor,
    "--chip-bg": backgroundColor,
    "--chip-fg": textColor,
    "--chip-border": backgroundColor,
  };
}



function normalizeHref(url) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return "";
  return /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
}

function normalizeTaskLinks(links = []) {
  if (!Array.isArray(links)) return [];
  return links.map((link, index) => ({
    id: link?.id || `link-${index}`,
    title: String(link?.title || "").trim(),
    url: String(link?.url || link?.href || "").trim(),
  }));
}

function isWordCharacter(char) {
  return /[A-Za-z0-9_]/.test(char || "");
}

function LinkifyText({ text, links = [] }) {
  if (!text) return null;

  const value = String(text);
  const taskLinks = normalizeTaskLinks(links)
    .filter((link) => link.title && link.url)
    .sort((a, b) => b.title.length - a.title.length);
  const urlRegex = /^(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/i;
  const parts = [];
  let buffer = "";
  let index = 0;

  function flushBuffer() {
    if (!buffer) return;
    parts.push(<span key={`text-${parts.length}`}>{buffer}</span>);
    buffer = "";
  }

  while (index < value.length) {
    const remaining = value.slice(index);
    const urlMatch = remaining.match(urlRegex);

    if (urlMatch) {
      const label = urlMatch[0];
      flushBuffer();
      parts.push(
        <a
          key={`url-${parts.length}`}
          href={normalizeHref(label)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {label}
        </a>
      );
      index += label.length;
      continue;
    }

    const matchedTaskLink = taskLinks.find((link) => {
      const token = `${link.title}*`;
      if (value.slice(index, index + token.length).toLowerCase() !== token.toLowerCase()) return false;
      const before = index > 0 ? value[index - 1] : "";
      const after = value[index + token.length] || "";
      return !isWordCharacter(before) && !isWordCharacter(after);
    });

    if (matchedTaskLink) {
      flushBuffer();
      parts.push(
        <a
          key={`named-link-${parts.length}`}
          href={normalizeHref(matchedTaskLink.url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="text-blue-600 underline hover:text-blue-800"
          title={matchedTaskLink.url}
        >
          {matchedTaskLink.title}
        </a>
      );
      index += matchedTaskLink.title.length + 1;
      continue;
    }

    buffer += value[index];
    index += 1;
  }

  flushBuffer();
  return <>{parts}</>;
}


function HistoryMessage({ message }) {
  const parts = String(message || "Change recorded").split(/(<strong>.*?<\/strong>)/g);

  return (
    <>
      {parts.map((part, index) => {
        const boldMatch = part.match(/^<strong>(.*?)<\/strong>$/);
        if (boldMatch) return <strong key={index}>{boldMatch[1]}</strong>;
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}


function splitCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeCsvHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "");
}

function parseTaskCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(normalizeCsvHeader);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

function splitCsvList(value) {
  return String(value || "")
    .split(/[|;]/)
    .map((item) => item.trim().replace(/^#/, ""))
    .filter(Boolean);
}

function normalizeCsvDate(value, fallback = "") {
  const text = String(value || "").trim();
  if (!text) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const slashMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return fallback;
}

function getCsvValue(row, ...keys) {
  for (const key of keys) {
    const normalized = normalizeCsvHeader(key);
    if (row[normalized]) return row[normalized];
  }
  return "";
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  return Math.max(1, Math.ceil((end - start) / 86400000) + 1);
}

function getTaskStartDate(task) {
  if (task.startDate) return task.startDate;
  const duration = Number(task.durationDays || 4);
  return addDays(task.deadline, -(Math.max(1, duration) - 1));
}

function getTaskDurationDays(task) {
  if (task.durationDays) return Number(task.durationDays);
  return daysBetween(getTaskStartDate(task), task.deadline);
}

function getProgress(task) {
  if (!task.subtasks.length) return 0;
  const done = task.subtasks.filter((item) => item.done).length;
  return Math.round((done / task.subtasks.length) * 100);
}

function getTaskOrderValue(task, fallbackIndex = 0) {
  const value = Number(task?.order);
  return Number.isFinite(value) ? value : fallbackIndex + 1;
}

function sortTasksByOrder(taskList = []) {
  return [...taskList].sort((a, b) => {
    const orderDiff = getTaskOrderValue(a) - getTaskOrderValue(b);
    if (orderDiff) return orderDiff;
    return Number(a?.id || 0) - Number(b?.id || 0);
  });
}

function withSequentialTaskOrder(taskList = []) {
  return taskList.map((task, index) => ({ ...task, order: index + 1 }));
}

function normalizeTasksWithOrder(taskList = []) {
  const normalizedTasks = (Array.isArray(taskList) ? taskList : []).map((task) => ({
    ...task,
    links: normalizeTaskLinks(task?.links),
  }));
  return withSequentialTaskOrder(sortTasksByOrder(normalizedTasks));
}

function moveTaskBefore(taskList = [], draggedTaskId, targetTaskId) {
  if (!draggedTaskId || !targetTaskId || draggedTaskId === targetTaskId) return taskList;
  const ordered = sortTasksByOrder(taskList);
  const fromIndex = ordered.findIndex((task) => String(task.id) === String(draggedTaskId));
  const toIndex = ordered.findIndex((task) => String(task.id) === String(targetTaskId));
  if (fromIndex < 0 || toIndex < 0) return taskList;
  const next = [...ordered];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return withSequentialTaskOrder(next);
}

function statusBadgeClass(status) {
  return "light-chip";
}

function statusChipStyle(status, statusColors = defaultStatusColors) {
  return chipStyleFromColor(statusColors[status] || defaultStatusColors[status] || "#e5e5e5");
}

function priorityBadgeClass(priority) {
  return "light-chip";
}

function priorityChipStyle(priority, priorityColors = defaultPriorityColors) {
  return chipStyleFromColor(priorityColors[priority] || defaultPriorityColors[priority] || "#e5e5e5");
}

function tagChipClass(index = 0) {
  return "tag-chip";
}

function tagChipStyle(tag, tagColors = defaultTagColors, fallbackIndex = 0) {
  const fallbacks = ["#bae6fd", "#a7f3d0", "#ddd6fe", "#a5f3fc", "#c7d2fe", "#99f6e4"];
  return chipStyleFromColor(tagColors[tag] || defaultTagColors[tag] || fallbacks[fallbackIndex % fallbacks.length]);
}

function priorityAccentClass(priority) {
  const map = {
    High: "bg-red-500",
    Medium: "bg-neutral-400",
    Low: "bg-stone-400",
  };
  return map[priority] || map.Low;
}

function groupSectionClass(index) {
  const styles = [
    "border-sky-200 bg-sky-50/45",
    "border-emerald-200 bg-emerald-50/45",
    "border-violet-200 bg-violet-50/45",
    "border-cyan-200 bg-cyan-50/45",
    "border-indigo-200 bg-indigo-50/45",
    "border-teal-200 bg-teal-50/45",
  ];
  return styles[index % styles.length];
}

function groupHeaderClass(index) {
  const styles = [
    "border-sky-300 bg-transparent text-sky-700",
    "border-emerald-300 bg-transparent text-emerald-700",
    "border-violet-300 bg-transparent text-violet-700",
    "border-cyan-300 bg-transparent text-cyan-700",
    "border-indigo-300 bg-transparent text-indigo-700",
    "border-teal-300 bg-transparent text-teal-700",
  ];
  return styles[index % styles.length];
}

const appStyles = String.raw`
  .dark [class*="bg-white"], .dark [class*="bg-card"], .dark .bg-card { background-color: rgb(18 18 18 / 0.96) !important; }
  .dark [class*="bg-slate-50"] { background-color: rgb(24 24 24 / 0.86) !important; }
  .dark [class*="bg-slate-100"], .dark [class*="bg-neutral-100"], .dark [class*="bg-stone-100"] { background-color: rgb(36 36 36 / 0.9) !important; }
  .dark [class*="border-slate-200"], .dark [class*="border-slate-100"], .dark [class*="border-neutral-200"], .dark [class*="border-stone-200"], .dark [class*="ring-slate-100"], .dark [class*="ring-slate-200"] { border-color: rgb(48 48 48) !important; --tw-ring-color: rgb(48 48 48) !important; }
  .dark input, .dark select, .dark textarea { background-color: rgb(14 14 14) !important; color: rgb(229 229 229) !important; border-color: rgb(58 58 58) !important; }
  .dark input::placeholder, .dark textarea::placeholder { color: rgb(100 116 139) !important; }
  .dark [class*="text-slate-900"], .dark [class*="text-slate-800"], .dark [class*="text-slate-700"], .dark [class*="text-neutral-950"], .dark [class*="text-stone-950"] { color: rgb(238 238 238) !important; }
  .dark [class*="text-slate-600"], .dark [class*="text-slate-500"] { color: rgb(168 168 168) !important; }
  .dark [class*="text-slate-400"] { color: rgb(126 126 126) !important; }
  .dark [class*="hover:bg-slate-50"]:hover, .dark [class*="hover:bg-slate-100"]:hover { background-color: rgb(38 38 38) !important; }
  .dark [class*="shadow"] { --tw-shadow-color: rgb(0 0 0 / 0.45); }
  .app-surface { background: linear-gradient(180deg, rgb(248 250 252), rgb(241 245 249)); }
  .dark .app-surface { background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.06), transparent 30%), linear-gradient(180deg, rgb(8 8 8), rgb(20 20 20)); }
  .soft-panel { background: rgba(255,255,255,0.84); border-color: rgb(226 232 240); box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
  .dark .soft-panel { background: rgba(18, 18, 18, 0.88) !important; border-color: rgb(48 48 48) !important; box-shadow: 0 14px 38px rgba(0,0,0,0.34); }
  .metric-card { background: rgba(255,255,255,0.9); border-color: rgb(226 232 240); transition: transform 160ms ease, box-shadow 160ms ease; }
  .metric-card:hover { transform: translateY(-1px); box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08); }
  .dark .metric-card { background: rgba(18, 18, 18, 0.92) !important; border-color: rgb(48 48 48) !important; }
  .task-card { position: relative; transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease; }
  .task-card:hover { transform: translateY(-1px); box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12); }
  .dark .task-card:hover { box-shadow: 0 14px 34px rgba(0,0,0,0.42); border-color: rgb(82 82 82) !important; }
  .focus-ring:focus-within { box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.14); border-color: rgb(245 245 245) !important; }
  .progress-fill { background-color: rgb(15 23 42); }
  .dark .progress-fill { background-color: rgb(245 245 245) !important; }
  .dark .task-card { background: linear-gradient(180deg, rgba(26,26,26,0.98), rgba(18,18,18,0.98)) !important; border-color: rgb(48 48 48) !important; }
  .dark h1, .dark h2, .dark h3, .dark .section-label, .dark .panel-title, .dark label, .dark [class*="tracking-wide"], .dark [class*="uppercase"] { color: rgb(245 245 245) !important; }
  .dark .metric-value { color: rgb(245 245 245) !important; }
  .dark .light-chip, .dark .tag-chip, .dark .gantt-bar { box-shadow: 0 0 0 1px rgb(255 255 255 / 0.10), 0 3px 8px rgb(0 0 0 / 0.22) !important; }
  .dark .light-chip *, .dark .tag-chip * { color: inherit !important; }
  .dark .stat-icon-box { background: rgb(38 38 38) !important; color: rgb(245 245 245) !important; }
  .dark .grouped-section { background: rgb(16 16 16 / 0.92) !important; border-color: rgb(48 48 48) !important; }
  .dark .grouped-section.border-sky-200 { border-color: rgb(56 189 248 / 0.75) !important; box-shadow: inset 4px 0 0 rgb(56 189 248), 0 0 0 1px rgb(56 189 248 / 0.18), 0 10px 24px rgba(0,0,0,0.28) !important; }
  .dark .grouped-section.border-emerald-200 { border-color: rgb(52 211 153 / 0.72) !important; box-shadow: inset 4px 0 0 rgb(52 211 153), 0 0 0 1px rgb(52 211 153 / 0.16), 0 10px 24px rgba(0,0,0,0.28) !important; }
  .dark .grouped-section.border-violet-200 { border-color: rgb(167 139 250 / 0.74) !important; box-shadow: inset 4px 0 0 rgb(167 139 250), 0 0 0 1px rgb(167 139 250 / 0.16), 0 10px 24px rgba(0,0,0,0.28) !important; }
  .dark .grouped-section.border-cyan-200 { border-color: rgb(34 211 238 / 0.74) !important; box-shadow: inset 4px 0 0 rgb(34 211 238), 0 0 0 1px rgb(34 211 238 / 0.16), 0 10px 24px rgba(0,0,0,0.28) !important; }
  .dark .grouped-section.border-indigo-200 { border-color: rgb(129 140 248 / 0.74) !important; box-shadow: inset 4px 0 0 rgb(129 140 248), 0 0 0 1px rgb(129 140 248 / 0.16), 0 10px 24px rgba(0,0,0,0.28) !important; }
  .dark .grouped-section.border-teal-200 { border-color: rgb(45 212 191 / 0.74) !important; box-shadow: inset 4px 0 0 rgb(45 212 191), 0 0 0 1px rgb(45 212 191 / 0.16), 0 10px 24px rgba(0,0,0,0.28) !important; }
  .dark .bg-transparent { background-color: transparent !important; }
  .dark .border-sky-300 { border-color: rgb(56 189 248 / 0.78) !important; color: rgb(245 245 245) !important; box-shadow: inset 4px 0 0 rgb(56 189 248) !important; }
  .dark .border-emerald-300 { border-color: rgb(52 211 153 / 0.78) !important; color: rgb(245 245 245) !important; box-shadow: inset 4px 0 0 rgb(52 211 153) !important; }
  .dark .border-violet-300 { border-color: rgb(167 139 250 / 0.78) !important; color: rgb(245 245 245) !important; box-shadow: inset 4px 0 0 rgb(167 139 250) !important; }
  .dark .border-cyan-300 { border-color: rgb(34 211 238 / 0.78) !important; color: rgb(245 245 245) !important; box-shadow: inset 4px 0 0 rgb(34 211 238) !important; }
  .dark .border-indigo-300 { border-color: rgb(129 140 248 / 0.78) !important; color: rgb(245 245 245) !important; box-shadow: inset 4px 0 0 rgb(129 140 248) !important; }
  .dark .border-teal-300 { border-color: rgb(45 212 191 / 0.78) !important; color: rgb(245 245 245) !important; box-shadow: inset 4px 0 0 rgb(45 212 191) !important; }
  .dark table, .dark thead, .dark tbody, .dark tr, .dark th, .dark td { background-color: transparent !important; }
  .dark thead { background-color: rgb(24 24 24 / 0.96) !important; }
  .dark tr:hover { background-color: rgb(38 38 38 / 0.78) !important; }
  .dark button[class*="bg-primary"], .dark .bg-primary { background-color: rgb(245 245 245) !important; color: rgb(17 17 17) !important; }
  .dark [class*="bg-white/"] { background-color: rgb(18 18 18 / 0.9) !important; }
  .dark .master-list-item { color: rgb(229 229 229) !important; }
  .dark .master-list-item:not(.tag-chip):not(.light-chip) span { color: rgb(229 229 229) !important; }
  .dark .master-list-item .drag-label { color: rgb(163 163 163) !important; }
  .dark .master-list-index { background-color: rgb(38 38 38) !important; color: rgb(245 245 245) !important; }
  .dark .master-list-name { color: inherit !important; }
  .dark .master-list-item.tag-chip,
  .dark .master-list-item.light-chip {
    background-color: var(--chip-bg) !important;
    color: var(--chip-fg) !important;
    border-color: var(--chip-border) !important;
  }
  .dark .master-list-item.tag-chip .master-list-name,
  .dark .master-list-item.light-chip .master-list-name,
  .dark .master-list-item.tag-chip .drag-label,
  .dark .master-list-item.light-chip .drag-label {
    color: var(--chip-fg) !important;
  }
  .dark .master-list-item.tag-chip .master-list-index,
  .dark .master-list-item.light-chip .master-list-index {
    background-color: rgb(255 255 255 / 0.55) !important;
    color: rgb(23 23 23) !important;
  }
  .dark .master-panel input { color: rgb(229 229 229) !important; }
  .dark .master-panel input[type="color"] { background: transparent !important; color: inherit !important; }
  .dark .master-panel input::placeholder { color: rgb(115 115 115) !important; }
  .dark .group-card-color-0, .dark .kanban-group-color-0 { background: linear-gradient(180deg, rgb(8 47 73 / 0.38), rgb(15 23 42 / 0.92)) !important; border-color: rgb(56 189 248 / 0.55) !important; box-shadow: inset 4px 0 0 rgb(56 189 248), 0 12px 28px rgba(0,0,0,0.34) !important; }
  .dark .group-card-color-1, .dark .kanban-group-color-1 { background: linear-gradient(180deg, rgb(6 78 59 / 0.36), rgb(15 23 42 / 0.92)) !important; border-color: rgb(52 211 153 / 0.55) !important; box-shadow: inset 4px 0 0 rgb(52 211 153), 0 12px 28px rgba(0,0,0,0.34) !important; }
  .dark .group-card-color-2, .dark .kanban-group-color-2 { background: linear-gradient(180deg, rgb(59 7 100 / 0.34), rgb(15 23 42 / 0.92)) !important; border-color: rgb(167 139 250 / 0.55) !important; box-shadow: inset 4px 0 0 rgb(167 139 250), 0 12px 28px rgba(0,0,0,0.34) !important; }
  .dark .group-card-color-3, .dark .kanban-group-color-3 { background: linear-gradient(180deg, rgb(22 78 99 / 0.34), rgb(15 23 42 / 0.92)) !important; border-color: rgb(34 211 238 / 0.55) !important; box-shadow: inset 4px 0 0 rgb(34 211 238), 0 12px 28px rgba(0,0,0,0.34) !important; }
  .dark .group-card-color-4, .dark .kanban-group-color-4 { background: linear-gradient(180deg, rgb(49 46 129 / 0.34), rgb(15 23 42 / 0.92)) !important; border-color: rgb(129 140 248 / 0.55) !important; box-shadow: inset 4px 0 0 rgb(129 140 248), 0 12px 28px rgba(0,0,0,0.34) !important; }
  .dark .group-card-color-5, .dark .kanban-group-color-5 { background: linear-gradient(180deg, rgb(19 78 74 / 0.34), rgb(15 23 42 / 0.92)) !important; border-color: rgb(45 212 191 / 0.55) !important; box-shadow: inset 4px 0 0 rgb(45 212 191), 0 12px 28px rgba(0,0,0,0.34) !important; }
  .dark .kanban-task-card { background: rgb(18 18 18 / 0.92) !important; border-color: rgb(64 64 64) !important; box-shadow: 0 8px 18px rgba(0,0,0,0.28) !important; }
  .dark .kanban-task-card:hover { filter: brightness(1.08); }
  .dark .kanban-task-card select { background: rgb(10 10 10 / 0.72) !important; }
  .gantt-scroll-x {
    overscroll-behavior-x: contain;
    overscroll-behavior-y: auto;
    touch-action: pan-x pan-y;
  }
`;


function LoginView({ onAuthenticated }) {
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin + window.location.pathname,
          },
        });
        if (error) throw error;
        setMessage("Signup done. Check your email if confirmation is enabled, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        onAuthenticated?.();
      }
    } catch (error) {
      setMessage(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-4">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="hidden lg:block">
            <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">NoteFlow V1 · Task + note workspace</div>
            <h1 className="max-w-xl text-5xl font-bold tracking-tight">Manage notes, tasks, deadlines, and Gantt plans in one workspace.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-400">Login keeps your tasks, groups, tags, colors, and settings synced with Supabase.</p>
          </div>
          <form onSubmit={submitAuth} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">{mode === "sign-in" ? "Sign in" : "Create account"}</h2>
              <p className="mt-1 text-sm text-neutral-400">Use your registered email and password.</p>
            </div>
            <div className="space-y-3">
              {mode === "sign-up" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-300">Full name</label>
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-neutral-500" placeholder="Your name" />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">Email</label>
                <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-neutral-500" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">Password</label>
                <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 rounded-xl border border-neutral-300 bg-white px-3 text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-neutral-500" placeholder="Minimum 6 characters" />
              </div>
              {message && <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-neutral-300">{message}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "14px",
                    background: "#ffffff",
                    color: "#111827",
                    fontWeight: 700,
                    border: "1px solid #ffffff",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.75 : 1,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "#e5e7eb";
                    event.currentTarget.style.color = "#111827";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "#ffffff";
                    event.currentTarget.style.color = "#111827";
                  }}
                >
                  {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
                </button>
              <button type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }} className="w-full text-center text-xs text-neutral-400 hover:text-white">
                {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

async function fetchOrCreateProfile(session) {
  if (!session?.user) return null;
  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const email = session.user.email || "";
  const fullName = session.user.user_metadata?.full_name || "";
  const { data: created, error: createError } = await supabase
    .from("user_profiles")
    .insert({ id: session.user.id, email, full_name: fullName, role: email.toLowerCase() === "nikhilpareta16@gmail.com" ? "admin" : "member", is_active: true })
    .select("*")
    .single();
  if (createError) throw createError;
  return created;
}

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  async function loadProfile(nextSession) {
    if (!nextSession) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const nextProfile = await fetchOrCreateProfile(nextSession);
      setProfile(nextProfile);
      setAuthError("");
      if (nextProfile && nextProfile.is_active === false) {
        setAuthError("Your account is disabled. Contact admin.");
        await supabase.auth.signOut();
      }
    } catch (error) {
      setAuthError(error.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
      loadProfile(data.session || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setLoading(true);
      loadProfile(nextSession || null);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">Loading NoteFlow...</div>;
  }

  if (!session) {
    return <LoginView onAuthenticated={() => {}} />;
  }

  if (authError) {
    return <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 text-white"><div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm">{authError}</div></div>;
  }

  return <NoteTaskAppV1 session={session} profile={profile} onSignOut={() => supabase.auth.signOut()} />;
}

export default App;

function NoteTaskAppV1({ session, profile, onSignOut }) {
  const activeViewStorageKey = session?.user?.id
    ? `noteflow_active_view_${session.user.id}`
    : "noteflow_active_view_guest";
  const [activeView, setActiveView] = useState("Home");
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyFromDate, setHistoryFromDate] = useState("");
  const [historyToDate, setHistoryToDate] = useState("");
  const [selectedHistoryReport, setSelectedHistoryReport] = useState("");
  const [historyFieldStart, setHistoryFieldStart] = useState({});
  const [statuses, setStatuses] = useState(initialStatuses);
  const [groups, setGroups] = useState(initialGroups);
  const [tags, setTags] = useState(initialTags);
  const [priorities, setPriorities] = useState(["High", "Medium", "Low"]);
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [masterSearch, setMasterSearch] = useState({
    groups: "",
    tags: "",
    statuses: "",
    priorities: "",
  });
  const [masterVisibleCount, setMasterVisibleCount] = useState({
    groups: 50,
    tags: 50,
    statuses: 50,
    priorities: 50,
  });
  const [editingMaster, setEditingMaster] = useState(null);
  const [editingMasterValue, setEditingMasterValue] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [defaultGroupMode, setDefaultGroupMode] = useState("None");
  const [homeGroupBy, setHomeGroupBy] = useState("None");
  const [tableGroupBy, setTableGroupBy] = useState("None");
  const [ganttGroupBy, setGanttGroupBy] = useState("None");
  const [calendarGroupBy, setCalendarGroupBy] = useState("Day");
  const [ganttColumns, setGanttColumns] = useState({ start: true, days: true, end: true, depends: true });
  const [quickTitle, setQuickTitle] = useState("");
  const [quickRemark, setQuickRemark] = useState("");
  const [quickGroup, setQuickGroup] = useState("Personal");
  const [quickDeadline, setQuickDeadline] = useState(todayIso());
  const [kanbanBy, setKanbanBy] = useState("Status");
  const [newGroup, setNewGroup] = useState("");
  const [newTag, setNewTag] = useState("");
  const [homeMinimalMode, setHomeMinimalMode] = useState(false);
  const [hideDoneTasks, setHideDoneTasks] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [homeFiltersOpen, setHomeFiltersOpen] = useState(false);
  const [tableColumns, setTableColumns] = useState(() =>
    tableColumnOptions.reduce((acc, column) => ({ ...acc, [column.key]: true }), {})
  );
  const [taskPopupId, setTaskPopupId] = useState(null);
  const [displayScale, setDisplayScale] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [statusColors, setStatusColors] = useState(defaultStatusColors);
  const [priorityColors, setPriorityColors] = useState(defaultPriorityColors);
  const [tagColors, setTagColors] = useState(defaultTagColors);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("Loading cloud data...");
  const [workspaceShares, setWorkspaceShares] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("mine");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;
    const savedView = localStorage.getItem(activeViewStorageKey);
    if (savedView) setActiveView(savedView);
  }, [session?.user?.id, activeViewStorageKey]);

  useEffect(() => {
    if (!session?.user?.id || !activeView) return;
    localStorage.setItem(activeViewStorageKey, activeView);
  }, [activeView, activeViewStorageKey, session?.user?.id]);

  useEffect(() => {
    if (!groups.includes(quickGroup)) {
      setQuickGroup(groups[0] || "Personal");
    }
  }, [groups, quickGroup]);

  const currentUserId = session?.user?.id || "";
  const selectedWorkspaceOwnerId = selectedWorkspaceId === "mine" ? currentUserId : selectedWorkspaceId;
  const selectedWorkspaceShare = workspaceShares.find((share) => share.owner_user_id === selectedWorkspaceId);
  const isSharedWorkspace = Boolean(selectedWorkspaceOwnerId && selectedWorkspaceOwnerId !== currentUserId);
  const workspaceLabel = isSharedWorkspace
    ? selectedWorkspaceShare?.ownerName || selectedWorkspaceShare?.ownerEmail || "Shared Workspace"
    : "My Workspace";

  function ensureEditableWorkspace() {
    if (!isSharedWorkspace) return true;
    setCloudStatus("View only shared workspace");
    return false;
  }

  function formatHistoryValue(value) {
    if (value === undefined || value === null || value === "") return "empty";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "empty";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  function addHistory(entry) {
    if (isSharedWorkspace) return;
    setHistory((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        type: entry.type || "change",
        taskId: entry.taskId || "",
        taskTitle: entry.taskTitle || "",
        message: entry.message || "",
      },
      ...(Array.isArray(current) ? current : []),
    ].slice(0, 2000));
  }

  function startHistoryField(key, value) {
    setHistoryFieldStart((current) => ({
      ...current,
      [key]: value || "",
    }));
  }

  function commitHistoryField(key, entry) {
    const oldValue = historyFieldStart[key] ?? "";
    const newValue = entry.newValue || "";

    if (oldValue !== newValue) {
      addHistory({
        type: entry.type || "text_changed",
        taskId: entry.taskId,
        taskTitle: entry.taskTitle,
        message: `${entry.label}: ${formatHistoryValue(oldValue)} → ${formatHistoryValue(newValue)}`,
      });
    }

    setHistoryFieldStart((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function deleteHistoryByDateRange(fromDate, toDate) {
    if (!fromDate || !toDate) {
      window.alert("Select From and To date first.");
      return;
    }

    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T23:59:59`);

    if (from > to) {
      window.alert("From date cannot be after To date.");
      return;
    }

    const ok = window.confirm(`Delete history from ${fromDate} to ${toDate}? This cannot be undone.`);
    if (!ok) return;

    setHistory((current) =>
      (Array.isArray(current) ? current : []).filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate < from || itemDate > to;
      })
    );
  }

  function applyWorkspaceState(state) {
    if (!state) {
      setTasks([]);
      setHistory([]);
      setStatuses(initialStatuses);
      setGroups(initialGroups);
      setTags(initialTags);
      setPriorities(["High", "Medium", "Low"]);
      setStatusColors(defaultStatusColors);
      setPriorityColors(defaultPriorityColors);
      setTagColors(defaultTagColors);
      return;
    }

    setTasks(Array.isArray(state.tasks) ? normalizeTasksWithOrder(state.tasks) : []);
    setHistory(Array.isArray(state.history) ? state.history : []);
    setStatuses(Array.isArray(state.statuses) ? state.statuses : initialStatuses);
    setGroups(Array.isArray(state.groups) ? state.groups : initialGroups);
    setTags(Array.isArray(state.tags) ? state.tags : initialTags);
    setPriorities(Array.isArray(state.priorities) && state.priorities.length ? state.priorities : ["High", "Medium", "Low"]);
    if (state.defaultGroupMode) setDefaultGroupMode(state.defaultGroupMode);
    if (state.homeGroupBy) setHomeGroupBy(state.homeGroupBy);
    if (state.tableGroupBy) setTableGroupBy(state.tableGroupBy);
    if (state.ganttGroupBy) setGanttGroupBy(state.ganttGroupBy);
    if (state.calendarGroupBy) setCalendarGroupBy(state.calendarGroupBy);
    if (state.ganttColumns) setGanttColumns(state.ganttColumns);
    if (state.kanbanBy) setKanbanBy(state.kanbanBy);
    if (state.tableColumns) setTableColumns(state.tableColumns);
    if (typeof state.homeMinimalMode === "boolean") setHomeMinimalMode(state.homeMinimalMode);
    if (typeof state.hideDoneTasks === "boolean") setHideDoneTasks(state.hideDoneTasks);
    if (typeof state.sidebarCollapsed === "boolean") setSidebarCollapsed(state.sidebarCollapsed);
    if (state.displayScale) setDisplayScale(state.displayScale);
    if (typeof state.darkMode === "boolean") setDarkMode(state.darkMode);
    setStatusColors({ ...defaultStatusColors, ...(state.statusColors || {}) });
    setPriorityColors({ ...defaultPriorityColors, ...(state.priorityColors || {}) });
    setTagColors({ ...defaultTagColors, ...(state.tagColors || {}) });
  }

  async function loadSharedUsersList() {
    if (!currentUserId) {
      setSharedUsers([]);
      return;
    }

    const { data: shares, error } = await supabase
      .from("task_workspace_shares")
      .select("id, shared_with_user_id, shared_with_email, permission, created_at")
      .eq("owner_user_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      setShareMessage(`Shared users load failed: ${error.message}`);
      setSharedUsers([]);
      return;
    }

    const sharedUserIds = [...new Set((shares || []).map((share) => share.shared_with_user_id).filter(Boolean))];
    let profiles = [];

    if (sharedUserIds.length) {
      const { data: profileRows } = await supabase
        .from("user_profiles")
        .select("id,email,full_name")
        .in("id", sharedUserIds);
      profiles = profileRows || [];
    }

    const profileById = Object.fromEntries(profiles.map((item) => [item.id, item]));
    setSharedUsers((shares || []).map((share) => ({
      ...share,
      userEmail: profileById[share.shared_with_user_id]?.email || share.shared_with_email || "",
      userName: profileById[share.shared_with_user_id]?.full_name || profileById[share.shared_with_user_id]?.email || share.shared_with_email || "Shared user",
    })));
  }

  async function removeSharedUser(share) {
    if (!share?.id) return;
    const ok = window.confirm(`Remove sharing access for ${share.userName || share.shared_with_email || "this user"}?`);
    if (!ok) return;

    const { error } = await supabase
      .from("task_workspace_shares")
      .delete()
      .eq("id", share.id)
      .eq("owner_user_id", currentUserId);

    if (error) {
      setShareMessage(`Remove share failed: ${error.message}`);
      return;
    }

    setShareMessage(`Removed sharing access for ${share.userName || share.shared_with_email || "user"}.`);
    await loadSharedUsersList();
  }

  useEffect(() => {
    let ignore = false;

    async function loadWorkspaceShares() {
      if (!currentUserId) return;

      const { data: shares, error } = await supabase.rpc("get_my_shared_workspaces");

      if (ignore) return;

      if (error) {
        setShareMessage(`Share list failed: ${error.message}`);
        setWorkspaceShares([]);
        return;
      }

      const mappedShares = (shares || []).map((item) => ({
        owner_user_id: item.owner_user_id,
        ownerEmail: item.owner_email,
        ownerName: item.owner_name,
        permission: item.permission,
        created_at: item.created_at,
      }));

      setWorkspaceShares(mappedShares);
      if (selectedWorkspaceId !== "mine" && !mappedShares.some((share) => share.owner_user_id === selectedWorkspaceId)) {
        setSelectedWorkspaceId("mine");
      }
    }

    loadWorkspaceShares();
    return () => { ignore = true; };
  }, [currentUserId, selectedWorkspaceId]);

  useEffect(() => {
    loadSharedUsersList();
  }, [currentUserId]);

  const filteredTasks = useMemo(() => {
    return sortTasksByOrder(tasks).filter((task) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.remarks.toLowerCase().includes(q) ||
        task.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesGroup = selectedGroup === "All" || task.group === selectedGroup;
      const matchesTag = selectedTag === "All" || task.tags.includes(selectedTag);
      return matchesSearch && matchesGroup && matchesTag;
    });
  }, [tasks, search, selectedGroup, selectedTag]);

  const openTasks = filteredTasks.filter((task) => task.status !== "Done");
  const doneTasks = tasks.filter((task) => task.status === "Done");
  const overdueTasks = tasks.filter((task) => task.status !== "Done" && task.deadline < todayIso());
  const visibleFilteredTasks = hideDoneTasks
    ? filteredTasks.filter((task) => task.status !== "Done")
    : filteredTasks;

  useEffect(() => {
    let ignore = false;

    async function loadCloudState() {
      if (!selectedWorkspaceOwnerId) return;
      setCloudReady(false);
      setCloudStatus(isSharedWorkspace ? `Loading ${workspaceLabel}...` : "Loading cloud data...");

      const { data, error } = await supabase
        .from("user_app_state")
        .select("state")
        .eq("user_id", selectedWorkspaceOwnerId)
        .eq("app_key", "note_task_v1")
        .maybeSingle();

      if (ignore) return;

      if (error) {
        setCloudStatus(`Cloud load failed: ${error.message}`);
        setCloudReady(true);
        return;
      }

      applyWorkspaceState(data?.state);
      setCloudStatus(
        data?.state
          ? (isSharedWorkspace ? `Viewing ${workspaceLabel}` : "Cloud data loaded")
          : (isSharedWorkspace ? `No tasks shared by ${workspaceLabel}` : "Cloud data loaded")
      );
      setCloudReady(true);
    }

    loadCloudState();
    return () => { ignore = true; };
  }, [selectedWorkspaceOwnerId, isSharedWorkspace, workspaceLabel]);

  useEffect(() => {
    if (!cloudReady || !session?.user?.id || isSharedWorkspace) return;
    const handle = window.setTimeout(async () => {
      const state = {
        tasks,
        history,
        statuses,
        groups,
        tags,
        priorities,
        defaultGroupMode,
        homeGroupBy,
        tableGroupBy,
        ganttGroupBy,
        calendarGroupBy,
        ganttColumns,
        kanbanBy,
        tableColumns,
        homeMinimalMode,
        hideDoneTasks,
        sidebarCollapsed,
        displayScale,
        darkMode,
        statusColors,
        priorityColors,
        tagColors,
        updatedAt: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("user_app_state")
        .upsert({ user_id: session.user.id, app_key: "note_task_v1", state, updated_at: new Date().toISOString() }, { onConflict: "user_id,app_key" });
      setCloudStatus(error ? `Cloud save failed: ${error.message}` : "Saved to cloud");
    }, 600);
    return () => window.clearTimeout(handle);
  }, [cloudReady, session?.user?.id, isSharedWorkspace, tasks, history, statuses, groups, tags, priorities, defaultGroupMode, homeGroupBy, tableGroupBy, ganttGroupBy, calendarGroupBy, ganttColumns, kanbanBy, tableColumns, homeMinimalMode, hideDoneTasks, sidebarCollapsed, displayScale, darkMode, statusColors, priorityColors, tagColors]);


  const canManageUsers = ["admin", "director"].includes(profile?.role);
  const navItems = [
    { name: "Home", icon: Home },
    { name: "Kanban", icon: Columns3 },
    { name: "Table", icon: Table2 },
    { name: "Calendar", icon: CalendarDays },
    { name: "Gantt", icon: GanttChartSquare },
    { name: "Master Data", icon: LayoutDashboard },
    ...(canManageUsers ? [{ name: "User Management", icon: Users }] : []),
    { name: "History", icon: Clock },
  ];

  useEffect(() => {
    const allowedViews = [
      "Home",
      "Kanban",
      "Table",
      "Calendar",
      "Gantt",
      "Master Data",
      "History",
      ...(canManageUsers ? ["User Management"] : []),
    ];

    if (!allowedViews.includes(activeView)) {
      setActiveView("Home");
      localStorage.setItem(activeViewStorageKey, "Home");
    }
  }, [activeView, canManageUsers, activeViewStorageKey]);

  async function shareMyWorkspace() {
    const normalizedEmail = shareEmail.trim().toLowerCase();
    if (!normalizedEmail) return;
    if (normalizedEmail === (session?.user?.email || "").toLowerCase()) {
      setShareMessage("You cannot share with yourself.");
      return;
    }

    setShareMessage("Finding user...");

    const { data: targetRows, error: targetError } = await supabase.rpc("find_share_user_by_email", {
      target_email: normalizedEmail,
    });

    if (targetError) {
      setShareMessage(`User lookup failed: ${targetError.message}`);
      return;
    }

    const targetProfile = Array.isArray(targetRows) ? targetRows[0] : null;

    if (!targetProfile?.id) {
      setShareMessage("No registered active user found with this email.");
      return;
    }

    const { error } = await supabase
      .from("task_workspace_shares")
      .upsert(
        {
          owner_user_id: session.user.id,
          shared_with_user_id: targetProfile.id,
          shared_with_email: targetProfile.email || normalizedEmail,
          permission: "view",
        },
        { onConflict: "owner_user_id,shared_with_user_id" }
      );

    if (error) {
      setShareMessage(`Share failed: ${error.message}`);
      return;
    }

    setShareEmail("");
    setShareMessage(`Workspace shared with ${targetProfile.full_name || targetProfile.email || normalizedEmail}.`);
    await loadSharedUsersList();
  }

  function applyDefaultGroupMode(nextMode) {
    setDefaultGroupMode(nextMode);
    setHomeGroupBy(nextMode);
    setTableGroupBy(nextMode);
    setGanttGroupBy(nextMode);
    setKanbanBy(nextMode === "None" ? "Status" : nextMode);
  }

  function addQuickTask() {
    if (!ensureEditableWorkspace()) return;
    if (!quickTitle.trim()) return;
    const task = {
      id: Date.now(),
      order: 0,
      title: quickTitle.trim(),
      description: "",
      group: quickGroup,
      status: "Open",
      priority: "Medium",
      tags: [],
      deadline: quickDeadline || todayIso(),
      completedAt: "",
      dependency: "",
      remarks: quickRemark,
      subtasks: [],
      links: [],
    };
    setTasks((current) => withSequentialTaskOrder([task, ...sortTasksByOrder(current)]));
    addHistory({
      type: "task_added",
      taskId: task.id,
      taskTitle: task.title,
      message: `Task added: "${task.title}" in Group <strong>${task.group || "No Group"}</strong>`,
    });
    setQuickTitle("");
    setQuickRemark("");
  }

  function addFloatingTask() {
    if (!ensureEditableWorkspace()) return;
    const title = window.prompt("Task name");
    if (!title?.trim()) return;
    const remark = window.prompt("Remark") || "";
    const task = {
      id: Date.now(),
      order: 0,
      title: title.trim(),
      description: "",
      group: quickGroup,
      status: "Open",
      priority: "Medium",
      tags: [],
      deadline: quickDeadline || todayIso(),
      completedAt: "",
      dependency: "",
      remarks: remark,
      subtasks: [],
      links: [],
    };
    setTasks((current) => withSequentialTaskOrder([task, ...sortTasksByOrder(current)]));
    addHistory({
      type: "task_added",
      taskId: task.id,
      taskTitle: task.title,
      message: `Task added: "${task.title}" in Group <strong>${task.group || "No Group"}</strong>`,
    });
  }

  function openTaskPopup(taskId) {
    setTaskPopupId(taskId);
  }

  function closeTaskPopup() {
    setTaskPopupId(null);
  }

  function updateTask(id, patch) {
    if (!ensureEditableWorkspace()) return;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task;

        const next = { ...task, ...patch };
        if (patch.status === "Done" && !task.completedAt) next.completedAt = todayIso();
        if (patch.status && patch.status !== "Done") next.completedAt = "";

        const labelMap = {
          title: "Title changed",
          description: "Description changed",
          remarks: "Remark changed",
          group: "Group changed",
          status: "Status changed",
          priority: "Priority changed",
          deadline: "Deadline changed",
          completedAt: "Completion date changed",
          dependency: "Dependency changed",
          dependsOn: "Dependency changed",
        };

        Object.entries(patch).forEach(([key, newValue]) => {
          if (["title", "description", "remarks"].includes(key)) return;

          const oldValue = task[key];
          if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;
          const label = labelMap[key] || `${key} changed`;
          addHistory({
            type: `${key}_changed`,
            taskId: task.id,
            taskTitle: next.title || task.title,
            message: `${label} in "${task.title}": ${formatHistoryValue(oldValue)} → ${formatHistoryValue(newValue)}`,
          });
        });

        return next;
      })
    );
  }

  function toggleSubtask(taskId, subtaskId) {
    if (!ensureEditableWorkspace()) return;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const oldSubtask = (task.subtasks || []).find((subtask) => subtask.id === subtaskId);
        if (oldSubtask) {
          addHistory({
            type: oldSubtask.done ? "subtask_uncompleted" : "subtask_completed",
            taskId: task.id,
            taskTitle: task.title,
            message: `Subtask ${oldSubtask.done ? "reopened" : "completed"} in "${task.title}": ${oldSubtask.title || "Untitled subtask"}`,
          });
        }
        return {
          ...task,
          subtasks: (task.subtasks || []).map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
          ),
        };
      })
    );
  }

  function addSubtask(taskId) {
    if (!ensureEditableWorkspace()) return;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        addHistory({
          type: "subtask_added",
          taskId: task.id,
          taskTitle: task.title,
          message: `Subtask added in "${task.title}"`,
        });
        return {
          ...task,
          subtasks: [
            ...(task.subtasks || []),
            {
              id: Date.now(),
              title: "",
              done: false,
            },
          ],
        };
      })
    );
  }

  function updateSubtask(taskId, subtaskId, patch) {
    if (!ensureEditableWorkspace()) return;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const oldSubtask = (task.subtasks || []).find((subtask) => subtask.id === subtaskId);


        if (oldSubtask && patch.done !== undefined && oldSubtask.done !== patch.done) {
          addHistory({
            type: patch.done ? "subtask_completed" : "subtask_uncompleted",
            taskId: task.id,
            taskTitle: task.title,
            message: `Subtask ${patch.done ? "completed" : "reopened"} in "${task.title}": ${oldSubtask.title || "Untitled subtask"}`,
          });
        }

        return {
          ...task,
          subtasks: (task.subtasks || []).map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, ...patch } : subtask
          ),
        };
      })
    );
  }

  function removeSubtask(taskId, subtaskId) {
    if (!ensureEditableWorkspace()) return;
    const ok = window.confirm("Delete this subtask?");
    if (!ok) return;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const removedSubtask = (task.subtasks || []).find((subtask) => subtask.id === subtaskId);
        if (removedSubtask) {
          addHistory({
            type: "subtask_deleted",
            taskId: task.id,
            taskTitle: task.title,
            message: `Subtask deleted from "${task.title}": ${removedSubtask.title || "Untitled subtask"}`,
          });
        }
        return {
          ...task,
          subtasks: (task.subtasks || []).filter((subtask) => subtask.id !== subtaskId),
        };
      })
    );
  }

  function removeTask(taskId) {
    if (!ensureEditableWorkspace()) return;
    const task = tasks.find((item) => item.id === taskId);
    if (task) {
      addHistory({
        type: "task_deleted",
        taskId: task.id,
        taskTitle: task.title,
        message: `Task deleted: "${task.title}"`,
      });
    }
    setTasks((current) => withSequentialTaskOrder(sortTasksByOrder(current).filter((task) => task.id !== taskId)));
  }

  function reorderTasks(draggedTaskId, targetTaskId) {
    if (!ensureEditableWorkspace()) return;
    setTasks((current) => moveTaskBefore(current, draggedTaskId, targetTaskId));
  }

  function addGroup() {
    if (!ensureEditableWorkspace()) return;
    if (!newGroup.trim() || groups.includes(newGroup.trim())) return;
    setGroups((current) => [...current, newGroup.trim()]);
    setNewGroup("");
  }

  function addTag() {
    if (!ensureEditableWorkspace()) return;
    const tagName = newTag.trim();
    if (!tagName || tags.includes(tagName)) return;
    setTags((current) => [...current, tagName]);
    setTagColors((current) => ({ ...current, [tagName]: "#e5e5e5" }));
    setNewTag("");
  }

  function addStatus() {
    if (!ensureEditableWorkspace()) return;
    const name = newStatus.trim();
    if (!name || statuses.includes(name)) return;
    setStatuses((current) => [...current, name]);
    setStatusColors((current) => ({ ...current, [name]: "#e5e5e5" }));
    setNewStatus("");
  }

  function addPriority() {
    if (!ensureEditableWorkspace()) return;
    const name = newPriority.trim();
    if (!name || priorities.includes(name)) return;
    setPriorities((current) => [...current, name]);
    setPriorityColors((current) => ({ ...current, [name]: "#e5e5e5" }));
    setNewPriority("");
  }

  function updateMasterSearch(type, value) {
    setMasterSearch((current) => ({ ...current, [type]: value }));
  }

  function showMoreMasterItems(type) {
    setMasterVisibleCount((current) => ({ ...current, [type]: current[type] + 50 }));
  }

  function startEditMaster(type, oldName) {
    setEditingMaster({ type, oldName });
    setEditingMasterValue(oldName);
  }

  function cancelEditMaster() {
    setEditingMaster(null);
    setEditingMasterValue("");
  }

  function renameMasterItem(type, oldName, newName) {
    if (!ensureEditableWorkspace()) return;
    const cleanName = newName.trim();

    if (!cleanName || cleanName === oldName) {
      cancelEditMaster();
      return;
    }

    if (type === "groups") {
      if (groups.includes(cleanName)) return;
      setGroups((current) => current.map((item) => (item === oldName ? cleanName : item)));
      setTasks((current) => current.map((task) => (task.group === oldName ? { ...task, group: cleanName } : task)));
    }

    if (type === "tags") {
      if (tags.includes(cleanName)) return;
      setTags((current) => current.map((item) => (item === oldName ? cleanName : item)));
      setTasks((current) => current.map((task) => ({ ...task, tags: task.tags.map((tag) => (tag === oldName ? cleanName : tag)) })));
      setTagColors((current) => {
        const next = { ...current, [cleanName]: current[oldName] || "#e5e5e5" };
        delete next[oldName];
        return next;
      });
    }

    if (type === "statuses") {
      if (statuses.includes(cleanName)) return;
      setStatuses((current) => current.map((item) => (item === oldName ? cleanName : item)));
      setTasks((current) => current.map((task) => (task.status === oldName ? { ...task, status: cleanName } : task)));
      setStatusColors((current) => {
        const next = { ...current, [cleanName]: current[oldName] || "#e5e5e5" };
        delete next[oldName];
        return next;
      });
    }

    if (type === "priorities") {
      if (priorities.includes(cleanName)) return;
      setPriorities((current) => current.map((item) => (item === oldName ? cleanName : item)));
      setTasks((current) => current.map((task) => (task.priority === oldName ? { ...task, priority: cleanName } : task)));
      setPriorityColors((current) => {
        const next = { ...current, [cleanName]: current[oldName] || "#e5e5e5" };
        delete next[oldName];
        return next;
      });
    }

    cancelEditMaster();
  }

  function deleteMasterItem(type, name) {
    if (!ensureEditableWorkspace()) return;
    const ok = window.confirm(`Delete "${name}"? Existing tasks will be moved to a safe default.`);
    if (!ok) return;

    if (type === "groups") {
      if (groups.length <= 1) return;
      const fallback = groups.find((item) => item !== name) || "Personal";
      setGroups((current) => current.filter((item) => item !== name));
      setTasks((current) => current.map((task) => (task.group === name ? { ...task, group: fallback } : task)));
    }

    if (type === "tags") {
      setTags((current) => current.filter((item) => item !== name));
      setTasks((current) => current.map((task) => ({ ...task, tags: task.tags.filter((tag) => tag !== name) })));
      setTagColors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }

    if (type === "statuses") {
      if (statuses.length <= 1) return;
      const fallback = statuses.find((item) => item !== name) || "Open";
      setStatuses((current) => current.filter((item) => item !== name));
      setTasks((current) => current.map((task) => (task.status === name ? { ...task, status: fallback } : task)));
      setStatusColors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }

    if (type === "priorities") {
      if (priorities.length <= 1) return;
      const fallback = priorities.find((item) => item !== name) || "Medium";
      setPriorities((current) => current.filter((item) => item !== name));
      setTasks((current) => current.map((task) => (task.priority === name ? { ...task, priority: fallback } : task)));
      setPriorityColors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  function updateStatusColor(status, color) {
    if (!ensureEditableWorkspace()) return;
    setStatusColors((current) => ({ ...current, [status]: color }));
  }

  function updatePriorityColor(priority, color) {
    if (!ensureEditableWorkspace()) return;
    setPriorityColors((current) => ({ ...current, [priority]: color }));
  }

  function updateTagColor(tag, color) {
    if (!ensureEditableWorkspace()) return;
    setTagColors((current) => ({ ...current, [tag]: color }));
  }

  function reorderList(type, fromIndex, toIndex) {
    if (!ensureEditableWorkspace()) return;
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const reorder = (list) => {
      const next = [...list];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    };

    if (type === "groups") setGroups(reorder);
    if (type === "tags") setTags(reorder);
    if (type === "statuses") setStatuses(reorder);
    if (type === "priorities") setPriorities(reorder);
  }

  function toggleTableColumn(columnKey) {
    if (!ensureEditableWorkspace()) return;
    setTableColumns((current) => ({ ...current, [columnKey]: !current[columnKey] }));
  }

  function toggleGanttColumn(columnKey) {
    if (!ensureEditableWorkspace()) return;
    setGanttColumns((current) => ({ ...current, [columnKey]: !current[columnKey] }));
  }

  function toggleTaskTag(taskId, tag) {
    if (!ensureEditableWorkspace()) return;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const taskTags = Array.isArray(task.tags) ? task.tags : [];
        const hasTag = taskTags.includes(tag);
        addHistory({
          type: hasTag ? "tag_removed" : "tag_added",
          taskId: task.id,
          taskTitle: task.title,
          message: `${hasTag ? "Tag removed from" : "Tag added to"} "${task.title}": #${tag}`,
        });
        return {
          ...task,
          tags: hasTag ? taskTags.filter((item) => item !== tag) : [...taskTags, tag],
        };
      })
    );
  }


  async function handleTaskCsvUpload(file) {
    if (!ensureEditableWorkspace()) return;
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseTaskCsv(text);
      let skipped = 0;

      const missingGroups = new Set();
      const missingStatuses = new Set();
      const missingPriorities = new Set();
      const missingTags = new Set();

      const importedTasks = rows
        .map((row, index) => {
          const title = getCsvValue(row, "title", "task", "tasktitle", "name").trim();
          if (!title) {
            skipped += 1;
            return null;
          }

          const group = getCsvValue(row, "group", "project") || groups[0] || "Personal";
          const status = getCsvValue(row, "status") || statuses[1] || statuses[0] || "Open";
          const priority = getCsvValue(row, "priority") || priorities[1] || priorities[0] || "Medium";
          const taskTags = splitCsvList(getCsvValue(row, "tags", "tag"));
          const subtaskTitles = splitCsvList(getCsvValue(row, "subtasks", "subtask"));

          if (!groups.includes(group)) missingGroups.add(group);
          if (!statuses.includes(status)) missingStatuses.add(status);
          if (!priorities.includes(priority)) missingPriorities.add(priority);
          taskTags.forEach((tag) => {
            if (!tags.includes(tag)) missingTags.add(tag);
          });

          return {
            id: Date.now() + index,
            title,
            description: getCsvValue(row, "description", "details"),
            group,
            status,
            priority,
            tags: taskTags,
            deadline: normalizeCsvDate(getCsvValue(row, "deadline", "due", "duedate"), todayIso()),
            completedAt: normalizeCsvDate(getCsvValue(row, "completedAt", "completion", "completiondate", "actualcompletion"), ""),
            dependency: getCsvValue(row, "dependency", "dependson"),
            remarks: getCsvValue(row, "remarks", "remark", "latestupdate", "notes"),
            subtasks: subtaskTitles.map((subtaskTitle, subtaskIndex) => ({
              id: Date.now() + index * 1000 + subtaskIndex + 1,
              title: subtaskTitle,
              done: false,
            })),
            links: [],
          };
        })
        .filter(Boolean);

      if (!importedTasks.length) {
        window.alert("No valid tasks found. CSV must have at least a title column.");
        return;
      }

      if (missingGroups.size) setGroups((current) => [...current, ...[...missingGroups].filter((item) => !current.includes(item))]);
      if (missingStatuses.size) {
        setStatuses((current) => [...current, ...[...missingStatuses].filter((item) => !current.includes(item))]);
        setStatusColors((current) => {
          const next = { ...current };
          missingStatuses.forEach((status) => {
            if (!next[status]) next[status] = "#e5e5e5";
          });
          return next;
        });
      }
      if (missingPriorities.size) {
        setPriorities((current) => [...current, ...[...missingPriorities].filter((item) => !current.includes(item))]);
        setPriorityColors((current) => {
          const next = { ...current };
          missingPriorities.forEach((priority) => {
            if (!next[priority]) next[priority] = "#e5e5e5";
          });
          return next;
        });
      }
      if (missingTags.size) {
        setTags((current) => [...current, ...[...missingTags].filter((item) => !current.includes(item))]);
        setTagColors((current) => {
          const next = { ...current };
          missingTags.forEach((tag) => {
            if (!next[tag]) next[tag] = "#e5e5e5";
          });
          return next;
        });
      }

      setTasks((current) => withSequentialTaskOrder([...importedTasks.map((task) => ({ ...task, order: 0 })), ...sortTasksByOrder(current)]));
      setCloudStatus(`Imported ${importedTasks.length} task${importedTasks.length === 1 ? "" : "s"} from CSV${skipped ? `, skipped ${skipped}` : ""}`);
      window.alert(`Imported ${importedTasks.length} task${importedTasks.length === 1 ? "" : "s"} from CSV${skipped ? `\nSkipped ${skipped} row${skipped === 1 ? "" : "s"} without title.` : ""}`);
    } catch (error) {
      window.alert(`CSV import failed: ${error.message}`);
    }
  }

  const kanbanColumns = useMemo(() => {
    if (kanbanBy === "Status") return statuses;
    if (kanbanBy === "Group") return groups;
    if (kanbanBy === "Priority") return priorities;
    if (kanbanBy === "Deadline") return [...new Set(visibleFilteredTasks.map((task) => task.deadline))].sort();
    if (kanbanBy === "Tag") return tags;
    return statuses;
  }, [kanbanBy, statuses, groups, tags, priorities, visibleFilteredTasks]);

  return (
    <div className={classNames("min-h-screen transition-colors", darkMode ? "bg-neutral-950 text-neutral-100 dark" : "bg-slate-50 text-slate-900")}>
      <style>{appStyles}</style>
      <div className="app-surface min-h-screen">
      <div className="flex">
        <aside className={classNames("sticky top-0 hidden h-screen border-r p-2.5 transition-all lg:block", darkMode ? "border-neutral-800 bg-neutral-950/95" : "border-slate-200 bg-white/85 backdrop-blur", sidebarCollapsed ? "w-14" : "w-52")}>
          <div className="mb-4 flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div>
                <div className="text-xl font-bold tracking-tight">NoteFlow</div>
                <div className={classNames("text-xs", darkMode ? "text-slate-400" : "text-slate-500")}>V1 task + note workspace</div>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={classNames("h-8 w-8 rounded-xl text-xs", darkMode ? "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800" : "")}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "→" : "←"}
            </Button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveView(item.name)}
                  className={classNames(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition", sidebarCollapsed ? "justify-center px-2" : "",
                    activeView === item.name
                      ? darkMode ? "bg-neutral-800 text-white shadow-sm ring-1 ring-white/20" : "bg-slate-900 text-white shadow-sm"
                      : darkMode ? "text-neutral-300 hover:bg-neutral-900" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon size={16} />
                  {!sidebarCollapsed && item.name}
                </button>
              );
            })}
          </nav>
          {!sidebarCollapsed && (
            <div className="absolute bottom-3 left-2.5 right-2.5 rounded-xl border border-slate-200 bg-white/70 p-2 text-xs dark:border-neutral-800 dark:bg-neutral-900/70">
              <div className="truncate font-semibold">{profile?.full_name || profile?.email || session?.user?.email}</div>
              <div className="mb-1 truncate text-[10px] uppercase tracking-wide text-slate-500">{profile?.role || "member"} · {cloudStatus}</div>
              <div className="mb-2 truncate text-[10px] text-slate-500" title={shareMessage || workspaceLabel}>
                {isSharedWorkspace ? `Viewing: ${workspaceLabel}` : (shareMessage || workspaceLabel)}
              </div>
              <Button variant="outline" onClick={onSignOut} className="h-7 w-full rounded-lg px-2 text-[10px]">
                <LogOut size={12} className="mr-1" /> Sign out
              </Button>
            </div>
          )}
        </aside>

        <main
          className={classNames("min-w-0 flex-1", activeView === "Home" && homeMinimalMode ? "p-2" : "p-2 sm:p-3 lg:p-4")}
        >
          <div className={classNames("flex w-full flex-col lg:flex-row lg:items-center lg:justify-between", activeView === "Home" && homeMinimalMode ? "mb-1 gap-1" : "mb-2 gap-2")}>
            <div className="flex w-full min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className={classNames("font-bold tracking-tight", activeView === "Home" && homeMinimalMode ? "text-lg" : "text-xl sm:text-2xl")}>{activeView}</h1>
                {!(activeView === "Home" && homeMinimalMode) && <p className={classNames("text-xs sm:text-sm", darkMode ? "text-slate-400" : "text-slate-500")}>Capture notes, manage tasks, and track work from one place.</p>}
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
              <div className={classNames("flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium shadow-sm", darkMode ? "border-neutral-700 bg-neutral-900 text-neutral-300" : "border-slate-200 bg-white text-slate-600")}>
                <span className="hidden whitespace-nowrap sm:inline">Workspace</span>
                <select
                  value={selectedWorkspaceId}
                  onChange={(event) => {
                    setSelectedWorkspaceId(event.target.value);
                    setTaskPopupId(null);
                  }}
                  className={classNames("h-6 max-w-[180px] rounded-md border px-1.5 text-[11px] outline-none", darkMode ? "border-neutral-700 bg-neutral-950 text-neutral-100" : "border-slate-200 bg-white text-slate-700")}
                  title="Select workspace"
                >
                  <option value="mine">My Workspace</option>
                  {workspaceShares.map((share) => (
                    <option key={share.owner_user_id} value={share.owner_user_id}>
                      {share.ownerName || share.ownerEmail || "Shared Workspace"}
                    </option>
                  ))}
                </select>
              </div>
              {!isSharedWorkspace && (
                <div className={classNames("hidden shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium shadow-sm xl:flex", darkMode ? "border-neutral-700 bg-neutral-900 text-neutral-300" : "border-slate-200 bg-white text-slate-600")}>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(event) => setShareEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") shareMyWorkspace();
                    }}
                    placeholder="Share email"
                    className={classNames("h-6 w-36 rounded-md border px-2 text-[11px] outline-none", darkMode ? "border-neutral-700 bg-neutral-950 text-neutral-100" : "border-slate-200 bg-white text-slate-700")}
                  />
                  <button
                    type="button"
                    onClick={shareMyWorkspace}
                    className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-700"
                    title="Share this workspace as view only"
                  >
                    Share
                  </button>
                </div>
              )}
              {isSharedWorkspace && (
                <div className="hidden rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 xl:block">
                  View only
                </div>
              )}
              {activeView === "Home" && (
                <label className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                  <span>{homeMinimalMode ? "Minimal" : "Full"}</span>
                  <button
                    type="button"
                    onClick={() => setHomeMinimalMode(!homeMinimalMode)}
                    className={classNames(
                      "relative h-4 w-8 rounded-full transition",
                      homeMinimalMode ? "bg-slate-900" : "bg-slate-200"
                    )}
                    title="Toggle minimal home view"
                  >
                    <span
                      className={classNames(
                        "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition",
                        homeMinimalMode ? "left-4" : "left-0.5"
                      )}
                    />
                  </button>
                </label>
              )}
              {["Kanban", "Table", "Calendar", "Gantt"].includes(activeView) && (
                <label className={classNames("flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm", darkMode ? "border-neutral-700 bg-neutral-900 text-neutral-300" : "border-slate-200 bg-white text-slate-600")}>
                  <span>{hideDoneTasks ? "Done hidden" : "Done visible"}</span>
                  <button
                    type="button"
                    onClick={() => setHideDoneTasks(!hideDoneTasks)}
                    className={classNames(
                      "relative h-4 w-8 rounded-full transition",
                      hideDoneTasks ? "bg-slate-900" : "bg-slate-200"
                    )}
                    title="Hide or show Done tasks"
                  >
                    <span
                      className={classNames(
                        "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition",
                        hideDoneTasks ? "left-4" : "left-0.5"
                      )}
                    />
                  </button>
                </label>
              )}
              <label className={classNames("flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm", darkMode ? "border-neutral-700 bg-neutral-900 text-neutral-300" : "border-slate-200 bg-white text-slate-600")}>
                <span>{darkMode ? "Dark" : "Light"}</span>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={classNames(
                    "relative h-4 w-8 rounded-full transition",
                    darkMode ? "bg-white/80" : "bg-slate-200"
                  )}
                  title="Toggle light/dark mode"
                >
                  <span
                    className={classNames(
                      "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition",
                      darkMode ? "left-4" : "left-0.5"
                    )}
                  />
                </button>
              </label>
              <div className={classNames("flex shrink-0 items-center gap-2 rounded-full border px-2 py-1 text-[11px] font-medium shadow-sm", darkMode ? "border-neutral-700 bg-neutral-900 text-neutral-300" : "border-slate-200 bg-white text-slate-600")}>
                <span className="whitespace-nowrap">Size</span>
                <input
                  type="number"
                  min="75"
                  max="130"
                  step="5"
                  value={displayScale}
                  onChange={(event) => setDisplayScale(Math.max(75, Math.min(130, Number(event.target.value) || 100)))}
                  className={classNames("h-5 w-12 rounded-md border px-1 text-center text-[11px] outline-none", darkMode ? "border-neutral-700 bg-neutral-950 text-neutral-100" : "border-slate-200 bg-white text-slate-700")}
                />
                <span>%</span>
              </div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant={activeView === item.name ? "default" : "outline"}
                  onClick={() => setActiveView(item.name)}
                  className="h-8 shrink-0 rounded-xl px-2.5 py-1 text-xs"
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>

          <div style={{ zoom: displayScale / 100 }}>
          <div className={classNames("grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-4", activeView === "Home" && homeMinimalMode ? "hidden" : "mb-2")}>
            <StatCard icon={Clock} label="Open Tasks" value={tasks.filter((t) => t.status !== "Done").length} />
            <StatCard icon={CheckCircle2} label="Completed" value={doneTasks.length} />
            <StatCard icon={Flag} label="Overdue" value={overdueTasks.length} />
            <StatCard icon={Tag} label="Tags" value={tags.length} />
          </div>
          {(isSharedWorkspace || shareMessage) && !(activeView === "Home" && homeMinimalMode) && (
            <div className={classNames("mb-2 rounded-xl border px-3 py-2 text-xs", isSharedWorkspace ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600")}>
              {isSharedWorkspace ? `Viewing ${workspaceLabel} in read-only mode. Your own workspace is not changed.` : shareMessage}
            </div>
          )}
          {activeView === "Home" && (
            <HomeView
              groups={groups}
              statuses={statuses}
              priorities={priorities}
              tags={tags}
              statusColors={statusColors}
              priorityColors={priorityColors}
              tagColors={tagColors}
              quickTitle={quickTitle}
              setQuickTitle={setQuickTitle}
              quickRemark={quickRemark}
              setQuickRemark={setQuickRemark}
              quickGroup={quickGroup}
              setQuickGroup={setQuickGroup}
              quickDeadline={quickDeadline}
              setQuickDeadline={setQuickDeadline}
              addQuickTask={addQuickTask}
              search={search}
              setSearch={setSearch}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              homeGroupBy={homeGroupBy}
              setHomeGroupBy={setHomeGroupBy}
              openTasks={openTasks}
              updateTask={updateTask}
              toggleSubtask={toggleSubtask}
              addSubtask={addSubtask}
              updateSubtask={updateSubtask}
              removeSubtask={removeSubtask}
              removeTask={removeTask}
              toggleTaskTag={toggleTaskTag}
              allTasks={tasks}
              homeMinimalMode={homeMinimalMode}
              setHomeMinimalMode={setHomeMinimalMode}
              addFloatingTask={addFloatingTask}
              homeFiltersOpen={homeFiltersOpen}
              setHomeFiltersOpen={setHomeFiltersOpen}
              openTaskPopup={openTaskPopup}
              reorderTasks={reorderTasks}
              addHistory={addHistory}
              startHistoryField={startHistoryField}
              commitHistoryField={commitHistoryField}
            />
          )}

          {activeView === "Kanban" && (
            <KanbanView
              statusColors={statusColors}
              priorityColors={priorityColors}
              tagColors={tagColors}
              openTaskPopup={openTaskPopup}
              kanbanBy={kanbanBy}
              setKanbanBy={setKanbanBy}
              columns={kanbanColumns}
              statuses={statuses}
              groups={groups}
              tasks={visibleFilteredTasks}
              updateTask={updateTask}
              reorderTasks={reorderTasks}
            />
          )}

          {activeView === "Table" && (
            <TableView
              statusColors={statusColors}
              priorityColors={priorityColors}
              tagColors={tagColors}
              tasks={visibleFilteredTasks}
              statuses={statuses}
              groups={groups}
              priorities={priorities}
              tags={tags}
              tableGroupBy={tableGroupBy}
              setTableGroupBy={setTableGroupBy}
              updateTask={updateTask}
              removeTask={removeTask}
              allTasks={tasks}
              tableColumns={tableColumns}
              openTaskPopup={openTaskPopup}
              onImportCsv={handleTaskCsvUpload}
              reorderTasks={reorderTasks}
              startHistoryField={startHistoryField}
              commitHistoryField={commitHistoryField}
            />
          )}

          {activeView === "Calendar" && (
            <CalendarView
              statusColors={statusColors}
              priorityColors={priorityColors}
              tasks={visibleFilteredTasks}
              openTaskPopup={openTaskPopup}
              calendarGroupBy={calendarGroupBy}
              setCalendarGroupBy={setCalendarGroupBy}
            />
          )}
          {activeView === "Gantt" && (
            <GanttView
              statusColors={statusColors}
              priorityColors={priorityColors}
              tasks={visibleFilteredTasks}
              groups={groups}
              statuses={statuses}
              priorities={priorities}
              tags={tags}
              ganttGroupBy={ganttGroupBy}
              setGanttGroupBy={setGanttGroupBy}
              updateTask={updateTask}
              allTasks={tasks}
              ganttColumns={ganttColumns}
              toggleGanttColumn={toggleGanttColumn}
              openTaskPopup={openTaskPopup}
            />
          )}
          {activeView === "User Management" && canManageUsers && (
            <UserManagementView currentProfile={profile} />
          )}
          
          {activeView === "Master Data" && (
            <MasterDataView
              groups={groups}
              tags={tags}
              statuses={statuses}
              priorities={priorities}
              statusColors={statusColors}
              priorityColors={priorityColors}
              tagColors={tagColors}
              updateStatusColor={updateStatusColor}
              updatePriorityColor={updatePriorityColor}
              updateTagColor={updateTagColor}
              defaultGroupMode={defaultGroupMode}
              applyDefaultGroupMode={applyDefaultGroupMode}
              newGroup={newGroup}
              setNewGroup={setNewGroup}
              addGroup={addGroup}
              newTag={newTag}
              setNewTag={setNewTag}
              addTag={addTag}
              newStatus={newStatus}
              setNewStatus={setNewStatus}
              addStatus={addStatus}
              newPriority={newPriority}
              setNewPriority={setNewPriority}
              addPriority={addPriority}
              masterSearch={masterSearch}
              updateMasterSearch={updateMasterSearch}
              masterVisibleCount={masterVisibleCount}
              showMoreMasterItems={showMoreMasterItems}
              editingMaster={editingMaster}
              editingMasterValue={editingMasterValue}
              setEditingMasterValue={setEditingMasterValue}
              startEditMaster={startEditMaster}
              cancelEditMaster={cancelEditMaster}
              renameMasterItem={renameMasterItem}
              deleteMasterItem={deleteMasterItem}
              reorderList={reorderList}
              tableColumns={tableColumns}
              toggleTableColumn={toggleTableColumn}
              sharedUsers={sharedUsers}
              shareEmail={shareEmail}
              setShareEmail={setShareEmail}
              shareMyWorkspace={shareMyWorkspace}
              shareMessage={shareMessage}
              removeSharedUser={removeSharedUser}
            />
          )}

          {activeView === "History" && (
            <HistoryView
              history={history}
              historyFromDate={historyFromDate}
              setHistoryFromDate={setHistoryFromDate}
              historyToDate={historyToDate}
              setHistoryToDate={setHistoryToDate}
              selectedHistoryReport={selectedHistoryReport}
              setSelectedHistoryReport={setSelectedHistoryReport}
              deleteHistoryByDateRange={deleteHistoryByDateRange}
            />
          )}
        </div>
          {taskPopupId && (
            <TaskDetailModal
              statusColors={statusColors}
              priorityColors={priorityColors}
              tagColors={tagColors}
              task={tasks.find((task) => task.id === taskPopupId)}
              statuses={statuses}
              groups={groups}
              priorities={priorities}
              tags={tags}
              allTasks={tasks}
              updateTask={updateTask}
              toggleSubtask={toggleSubtask}
              addSubtask={addSubtask}
              updateSubtask={updateSubtask}
              removeSubtask={removeSubtask}
              removeTask={removeTask}
              startHistoryField={startHistoryField}
              commitHistoryField={commitHistoryField}
              onClose={closeTaskPopup}
            />
          )}
        </main>
      </div>
      </div>
    </div>
  );
}


function HistoryView({
  history = [],
  historyFromDate,
  setHistoryFromDate,
  historyToDate,
  setHistoryToDate,
  selectedHistoryReport,
  setSelectedHistoryReport,
  deleteHistoryByDateRange,
}) {
  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false);
  const [deleteFromDate, setDeleteFromDate] = useState("");
  const [deleteToDate, setDeleteToDate] = useState("");

  const safeHistory = Array.isArray(history) ? history : [];

  const reportCards = [
    { key: "task_added", label: "Tasks Added" },
    { key: "task_deleted", label: "Tasks Deleted" },
    { key: "status_changed", label: "Status Changed" },
    { key: "priority_changed", label: "Priority Changed" },
    { key: "group_changed", label: "Group Changed" },
    { key: "deadline_changed", label: "Deadline Shifted" },
    { key: "completedAt_changed", label: "Completion Changed" },
    { key: "dependency_changed", label: "Dependency Changed" },
    { key: "remarks_changed", label: "Remarks Updated" },
    { key: "tag_added", label: "Tags Added" },
    { key: "tag_removed", label: "Tags Removed" },
    { key: "subtask_added", label: "Subtasks Added" },
    { key: "subtask_completed", label: "Subtasks Completed" },
    { key: "subtask_uncompleted", label: "Subtasks Reopened" },
    { key: "subtask_deleted", label: "Subtasks Deleted" },
    { key: "title_changed", label: "Titles Changed" },
    { key: "description_changed", label: "Descriptions Changed" },
  ];

  const filteredHistory = safeHistory.filter((item) => {
    if (!item?.createdAt) return false;
    const itemDate = new Date(item.createdAt);

    if (historyFromDate) {
      const from = new Date(`${historyFromDate}T00:00:00`);
      if (itemDate < from) return false;
    }

    if (historyToDate) {
      const to = new Date(`${historyToDate}T23:59:59`);
      if (itemDate > to) return false;
    }

    return true;
  });

  const knownReportKeys = reportCards.map((card) => card.key);
  const otherHistory = filteredHistory.filter((item) => !knownReportKeys.includes(item.type));

  const reportCounts = reportCards.map((card) => ({
    ...card,
    count: filteredHistory.filter((item) => item.type === card.key).length,
  }));

  const selectedReportLabel =
    selectedHistoryReport === "other"
      ? "Other Changes"
      : reportCards.find((card) => card.key === selectedHistoryReport)?.label || "All Changes";

  const selectedReportItems =
    selectedHistoryReport === "other"
      ? otherHistory
      : selectedHistoryReport
        ? filteredHistory.filter((item) => item.type === selectedHistoryReport)
        : filteredHistory;

  const groupedHistory = selectedReportItems.reduce((acc, item) => {
    const dateKey = item?.createdAt ? item.createdAt.slice(0, 10) : "Unknown date";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  function confirmDeleteHistory() {
    if (!deleteFromDate || !deleteToDate) {
      window.alert("Select From and To date first.");
      return;
    }

    deleteHistoryByDateRange(deleteFromDate, deleteToDate);
    setDeleteHistoryOpen(false);
    setDeleteFromDate("");
    setDeleteToDate("");
  }
  const historyCardColors = [
  "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-100",
  "border-amber-200 bg-amber-50 text-amber-950 shadow-amber-100",
  "border-rose-200 bg-rose-50 text-rose-950 shadow-rose-100",
  "border-violet-200 bg-violet-50 text-violet-950 shadow-violet-100",
  "border-cyan-200 bg-cyan-50 text-cyan-950 shadow-cyan-100",
  "border-orange-200 bg-orange-50 text-orange-950 shadow-orange-100",
  "border-lime-200 bg-lime-50 text-lime-950 shadow-lime-100",
  "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950 shadow-fuchsia-100",
  ];

  const historyNumberColors = [
    "text-emerald-900",
    "text-amber-900",
    "text-rose-900",
    "text-violet-900",
    "text-cyan-900",
    "text-orange-900",
    "text-lime-900",
    "text-fuchsia-900",
  ];

  const historyLabelColors = [
    "text-emerald-700",
    "text-amber-700",
    "text-rose-700",
    "text-violet-700",
    "text-cyan-700",
    "text-orange-700",
    "text-lime-700",
    "text-fuchsia-700",
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">History Report</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a date range to review activity. Click any card to see detailed entries below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredHistory.length} shown / {safeHistory.length} total
            </div>
            <button
              type="button"
              onClick={() => setDeleteHistoryOpen(true)}
              className="h-7 rounded-full border border-red-200 bg-red-50 px-3 text-[11px] font-semibold text-red-600 hover:bg-red-100"
            >
              Delete history
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[160px_160px_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Report from
            </label>
            <input
              type="date"
              value={historyFromDate}
              onChange={(event) => setHistoryFromDate(event.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Report to
            </label>
            <input
              type="date"
              value={historyToDate}
              onChange={(event) => setHistoryToDate(event.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setHistoryFromDate("");
              setHistoryToDate("");
              setSelectedHistoryReport("");
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear report filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
        <button
          type="button"
          onClick={() => setSelectedHistoryReport("")}
          className={classNames(
            "rounded-xl border bg-white p-3 text-left shadow-sm transition hover:border-slate-400",
            !selectedHistoryReport ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
          )}
        >
          <div className="text-2xl font-black text-slate-900">{filteredHistory.length}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">All Changes</div>
        </button>

        {reportCounts.map((card, cardIndex) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setSelectedHistoryReport(card.key)}
            className={classNames(
              "rounded-xl border p-3 text-left shadow-sm transition hover:scale-[1.01]",
              card.count > 0
                ? historyCardColors[cardIndex % historyCardColors.length]
                : "border-slate-200 bg-white text-slate-500",
              selectedHistoryReport === card.key
                ? "border-slate-900 ring-2 ring-slate-900/10"
                : ""
            )}
          >
            <div
              className={classNames(
                "text-2xl font-extrabold",
                card.count > 0
                  ? historyNumberColors[cardIndex % historyNumberColors.length]
                  : "text-slate-400"
              )}
            >
              {card.count}
            </div>
            <div
              className={classNames(
                "mt-1 text-xs font-bold uppercase tracking-wide",
                card.count > 0
                  ? historyLabelColors[cardIndex % historyLabelColors.length]
                  : "text-slate-400"
              )}
            >
              {card.label}
            </div>
          </button>
        ))}

        {!!otherHistory.length && (
          <button
            type="button"
            onClick={() => setSelectedHistoryReport("other")}
            className={classNames(
              "rounded-xl border bg-white p-3 text-left shadow-sm transition hover:border-slate-400",
              selectedHistoryReport === "other" ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
            )}
          >
            <div className="text-2xl font-black text-slate-900">{otherHistory.length}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Other Changes</div>
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{selectedReportLabel}</h3>
            <p className="text-xs text-slate-500">
              {selectedReportItems.length} entries in selected report range.
            </p>
          </div>
          {selectedHistoryReport && (
            <button
              type="button"
              onClick={() => setSelectedHistoryReport("")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Show all
            </button>
          )}
        </div>

        {!selectedReportItems.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
            No history found for this report selection.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDates.map((date) => (
              <div key={date} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {date}
                </div>

                <div className="space-y-2">
                  {(groupedHistory[date] || []).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-100 bg-white px-3 py-2"
                    >
                      <div className="text-[10px] text-slate-400">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                      <div className="text-xs font-medium text-slate-800">
                        <HistoryMessage message={item.message} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Delete history by date range</h3>
            <p className="mt-1 text-xs text-slate-500">
              This uses its own date range and will not affect the report filter above.
            </p>

            <div className="mt-3 space-y-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Delete from
                </label>
                <input
                  type="date"
                  value={deleteFromDate}
                  onChange={(event) => setDeleteFromDate(event.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Delete to
                </label>
                <input
                  type="date"
                  value={deleteToDate}
                  onChange={(event) => setDeleteToDate(event.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteHistoryOpen(false)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteHistory}
                className="h-8 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="metric-card rounded-xl border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-2 px-3 py-2">
        <div className="stat-icon-box rounded-lg bg-slate-100 p-1.5">
          <Icon size={15} />
        </div>
        <div className="flex min-w-0 items-baseline gap-2">
          <div className="metric-value text-lg font-bold leading-none">{value}</div>
          <div className="truncate text-xs text-slate-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function HomeView(props) {
  const {
    groups,
    statuses,
    priorities,
    tags,
    statusColors,
    priorityColors,
    tagColors,
    quickTitle,
    setQuickTitle,
    quickRemark,
    setQuickRemark,
    quickGroup,
    setQuickGroup,
    quickDeadline,
    setQuickDeadline,
    addQuickTask,
    search,
    setSearch,
    selectedGroup,
    setSelectedGroup,
    selectedTag,
    setSelectedTag,
    homeGroupBy,
    setHomeGroupBy,
    openTasks,
    updateTask,
    toggleSubtask,
    addSubtask,
    updateSubtask,
    removeSubtask,
    removeTask,
    toggleTaskTag,
    allTasks,
    homeMinimalMode,
    setHomeMinimalMode,
    addFloatingTask,
    homeFiltersOpen,
    setHomeFiltersOpen,
    openTaskPopup,
    reorderTasks,
    addHistory,
    startHistoryField,
    commitHistoryField,
    
  } = props;

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const visibleOpenTaskIds = useMemo(() => openTasks.map((task) => task.id), [openTasks]);

  function toggleTaskSelection(taskId) {
    setSelectedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]
    );
  }

  function selectAllVisibleTasks() {
    setSelectedTaskIds(visibleOpenTaskIds);
  }

  function clearSelectedTasks() {
    setSelectedTaskIds([]);
  }

  function toggleSelectionMode() {
    setSelectionMode((current) => {
      if (current) setSelectedTaskIds([]);
      return !current;
    });
  }

  function updateMinimalTask(taskId, patch) {
    const targetIds = selectionMode && selectedTaskIds.includes(taskId) && selectedTaskIds.length
      ? selectedTaskIds
      : [taskId];
    targetIds.forEach((id) => updateTask(id, patch));
  }

  const groupedOpenTasks = useMemo(() => {
    if (homeGroupBy === "None") {
      return [{ title: "All open tasks", tasks: openTasks }];
    }

    const bucket = {};
    openTasks.forEach((task) => {
      let keys = [];
      if (homeGroupBy === "Group") keys = [task.group || "No group"];
      if (homeGroupBy === "Status") keys = [task.status || "No status"];
      if (homeGroupBy === "Priority") keys = [task.priority || "No priority"];
      if (homeGroupBy === "Deadline") keys = [formatDate(task.deadline) || "No deadline"];
      if (homeGroupBy === "Tag") keys = task.tags.length ? task.tags.map((tag) => `#${tag}`) : ["No tag"];

      keys.forEach((key) => {
        bucket[key] = bucket[key] || [];
        bucket[key].push(task);
      });
    });

    let order = [];
    if (homeGroupBy === "Group") order = groups;
    if (homeGroupBy === "Status") order = statuses;
    if (homeGroupBy === "Tag") order = tags.map((tag) => `#${tag}`);

    const entries = Object.entries(bucket).map(([title, tasks]) => ({ title, tasks }));
    if (homeGroupBy === "Deadline") {
      return entries.sort((a, b) => new Date(a.tasks[0]?.deadline || 0) - new Date(b.tasks[0]?.deadline || 0));
    }
    if (order.length) {
      return entries.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    }
    return entries;
  }, [openTasks, homeGroupBy, groups, statuses, tags]);

  return (
    <div className={classNames("relative min-w-0", homeMinimalMode ? "" : "grid grid-cols-1 gap-2 xl:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)]")}>
      {!homeMinimalMode && (
        <Card className="soft-panel rounded-xl border-slate-200 shadow-sm">
          <CardContent className="p-2.5 sm:p-3">
            <div className="mb-2 flex items-center gap-2">
              <Plus size={16} />
              <h2 className="panel-title text-sm font-semibold sm:text-base">Quick note / task</h2>
            </div>
            <div className="space-y-2">
              <Input
                value={quickTitle}
                onChange={(event) => setQuickTitle(event.target.value)}
                placeholder="Write a quick task or note..."
                className="h-9 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
                onKeyDown={(event) => {
                  if (event.key === "Enter") addQuickTask();
                }}
              />
              <Textarea
                value={quickRemark}
                onChange={(event) => setQuickRemark(event.target.value)}
                placeholder="Remark / details"
                className="min-h-[78px] w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400"
              />
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <select
                  value={quickGroup}
                  onChange={(event) => setQuickGroup(event.target.value)}
                  className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
                >
                  {groups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={quickDeadline}
                  onChange={(event) => setQuickDeadline(event.target.value)}
                  className="h-8 rounded-xl text-xs"
                />
              </div>
              <Button onClick={addQuickTask} className="h-8 w-full rounded-xl text-xs">
                Add to open tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="min-w-0 space-y-2">
        <Card className={classNames("soft-panel border-slate-200 shadow-sm", homeMinimalMode ? "rounded-lg" : "rounded-2xl")}>
          <CardContent className={classNames("grid gap-1.5", homeMinimalMode ? "p-1" : "p-2 md:grid-cols-[1fr_140px_140px_150px]")}>
            {homeMinimalMode ? (
              <>
                <div className="grid grid-cols-[minmax(0,1fr)_110px_74px] gap-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1.5 text-slate-400" size={13} />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search..."
                      className="h-7 rounded-md pl-7 text-xs"
                    />
                  </div>
                  <select
                    aria-label="Group tasks by"
                    title="Group tasks by"
                    value={homeGroupBy}
                    onChange={(event) => setHomeGroupBy(event.target.value)}
                    className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs"
                  >
                    <option>None</option>
                    <option>Group</option>
                    <option>Status</option>
                    <option>Priority</option>
                    <option>Deadline</option>
                    <option>Tag</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => setHomeFiltersOpen(!homeFiltersOpen)}
                    className="h-7 rounded-md px-2 text-xs"
                  >
                    Filter
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    variant={selectionMode ? "default" : "outline"}
                    onClick={toggleSelectionMode}
                    className="h-7 rounded-md px-2 text-xs"
                    title="Turn selection mode on/off"
                  >
                    {selectionMode ? "Selection On" : "Select"}
                  </Button>
                  {selectionMode && (
                    <>
                      <Button variant="outline" onClick={selectAllVisibleTasks} className="h-7 rounded-md px-2 text-xs">
                        Select all
                      </Button>
                      <Button variant="outline" onClick={clearSelectedTasks} className="h-7 rounded-md px-2 text-xs">
                        Clear all
                      </Button>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                        {selectedTaskIds.length} selected
                      </span>
                    </>
                  )}
                </div>

                {homeFiltersOpen && (
                  <div className="grid grid-cols-2 gap-1">
                    <select
                      value={selectedGroup}
                      onChange={(event) => setSelectedGroup(event.target.value)}
                      className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs"
                    >
                      <option>All</option>
                      {groups.map((group) => (
                        <option key={group}>{group}</option>
                      ))}
                    </select>
                    <select
                      value={selectedTag}
                      onChange={(event) => setSelectedTag(event.target.value)}
                      className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs"
                    >
                      <option>All</option>
                      {tags.map((tag) => (
                        <option key={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 text-slate-400" size={15} />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search task, tag, remark..."
                    className="h-8 rounded-xl pl-8 text-xs"
                  />
                </div>
                <select
                  value={selectedGroup}
                  onChange={(event) => setSelectedGroup(event.target.value)}
                  className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
                >
                  <option>All</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <select
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                  className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
                >
                  <option>All</option>
                  {tags.map((tag) => (
                    <option key={tag}>{tag}</option>
                  ))}
                </select>
                <select
                  aria-label="Group tasks by"
                  title="Group tasks by"
                  value={homeGroupBy}
                  onChange={(event) => setHomeGroupBy(event.target.value)}
                  className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
                >
                  <option>None</option>
                  <option>Group</option>
                  <option>Status</option>
                  <option>Priority</option>
                  <option>Deadline</option>
                  <option>Tag</option>
                </select>
              </>
            )}
          </CardContent>
        </Card>

        <div className={classNames("grid grid-cols-1 overflow-y-auto pr-1", homeMinimalMode ? (homeFiltersOpen ? "max-h-[calc(100vh-104px)] gap-0.5" : "max-h-[calc(100vh-70px)] gap-0.5") : "max-h-[76vh] gap-2 sm:max-h-[74vh] lg:max-h-[calc(100vh-170px)] xl:max-h-[calc(100vh-160px)]")}>
          {groupedOpenTasks.map((section, index) => (
            <div
              key={section.title}
              className={classNames(
                homeMinimalMode ? "grouped-section min-w-0 rounded-lg border p-0.5 shadow-sm" : "grouped-section min-w-0 rounded-xl border p-1 shadow-sm",
                homeGroupBy === "None" ? "border-transparent bg-transparent p-0 shadow-none" : groupSectionClass(index)
              )}
            >
              {homeGroupBy !== "None" && (
                <div className={classNames("group-header flex items-center justify-between border shadow-sm", homeMinimalMode ? "mb-0.5 rounded-md px-2 py-0.5" : "sticky top-0 z-10 mb-1 rounded-lg px-2 py-1 backdrop-blur", groupHeaderClass(index))}>
                  <div className="flex items-center gap-3">
                    <div className={classNames("flex items-center justify-center rounded-full bg-white/80 font-bold shadow-sm", homeMinimalMode ? "h-4 w-4 text-[9px]" : "h-6 w-6 text-[10px]")}>
                      {index + 1}
                    </div>
                    <div>
                      {!homeMinimalMode && <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">Grouped by {homeGroupBy}</div>}
                      <div className={classNames("font-bold leading-tight", homeMinimalMode ? "text-sm" : "text-sm")}>{section.title}</div>
                    </div>
                  </div>
                  <div className={classNames("rounded-full bg-white/90 font-semibold shadow-sm", homeMinimalMode ? "px-1.5 py-0 text-[9px]" : "px-2 py-0.5 text-[10px]")}>{section.tasks.length}</div>
                </div>
              )}
              <div className={classNames("grid grid-cols-1", homeMinimalMode ? "gap-0.5" : "gap-1")}>
                {section.tasks.map((task, taskIndex) => (
                  homeMinimalMode ? (
                    <MinimalTaskRow
                      key={task.id}
                      task={task}
                      statuses={statuses}
                      selectionMode={selectionMode}
                      isSelected={selectedTaskIds.includes(task.id)}
                      selectedCount={selectedTaskIds.length}
                      toggleTaskSelection={toggleTaskSelection}
                      updateTask={updateMinimalTask}
                      openTaskPopup={openTaskPopup}
                      reorderTasks={reorderTasks}
                      addHistory={addHistory}
                    />
                  ) : (
                  <TaskCard
                    key={task.id}
                    task={task}
                    statuses={statuses}
                    groups={groups}
                    priorities={priorities}
                    tags={tags}
                    statusColors={statusColors}
                    priorityColors={priorityColors}
                    tagColors={tagColors}
                    updateTask={updateTask}
                    toggleSubtask={toggleSubtask}
                    addSubtask={addSubtask}
                    updateSubtask={updateSubtask}
                    removeSubtask={removeSubtask}
                    removeTask={removeTask}
                    toggleTaskTag={toggleTaskTag}
                    allTasks={allTasks}
                    openTaskPopup={openTaskPopup}
                    reorderTasks={reorderTasks}
                    startHistoryField={startHistoryField}
                    commitHistoryField={commitHistoryField}
                  />
                  )
                ))}
              </div>
            </div>
          ))}
          {!openTasks.length && (
            <Card className="rounded-3xl border-dashed border-slate-300 bg-white/70">
              <CardContent className="p-10 text-center text-slate-500">No open tasks found.</CardContent>
            </Card>
          )}
        </div>
      </div>
      {homeMinimalMode && (
        <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-lg ring-1 ring-slate-200">
            {openTasks.length} open tasks
          </div>
          <Button onClick={addFloatingTask} className="h-11 w-11 rounded-full p-0 shadow-xl" title="Add task">
            <Plus size={20} />
          </Button>
        </div>
      )}
    </div>
  );
}

function MinimalTaskRow({ task, statuses, selectionMode, isSelected, selectedCount, toggleTaskSelection, updateTask, openTaskPopup, reorderTasks, addHistory }) {
  const batchHint = selectionMode && isSelected && selectedCount > 1 ? `Editing this row updates ${selectedCount} selected tasks` : "";

  return (
    <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }}>
      <div
        draggable={!selectionMode}
        onDragStart={(event) => event.dataTransfer.setData("text/plain", String(task.id))}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const draggedTaskId = event.dataTransfer.getData("text/plain");
          reorderTasks?.(draggedTaskId, task.id);
        }}
        className={classNames(
          "grid min-w-0 items-center gap-1 rounded-lg border bg-white/95 px-2 py-1 shadow-sm",
          selectionMode ? "grid-cols-[22px_minmax(140px,1.1fr)_minmax(200px,2fr)_118px]" : "grid-cols-[minmax(160px,1.1fr)_minmax(220px,2fr)_118px]",
          isSelected ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
        )}
        title={batchHint}
      >
        {selectionMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleTaskSelection(task.id)}
            className="h-4 w-4 cursor-pointer rounded border-slate-300"
            title="Select task"
          />
        )}
        <button
          type="button"
          onClick={() => (selectionMode ? toggleTaskSelection(task.id) : openTaskPopup(task.id))}
          className="min-w-0 truncate text-left text-sm font-semibold leading-tight text-slate-900 hover:underline"
          title={task.title}
        >
          <LinkifyText text={task.title} links={task.links} />
        </button>
        <input
          value={task.remarks || ""}
          onFocus={(event) => {
            event.currentTarget.dataset.historyStart = task.remarks || "";
          }}
          onBlur={(event) => {
            const oldValue = event.currentTarget.dataset.historyStart || "";
            const newValue = event.target.value || "";

            if (oldValue !== newValue && typeof addHistory === "function") {
              addHistory({
                type: "remarks_changed",
                taskId: task.id,
                taskTitle: task.title,
                message: `Remark changed in "${task.title}": ${oldValue || "empty"} → ${newValue || "empty"}`,
              });
            }
          }}
          onChange={(event) => updateTask(task.id, { remarks: event.target.value })}
          className="h-7 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none focus:border-slate-400"
          placeholder="Remark..."
          title={batchHint || "Remark"}
        />

        <select
          value={task.status}
          onChange={(event) => updateTask(task.id, { status: event.target.value })}
          className="h-6 w-full min-w-0 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] leading-none shadow-sm"
          title={batchHint || "Status"}
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

function CompactDatePicker({ value, onChange, title = "Deadline" }) {
  const inputId = `date-${title}-${value || "empty"}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  return (
    <label
      htmlFor={inputId}
      className="relative flex h-8 w-full min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-xs leading-normal text-slate-900 shadow-sm"
      title={title}
    >
      <span className="min-w-0 truncate">{formatDate(value) || "Select date"}</span>
      <CalendarDays size={13} className="shrink-0 text-slate-400" />
      <input
        id={inputId}
        type="date"
        value={value}
        onChange={onChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={title}
      />
    </label>
  );
}

function TaskCard({ task, statuses, groups, priorities = ["High", "Medium", "Low"], tags, statusColors, priorityColors, tagColors, updateTask, toggleSubtask, addSubtask, updateSubtask = () => {}, removeSubtask = () => {}, removeTask, toggleTaskTag, allTasks, openTaskPopup, reorderTasks, startHistoryField = () => {}, commitHistoryField = () => {} }) {
  const progress = getProgress(task);
  const [expanded, setExpanded] = useState(false);
  const taskPriorityAccent = {
    High: "bg-red-500",
    Medium: "bg-neutral-400",
    Low: "bg-stone-400",
  }[task.priority] || "bg-stone-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      draggable
      onDragStart={(event) => event.dataTransfer.setData("text/plain", String(task.id))}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const draggedTaskId = event.dataTransfer.getData("text/plain");
        reorderTasks?.(draggedTaskId, task.id);
      }}
      onClick={() => setExpanded((current) => !current)}
      className="cursor-pointer"
      title="Click blank space to expand/collapse"
    >
      <Card className="task-card min-w-0 overflow-hidden rounded-lg border-slate-200 bg-white/95 shadow-sm ring-1 ring-slate-100">
        <CardContent className="relative p-2 pl-3">
          <div className={classNames("absolute left-0 top-0 h-full w-1", taskPriorityAccent)} />

          <div className="grid min-w-0 grid-cols-1 gap-1.5 md:grid-cols-[minmax(0,1fr)_290px_42px] md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openTaskPopup(task.id);
                  }}
                  className="min-w-0 truncate text-left text-sm font-bold leading-tight text-slate-900 hover:underline"
                  title={task.title}
                >
                  <LinkifyText text={task.title} links={task.links} />
                </button>

                <span
                  className={classNames("light-chip rounded-full border px-1.5 py-0 text-[9px] font-medium", statusBadgeClass(task.status))}
                  style={statusChipStyle(task.status, statusColors)}
                >
                  {task.status}
                </span>

                <span
                  className={classNames("light-chip rounded-full border px-1.5 py-0 text-[9px] font-medium", priorityBadgeClass(task.priority))}
                  style={priorityChipStyle(task.priority, priorityColors)}
                >
                  {task.priority}
                </span>
              </div>

              <div className="mt-0.5 min-w-0 truncate text-xs text-slate-400" title={task.remarks || "No remark"}>
                {task.remarks ? <><span>Remark: </span><LinkifyText text={task.remarks} links={task.links} /></> : "No remark"}
              </div>
            </div>

            <div
              className="grid w-[290px] shrink-0 grid-cols-2 items-center gap-x-1.5 gap-y-1.5 py-0.5"
              onClick={(event) => event.stopPropagation()}
            >
              <select
                value={task.status}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => updateTask(task.id, { status: event.target.value })}
                className="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs leading-normal text-slate-900 shadow-sm"
                title="Status"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>

              <select
                value={task.group}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => updateTask(task.id, { group: event.target.value })}
                className="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs leading-normal text-slate-900 shadow-sm"
                title="Group"
              >
                {groups.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>

              <select
                value={task.priority}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => updateTask(task.id, { priority: event.target.value })}
                className="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs leading-normal text-slate-900 shadow-sm"
                title="Priority"
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>

              <div className="min-w-0" onClick={(event) => event.stopPropagation()}>
                <CompactDatePicker
                  value={task.deadline}
                  onChange={(event) => updateTask(task.id, { deadline: event.target.value })}
                  title="Deadline"
                />
              </div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
                className="h-8 w-8 rounded-md text-slate-400 hover:text-red-600"
                title="Delete task"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          <div className="mt-1.5 grid min-w-0 grid-cols-1 gap-1 md:grid-cols-[120px_minmax(0,1fr)] md:items-center">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span>{progress}%</span>
              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-1 overflow-hidden">
              {task.tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tag}
                  className={classNames("tag-chip rounded-full border px-1.5 py-0 text-[9px] font-medium", tagChipClass(tagIndex))}
                  style={tagChipStyle(tag, tagColors, tagIndex)}
                >
                  #{tag}
                </span>
              ))}

              {task.tags.length > 3 && <span className="text-[9px] text-slate-400">+{task.tags.length - 3}</span>}
              <span className="text-[10px] text-slate-500">{task.group}</span>
              <span className="text-[10px] text-slate-500">{formatDate(task.deadline)}</span>

              {task.dependency && (
                <span className="min-w-0 truncate text-[10px] text-slate-500" title={task.dependency}>
                  Depends: {task.dependency}
                </span>
              )}
            </div>
          </div>

          {expanded && (
            <div
              className="mt-2 grid grid-cols-1 gap-2 border-t border-slate-100 pt-2 lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Left side - Subtasks */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Subtasks</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      addSubtask(task.id);
                    }}
                    className="h-7 rounded-md px-2 text-[10px]"
                  >
                    Add
                  </Button>
                </div>

                <div className="ml-3 space-y-1 border-l-2 border-slate-100 pl-3">
                  {task.subtasks.length ? (
                    task.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-2 rounded-md border-l-2 border-slate-200 bg-slate-50 px-3 py-1 text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={subtask.done}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => toggleSubtask(task.id, subtask.id)}
                          className="h-4 w-4 shrink-0"
                          title="Mark subtask done"
                        />
                        <input
                          value={subtask.title}
                          onClick={(event) => event.stopPropagation()}
                          onFocus={() => startHistoryField(`subtask-title-${task.id}-${subtask.id}`, subtask.title)}
                          onBlur={(event) =>
                            commitHistoryField(`subtask-title-${task.id}-${subtask.id}`, {
                              type: "subtask_updated",
                              taskId: task.id,
                              taskTitle: task.title,
                              label: `Subtask edited in "${task.title}"`,
                              newValue: event.target.value,
                            })
                          }
                          onChange={(event) => updateSubtask(task.id, subtask.id, { title: event.target.value })}
                          className={classNames(
                            "h-6 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] outline-none focus:border-slate-400",
                            subtask.done ? "text-slate-400 line-through" : "text-slate-700"
                          )}
                          title="Edit subtask"
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeSubtask(task.id, subtask.id);
                          }}
                          className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-red-500 hover:bg-red-50"
                          title="Delete subtask"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400">No subtasks</div>
                  )}
                </div>
              </div>

              {/* Right side - Row 1 Remark, Row 2 Dependency + Completion, Row 3 Tags */}
              <div className="space-y-2">
                <Textarea
                  value={task.remarks}
                  onClick={(event) => event.stopPropagation()}
                  onFocus={() => startHistoryField(`task-remarks-${task.id}`, task.remarks)}
                  onBlur={(event) =>
                    commitHistoryField(`task-remarks-${task.id}`, {
                      type: "remarks_changed",
                      taskId: task.id,
                      taskTitle: task.title,
                      label: `Remark changed in "${task.title}"`,
                      newValue: event.target.value,
                    })
                  }
                  onChange={(event) => updateTask(task.id, { remarks: event.target.value })}
                  className="min-h-[110px] w-full resize-y rounded-md text-[11px]"
                  placeholder="Add latest remark..."
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    value={task.dependency}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateTask(task.id, { dependency: event.target.value })}
                    className="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs leading-normal text-slate-900 shadow-sm"
                    title="Dependency"
                  >
                    <option value="">No dependency</option>
                    {allTasks
                      .filter((item) => item.id !== task.id)
                      .map((item) => (
                        <option key={item.id} value={item.title}>
                          {item.title}
                        </option>
                      ))}
                  </select>

                  <Input
                    type="date"
                    value={task.completedAt}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateTask(task.id, { completedAt: event.target.value })}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs leading-normal text-slate-900 shadow-sm"
                    title="Actual completion date"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, tagIndex) => {
                    const active = task.tags.includes(tag);

                    return (
                      <button
                        key={tag}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleTaskTag(task.id, tag);
                        }}
                        className={classNames(
                          "tag-chip rounded-full border px-1.5 py-0 text-[9px] font-medium transition",
                          active ? tagChipClass(tagIndex) : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        )}
                        style={active ? tagChipStyle(tag, tagColors, tagIndex) : undefined}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TableView({ statusColors, priorityColors, tagColors, tasks, statuses, groups, priorities = ["High", "Medium", "Low"], tags, tableGroupBy, setTableGroupBy, updateTask, removeTask, allTasks, tableColumns, openTaskPopup, onImportCsv, reorderTasks, startHistoryField = () => {}, commitHistoryField = () => {} }) {
  const [sortConfig, setSortConfig] = useState({ key: "order", direction: "asc" });

  function getSortValue(task, key) {
    if (key === "order") return getTaskOrderValue(task);
    if (key === "task") return task.title.toLowerCase();
    if (key === "status") return statuses.indexOf(task.status);
    if (key === "group") return groups.indexOf(task.group);
    if (key === "priority") return priorities.indexOf(task.priority);
    if (key === "tags") return task.tags.join(", ").toLowerCase();
    if (key === "deadline") return task.deadline || "9999-12-31";
    if (key === "completion") return task.completedAt || "9999-12-31";
    if (key === "dependency") return (task.dependency || "").toLowerCase();
    if (key === "progress") return getProgress(task);
    if (key === "remark") return (task.remarks || "").toLowerCase();
    return "";
  }

  function requestSort(key) {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function SortHeader({ columnKey, children }) {
    const active = sortConfig.key === columnKey;
    return (
      <th className="px-2 py-1.5 font-semibold">
        <button
          type="button"
          onClick={() => requestSort(columnKey)}
          className={classNames("flex items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-slate-100", active ? "text-slate-900" : "text-slate-500")}
          title={`Sort by ${children}`}
        >
          <span>{children}</span>
          <span className="text-[9px]">{active ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span>
        </button>
      </th>
    );
  }

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [tasks, sortConfig, statuses, groups, priorities]);

  const groupedTableTasks = useMemo(() => {
    if (tableGroupBy === "None") {
      return [{ title: "All tasks", tasks: sortedTasks }];
    }

    const bucket = {};
    sortedTasks.forEach((task) => {
      let keys = [];
      if (tableGroupBy === "Group") keys = [task.group || "No group"];
      if (tableGroupBy === "Status") keys = [task.status || "No status"];
      if (tableGroupBy === "Priority") keys = [task.priority || "No priority"];
      if (tableGroupBy === "Deadline") keys = [formatDate(task.deadline) || "No deadline"];
      if (tableGroupBy === "Tag") keys = task.tags.length ? task.tags.map((tag) => `#${tag}`) : ["No tag"];

      keys.forEach((key) => {
        bucket[key] = bucket[key] || [];
        bucket[key].push(task);
      });
    });

    let order = [];
    if (tableGroupBy === "Group") order = groups;
    if (tableGroupBy === "Status") order = statuses;
    if (tableGroupBy === "Priority") order = priorities;
    if (tableGroupBy === "Tag") order = tags.map((tag) => `#${tag}`);

    const entries = Object.entries(bucket).map(([title, tasks]) => ({ title, tasks }));
    if (tableGroupBy === "Deadline") {
      return entries.sort((a, b) => new Date(a.tasks[0]?.deadline || 0) - new Date(b.tasks[0]?.deadline || 0));
    }
    if (order.length) {
      return entries.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    }
    return entries;
  }, [sortedTasks, tableGroupBy, groups, statuses, priorities, tags]);

  return (
    <div className="space-y-2">
      <Card className="master-panel rounded-xl border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-2 p-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="panel-title text-base font-semibold">Tabular task view</h2>
            <p className="text-xs text-slate-500">Spreadsheet-style overview with grouped sections and wider title/remark space.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="inline-flex h-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file && onImportCsv) onImportCsv(file);
                }}
              />
            </label>
            <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{sortedTasks.length} tasks</div>
            <select
              aria-label="Group table by"
              title="Group table by"
              value={tableGroupBy}
              onChange={(event) => setTableGroupBy(event.target.value)}
              className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
            >
              <option>None</option>
              <option>Group</option>
              <option>Status</option>
              <option>Priority</option>
              <option>Deadline</option>
              <option>Tag</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="max-h-[calc(100vh-145px)] space-y-2 overflow-y-auto pr-1">
        {groupedTableTasks.map((section, index) => (
          <div
            key={section.title}
            className={classNames(
              "grouped-section min-w-0 rounded-xl border p-1.5 shadow-sm",
              tableGroupBy === "None" ? "border-transparent bg-transparent p-0 shadow-none" : classNames(groupSectionClass(index), `group-card-color-${index % 6}`)
            )}
          >
            {tableGroupBy !== "None" && (
              <div className={classNames("group-header sticky top-0 z-20 mb-1.5 flex items-center justify-between rounded-xl border px-3 py-1.5 shadow-sm backdrop-blur", groupHeaderClass(index))}>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Grouped by {tableGroupBy}</div>
                    <div className="text-sm font-bold leading-tight">{section.title}</div>
                  </div>
                </div>
                <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow-sm">{section.tasks.length} tasks</div>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/95">
              <table className="w-full min-w-[1100px] border-collapse text-xs">
                <colgroup>
                  {tableColumns.task && <col className="w-[300px]" />}
                  {tableColumns.status && <col className="w-[92px]" />}
                  {tableColumns.group && <col className="w-[105px]" />}
                  {tableColumns.priority && <col className="w-[86px]" />}
                  {tableColumns.tags && <col className="w-[140px]" />}
                  {tableColumns.deadline && <col className="w-[105px]" />}
                  {tableColumns.completion && <col className="w-[105px]" />}
                  {tableColumns.dependency && <col className="w-[190px]" />}
                  {tableColumns.progress && <col className="w-[90px]" />}
                  {tableColumns.remark && <col className="w-[300px]" />}
                  {tableColumns.action && <col className="w-[52px]" />}
                </colgroup>
                <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    {tableColumns.task && <SortHeader columnKey="task">Task</SortHeader>}
                    {tableColumns.status && <SortHeader columnKey="status">Status</SortHeader>}
                    {tableColumns.group && <SortHeader columnKey="group">Group</SortHeader>}
                    {tableColumns.priority && <SortHeader columnKey="priority">Priority</SortHeader>}
                    {tableColumns.tags && <SortHeader columnKey="tags">Tags</SortHeader>}
                    {tableColumns.deadline && <SortHeader columnKey="deadline">Deadline</SortHeader>}
                    {tableColumns.completion && <SortHeader columnKey="completion">Done</SortHeader>}
                    {tableColumns.dependency && <SortHeader columnKey="dependency">Dependency</SortHeader>}
                    {tableColumns.progress && <SortHeader columnKey="progress">Progress</SortHeader>}
                    {tableColumns.remark && <SortHeader columnKey="remark">Remark</SortHeader>}
                    {tableColumns.action && <th className="px-2 py-1.5 font-semibold">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {section.tasks.map((task) => {
                    const progress = getProgress(task);
                    return (
                      <tr
                        key={task.id}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", String(task.id))}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const draggedTaskId = event.dataTransfer.getData("text/plain");
                          reorderTasks?.(draggedTaskId, task.id);
                        }}
                        className="border-t border-slate-100 align-top hover:bg-slate-50/70"
                      >
                        {tableColumns.task && (
                          <td className="px-2 py-1.5">
                            <button type="button" onClick={() => openTaskPopup(task.id)} className="text-left text-xs font-semibold leading-snug text-slate-900 hover:underline"><LinkifyText text={task.title} links={task.links} /></button>
                            {task.description && <div className="mt-0.5 text-[11px] leading-snug text-slate-500"><LinkifyText text={task.description} links={task.links} /></div>}
                          </td>
                        )}
                        {tableColumns.status && (
                          <td className="px-2 py-1.5">
                            <select
                              value={task.status}
                              onChange={(event) => updateTask(task.id, { status: event.target.value })}
                              className="h-7 w-full min-w-0 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]"
                            >
                              {statuses.map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        )}
                        {tableColumns.group && (
                          <td className="px-2 py-1.5">
                            <select
                              value={task.group}
                              onChange={(event) => updateTask(task.id, { group: event.target.value })}
                              className="h-7 w-full min-w-0 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]"
                            >
                              {groups.map((group) => (
                                <option key={group}>{group}</option>
                              ))}
                            </select>
                          </td>
                        )}
                        {tableColumns.priority && (
                          <td className="px-2 py-1.5">
                            <select
                              value={task.priority}
                              onChange={(event) => updateTask(task.id, { priority: event.target.value })}
                              className="h-7 w-full min-w-0 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]"
                            >
                              {priorities.map((priority) => (
                                <option key={priority}>{priority}</option>
                              ))}
                            </select>
                          </td>
                        )}
                        {tableColumns.tags && (
                          <td className="px-2 py-1.5">
                            <div className="flex flex-wrap gap-1">
                              {task.tags.length ? (
                                task.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tag}
                                    className={classNames("tag-chip rounded-full border px-1.5 py-0.5 text-[10px] font-medium", tagChipClass(tagIndex))}
                                    style={tagChipStyle(tag, tagColors, tagIndex)}
                                  >
                                    #{tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">No tags</span>
                              )}
                            </div>
                          </td>
                        )}
                        {tableColumns.deadline && <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{formatDate(task.deadline)}</td>}
                        {tableColumns.completion && <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">{formatDate(task.completedAt) || "-"}</td>}
                        {tableColumns.dependency && (
                          <td className="px-2 py-1.5">
                            <select
                              value={task.dependency}
                              onChange={(event) => updateTask(task.id, { dependency: event.target.value })}
                              className="h-7 w-full min-w-0 rounded-md border border-slate-200 bg-white px-1.5 text-[11px]"
                            >
                              <option value="">No dependency</option>
                              {allTasks
                                .filter((item) => item.id !== task.id)
                                .map((item) => (
                                  <option key={item.id} value={item.title}>
                                    {item.title}
                                  </option>
                                ))}
                            </select>
                          </td>
                        )}
                        {tableColumns.progress && (
                          <td className="px-2 py-1.5">
                            <div className="w-full">
                              <div className="mb-0.5 text-[10px] text-slate-500">{progress}%</div>
                              <div className="h-1.5 rounded-full bg-slate-100">
                                <div className="h-1.5 rounded-full progress-fill" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          </td>
                        )}
                        {tableColumns.remark && (
                          <td className="px-2 py-1.5">
                            <Textarea
                              value={task.remarks}
                              onFocus={() => startHistoryField(`task-remarks-${task.id}`, task.remarks)}
                              onBlur={(event) =>
                                commitHistoryField(`task-remarks-${task.id}`, {
                                  type: "remarks_changed",
                                  taskId: task.id,
                                  taskTitle: task.title,
                                  label: `Remark changed in "${task.title}"`,
                                  newValue: event.target.value,
                                })
                              }
                              onChange={(event) => updateTask(task.id, { remarks: event.target.value })}
                              className="min-h-9 w-full rounded-md text-[11px] leading-snug"
                              placeholder="Add remark..."
                            />
                          </td>
                        )}
                        {tableColumns.action && (
                          <td className="px-2 py-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTask(task.id)}
                              className="h-7 w-7 rounded-md text-slate-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {!section.tasks.length && (
                    <tr>
                      <td colSpan={Object.values(tableColumns).filter(Boolean).length || 1} className="px-4 py-10 text-center text-slate-500">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanView({ statusColors, priorityColors, tagColors, openTaskPopup, kanbanBy, setKanbanBy, columns, statuses, groups, tasks, updateTask, reorderTasks }) {
  function getColumnTasks(column) {
    if (kanbanBy === "Status") return tasks.filter((task) => task.status === column);
    if (kanbanBy === "Group") return tasks.filter((task) => task.group === column);
    if (kanbanBy === "Priority") return tasks.filter((task) => task.priority === column);
    if (kanbanBy === "Deadline") return tasks.filter((task) => task.deadline === column);
    if (kanbanBy === "Tag") return tasks.filter((task) => task.tags.includes(column));
    return [];
  }

  function getColumnTitle(column) {
    if (kanbanBy === "Tag") return `#${column}`;
    if (kanbanBy === "Deadline") return formatDate(column);
    return column;
  }

  return (
    <div className="space-y-2">
      <Card className="master-panel rounded-xl border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-2 p-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="panel-title text-sm font-semibold">Kanban board</div>
            <div className="text-xs text-slate-500">Compact board with colored columns and quick status update.</div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Group by</span>
            <select
              value={kanbanBy}
              onChange={(event) => setKanbanBy(event.target.value)}
              className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
            >
              <option>Status</option>
              <option>Group</option>
              <option>Priority</option>
              <option>Deadline</option>
              <option>Tag</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex max-h-[calc(100vh-145px)] gap-2 overflow-x-auto overflow-y-hidden pb-1">
        {columns.map((column, index) => {
          const columnTasks = getColumnTasks(column);
          if (columnTasks.length === 0) return null;
          return (
            <div
              key={column}
              className={classNames(
                "kanban-group-card flex h-[calc(100vh-190px)] min-h-[560px] w-[260px] shrink-0 flex-col rounded-xl border p-1.5 shadow-sm sm:w-[280px]",
                groupSectionClass(index),
                `kanban-group-color-${index % 6}`
              )}
            >
              <div className={classNames("sticky top-0 z-10 mb-1.5 flex items-center justify-between rounded-xl border px-2.5 py-1.5 shadow-sm backdrop-blur", groupHeaderClass(index))}>
                <div className="min-w-0">
                  <div className="text-[9px] font-semibold uppercase tracking-wide opacity-70">Grouped by {kanbanBy}</div>
                  <div className="truncate text-xs font-bold">{getColumnTitle(column)}</div>
                </div>
                <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow-sm">{columnTasks.length}</div>
              </div>

              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", String(task.id))}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const draggedTaskId = event.dataTransfer.getData("text/plain");
                      reorderTasks?.(draggedTaskId, task.id);
                    }}
                    className="kanban-task-card rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <button type="button" onClick={() => openTaskPopup(task.id)} className="min-w-0 text-left text-xs font-semibold leading-snug text-slate-900 hover:underline"><LinkifyText text={task.title} links={task.links} /></button>
                      <span
                        className={classNames("light-chip shrink-0 rounded-full border px-1.5 py-0 text-[9px] font-medium", priorityBadgeClass(task.priority))}
                        style={priorityChipStyle(task.priority, priorityColors)}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.remarks && (
                      <div className="mb-1.5 line-clamp-2 text-[11px] leading-snug text-slate-500"><LinkifyText text={task.remarks} links={task.links} /></div>
                    )}

                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                      <span>{task.group}</span>
                      <span>Due {formatDate(task.deadline)}</span>
                    </div>

                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tag}
                          className={classNames("tag-chip rounded-full border px-2 py-0.5 text-[10px] font-medium", tagChipClass(tagIndex))}
                          style={tagChipStyle(tag, tagColors, tagIndex)}
                        >
                          #{tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && <span className="text-[10px] text-slate-400">+{task.tags.length - 3}</span>}
                    </div>

                    <select
                      value={task.status}
                      onChange={(event) => updateTask(task.id, { status: event.target.value })}
                      className="h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px]"
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {!columnTasks.length && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-3 text-center text-xs text-slate-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getWeekStart(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function getCalendarGroupKey(dateString, calendarGroupBy) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString || "No date";

  if (calendarGroupBy === "Week") {
    const weekStart = getWeekStart(dateString);
    const weekEnd = addDays(weekStart, 6);
    return `${formatDate(weekStart)} to ${formatDate(weekEnd)}`;
  }

  if (calendarGroupBy === "Month") {
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  if (calendarGroupBy === "Year") {
    return String(date.getFullYear());
  }

  return formatDate(dateString);
}

function getCalendarSortDate(sectionTitle, calendarGroupBy, tasks) {
  if (calendarGroupBy === "Week") return tasks[0]?.deadline || "9999-12-31";
  if (calendarGroupBy === "Month") return tasks[0]?.deadline || "9999-12-31";
  if (calendarGroupBy === "Year") return tasks[0]?.deadline || "9999-12-31";
  return tasks[0]?.deadline || "9999-12-31";
}

function CalendarView({ statusColors, priorityColors, tasks, openTaskPopup, calendarGroupBy, setCalendarGroupBy }) {
  const groupedCalendarTasks = useMemo(() => {
    const bucket = {};
    tasks.forEach((task) => {
      const key = getCalendarGroupKey(task.deadline, calendarGroupBy);
      bucket[key] = bucket[key] || [];
      bucket[key].push(task);
    });

    return Object.entries(bucket)
      .map(([title, tasks]) => ({
        title,
        tasks: [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline)),
      }))
      .sort((a, b) => getCalendarSortDate(a.title, calendarGroupBy, a.tasks).localeCompare(getCalendarSortDate(b.title, calendarGroupBy, b.tasks)));
  }, [tasks, calendarGroupBy]);

  return (
    <div className="space-y-2">
      <Card className="master-panel rounded-xl border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-2 p-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="panel-title text-base font-semibold">Calendar view</h2>
            <p className="text-xs text-slate-500">Group task deadlines by day, week, month, or year.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Group by</span>
            <select
              value={calendarGroupBy}
              onChange={(event) => setCalendarGroupBy(event.target.value)}
              className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
            >
              <option>Day</option>
              <option>Week</option>
              <option>Month</option>
              <option>Year</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid max-h-[calc(100vh-145px)] grid-cols-1 gap-2 overflow-y-auto pr-1 lg:grid-cols-3">
        {groupedCalendarTasks.map((section, index) => (
          <Card key={section.title} className={classNames("grouped-section rounded-xl shadow-sm", calendarGroupBy === "Day" ? classNames("border-slate-200", `group-card-color-${index % 6}`) : classNames(groupSectionClass(index), `group-card-color-${index % 6}`))}>
            <CardContent className="p-3">
              <div className={classNames("mb-2 flex items-center justify-between rounded-lg px-2 py-1.5", calendarGroupBy === "Day" ? "bg-slate-50 text-slate-800" : groupHeaderClass(index))}>
                <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  <CalendarDays size={15} />
                  <span className="truncate">{section.title}</span>
                </div>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow-sm">{section.tasks.length}</span>
              </div>
              <div className="space-y-1.5">
                {section.tasks.map((task) => (
                  <div key={task.id} className="rounded-lg bg-white px-2 py-1.5 shadow-sm ring-1 ring-slate-100">
                    <button type="button" onClick={() => openTaskPopup(task.id)} className="text-left text-xs font-medium text-slate-900 hover:underline"><LinkifyText text={task.title} links={task.links} /></button>
                    <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                      <span>{formatDate(task.deadline)}</span>
                      <span>{task.group}</span>
                      <span className="light-chip rounded-full border px-1.5 py-0 text-[9px] font-medium" style={statusChipStyle(task.status, statusColors)}>{task.status}</span>
                      <span className="light-chip rounded-full border px-1.5 py-0 text-[9px] font-medium" style={priorityChipStyle(task.priority, priorityColors)}>{task.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GanttView({ statusColors, priorityColors, tasks, groups, statuses, priorities = ["High", "Medium", "Low"], tags, ganttGroupBy, setGanttGroupBy, updateTask, allTasks, ganttColumns, toggleGanttColumn, openTaskPopup }) {
  const sorted = [...tasks].sort((a, b) => getTaskStartDate(a).localeCompare(getTaskStartDate(b)));
  const safeTasks = sorted.length ? sorted : [];
  const start = safeTasks.length
    ? new Date(Math.min(...safeTasks.map((task) => new Date(`${getTaskStartDate(task)}T00:00:00`).getTime())))
    : new Date();
  const end = safeTasks.length
    ? new Date(Math.max(...safeTasks.map((task) => new Date(`${task.deadline}T00:00:00`).getTime())))
    : new Date();
  const totalDays = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
  const timelineDates = Array.from({ length: totalDays }, (_, index) => addDays(start.toISOString().slice(0, 10), index));
  const dayWidth = 72;
  const rowHeight = 36;
  const rowGap = 6;
  const rowStep = rowHeight + rowGap;
  const timelineWidth = Math.max(520, totalDays * dayWidth);
  const visibleGanttColumnCount = Object.values(ganttColumns).filter(Boolean).length;
  const ganttLeftWidth = 280 + (ganttColumns.start ? 104 : 0) + (ganttColumns.days ? 58 : 0) + (ganttColumns.end ? 104 : 0) + (ganttColumns.depends ? 150 : 0);
  const ganttGridColumns = ["minmax(250px,1fr)"];
  if (ganttColumns.start) ganttGridColumns.push("104px");
  if (ganttColumns.days) ganttGridColumns.push("58px");
  if (ganttColumns.end) ganttGridColumns.push("104px");
  if (ganttColumns.depends) ganttGridColumns.push("150px");
  const ganttGridTemplate = ganttGridColumns.join(" ");
  const ganttMinWidth = ganttLeftWidth + timelineWidth + 32;
  const connectorColors = [
    "rgba(245, 245, 245, 0.92)",
    "rgba(212, 212, 212, 0.88)",
    "rgba(229, 229, 229, 0.9)",
    "rgba(163, 163, 163, 0.88)",
    "rgba(250, 250, 250, 0.85)",
    "rgba(188, 188, 188, 0.9)",
  ];

  function getConnectorColor(index) {
    return connectorColors[index % connectorColors.length];
  }

  const groupedGanttTasks = useMemo(() => {
    if (ganttGroupBy === "None") {
      return [{ title: "All tasks", tasks: sorted }];
    }

    const bucket = {};
    sorted.forEach((task) => {
      let keys = [];
      if (ganttGroupBy === "Group") keys = [task.group || "No group"];
      if (ganttGroupBy === "Status") keys = [task.status || "No status"];
      if (ganttGroupBy === "Priority") keys = [task.priority || "No priority"];
      if (ganttGroupBy === "Deadline") keys = [formatDate(task.deadline) || "No deadline"];
      if (ganttGroupBy === "Tag") keys = task.tags.length ? task.tags.map((tag) => `#${tag}`) : ["No tag"];

      keys.forEach((key) => {
        bucket[key] = bucket[key] || [];
        bucket[key].push(task);
      });
    });

    let order = [];
    if (ganttGroupBy === "Group") order = groups;
    if (ganttGroupBy === "Status") order = statuses;
    if (ganttGroupBy === "Priority") order = priorities;
    if (ganttGroupBy === "Tag") order = tags.map((tag) => `#${tag}`);

    const entries = Object.entries(bucket).map(([title, tasks]) => ({ title, tasks }));
    if (ganttGroupBy === "Deadline") {
      return entries.sort((a, b) => new Date(a.tasks[0]?.deadline || 0) - new Date(b.tasks[0]?.deadline || 0));
    }
    if (order.length) {
      return entries.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    }
    return entries;
  }, [sorted, ganttGroupBy, groups, statuses, priorities, tags]);

  function dayOffset(dateString) {
    return Math.max(0, Math.round((new Date(`${dateString}T00:00:00`) - start) / 86400000));
  }

  function barStyle(task) {
    const taskStart = getGanttTaskStartDate(task);
    const left = dayOffset(taskStart) * dayWidth;
    const width = Math.max(dayWidth * getGanttTaskDurationDays(task), 44);
    return { left: `${left}px`, width: `${width}px` };
  }

    function getDependencyTask(task) {
    if (!task.dependency) return null;
    return allTasks.find((item) => item.title === task.dependency) || null;
  }

  function getGanttTaskStartDate(task) {
    if (task.startDate) return task.startDate;
    const dependencyTask = getDependencyTask(task);
    if (dependencyTask) {
      return addDays(dependencyTask.deadline, 1);
    }
    return getTaskStartDate(task);
  }

  function getGanttTaskDurationDays(task) {
    return daysBetween(getGanttTaskStartDate(task), task.deadline);
  }

  function getGanttBarStartX(task) {
    return dayOffset(getGanttTaskStartDate(task)) * dayWidth;
  }

  function getGanttBarEndX(task) {
    return getGanttBarStartX(task) + Math.max(dayWidth * getGanttTaskDurationDays(task), 44);
  }

  function getDependencyConnector(sectionTasks, task, rowIndex) {
    if (!task.dependency) return null;
    const dependencyIndex = sectionTasks.findIndex((item) => item.title === task.dependency);
    if (dependencyIndex < 0 || dependencyIndex === rowIndex) return null;

    const predecessor = sectionTasks[dependencyIndex];

    // Finish-to-start connector:
    // start point = predecessor bar END + vertical middle
    // end point = successor bar START + vertical middle
    const sourceX = getGanttBarEndX(predecessor);
    const sourceY = dependencyIndex * rowStep + rowHeight / 2;
    const targetX = getGanttBarStartX(task);
    const targetY = rowIndex * rowStep + rowHeight / 2;

    const directionY = targetY >= sourceY ? 1 : -1;
    const exitX = sourceX + 18;
    const entryX = Math.max(0, targetX - 18);

    // Keep the long horizontal run in the empty gap between task rows,
    // not through the center of a bar. This makes it look like a standard Gantt dependency.
    const laneY = sourceY + directionY * (rowHeight / 2 + rowGap / 2);

    const path = `M ${sourceX} ${sourceY} H ${exitX} V ${laneY} H ${entryX} V ${targetY} H ${targetX}`;

    return { path, fromX: sourceX, fromY: sourceY, toX: targetX, toY: targetY };
  }

  function updateStartDate(task, startDate) {
    const duration = getTaskDurationDays(task);
    updateTask(task.id, {
      startDate,
      durationDays: duration,
      deadline: addDays(startDate, duration - 1),
    });
  }

  function updateDuration(task, rawValue) {
    const durationDays = Math.max(1, Number(rawValue || 1));
    const startDate = getTaskStartDate(task);
    updateTask(task.id, {
      startDate,
      durationDays,
      deadline: addDays(startDate, durationDays - 1),
    });
  }

  function updateEndDate(task, endDate) {
    const startDate = getTaskStartDate(task);
    updateTask(task.id, {
      startDate,
      deadline: endDate,
      durationDays: daysBetween(startDate, endDate),
    });
  }

  return (
    <div className="space-y-2">
      <Card className="master-panel rounded-xl border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-2 p-2.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="panel-title text-base font-semibold">Gantt timeline</h2>
            <p className="text-xs text-slate-500">Bars use start date + days/end date. Dependency is selected per task.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Group by</span>
            <select
              value={ganttGroupBy}
              onChange={(event) => setGanttGroupBy(event.target.value)}
              className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs"
            >
              <option>None</option>
              <option>Group</option>
              <option>Status</option>
              <option>Priority</option>
              <option>Deadline</option>
              <option>Tag</option>
            </select>
            <div className="flex flex-wrap gap-1">
              {[
                ["start", "Start"],
                ["days", "Days"],
                ["end", "End"],
                ["depends", "Depends"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleGanttColumn(key)}
                  className={classNames(
                    "h-8 rounded-xl border px-2 text-[11px] font-medium",
                    ganttColumns[key] ? "border-neutral-200 bg-neutral-100 text-neutral-950 dark:border-white/40 dark:bg-white/15 dark:text-white" : "border-slate-200 bg-white text-slate-500"
                  )}
                  title={`${ganttColumns[key] ? "Hide" : "Show"} ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="max-h-[calc(100vh-145px)] space-y-2 overflow-y-auto pr-1">
        {groupedGanttTasks.map((section, index) => (
          <div
            key={section.title}
            className={classNames(
              "grouped-section min-w-0 rounded-xl border p-1.5 shadow-sm",
              ganttGroupBy === "None" ? "border-transparent bg-transparent p-0 shadow-none" : classNames(groupSectionClass(index), `group-card-color-${index % 6}`)
            )}
          >
            {ganttGroupBy !== "None" && (
              <div className={classNames("group-header sticky top-0 z-20 mb-1.5 flex items-center justify-between rounded-xl border px-3 py-1.5 shadow-sm backdrop-blur", groupHeaderClass(index))}>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Grouped by {ganttGroupBy}</div>
                    <div className="text-sm font-bold leading-tight">{section.title}</div>
                  </div>
                </div>
                <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow-sm">{section.tasks.length} tasks</div>
              </div>
            )}

            <Card className="rounded-xl border-slate-200 bg-white/95 shadow-sm">
              <CardContent className="p-2">
                <div
                  className="gantt-scroll-x overflow-x-auto"
                  onWheel={(event) => {
                    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                      event.stopPropagation();
                    }
                  }}
                >
                  <div style={{ minWidth: `${ganttMinWidth}px` }}>
                    <div className="sticky top-0 z-40 grid gap-2 bg-white/95 pb-1" style={{ gridTemplateColumns: `${ganttLeftWidth}px 1fr` }}>
                      <div
                        className="sticky left-0 z-50 grid gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm"
                        style={{ gridTemplateColumns: ganttGridTemplate }}
                      >
                        <div>Task</div>
                        {ganttColumns.start && <div>Start</div>}
                        {ganttColumns.days && <div>Days</div>}
                        {ganttColumns.end && <div>End</div>}
                        {ganttColumns.depends && <div>Depends</div>}
                      </div>
                      <div className="relative h-8 rounded-lg bg-slate-50" style={{ width: `${timelineWidth}px` }}>
                        {timelineDates.map((date) => (
                          <div
                            key={date}
                            className="absolute top-0 flex h-8 flex-col items-center justify-center border-l border-slate-200 text-[10px] text-slate-500"
                            style={{ left: `${dayOffset(date) * dayWidth}px`, width: `${dayWidth}px` }}
                          >
                            <div className="font-semibold">{new Date(`${date}T00:00:00`).getDate()}</div>
                            <div>{new Date(`${date}T00:00:00`).toLocaleString("en-US", { month: "short" })}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative" style={{ display: "grid", rowGap: `${rowGap}px` }}>
                      <svg
                        className="pointer-events-none absolute top-0 z-40 overflow-visible"
                        style={{ left: `${ganttLeftWidth + 8}px`, width: `${timelineWidth}px`, height: `${Math.max(rowHeight, section.tasks.length * rowStep - rowGap)}px`, overflow: "visible" }}
                      >
                        
                        {section.tasks.map((task, taskIndex) => {
                          const connector = getDependencyConnector(section.tasks, task, taskIndex);
                          if (!connector) return null;
                          const connectorColor = getConnectorColor(taskIndex);
                          return (
                            <g key={`connector-${task.id}`}>
                              <path
                                d={connector.path}
                                fill="none"
                                stroke={connectorColor}
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle cx={connector.fromX} cy={connector.fromY} r="2.4" fill={connectorColor} />
                              <polygon
                                points={`${connector.toX},${connector.toY} ${connector.toX - 8},${connector.toY - 4} ${connector.toX - 8},${connector.toY + 4}`}
                                fill={connectorColor}
                              />
                            </g>
                          );
                        })}
                      </svg>
                      {section.tasks.map((task, taskIndex) => (
                        <div key={task.id} className="grid items-center gap-2 overflow-visible" style={{ gridTemplateColumns: `${ganttLeftWidth}px 1fr`, height: `${rowHeight}px` }}>
                          <div
                            className="sticky left-0 z-50 grid min-w-0 items-center gap-1 overflow-hidden rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm"
                            style={{ gridTemplateColumns: ganttGridTemplate }}
                          >
                            <div className="min-w-0">
                              <button type="button" onClick={() => openTaskPopup(task.id)} className="whitespace-normal break-words text-left text-xs font-semibold leading-snug text-slate-900 hover:underline" title={task.title}><LinkifyText text={task.title} links={task.links} /></button>
                              <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-slate-500">
                                <span>{task.group}</span>
                                <span>·</span>
                                <span>{task.status}</span>
                              </div>
                            </div>
                            {ganttColumns.start && (
                              <Input
                                type="date"
                                value={getGanttTaskStartDate(task)}
                                onChange={(event) => updateStartDate(task, event.target.value)}
                                className="h-6 w-full min-w-0 rounded-md px-1 text-[9px]"
                              />
                            )}
                            {ganttColumns.days && (
                              <Input
                                type="number"
                                min="1"
                                value={getTaskDurationDays(task)}
                                onChange={(event) => updateDuration(task, event.target.value)}
                                className="h-6 w-full min-w-0 rounded-md px-1 text-[9px]"
                              />
                            )}
                            {ganttColumns.end && (
                              <Input
                                type="date"
                                value={task.deadline}
                                onChange={(event) => updateEndDate(task, event.target.value)}
                                className="h-6 w-full min-w-0 rounded-md px-1 text-[9px]"
                              />
                            )}
                            {ganttColumns.depends && (
                              <select
                                value={task.dependency}
                                onChange={(event) => updateTask(task.id, { dependency: event.target.value })}
                                className="h-7 w-full min-w-0 truncate rounded-md border border-slate-200 bg-white px-1 text-[10px]"
                                title={task.dependency || "No dependency"}
                              >
                                <option value="">No dependency</option>
                                {allTasks
                                  .filter((item) => item.id !== task.id)
                                  .map((item) => (
                                    <option key={item.id} value={item.title}>
                                      {item.title}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>

                          <div className="relative z-10 overflow-hidden rounded-lg bg-slate-50" style={{ width: `${timelineWidth}px`, height: `${rowHeight}px` }}>
                            {timelineDates.map((date) => (
                              <div
                                key={date}
                                className="absolute top-0 h-9 border-l border-slate-100"
                                style={{ left: `${dayOffset(date) * dayWidth}px` }}
                              />
                            ))}
                            <div
                              className={classNames("gantt-bar absolute top-1.5 z-30 h-6 rounded-lg border px-2 py-1 text-[10px] font-medium shadow-sm", statusBadgeClass(task.status))}
                              style={{ ...barStyle(task), ...statusChipStyle(task.status, statusColors) }}
                              title={`${task.title}: ${formatDate(getGanttTaskStartDate(task))} to ${formatDate(task.deadline)} (${getGanttTaskDurationDays(task)} days)`}
                            >
                              <button type="button" onClick={() => openTaskPopup(task.id)} className="block w-full truncate text-left">{getGanttTaskDurationDays(task)}d · {task.priority}</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!section.tasks.length && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-3 text-center text-xs text-slate-400">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskDetailModal({ statusColors, priorityColors, tagColors, task, statuses, groups, priorities = ["High", "Medium", "Low"], tags, allTasks, updateTask, toggleSubtask, addSubtask, updateSubtask = () => {}, removeSubtask = () => {}, removeTask, startHistoryField = () => {}, commitHistoryField = () => {}, onClose }) {
  const [draft, setDraft] = useState(task || null);
  const [editingLinkId, setEditingLinkId] = useState(null);

  useEffect(() => {
    setDraft(task || null);
    setEditingLinkId(null);
  }, [task]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!task || !draft) return null;

  const draftLinks = normalizeTaskLinks(draft.links);

  function updateDraft(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function addTaskLink() {
    const newLinkId = Date.now();
    updateDraft({
      links: [
        ...draftLinks,
        { id: newLinkId, title: "", url: "" },
      ],
    });
    setEditingLinkId(newLinkId);
  }

  function updateTaskLink(linkId, patch) {
    updateDraft({
      links: draftLinks.map((link) =>
        link.id === linkId ? { ...link, ...patch } : link
      ),
    });
  }

  function removeTaskLink(linkId) {
    updateDraft({ links: draftLinks.filter((link) => link.id !== linkId) });
  }

  function saveChanges() {
    updateTask(task.id, draft);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm" onMouseDown={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Task Detail · Edit Mode</div>
            <h2 className="truncate text-lg font-bold text-slate-900">{draft.title || "Untitled task"}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={onClose} className="h-8 rounded-xl px-3 text-xs" title="Esc also closes and discards changes">
              Discard
            </Button>
            <Button onClick={saveChanges} className="h-8 rounded-xl px-3 text-xs">
              Save
            </Button>
          </div>
        </div>

        <div className="max-h-[calc(92vh-62px)] overflow-y-auto p-4">
          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
            <div className="min-w-0 space-y-3">
              <div className="min-w-0">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Task title
                </label>
                <Input
                  value={draft.title}
                  onFocus={() => startHistoryField(`task-title-${task.id}`, task.title)}
                  onBlur={(event) =>
                    commitHistoryField(`task-title-${task.id}`, {
                      type: "title_changed",
                      taskId: task.id,
                      taskTitle: task.title,
                      label: `Title changed in "${task.title}"`,
                      newValue: event.target.value,
                    })
                  }
                  onChange={(e) => updateDraft({ title: e.target.value })}
                  className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </label>
                <Textarea
                  value={draft.description}
                  onFocus={() => startHistoryField(`task-description-${task.id}`, task.description)}
                  onBlur={(event) =>
                    commitHistoryField(`task-description-${task.id}`, {
                      type: "description_changed",
                      taskId: task.id,
                      taskTitle: task.title,
                      label: `Description changed in "${task.title}"`,
                      newValue: event.target.value,
                    })
                  }
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  className="min-h-[96px] w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Remark / latest update
                </label>
                <Textarea
                  value={draft.remarks}
                  onFocus={() => startHistoryField(`task-remarks-${task.id}`, task.remarks)}
                  onBlur={(event) =>
                    commitHistoryField(`task-remarks-${task.id}`, {
                      type: "remarks_changed",
                      taskId: task.id,
                      taskTitle: task.title,
                      label: `Remark changed in "${task.title}"`,
                      newValue: event.target.value,
                    })
                  }
                  onChange={(e) => updateDraft({ remarks: e.target.value })}
                  className="min-h-[140px] w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-700">Subtasks</div>
                  <Button variant="outline" size="sm" onClick={() => addSubtask(task.id)} className="h-7 rounded-lg px-2 text-[10px]">
                    Add subtask
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {task.subtasks.length ? task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-xs shadow-sm ring-1 ring-slate-100">
                      <input
                        type="checkbox"
                        checked={subtask.done}
                        onChange={() => toggleSubtask(task.id, subtask.id)}
                        title="Mark subtask done"
                      />
                      <Input
                        value={subtask.title}
                        onFocus={() => startHistoryField(`subtask-title-${task.id}-${subtask.id}`, subtask.title)}
                        onBlur={(event) =>
                          commitHistoryField(`subtask-title-${task.id}-${subtask.id}`, {
                            type: "subtask_updated",
                            taskId: task.id,
                            taskTitle: task.title,
                            label: `Subtask edited in "${task.title}"`,
                            newValue: event.target.value,
                          })
                        }
                        onChange={(event) => updateSubtask(task.id, subtask.id, { title: event.target.value })}
                        className={classNames(
                          "h-7 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-slate-400",
                          subtask.done ? "text-slate-400 line-through" : "text-slate-700"
                        )}
                        title="Edit subtask"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubtask(task.id, subtask.id)}
                        className="h-7 rounded-lg px-2 text-[10px] text-red-500 hover:text-red-700"
                        title="Delete subtask"
                      >
                        Delete
                      </Button>
                    </div>
                  )) : <div className="text-xs text-slate-400">No subtasks yet.</div>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</label>
                  <select value={draft.status} onChange={(e) => updateDraft({ status: e.target.value })} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm">
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Priority</label>
                  <select value={draft.priority} onChange={(e) => updateDraft({ priority: e.target.value })} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm">
                    {priorities.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Group</label>
                  <select value={draft.group} onChange={(e) => updateDraft({ group: e.target.value })} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm">
                    {groups.map((group) => <option key={group}>{group}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Deadline</label>
                  <Input type="date" value={draft.deadline} onChange={(e) => updateDraft({ deadline: e.target.value })} className="h-9 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Completed</label>
                  <Input type="date" value={draft.completedAt} onChange={(e) => updateDraft({ completedAt: e.target.value })} className="h-9 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Progress</label>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{getProgress(task)}%</div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Dependency</label>
                <select value={draft.dependency} onChange={(e) => updateDraft({ dependency: e.target.value })} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-sm">
                  <option value="">No dependency</option>
                  {allTasks.filter((item) => item.id !== task.id).map((item) => (
                    <option key={item.id} value={item.title}>{item.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const active = draft.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const nextTags = active ? draft.tags.filter((item) => item !== tag) : [...draft.tags, tag];
                          updateDraft({ tags: nextTags });
                        }}
                        className={classNames("tag-chip rounded-full border px-2 py-1 text-xs font-medium", active ? tagChipClass(tags.indexOf(tag)) : "border-slate-200 bg-white text-slate-500")}
                        style={active ? tagChipStyle(tag, tagColors, tags.indexOf(tag)) : undefined}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                Press <span className="font-semibold text-slate-700">Esc</span> to close and discard unsaved popup changes. Click <span className="font-semibold text-slate-700">Save</span> to apply edits.
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Links</div>
                    <div className="text-[10px] text-slate-400">Use Link Title* in title, description, or remark to make it clickable.</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addTaskLink} className="h-7 rounded-lg px-3 text-[10px]">
                    Add
                  </Button>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 text-[10px]">
                  <div className="grid grid-cols-[28px_minmax(82px,1fr)_minmax(96px,1.15fr)_34px_34px] border-b border-slate-200 bg-slate-50 px-1.5 py-1 text-[9px] font-semibold text-slate-500">
                    <div>S.no.</div>
                    <div>Title</div>
                    <div>Link</div>
                    <div className="text-center">Edit</div>
                    <div className="text-center">Del</div>
                  </div>
                  {draftLinks.length ? draftLinks.map((link, linkIndex) => {
                    const linkHref = link.url ? normalizeHref(link.url) : "";
                    const isEditing = editingLinkId === link.id;
                    return (
                      <div key={link.id} className="grid grid-cols-[28px_minmax(82px,1fr)_minmax(96px,1.15fr)_34px_34px] items-center gap-1 border-b border-slate-100 px-1.5 py-1 last:border-b-0">
                        <div className="text-[10px] text-slate-500">
                          {linkHref ? (
                            <a
                              href={linkHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="font-medium text-blue-600 underline hover:text-blue-800"
                              title={link.url}
                            >
                              {linkIndex + 1}
                            </a>
                          ) : (
                            linkIndex + 1
                          )}
                        </div>
                        {isEditing ? (
                          <Input
                            value={link.title}
                            onChange={(event) => updateTaskLink(link.id, { title: event.target.value })}
                            placeholder="Title"
                            className="h-6 min-w-0 rounded-lg px-1.5 text-[10px]"
                          />
                        ) : linkHref ? (
                          <a
                            href={linkHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="whitespace-normal break-words font-medium text-blue-600 underline hover:text-blue-800"
                            title={link.url}
                          >
                            {link.title || "Untitled link"}
                          </a>
                        ) : (
                          <div className="whitespace-normal break-words text-slate-700">{link.title || "Untitled link"}</div>
                        )}
                        {isEditing ? (
                          <Input
                            value={link.url}
                            onChange={(event) => updateTaskLink(link.id, { url: event.target.value })}
                            placeholder="https://..."
                            className="h-6 min-w-0 rounded-lg px-1.5 text-[10px]"
                            title={link.url}
                          />
                        ) : linkHref ? (
                          <a
                            href={linkHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="block min-w-0 truncate text-blue-600 underline hover:text-blue-800"
                            title={link.url}
                          >
                            {link.url}
                          </a>
                        ) : (
                          <div className="truncate text-slate-400">No URL</div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLinkId(isEditing ? null : link.id)}
                          className="h-6 rounded-lg px-1 text-[9px]"
                          title={isEditing ? "Done editing" : "Edit link"}
                        >
                          {isEditing ? "Done" : "Edit"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTaskLink(link.id)}
                          className="h-6 rounded-lg px-1 text-[9px] text-red-500 hover:text-red-700"
                          title="Delete link"
                        >
                          Del
                        </Button>
                      </div>
                    );
                  }) : (
                    <div className="px-2 py-3 text-center text-xs text-slate-400">
                      No links yet.
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" onClick={() => { removeTask(task.id); onClose(); }} className="w-full rounded-xl text-red-600 hover:text-red-700">
                Delete task
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


function UserManagementView({ currentProfile }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const isAdmin = currentProfile?.role === "admin";
  const roles = ["admin", "director", "manager", "member"];

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateUser(userId, patch) {
    if (!isAdmin) return;
    const { error } = await supabase.from("user_profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", userId);
    if (error) setMessage(error.message);
    else {
      setMessage("User rights updated.");
      loadUsers();
    }
  }

  return (
    <div className="space-y-2">
      <Card className="master-panel rounded-xl border-slate-200 shadow-sm">
        <CardContent className="p-3">
          <h2 className="panel-title text-base font-semibold">User Management</h2>
          <p className="text-xs text-slate-500">Visible only for Admin and Director. Role editing is available only for Admin.</p>
        </CardContent>
      </Card>

      <Card className="master-panel rounded-xl border-slate-200 shadow-sm">
        <CardContent className="p-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-2 py-2">User</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Created</th>
                    <th className="px-2 py-2">Rights</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="px-2 py-2">
                        <div className="font-semibold text-slate-900">{user.full_name || "Unnamed user"}</div>
                        <div className="text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-2 py-2">
                        {isAdmin ? (
                          <select value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value })} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs">
                            {roles.map((role) => <option key={role}>{role}</option>)}
                          </select>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold capitalize text-slate-700">{user.role}</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {isAdmin ? (
                          <select value={user.is_active ? "active" : "disabled"} onChange={(event) => updateUser(user.id, { is_active: event.target.value === "active" })} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs">
                            <option value="active">Active</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        ) : (
                          <span>{user.is_active ? "Active" : "Disabled"}</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-slate-500">{formatDate((user.created_at || "").slice(0, 10))}</td>
                      <td className="px-2 py-2 text-slate-500">{isAdmin ? "Editable" : "Read only"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {message && <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{message}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function MasterDataView({
  groups,
  tags,
  statuses,
  priorities,
  statusColors,
  priorityColors,
  tagColors,
  updateStatusColor,
  updatePriorityColor,
  updateTagColor,
  defaultGroupMode,
  applyDefaultGroupMode,
  newGroup,
  setNewGroup,
  addGroup,
  newTag,
  setNewTag,
  addTag,
  newStatus,
  setNewStatus,
  addStatus,
  newPriority,
  setNewPriority,
  addPriority,
  masterSearch,
  updateMasterSearch,
  masterVisibleCount,
  showMoreMasterItems,
  editingMaster,
  editingMasterValue,
  setEditingMasterValue,
  startEditMaster,
  cancelEditMaster,
  renameMasterItem,
  deleteMasterItem,
  reorderList,
  tableColumns,
  toggleTableColumn,
  sharedUsers = [],
  shareEmail = "",
  setShareEmail = () => {},
  shareMyWorkspace = () => {},
  shareMessage = "",
  removeSharedUser = () => {},
}) {
  const groupingOptions = ["None", "Group", "Status", "Priority", "Deadline", "Tag"];

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
      <Card className="master-panel rounded-xl border-slate-200 shadow-sm lg:col-span-3">
        <CardContent className="p-3">
          <h2 className="panel-title mb-1 text-base font-semibold">Default View Settings</h2>
          <p className="mb-2 text-xs text-slate-500">Choose the default grouping mode for Home, Kanban, and Table views.</p>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-[220px_1fr] md:items-center">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Default group mode
              </label>
              <select
                value={defaultGroupMode}
                onChange={(event) => applyDefaultGroupMode(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {groupingOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Current default: <span className="font-semibold text-slate-900">{defaultGroupMode}</span>. Use{" "}
              <span className="font-semibold">Group</span> for project-wise work, or{" "}
              <span className="font-semibold">Deadline</span> for date-wise planning.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="master-panel rounded-xl border-slate-200 shadow-sm lg:col-span-3">
        <CardContent className="p-3">
          <h2 className="panel-title mb-1 text-base font-semibold">Table Column Settings</h2>
          <p className="mb-2 text-xs text-slate-500">Select which columns should be visible in Table view.</p>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {tableColumnOptions.map((column) => (
              <label key={column.key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm">
                <input
                  type="checkbox"
                  checked={!!tableColumns[column.key]}
                  onChange={() => toggleTableColumn(column.key)}
                  className="h-3.5 w-3.5"
                />
                <span className="truncate">{column.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="master-panel rounded-xl border-slate-200 shadow-sm lg:col-span-3">
        <CardContent className="p-3">
          <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="panel-title mb-1 text-base font-semibold">Shared Users</h2>
              <p className="text-xs text-slate-500">Manage users who can view your workspace. Workspace dropdown remains available in the top bar.</p>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
              {sharedUsers.length} shared
            </span>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_110px]">
            <Input
              type="email"
              value={shareEmail}
              onChange={(event) => setShareEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") shareMyWorkspace();
              }}
              placeholder="Type registered user email to share..."
              className="h-9 rounded-xl text-xs"
            />
            <Button onClick={shareMyWorkspace} className="h-9 rounded-xl px-3 text-xs">
              Share
            </Button>
          </div>

          {shareMessage && (
            <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {shareMessage}
            </div>
          )}

          <div className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1">
            {sharedUsers.length ? (
              sharedUsers.map((share) => (
                <div key={share.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-800">{share.userName || share.shared_with_email}</div>
                    <div className="truncate text-[11px] text-slate-500">{share.userEmail || share.shared_with_email}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{share.permission || "view"} access</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => removeSharedUser(share)}
                    className="h-8 shrink-0 rounded-lg px-2 text-[10px] text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-400">
                No users currently have access to your workspace.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <MasterCrudPanel
        title="Groups / Projects"
        type="groups"
        items={groups}
        newValue={newGroup}
        setNewValue={setNewGroup}
        addItem={addGroup}
        searchValue={masterSearch.groups}
        updateSearch={updateMasterSearch}
        visibleCount={masterVisibleCount.groups}
        showMore={showMoreMasterItems}
        reorderList={reorderList}
        editingMaster={editingMaster}
        editingMasterValue={editingMasterValue}
        setEditingMasterValue={setEditingMasterValue}
        startEditMaster={startEditMaster}
        cancelEditMaster={cancelEditMaster}
        renameMasterItem={renameMasterItem}
        deleteMasterItem={deleteMasterItem}
        placeholder="New project"
        searchPlaceholder="Search projects..."
      />

      <MasterCrudPanel
        title="Tags"
        type="tags"
        items={tags}
        newValue={newTag}
        setNewValue={setNewTag}
        addItem={addTag}
        searchValue={masterSearch.tags}
        updateSearch={updateMasterSearch}
        visibleCount={masterVisibleCount.tags}
        showMore={showMoreMasterItems}
        reorderList={reorderList}
        editingMaster={editingMaster}
        editingMasterValue={editingMasterValue}
        setEditingMasterValue={setEditingMasterValue}
        startEditMaster={startEditMaster}
        cancelEditMaster={cancelEditMaster}
        renameMasterItem={renameMasterItem}
        deleteMasterItem={deleteMasterItem}
        placeholder="New tag"
        searchPlaceholder="Search tags..."
        renderItem={(tag) => `#${tag}`}
        getItemClass={() => "tag-chip"}
        getItemStyle={(tag, index) => tagChipStyle(tag, tagColors, index)}
        renderRight={(tag) => (
          <input
            type="color"
            value={tagColors[tag] || "#e5e5e5"}
            onChange={(event) => updateTagColor(tag, event.target.value)}
            className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
            title="Tag color"
          />
        )}
      />

      <MasterCrudPanel
        title="Statuses"
        type="statuses"
        items={statuses}
        newValue={newStatus}
        setNewValue={setNewStatus}
        addItem={addStatus}
        searchValue={masterSearch.statuses}
        updateSearch={updateMasterSearch}
        visibleCount={masterVisibleCount.statuses}
        showMore={showMoreMasterItems}
        reorderList={reorderList}
        editingMaster={editingMaster}
        editingMasterValue={editingMasterValue}
        setEditingMasterValue={setEditingMasterValue}
        startEditMaster={startEditMaster}
        cancelEditMaster={cancelEditMaster}
        renameMasterItem={renameMasterItem}
        deleteMasterItem={deleteMasterItem}
        placeholder="New status"
        searchPlaceholder="Search statuses..."
        description="Drag statuses to control Status group order in Home, Kanban, and Table."
        getItemClass={(status) => statusBadgeClass(status)}
        getItemStyle={(status) => statusChipStyle(status, statusColors)}
        renderRight={(status) => (
          <input
            type="color"
            value={statusColors[status] || "#e5e5e5"}
            onChange={(event) => updateStatusColor(status, event.target.value)}
            className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
            title="Status color"
          />
        )}
      />

      <MasterCrudPanel
        title="Priorities"
        type="priorities"
        items={priorities}
        newValue={newPriority}
        setNewValue={setNewPriority}
        addItem={addPriority}
        searchValue={masterSearch.priorities}
        updateSearch={updateMasterSearch}
        visibleCount={masterVisibleCount.priorities}
        showMore={showMoreMasterItems}
        reorderList={reorderList}
        editingMaster={editingMaster}
        editingMasterValue={editingMasterValue}
        setEditingMasterValue={setEditingMasterValue}
        startEditMaster={startEditMaster}
        cancelEditMaster={cancelEditMaster}
        renameMasterItem={renameMasterItem}
        deleteMasterItem={deleteMasterItem}
        placeholder="New priority"
        searchPlaceholder="Search priorities..."
        description="Create, edit, delete, reorder, and color task priorities."
        getItemClass={(priority) => priorityBadgeClass(priority)}
        getItemStyle={(priority) => priorityChipStyle(priority, priorityColors)}
        renderRight={(priority) => (
          <input
            type="color"
            value={priorityColors[priority] || "#e5e5e5"}
            onChange={(event) => updatePriorityColor(priority, event.target.value)}
            className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
            title="Priority color"
          />
        )}
      />
    </div>
  );
}

function MasterCrudPanel({
  title,
  type,
  items,
  newValue,
  setNewValue,
  addItem,
  searchValue,
  updateSearch,
  visibleCount,
  showMore,
  reorderList,
  editingMaster,
  editingMasterValue,
  setEditingMasterValue,
  startEditMaster,
  cancelEditMaster,
  renameMasterItem,
  deleteMasterItem,
  placeholder,
  searchPlaceholder,
  description,
  renderItem,
  getItemClass,
  getItemStyle,
  renderRight,
}) {
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes((searchValue || "").toLowerCase())
  );

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleItems.length;

  return (
    <Card className="master-panel rounded-xl border-slate-200 shadow-sm">
      <CardContent className="p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="panel-title text-base font-semibold">{title}</h2>
            <p className="text-xs text-slate-500">
              {description || `${items.length} items`}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
            {items.length}
          </span>
        </div>

        <div className="mb-2 grid grid-cols-[minmax(0,1fr)_74px] gap-1.5">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholder}
            className="h-8 min-w-0 rounded-xl text-xs"
            onKeyDown={(event) => {
              if (event.key === "Enter") addItem();
            }}
          />
          <Button onClick={addItem} className="h-8 rounded-xl px-3 text-xs">
            Add
          </Button>
        </div>

        <Input
          value={searchValue || ""}
          onChange={(e) => updateSearch(type, e.target.value)}
          placeholder={searchPlaceholder}
          className="mb-2 h-8 rounded-xl text-xs"
        />

        <SortableMasterList
          type={type}
          items={visibleItems}
          allItems={items}
          reorderList={reorderList}
          renderItem={renderItem}
          getItemClass={getItemClass}
          getItemStyle={getItemStyle}
          renderRight={renderRight}
          editingMaster={editingMaster}
          editingMasterValue={editingMasterValue}
          setEditingMasterValue={setEditingMasterValue}
          startEditMaster={startEditMaster}
          cancelEditMaster={cancelEditMaster}
          renameMasterItem={renameMasterItem}
          deleteMasterItem={deleteMasterItem}
        />

        {hasMore && (
          <Button
            variant="outline"
            onClick={() => showMore(type)}
            className="mt-2 h-8 w-full rounded-xl text-xs"
          >
            Show more {filteredItems.length - visibleItems.length}
          </Button>
        )}

        {!filteredItems.length && (
          <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
            No matching item found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SortableMasterList({
  type,
  items,
  allItems,
  reorderList,
  renderItem,
  getItemClass,
  getItemStyle,
  renderRight,
  editingMaster,
  editingMasterValue,
  setEditingMasterValue,
  startEditMaster,
  cancelEditMaster,
  renameMasterItem,
  deleteMasterItem,
}) {
  const [dragItem, setDragItem] = useState(null);

  return (
    <div className="max-h-[360px] space-y-1.5 overflow-y-auto pr-1">
      {items.map((item, index) => {
        const actualIndex = allItems.indexOf(item);
        const isEditing = editingMaster?.type === type && editingMaster?.oldName === item;

        return (
          <div
            key={item}
            draggable={!isEditing}
            onDragStart={() => setDragItem(item)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!dragItem || dragItem === item) return;
              reorderList(type, allItems.indexOf(dragItem), actualIndex);
              setDragItem(null);
            }}
            onDragEnd={() => setDragItem(null)}
            className={classNames(
              "master-list-item flex cursor-grab items-center justify-between rounded-xl border bg-white px-2 py-1.5 text-xs shadow-sm transition active:cursor-grabbing",
              dragItem === item ? "scale-[0.99] border-slate-400 opacity-60" : "border-slate-200 hover:bg-slate-50",
              getItemClass ? getItemClass(item, index) : ""
            )}
            style={getItemStyle ? getItemStyle(item, index) : undefined}
            title="Drag to reorder"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="master-list-index flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                {actualIndex + 1}
              </span>

              {isEditing ? (
                <input
                  value={editingMasterValue}
                  onChange={(event) => setEditingMasterValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") renameMasterItem(type, item, editingMasterValue);
                    if (event.key === "Escape") cancelEditMaster();
                  }}
                  className="h-7 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900"
                  autoFocus
                />
              ) : (
                <span className="master-list-name min-w-0 truncate font-medium">
                  {renderItem ? renderItem(item, index) : item}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {renderRight ? renderRight(item, index) : null}

              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => renameMasterItem(type, item, editingMasterValue)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditMaster}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startEditMaster(type, item)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMasterItem(type, item)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>
                  <span className="drag-label text-[10px] text-slate-400">drag</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
