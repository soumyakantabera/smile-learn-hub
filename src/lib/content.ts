import type { ContentData, ContentItem, Course, Module, Batch } from '@/types/content';

let contentCache: ContentData | null = null;

export async function loadContent(): Promise<ContentData> {
  if (contentCache) return contentCache;
  
  const response = await fetch(`${import.meta.env.BASE_URL}content/index.json`);
  if (!response.ok) {
    throw new Error('Failed to load content');
  }
  
  contentCache = await response.json();
  return contentCache!;
}

export function getBatchCourses(content: ContentData, batchKey: string): Course[] {
  const batch = content.batches[batchKey];
  if (!batch) return [];
  
  return batch.courses
    .map(courseId => content.courses[courseId])
    .filter(Boolean);
}

export function getCourse(content: ContentData, courseId: string): Course | null {
  return content.courses[courseId] || null;
}

export function getCourseModules(content: ContentData, courseId: string): Module[] {
  const course = content.courses[courseId];
  if (!course) return [];
  
  return course.modules
    .map(moduleId => content.modules[moduleId])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
}

export function getModule(content: ContentData, moduleId: string): Module | null {
  return content.modules[moduleId] || null;
}

export function getModuleItems(content: ContentData, moduleId: string): ContentItem[] {
  const module = content.modules[moduleId];
  if (!module) return [];
  
  return module.items
    .map(itemId => content.items[itemId])
    .filter(Boolean);
}

export function getItem(content: ContentData, itemId: string): ContentItem | null {
  return content.items[itemId] || null;
}

export function getRecentItems(content: ContentData, batchKey: string, limit: number = 5): ContentItem[] {
  const batch = content.batches[batchKey];
  if (!batch) return [];
  
  const allItems: ContentItem[] = [];
  
  batch.courses.forEach(courseId => {
    const course = content.courses[courseId];
    if (!course) return;
    
    course.modules.forEach(moduleId => {
      const module = content.modules[moduleId];
      if (!module) return;
      
      module.items.forEach(itemId => {
        const item = content.items[itemId];
        if (item) allItems.push(item);
      });
    });
  });
  
  return allItems
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function searchItems(
  content: ContentData,
  batchKey: string,
  query: string,
  filters?: { type?: string; tag?: string }
): ContentItem[] {
  const batch = content.batches[batchKey];
  if (!batch) return [];
  
  const queryLower = query.toLowerCase();
  const results: ContentItem[] = [];
  
  batch.courses.forEach(courseId => {
    const course = content.courses[courseId];
    if (!course) return;
    
    course.modules.forEach(moduleId => {
      const module = content.modules[moduleId];
      if (!module) return;
      
      module.items.forEach(itemId => {
        const item = content.items[itemId];
        if (!item) return;
        
        // Apply type filter
        if (filters?.type && item.type !== filters.type) return;
        
        // Apply tag filter
        if (filters?.tag && !item.tags.includes(filters.tag)) return;
        
        // Apply search query
        if (query) {
          const matchesTitle = item.title.toLowerCase().includes(queryLower);
          const matchesDescription = item.description.toLowerCase().includes(queryLower);
          const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(queryLower));
          
          if (!matchesTitle && !matchesDescription && !matchesTags) return;
        }
        
        results.push(item);
      });
    });
  });
  
  return results;
}

export function getAllTags(content: ContentData, batchKey: string): string[] {
  const batch = content.batches[batchKey];
  if (!batch) return [];
  
  const tags = new Set<string>();
  
  batch.courses.forEach(courseId => {
    const course = content.courses[courseId];
    if (!course) return;
    
    course.modules.forEach(moduleId => {
      const module = content.modules[moduleId];
      if (!module) return;
      
      module.items.forEach(itemId => {
        const item = content.items[itemId];
        if (item) {
          item.tags.forEach(tag => tags.add(tag));
        }
      });
    });
  });
  
  return Array.from(tags).sort();
}

export function getBatch(content: ContentData, batchKey: string): Batch | null {
  return content.batches[batchKey] || null;
}
