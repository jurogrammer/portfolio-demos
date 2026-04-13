import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

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
