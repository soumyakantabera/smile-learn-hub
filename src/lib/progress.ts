// Cross-device progress sync — backed by Supabase, fronted by an in-memory cache
// so existing visited-set/resume-card components keep working synchronously.
import { supabase } from '@/integrations/supabase/client';

export interface ProgressRow {
  item_id: string;
  course_id: string;
  module_id: string;
  visited_at: string;
  completed: boolean;
  time_spent_seconds: number;
}

export interface ResumeRow {
  course_id: string;
  last_item_id: string;
  last_module_id: string | null;
  updated_at: string;
}

// In-memory caches (keyed by user id implicitly — cleared on login change)
let progressCache: ProgressRow[] = [];
let resumeCache: ResumeRow[] = [];
let progressLoaded = false;
let listeners = new Set<() => void>();

export function subscribeProgress(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function notify() {
  listeners.forEach((cb) => cb());
}

export function resetProgressCache() {
  progressCache = [];
  resumeCache = [];
  progressLoaded = false;
  notify();
}

export async function loadProgress() {
  const { data: progress } = await supabase
    .from('progress')
    .select('item_id, course_id, module_id, visited_at, completed, time_spent_seconds');
  const { data: resume } = await supabase
    .from('resume_state')
    .select('course_id, last_item_id, last_module_id, updated_at');
  progressCache = (progress || []) as ProgressRow[];
  resumeCache = (resume || []) as ResumeRow[];
  progressLoaded = true;
  notify();
}

export function isProgressLoaded() {
  return progressLoaded;
}

export function getVisitedItemsForCourse(courseId: string): Set<string> {
  return new Set(progressCache.filter((p) => p.course_id === courseId).map((p) => p.item_id));
}

export function getAllProgress() {
  return progressCache;
}

export function getCompletedCount(courseId: string) {
  return progressCache.filter((p) => p.course_id === courseId && p.completed).length;
}

export function getVisitedCount(courseId: string) {
  return progressCache.filter((p) => p.course_id === courseId).length;
}

export function getTimeSpentSeconds(courseId: string) {
  return progressCache
    .filter((p) => p.course_id === courseId)
    .reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
}

export function getResumeForCourse(courseId: string): ResumeRow | null {
  return resumeCache.find((r) => r.course_id === courseId) || null;
}

export async function markItemVisited(params: {
  itemId: string;
  courseId: string;
  moduleId: string;
}) {
  const { itemId, courseId, moduleId } = params;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;
  // Optimistic
  const existing = progressCache.find((p) => p.item_id === itemId);
  if (!existing) {
    progressCache = [
      ...progressCache,
      {
        item_id: itemId,
        course_id: courseId,
        module_id: moduleId,
        visited_at: new Date().toISOString(),
        completed: false,
        time_spent_seconds: 0,
      },
    ];
    notify();
  }
  await supabase.from('progress').upsert(
    {
      user_id: userData.user.id,
      item_id: itemId,
      course_id: courseId,
      module_id: moduleId,
      visited_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,item_id' },
  );
}

export async function addTimeSpent(itemId: string, seconds: number) {
  if (seconds <= 0) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;
  const row = progressCache.find((p) => p.item_id === itemId);
  if (row) {
    row.time_spent_seconds = (row.time_spent_seconds || 0) + seconds;
    notify();
  }
  // Read-modify-write — small race window acceptable for a learning app.
  const { data: existing } = await supabase
    .from('progress')
    .select('time_spent_seconds')
    .eq('user_id', userData.user.id)
    .eq('item_id', itemId)
    .maybeSingle();
  const newTime = (existing?.time_spent_seconds || 0) + seconds;
  await supabase
    .from('progress')
    .update({ time_spent_seconds: newTime })
    .eq('user_id', userData.user.id)
    .eq('item_id', itemId);
}

export async function setResume(params: {
  courseId: string;
  itemId: string;
  moduleId?: string;
}) {
  const { courseId, itemId, moduleId } = params;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;
  const idx = resumeCache.findIndex((r) => r.course_id === courseId);
  const row: ResumeRow = {
    course_id: courseId,
    last_item_id: itemId,
    last_module_id: moduleId || null,
    updated_at: new Date().toISOString(),
  };
  if (idx >= 0) resumeCache[idx] = row;
  else resumeCache.push(row);
  notify();
  await supabase.from('resume_state').upsert(
    {
      user_id: userData.user.id,
      course_id: courseId,
      last_item_id: itemId,
      last_module_id: moduleId || null,
    },
    { onConflict: 'user_id,course_id' },
  );
}

export async function clearCourseProgress(courseId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;
  progressCache = progressCache.filter((p) => p.course_id !== courseId);
  resumeCache = resumeCache.filter((r) => r.course_id !== courseId);
  notify();
  await supabase.from('progress').delete().eq('user_id', userData.user.id).eq('course_id', courseId);
  await supabase
    .from('resume_state')
    .delete()
    .eq('user_id', userData.user.id)
    .eq('course_id', courseId);
}

export async function saveQuizAttempt(params: {
  itemId: string;
  courseId?: string;
  score: number;
  maxScore: number;
  answers: (number | null)[];
}) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;
  await supabase.from('quiz_attempts').insert({
    user_id: userData.user.id,
    item_id: params.itemId,
    course_id: params.courseId || null,
    score: params.score,
    max_score: params.maxScore,
    answers: params.answers,
  });
}
