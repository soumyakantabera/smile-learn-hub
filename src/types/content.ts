// Content types for the learning platform

export type ItemType = 'pdf' | 'doc' | 'ppt' | 'spreadsheet' | 'video' | 'link' | 'homework' | 'youtube' | 'audio' | 'quiz';

export type CourseStatus = 'draft' | 'published' | 'archived';

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
  embedUrl?: string;
  instructions?: string;
  dueDate?: string;
  tags: string[];
  publishedAt: string;
  quizQuestions?: QuizQuestion[];
  audioDuration?: string;
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
  status?: CourseStatus;
}

// Legacy batch type kept for editor compatibility (no longer used for access control).
export interface Batch {
  name: string;
  description: string;
  courses: string[];
}

export interface ContentData {
  batches: Record<string, Batch>;
  courses: Record<string, Course>;
  modules: Record<string, Module>;
  items: Record<string, ContentItem>;
}

export interface DraftContentData extends ContentData {
  lastModified: number;
  isDraft: boolean;
}

// Session info derived from Supabase auth + role tables
export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  isAdmin: boolean;
}
