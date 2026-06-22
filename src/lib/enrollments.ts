import { supabase } from '@/integrations/supabase/client';

export interface EnrollmentRow {
  id: string;
  course_id: string;
  enrolled_at: string;
  status: string;
}

export async function fetchMyEnrollments(): Promise<string[]> {
  const { data } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('status', 'active');
  return (data || []).map((r) => r.course_id);
}
