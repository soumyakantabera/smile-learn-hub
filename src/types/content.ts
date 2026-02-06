// Content types for the learning platform

export type ItemType = 'pdf' | 'doc' | 'ppt' | 'spreadsheet' | 'video' | 'link' | 'homework';

export interface ContentItem {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: ItemType;
  url?: string;
  instructions?: string;
  dueDate?: string;
  tags: string[];
  publishedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  items: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  modules: string[];
}

export interface Batch {
  name: string;
  description: string;
  courses: string[];
}

export interface PasscodeEntry {
  hash: string;
  batchKey: string;
  label: string;
}

export interface ContentData {
  batches: Record<string, Batch>;
  courses: Record<string, Course>;
  modules: Record<string, Module>;
  items: Record<string, ContentItem>;
}

export interface SessionData {
  batchKey: string;
  batchLabel: string;
  expiresAt: number;
}
