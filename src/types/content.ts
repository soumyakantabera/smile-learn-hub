// Content types for the learning platform

export type ItemType = 'pdf' | 'doc' | 'ppt' | 'spreadsheet' | 'video' | 'link' | 'homework' | 'youtube' | 'audio' | 'quiz';

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface QuizSettings {
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage 0-100
  shuffleQuestions?: boolean;
  showExplanations?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  type?: QuestionType;
  imageUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
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
  quizSettings?: QuizSettings;
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

export interface Batch {
  name: string;
  description: string;
  courses: string[];
}

export interface PasscodeEntry {
  hash: string;
  batchKey: string;
  label: string;
  isAdmin?: boolean;
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
