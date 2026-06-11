import type { DraftContentData, ContentData, Course, Module, ContentItem } from '@/types/content';

const DRAFT_KEY = 'lws_draft_content';
const SNAPSHOT_KEY = 'lws_draft_snapshots';
const MAX_SNAPSHOTS = 5;

export function saveDraft(content: ContentData): void {
  const draft: DraftContentData = {
    ...content,
    lastModified: Date.now(),
    isDraft: true,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  pushSnapshot(draft);
}

export function loadDraft(): DraftContentData | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function hasDraft(): boolean {
  return localStorage.getItem(DRAFT_KEY) !== null;
}

export function getDraftSizeKB(): number {
  const stored = localStorage.getItem(DRAFT_KEY);
  return stored ? Math.round((stored.length / 1024) * 10) / 10 : 0;
}

export interface Snapshot {
  id: string;
  takenAt: number;
  sizeKB: number;
  data: DraftContentData;
}

function pushSnapshot(draft: DraftContentData) {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    const snaps: Snapshot[] = raw ? JSON.parse(raw) : [];
    const serialized = JSON.stringify(draft);
    snaps.unshift({
      id: `snap-${Date.now()}`,
      takenAt: Date.now(),
      sizeKB: Math.round((serialized.length / 1024) * 10) / 10,
      data: draft,
    });
    while (snaps.length > MAX_SNAPSHOTS) snaps.pop();
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snaps));
  } catch {
    localStorage.removeItem(SNAPSHOT_KEY);
  }
}

export function listSnapshots(): Snapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function restoreSnapshot(id: string): DraftContentData | null {
  const snaps = listSnapshots();
  const snap = snaps.find((s) => s.id === id);
  return snap ? snap.data : null;
}

export function clearSnapshots(): void {
  localStorage.removeItem(SNAPSHOT_KEY);
}

export function exportDraftAsJson(content: ContentData): void {
  const { batches, courses, modules, items } = content;
  const exportData = { batches, courses, modules, items };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDraftFromFile(file: File): Promise<ContentData> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed.batches || !parsed.courses || !parsed.modules || !parsed.items) {
    throw new Error('Invalid content format - missing required keys.');
  }
  return parsed as ContentData;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ---------- Course CRUD ----------
export function addCourse(content: ContentData, course: Course, batchKey: string): ContentData {
  const newContent = { ...content };
  newContent.courses = { ...newContent.courses, [course.id]: course };
  if (newContent.batches[batchKey]) {
    newContent.batches = {
      ...newContent.batches,
      [batchKey]: {
        ...newContent.batches[batchKey],
        courses: [...newContent.batches[batchKey].courses, course.id],
      },
    };
  }
  return newContent;
}

export function updateCourse(content: ContentData, course: Course): ContentData {
  return { ...content, courses: { ...content.courses, [course.id]: course } };
}

export function deleteCourse(content: ContentData, courseId: string): ContentData {
  const newContent = { ...content };
  const course = newContent.courses[courseId];
  if (course) {
    course.modules.forEach((moduleId) => {
      const module = newContent.modules[moduleId];
      if (module) {
        module.items.forEach((itemId) => delete newContent.items[itemId]);
        delete newContent.modules[moduleId];
      }
    });
  }
  delete newContent.courses[courseId];
  Object.keys(newContent.batches).forEach((batchKey) => {
    newContent.batches[batchKey] = {
      ...newContent.batches[batchKey],
      courses: newContent.batches[batchKey].courses.filter((id) => id !== courseId),
    };
  });
  return newContent;
}

export function duplicateCourse(content: ContentData, courseId: string): ContentData {
  const course = content.courses[courseId];
  if (!course) return content;

  const newCourseId = generateId('course');
  const newModuleIds: string[] = [];
  const newModules: Record<string, Module> = { ...content.modules };
  const newItems: Record<string, ContentItem> = { ...content.items };

  course.modules.forEach((modId) => {
    const mod = content.modules[modId];
    if (!mod) return;
    const newModId = generateId('module');
    const newItemIds: string[] = [];
    mod.items.forEach((itemId) => {
      const it = content.items[itemId];
      if (!it) return;
      const newItemId = generateId('item');
      newItems[newItemId] = { ...it, id: newItemId, moduleId: newModId };
      newItemIds.push(newItemId);
    });
    newModules[newModId] = { ...mod, id: newModId, courseId: newCourseId, items: newItemIds };
    newModuleIds.push(newModId);
  });

  const newCourse: Course = {
    ...course,
    id: newCourseId,
    title: `${course.title} (Copy)`,
    modules: newModuleIds,
    status: 'draft',
  };

  const newBatches = { ...content.batches };
  Object.keys(newBatches).forEach((bk) => {
    if (newBatches[bk].courses.includes(courseId)) {
      newBatches[bk] = { ...newBatches[bk], courses: [...newBatches[bk].courses, newCourseId] };
    }
  });

  return {
    ...content,
    courses: { ...content.courses, [newCourseId]: newCourse },
    modules: newModules,
    items: newItems,
    batches: newBatches,
  };
}

// ---------- Module CRUD ----------
export function addModule(content: ContentData, module: Module): ContentData {
  const newContent = { ...content };
  newContent.modules = { ...newContent.modules, [module.id]: module };
  if (newContent.courses[module.courseId]) {
    newContent.courses = {
      ...newContent.courses,
      [module.courseId]: {
        ...newContent.courses[module.courseId],
        modules: [...newContent.courses[module.courseId].modules, module.id],
      },
    };
  }
  return newContent;
}

export function updateModule(content: ContentData, module: Module): ContentData {
  return { ...content, modules: { ...content.modules, [module.id]: module } };
}

export function deleteModule(content: ContentData, moduleId: string): ContentData {
  const newContent = { ...content };
  const module = newContent.modules[moduleId];
  if (module) {
    module.items.forEach((itemId) => delete newContent.items[itemId]);
    if (newContent.courses[module.courseId]) {
      newContent.courses[module.courseId] = {
        ...newContent.courses[module.courseId],
        modules: newContent.courses[module.courseId].modules.filter((id) => id !== moduleId),
      };
    }
  }
  delete newContent.modules[moduleId];
  return newContent;
}

export function duplicateModule(content: ContentData, moduleId: string): ContentData {
  const mod = content.modules[moduleId];
  if (!mod) return content;
  const course = content.courses[mod.courseId];
  if (!course) return content;

  const newModId = generateId('module');
  const newItems: Record<string, ContentItem> = { ...content.items };
  const newItemIds: string[] = [];
  mod.items.forEach((itemId) => {
    const it = content.items[itemId];
    if (!it) return;
    const newItemId = generateId('item');
    newItems[newItemId] = { ...it, id: newItemId, moduleId: newModId };
    newItemIds.push(newItemId);
  });
  const newModule: Module = {
    ...mod,
    id: newModId,
    title: `${mod.title} (Copy)`,
    items: newItemIds,
    order: course.modules.length + 1,
  };
  return {
    ...content,
    modules: { ...content.modules, [newModId]: newModule },
    items: newItems,
    courses: {
      ...content.courses,
      [course.id]: { ...course, modules: [...course.modules, newModId] },
    },
  };
}

// ---------- Item CRUD ----------
export function addItem(content: ContentData, item: ContentItem): ContentData {
  const newContent = { ...content };
  newContent.items = { ...newContent.items, [item.id]: item };
  if (newContent.modules[item.moduleId]) {
    newContent.modules = {
      ...newContent.modules,
      [item.moduleId]: {
        ...newContent.modules[item.moduleId],
        items: [...newContent.modules[item.moduleId].items, item.id],
      },
    };
  }
  return newContent;
}

export function updateItem(content: ContentData, item: ContentItem): ContentData {
  return { ...content, items: { ...content.items, [item.id]: item } };
}

export function deleteItem(content: ContentData, itemId: string): ContentData {
  const newContent = { ...content };
  const item = newContent.items[itemId];
  if (item && newContent.modules[item.moduleId]) {
    newContent.modules[item.moduleId] = {
      ...newContent.modules[item.moduleId],
      items: newContent.modules[item.moduleId].items.filter((id) => id !== itemId),
    };
  }
  delete newContent.items[itemId];
  return newContent;
}

export function duplicateItem(content: ContentData, itemId: string): ContentData {
  const it = content.items[itemId];
  if (!it) return content;
  const newItemId = generateId('item');
  const newItem: ContentItem = { ...it, id: newItemId, title: `${it.title} (Copy)` };
  return addItem(content, newItem);
}

export function moveItem(content: ContentData, itemId: string, targetModuleId: string): ContentData {
  const it = content.items[itemId];
  if (!it || !content.modules[targetModuleId] || it.moduleId === targetModuleId) return content;
  const updated = deleteItem(content, itemId);
  return addItem(updated, { ...it, moduleId: targetModuleId, id: itemId });
}

// ---------- Reorder ----------
export function reorderModulesInCourse(
  content: ContentData,
  courseId: string,
  fromIndex: number,
  toIndex: number,
): ContentData {
  const course = content.courses[courseId];
  if (!course) return content;
  const modules = [...course.modules];
  const [moved] = modules.splice(fromIndex, 1);
  modules.splice(toIndex, 0, moved);
  const updatedModules = { ...content.modules };
  modules.forEach((id, i) => {
    if (updatedModules[id]) updatedModules[id] = { ...updatedModules[id], order: i + 1 };
  });
  return {
    ...content,
    courses: { ...content.courses, [courseId]: { ...course, modules } },
    modules: updatedModules,
  };
}

export function reorderItemsInModule(
  content: ContentData,
  moduleId: string,
  fromIndex: number,
  toIndex: number,
): ContentData {
  const module = content.modules[moduleId];
  if (!module) return content;
  const items = [...module.items];
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  return {
    ...content,
    modules: { ...content.modules, [moduleId]: { ...module, items } },
  };
}

// ---------- Diff vs production ----------
export interface ContentDiffSummary {
  coursesAdded: number;
  coursesRemoved: number;
  coursesChanged: number;
  modulesAdded: number;
  modulesRemoved: number;
  itemsAdded: number;
  itemsRemoved: number;
  itemsChanged: number;
}

export function diffContent(draft: ContentData, production: ContentData): ContentDiffSummary {
  const diffKeys = <T,>(a: Record<string, T>, b: Record<string, T>) => {
    const aIds = new Set(Object.keys(a));
    const bIds = new Set(Object.keys(b));
    const added = [...aIds].filter((k) => !bIds.has(k)).length;
    const removed = [...bIds].filter((k) => !aIds.has(k)).length;
    let changed = 0;
    aIds.forEach((id) => {
      if (bIds.has(id) && JSON.stringify(a[id]) !== JSON.stringify(b[id])) changed++;
    });
    return { added, removed, changed };
  };

  const c = diffKeys(draft.courses, production.courses);
  const m = diffKeys(draft.modules, production.modules);
  const i = diffKeys(draft.items, production.items);
  return {
    coursesAdded: c.added,
    coursesRemoved: c.removed,
    coursesChanged: c.changed,
    modulesAdded: m.added,
    modulesRemoved: m.removed,
    itemsAdded: i.added,
    itemsRemoved: i.removed,
    itemsChanged: i.changed,
  };
}

// ---------- Tags ----------
export function getAllItemTags(content: ContentData): string[] {
  const set = new Set<string>();
  Object.values(content.items).forEach((it) => it.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}
