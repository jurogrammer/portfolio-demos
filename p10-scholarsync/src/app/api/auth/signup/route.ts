import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const supabase = createAdminClient();

  // Create user with email auto-confirmed (skip email verification for MVP)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Create ss_profile
  if (data.user) {
    await supabase.from("ss_profiles").upsert(
      { user_id: data.user.id },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({ success: true, userId: data.user.id });
}
