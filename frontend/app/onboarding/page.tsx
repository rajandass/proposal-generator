import ProfileForm from "@/components/ProfileForm";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set up your profile</h1>
        <p className="text-gray-500 mb-6 text-sm">
          This info will be pre-filled into every proposal you create.
        </p>
        <ProfileForm redirectTo="/dashboard" />
      </div>
    </div>
  );
}
