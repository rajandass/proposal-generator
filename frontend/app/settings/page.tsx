import { createClient } from "@/lib/supabase-server";
import ProfileForm from "@/components/ProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <ProfileForm initialData={profile || {}} redirectTo="/settings" />
      </div>
    </div>
  );
}
