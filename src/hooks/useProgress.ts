import { useEffect, useState } from 'react';
import {
  loadProgress,
  subscribeProgress,
  isProgressLoaded,
  getVisitedItemsForCourse,
  getVisitedCount,
  getCompletedCount,
  getTimeSpentSeconds,
  getResumeForCourse,
  resetProgressCache,
} from '@/lib/progress';
import { useAuth } from '@/contexts/AuthContext';

let lastUserId: string | null = null;

/** Hook: ensures progress is loaded once for current user and re-renders on changes. */
export function useProgress() {
  const { user } = useAuth();
  const [, force] = useState(0);

  useEffect(() => {
    if (!user) {
      resetProgressCache();
      lastUserId = null;
      return;
    }
    if (lastUserId !== user.id) {
      lastUserId = user.id;
      resetProgressCache();
      loadProgress();
    } else if (!isProgressLoaded()) {
      loadProgress();
    }
    const unsub = subscribeProgress(() => force((x) => x + 1));
    return () => {
      unsub();
    };
  }, [user]);

  return {
    loaded: isProgressLoaded(),
    visitedForCourse: getVisitedItemsForCourse,
    visitedCount: getVisitedCount,
    completedCount: getCompletedCount,
    timeSpentSeconds: getTimeSpentSeconds,
    resumeForCourse: getResumeForCourse,
  };
}
