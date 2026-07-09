import type { ContentData, ContentItem, Course, Module } from '@/types/content';
import { supabase } from '@/integrations/supabase/client';

let contentCache: ContentData | null = null;

async function loadBundledContent(): Promise<ContentData> {
  const response = await fetch(`${import.meta.env.BASE_URL}content/index.json`);
  if (!response.ok) throw new Error('Failed to load bundled content');
  return response.json();
}

function isValidContent(data: unknown): data is ContentData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Partial<ContentData>;
  return (
    !!d.courses &&
    !!d.modules &&
    !!d.items &&
    !!d.batches &&
    Object.keys(d.courses).length > 0
  );
}

export async function loadContent(force = false): Promise<ContentData> {
  if (contentCache && !force) return contentCache;
  // Prefer live content from backend so admin publishes go out instantly.
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 'current')
      .maybeSingle();
    if (!error && data && isValidContent((data as any).data)) {
      contentCache = (data as any).data as ContentData;
      return contentCache!;
    }
  } catch {
    // fall through to bundled
  }
  contentCache = await loadBundledContent();
  return contentCache!;
}

export async function refreshContent(): Promise<ContentData> {
  contentCache = null;
  return loadContent(true);
}

export async function publishLiveContent(content: ContentData): Promise<void> {
  const { batches, courses, modules, items } = content;
  const payload = { batches, courses, modules, items } as ContentData;
  const { error } = await supabase
    .from('site_content')
    .upsert({ id: 'current', data: payload as any, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  contentCache = payload;
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
