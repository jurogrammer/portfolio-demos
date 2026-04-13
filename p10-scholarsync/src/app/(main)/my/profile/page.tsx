import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./actions";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await getProfile();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">프로필 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">
          입력한 정보를 바탕으로 맞춤 장학금을 추천해드립니다.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
