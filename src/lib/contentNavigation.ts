import type { ContentData, ContentItem, Module, Course } from '@/types/content';
import { getCourse, getCourseModules, getModuleItems, getModule } from './content';

export interface SequenceEntry {
  item: ContentItem;
  module: Module;
  indexInCourse: number;
}

export function buildCourseSequence(content: ContentData, courseId: string): SequenceEntry[] {
  const modules = getCourseModules(content, courseId);
  const seq: SequenceEntry[] = [];
  let i = 0;
  for (const module of modules) {
    const items = getModuleItems(content, module.id);
    for (const item of items) {
      seq.push({ item, module, indexInCourse: i++ });
    }
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

const LAST_VISITED_KEY = 'lms:last-visited-item';

export function rememberVisitedItem(courseId: string, itemId: string) {
  try {
    const map = JSON.parse(localStorage.getItem(LAST_VISITED_KEY) || '{}');
    map[courseId] = itemId;
    localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(map));
  } catch {}
}

export function getLastVisitedItem(courseId: string): string | null {
  try {
    const map = JSON.parse(localStorage.getItem(LAST_VISITED_KEY) || '{}');
    return map[courseId] || null;
  } catch {
    return null;
  }
}
