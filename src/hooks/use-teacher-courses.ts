import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TeacherCourse = {
  id: string;
  title: string;
  code: string | null;
  level: string | null;
  description: string;
  is_open_for_enrollment: boolean;
};

export function useTeacherCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!user) {
      setCourses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, code, level, description, is_open_for_enrollment")
      .eq("teacher_user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      setCourses(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
}
