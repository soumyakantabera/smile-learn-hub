import type { ContentData, ContentItem, Module, Course } from '@/types/content';
import { getCourse, getCourseModules, getModuleItems, getModule } from './content';

export interface SequenceEntry {
  item: ContentItem;
  module: Module;
  indexInCourse: number;
  indexInModule: number;
}

export function buildCourseSequence(content: ContentData, courseId: string): SequenceEntry[] {
  const modules = getCourseModules(content, courseId);
  const seq: SequenceEntry[] = [];
  let i = 0;
  for (const module of modules) {
    const items = getModuleItems(content, module.id);
    items.forEach((item, j) => {
      seq.push({ item, module, indexInCourse: i++, indexInModule: j });
    });
  }
  return seq;
}

export interface AdjacentInfo {
  prev: SequenceEntry | null;
  next: SequenceEntry | null;
  current: SequenceEntry | null;
  sequence: SequenceEntry[];
  course: Course | null;
  module: Module | null;
}

export function getAdjacentItems(content: ContentData, itemId: string): AdjacentInfo {
  const item = content.items[itemId];
  if (!item) {
    return { prev: null, next: null, current: null, sequence: [], course: null, module: null };
  }
  const module = getModule(content, item.moduleId);
  const course = module ? getCourse(content, module.courseId) : null;
  if (!course) {
    return { prev: null, next: null, current: null, sequence: [], course: null, module };
  }
  const sequence = buildCourseSequence(content, course.id);
  const idx = sequence.findIndex((s) => s.item.id === itemId);
  return {
    prev: idx > 0 ? sequence[idx - 1] : null,
    next: idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null,
    current: idx >= 0 ? sequence[idx] : null,
    sequence,
    course,
    module,
  };
}

export function getAdjacentModules(content: ContentData, moduleId: string) {
  const module = getModule(content, moduleId);
  if (!module) return { prev: null, next: null, course: null };
  const course = getCourse(content, module.courseId);
  if (!course) return { prev: null, next: null, course: null };
  const modules = getCourseModules(content, course.id);
  const idx = modules.findIndex((m) => m.id === moduleId);
  return {
    prev: idx > 0 ? modules[idx - 1] : null,
    next: idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null,
    course,
  };
}

/* -------------------- Local browser cache -------------------- */

const LAST_VISITED_KEY = 'lms:last-visited-item';
const LAST_MODULE_KEY = 'lms:last-module';
const VISITED_ITEMS_KEY = 'lms:visited-items';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function rememberVisitedItem(courseId: string, itemId: string) {
  const map = readJSON<Record<string, string>>(LAST_VISITED_KEY, {});
  map[courseId] = itemId;
  writeJSON(LAST_VISITED_KEY, map);
}

export function getLastVisitedItem(courseId: string): string | null {
  const map = readJSON<Record<string, string>>(LAST_VISITED_KEY, {});
  return map[courseId] || null;
}

export function rememberVisitedModule(courseId: string, moduleId: string) {
  const map = readJSON<Record<string, string>>(LAST_MODULE_KEY, {});
  map[courseId] = moduleId;
  writeJSON(LAST_MODULE_KEY, map);
}

export function getLastVisitedModule(courseId: string): string | null {
  const map = readJSON<Record<string, string>>(LAST_MODULE_KEY, {});
  return map[courseId] || null;
}

export function markItemVisited(courseId: string, itemId: string) {
  const map = readJSON<Record<string, string[]>>(VISITED_ITEMS_KEY, {});
  const list = new Set(map[courseId] || []);
  list.add(itemId);
  map[courseId] = Array.from(list);
  writeJSON(VISITED_ITEMS_KEY, map);
}

export function getVisitedItems(courseId: string): Set<string> {
  const map = readJSON<Record<string, string[]>>(VISITED_ITEMS_KEY, {});
  return new Set(map[courseId] || []);
}

export function clearCourseProgress(courseId: string) {
  for (const key of [LAST_VISITED_KEY, LAST_MODULE_KEY, VISITED_ITEMS_KEY]) {
    const map = readJSON<Record<string, unknown>>(key, {});
    delete map[courseId];
    writeJSON(key, map);
  }
}
