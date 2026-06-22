import type { ContentData, ContentItem, Course, Module } from '@/types/content';

let contentCache: ContentData | null = null;

export async function loadContent(): Promise<ContentData> {
  if (contentCache) return contentCache;
  const response = await fetch(`${import.meta.env.BASE_URL}content/index.json`);
  if (!response.ok) throw new Error('Failed to load content');
  contentCache = await response.json();
  return contentCache!;
}

/** Get all published courses visible to a learner given their enrollment list. */
export function getEnrolledCourses(content: ContentData, enrolledCourseIds: string[]): Course[] {
  const set = new Set(enrolledCourseIds);
  return Object.values(content.courses)
    .filter((c) => set.has(c.id))
    .filter((c) => (c.status || 'published') === 'published');
}

/** Admin / catalog view: all courses regardless of enrollment. */
export function getAllCourses(content: ContentData, includeDrafts = false): Course[] {
  return Object.values(content.courses).filter(
    (c) => includeDrafts || (c.status || 'published') === 'published',
  );
}

export function getCourse(content: ContentData, courseId: string): Course | null {
  return content.courses[courseId] || null;
}

export function getCourseModules(content: ContentData, courseId: string): Module[] {
  const course = content.courses[courseId];
  if (!course) return [];
  return course.modules
    .map((moduleId) => content.modules[moduleId])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
}

export function getModule(content: ContentData, moduleId: string): Module | null {
  return content.modules[moduleId] || null;
}

export function getModuleItems(content: ContentData, moduleId: string): ContentItem[] {
  const module = content.modules[moduleId];
  if (!module) return [];
  return module.items.map((itemId) => content.items[itemId]).filter(Boolean);
}

export function getItem(content: ContentData, itemId: string): ContentItem | null {
  return content.items[itemId] || null;
}

/** Recent items across the given courses, newest first. */
export function getRecentItemsForCourses(
  content: ContentData,
  courseIds: string[],
  limit = 5,
): ContentItem[] {
  const idSet = new Set(courseIds);
  const items: ContentItem[] = [];
  Object.values(content.courses).forEach((course) => {
    if (!idSet.has(course.id)) return;
    course.modules.forEach((moduleId) => {
      const module = content.modules[moduleId];
      if (!module) return;
      module.items.forEach((itemId) => {
        const item = content.items[itemId];
        if (item) items.push(item);
      });
    });
  });
  return items
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function searchItemsInCourses(
  content: ContentData,
  courseIds: string[],
  query: string,
  filters?: { type?: string; tag?: string },
): ContentItem[] {
  const idSet = new Set(courseIds);
  const q = query.toLowerCase();
  const out: ContentItem[] = [];
  Object.values(content.courses).forEach((course) => {
    if (!idSet.has(course.id)) return;
    course.modules.forEach((mid) => {
      const m = content.modules[mid];
      if (!m) return;
      m.items.forEach((iid) => {
        const it = content.items[iid];
        if (!it) return;
        if (filters?.type && it.type !== filters.type) return;
        if (filters?.tag && !it.tags.includes(filters.tag)) return;
        if (q) {
          const hit =
            it.title.toLowerCase().includes(q) ||
            it.description.toLowerCase().includes(q) ||
            it.tags.some((t) => t.toLowerCase().includes(q));
          if (!hit) return;
        }
        out.push(it);
      });
    });
  });
  return out;
}

export function getAllTagsForCourses(content: ContentData, courseIds: string[]): string[] {
  const idSet = new Set(courseIds);
  const tags = new Set<string>();
  Object.values(content.courses).forEach((course) => {
    if (!idSet.has(course.id)) return;
    course.modules.forEach((mid) => {
      const m = content.modules[mid];
      if (!m) return;
      m.items.forEach((iid) => {
        const it = content.items[iid];
        if (it) it.tags.forEach((t) => tags.add(t));
      });
    });
  });
  return Array.from(tags).sort();
}

/* -------- Legacy compatibility (used by editor only) -------- */
export function getBatchCourses(content: ContentData, _batchKey: string): Course[] {
  return getAllCourses(content);
}
export function getBatch(content: ContentData, batchKey: string) {
  return content.batches[batchKey] || null;
}
export function getRecentItems(content: ContentData, _batchKey: string, limit = 5): ContentItem[] {
  return getRecentItemsForCourses(content, Object.keys(content.courses), limit);
}
export function searchItems(
  content: ContentData,
  _batchKey: string,
  query: string,
  filters?: { type?: string; tag?: string },
) {
  return searchItemsInCourses(content, Object.keys(content.courses), query, filters);
}
export function getAllTags(content: ContentData, _batchKey: string) {
  return getAllTagsForCourses(content, Object.keys(content.courses));
}
