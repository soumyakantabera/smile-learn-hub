// Content types for the learning platform

export type ItemType = 'pdf' | 'doc' | 'ppt' | 'spreadsheet' | 'video' | 'link' | 'homework' | 'youtube' | 'audio' | 'quiz';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ContentItem {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: ItemType;
  url?: string;
  embedUrl?: string; // For YouTube/Vimeo embeds
  instructions?: string;
  dueDate?: string;
  tags: string[];
  publishedAt: string;
  quizQuestions?: QuizQuestion[]; // For quiz type
  audioDuration?: string; // For audio type
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
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
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
  isAdmin?: boolean; // Admin flag for editor access
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
  isAdmin?: boolean;
}

// Draft content for editor
export interface DraftContentData extends ContentData {
  lastModified: number;
  isDraft: boolean;
}
