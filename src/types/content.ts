// Content types for the learning platform

export type ItemType =
  | 'pdf'
  | 'doc'
  | 'ppt'
  | 'spreadsheet'
  | 'video'
  | 'link'
  | 'homework'
  | 'youtube'
  | 'audio'
  | 'quiz'
  | 'conversation';

export type CourseStatus = 'draft' | 'published' | 'archived';

// Duolingo-style question variants. `mcq` is the classic single-answer MCQ.
// `listen-choose` uses browser TTS to speak `audioText`, learner picks the matching option.
// Other variants are reserved for future authoring UIs; renderers fall back to MCQ.
export type QuestionType =
  | 'mcq'
  | 'listen-choose'
  | 'tap-order'
  | 'match'
  | 'fill-blank';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  type?: QuestionType;
  // Variant-specific optional fields.
  audioText?: string;    // listen-choose: text spoken by TTS
  audioLang?: string;    // listen-choose: BCP-47 hint (e.g. "en-US")
  tokens?: string[];     // tap-order: shuffled tokens to arrange
  correctOrder?: string[]; // tap-order: expected order
  pairs?: { left: string; right: string }[]; // match
  blanks?: string[];     // fill-blank: expected answers per {{blank}}
}

export interface ConversationLine {
  id: string;
  speaker: string;
  voiceURI?: string;   // preferred SpeechSynthesis voice URI
  lang?: string;       // BCP-47 language hint (e.g. "en-US")
  text: string;
  translation?: string;
  rate?: number;       // 0.5–1.5
  pitch?: number;      // 0.5–1.5
}

export interface ConversationData {
  scenario?: string;
  lines: ConversationLine[];
  autoPlay?: boolean;
}

export interface ItemResource {
  label: string;
  url: string;
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
  quizMode?: 'classic' | 'step';
  audioDuration?: string;
  conversation?: ConversationData;

  // Customization fields (all optional; safe defaults everywhere).
  accentColor?: string;             // hex override for chips / header
  icon?: string;                    // reserved for future custom icon picker
  visibility?: 'published' | 'draft' | 'hidden';
  estimatedMinutes?: number;
  objectives?: string[];
  resources?: ItemResource[];
  prerequisiteItemIds?: string[];
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
