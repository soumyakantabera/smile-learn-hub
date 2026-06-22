// Shared helper for invoking admin edge functions with the current session JWT.
import { supabase } from '@/integrations/supabase/client';

async function invoke(fnName: string, body?: unknown) {
  const { data, error } = await supabase.functions.invoke(fnName, { body });
  if (error) throw new Error(error.message || `Failed: ${fnName}`);
  if (data && typeof data === 'object' && 'error' in (data as any) && (data as any).error) {
    throw new Error((data as any).error);
  }
  return data as any;
}

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  roles: string[];
  enrolled_course_ids: string[];
}

export async function listUsers(): Promise<AdminUser[]> {
  const data = await invoke('admin-list-users');
  return data.users as AdminUser[];
}

export async function createUser(payload: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  course_ids?: string[];
}) {
  return invoke('admin-create-user', payload);
}

export async function grantAdmin(user_id: string) {
  return invoke('admin-promote', { user_id, action: 'grant' });
}
export async function revokeAdmin(user_id: string) {
  return invoke('admin-promote', { user_id, action: 'revoke' });
}
export async function deleteUser(user_id: string) {
  return invoke('admin-promote', { user_id, action: 'delete_user' });
}
export async function resetUserPassword(user_id: string, new_password: string) {
  return invoke('admin-reset-password', { user_id, new_password });
}

export async function setEnrollments(user_id: string, course_ids: string[]) {
  // Replace user's enrollments by diffing.
  const { data: existing } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', user_id);
  const existingSet = new Set((existing || []).map((e) => e.course_id));
  const desiredSet = new Set(course_ids);

  const toAdd = course_ids.filter((c) => !existingSet.has(c));
  const toRemove = [...existingSet].filter((c) => !desiredSet.has(c));

  if (toAdd.length > 0) {
    const { data: userData } = await supabase.auth.getUser();
    const rows = toAdd.map((cid) => ({
      user_id,
      course_id: cid,
      enrolled_by: userData?.user?.id || null,
    }));
    await supabase.from('enrollments').upsert(rows, { onConflict: 'user_id,course_id' });
  }
  if (toRemove.length > 0) {
    await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', user_id)
      .in('course_id', toRemove);
  }
}
