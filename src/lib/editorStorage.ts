import type { DraftContentData, ContentData, Course, Module, ContentItem } from '@/types/content';

const DRAFT_KEY = 'lws_draft_content';

export function saveDraft(content: ContentData): void {
  const draft: DraftContentData = {
    ...content,
    lastModified: Date.now(),
    isDraft: true,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
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

// Helper to generate unique IDs
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Course CRUD
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
  return {
    ...content,
    courses: { ...content.courses, [course.id]: course },
  };
}

export function deleteCourse(content: ContentData, courseId: string): ContentData {
  const newContent = { ...content };
  const course = newContent.courses[courseId];
  if (course) {
    course.modules.forEach(moduleId => {
      const module = newContent.modules[moduleId];
      if (module) {
        module.items.forEach(itemId => {
          delete newContent.items[itemId];
        });
        delete newContent.modules[moduleId];
      }
    });
  }
  delete newContent.courses[courseId];
  Object.keys(newContent.batches).forEach(batchKey => {
    newContent.batches[batchKey] = {
      ...newContent.batches[batchKey],
      courses: newContent.batches[batchKey].courses.filter(id => id !== courseId),
    };
  });
  return newContent;
}

// Module CRUD
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
  return {
    ...content,
    modules: { ...content.modules, [module.id]: module },
  };
}

export function deleteModule(content: ContentData, moduleId: string): ContentData {
  const newContent = { ...content };
  const module = newContent.modules[moduleId];
  if (module) {
    module.items.forEach(itemId => {
      delete newContent.items[itemId];
    });
    if (newContent.courses[module.courseId]) {
      newContent.courses[module.courseId] = {
        ...newContent.courses[module.courseId],
        modules: newContent.courses[module.courseId].modules.filter(id => id !== moduleId),
      };
    }
  }
  delete newContent.modules[moduleId];
  return newContent;
}

// Item CRUD
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
  return {
    ...content,
    items: { ...content.items, [item.id]: item },
  };
}

export function deleteItem(content: ContentData, itemId: string): ContentData {
  const newContent = { ...content };
  const item = newContent.items[itemId];
  if (item && newContent.modules[item.moduleId]) {
    newContent.modules[item.moduleId] = {
      ...newContent.modules[item.moduleId],
      items: newContent.modules[item.moduleId].items.filter(id => id !== itemId),
    };
  }
  delete newContent.items[itemId];
  return newContent;
}

// Reorder modules within a course
export function reorderModulesInCourse(content: ContentData, courseId: string, fromIndex: number, toIndex: number): ContentData {
  const course = content.courses[courseId];
  if (!course) return content;
  const modules = [...course.modules];
  const [moved] = modules.splice(fromIndex, 1);
  modules.splice(toIndex, 0, moved);
  const updatedModules = { ...content.modules };
  modules.forEach((id, i) => {
    if (updatedModules[id]) {
      updatedModules[id] = { ...updatedModules[id], order: i + 1 };
    }
  });
  return {
    ...content,
    courses: { ...content.courses, [courseId]: { ...course, modules } },
    modules: updatedModules,
  };
}

// Reorder items within a module
export function reorderItemsInModule(content: ContentData, moduleId: string, fromIndex: number, toIndex: number): ContentData {
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

// Duplicate a course with all modules and items
export function duplicateCourse(content: ContentData, courseId: string): { content: ContentData; newCourseId: string } {
  const course = content.courses[courseId];
  if (!course) return { content, newCourseId: '' };

  const newCourseId = generateId('course');
  const newModuleIds: string[] = [];
  let newContent = { ...content };
  newContent.courses = { ...newContent.courses };
  newContent.modules = { ...newContent.modules };
  newContent.items = { ...newContent.items };

  course.modules.forEach((modId) => {
    const mod = content.modules[modId];
    if (!mod) return;
    const newModId = generateId('module');
    const newItemIds: string[] = [];

    mod.items.forEach((itemId) => {
      const item = content.items[itemId];
      if (!item) return;
      const newItemId = generateId('item');
      newContent.items[newItemId] = { ...item, id: newItemId, moduleId: newModId };
      newItemIds.push(newItemId);
    });

    newContent.modules[newModId] = { ...mod, id: newModId, courseId: newCourseId, items: newItemIds };
    newModuleIds.push(newModId);
  });

  newContent.courses[newCourseId] = {
    ...course,
    id: newCourseId,
    title: `${course.title} (Copy)`,
    modules: newModuleIds,
  };

  // Add to same batches
  Object.keys(newContent.batches).forEach((bk) => {
    if (newContent.batches[bk].courses.includes(courseId)) {
      newContent.batches = {
        ...newContent.batches,
        [bk]: { ...newContent.batches[bk], courses: [...newContent.batches[bk].courses, newCourseId] },
      };
    }
  });

  return { content: newContent, newCourseId };
}

// Duplicate a module with all items
export function duplicateModule(content: ContentData, moduleId: string): { content: ContentData; newModuleId: string } {
  const mod = content.modules[moduleId];
  if (!mod) return { content, newModuleId: '' };

  const newModId = generateId('module');
  let newContent = { ...content };
  newContent.modules = { ...newContent.modules };
  newContent.items = { ...newContent.items };
  newContent.courses = { ...newContent.courses };

  const newItemIds: string[] = [];
  mod.items.forEach((itemId) => {
    const item = content.items[itemId];
    if (!item) return;
    const newItemId = generateId('item');
    newContent.items[newItemId] = { ...item, id: newItemId, moduleId: newModId };
    newItemIds.push(newItemId);
  });

  newContent.modules[newModId] = { ...mod, id: newModId, title: `${mod.title} (Copy)`, items: newItemIds };

  // Add to course
  const course = newContent.courses[mod.courseId];
  if (course) {
    newContent.courses[mod.courseId] = { ...course, modules: [...course.modules, newModId] };
  }

  return { content: newContent, newModuleId: newModId };
}

// Duplicate an item
export function duplicateItem(content: ContentData, itemId: string): { content: ContentData; newItemId: string } {
  const item = content.items[itemId];
  if (!item) return { content, newItemId: '' };

  const newItemId = generateId('item');
  let newContent = { ...content };
  newContent.items = { ...newContent.items, [newItemId]: { ...item, id: newItemId, title: `${item.title} (Copy)` } };
  newContent.modules = { ...newContent.modules };

  const mod = newContent.modules[item.moduleId];
  if (mod) {
    newContent.modules[item.moduleId] = { ...mod, items: [...mod.items, newItemId] };
  }

  return { content: newContent, newItemId };
}
