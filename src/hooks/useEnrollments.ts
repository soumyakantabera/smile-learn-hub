import { useEffect, useState, useCallback } from 'react';
import { fetchMyEnrollments } from '@/lib/enrollments';
import { useAuth } from '@/contexts/AuthContext';

export function useEnrolledCourseIds() {
  const { user, session } = useAuth();
  const [courseIds, setCourseIds] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCourseIds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ids = await fetchMyEnrollments();
    setCourseIds(ids);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { courseIds: courseIds || [], loading, refresh, isAdmin: !!session?.isAdmin };
}
