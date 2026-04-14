"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type { ProfileUpdateData } from "@/types/database";
import { profileUpdateSchema } from "@/lib/schemas";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let { data } = await supabase
    .from("ss_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!data) {
    await supabase.from("ss_profiles").upsert({ user_id: user.id }, { onConflict: "user_id" });
    const res = await supabase.from("ss_profiles").select("*").eq("user_id", user.id).single();
    data = res.data;
  }

  return data ?? null;
}

export async function updateProfile(
  data: ProfileUpdateData
): Promise<{ error?: string }> {
  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const scale = data.gpa_scale ? parseFloat(data.gpa_scale) : 4.5;

  // Parse per-grade GPAs and compute average
  const gpaByGrade: Record<string, number> = {};
  const gpaValues: number[] = [];
  if (data.gpa_by_grade) {
    for (const [grade, val] of Object.entries(data.gpa_by_grade)) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= scale) {
        gpaByGrade[grade] = parsed;
        gpaValues.push(parsed);
      }
    }
  }
  const averageGpa =
    gpaValues.length > 0
      ? Math.round((gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length) * 100) / 100
      : null;

  const payload = {
    user_id: user.id,
    university: data.university || null,
    department: data.department || null,
    grade: data.grade ? parseInt(data.grade, 10) : null,
    semester: data.semester ? parseInt(data.semester, 10) : null,
    gpa: averageGpa,
    gpa_by_grade: Object.keys(gpaByGrade).length > 0 ? gpaByGrade : {},
    gpa_scale: scale,
    income_quintile: data.income_quintile
      ? parseInt(data.income_quintile, 10)
      : null,
    region: data.region || null,
    degree_type: data.degree_type || "undergraduate",
    interests: data.interests
      ? data.interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null,
    bio_keywords: data.bio_keywords || null,
    experiences: data.experiences || null,
    awards: data.awards || null,
    volunteering: data.volunteering || null,
    work_experience: data.work_experience || null,
    projects: data.projects || null,
    leadership: data.leadership || null,
    motivation: data.motivation || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("ss_profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return { error: error.message };
  return {};
}
