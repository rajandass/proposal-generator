"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialData?: {
    company_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    about_blurb?: string;
  };
  redirectTo?: string;
}

export default function ProfileForm({ initialData = {}, redirectTo = "/dashboard" }: ProfileFormProps) {
  const [form, setForm] = useState({
    company_name: initialData.company_name || "",
    address: initialData.address || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
    about_blurb: initialData.about_blurb || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_profiles")
      .upsert({ id: user.id, ...form });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  }

  const fields = [
    { key: "company_name", label: "Company Name", type: "text" },
    { key: "email", label: "Business Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "address", label: "Address", type: "text" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ key, label, type }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type={type}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">About Your Company</label>
        <textarea
          value={form.about_blurb}
          onChange={(e) => setForm({ ...form, about_blurb: e.target.value })}
          rows={3}
          placeholder="Brief description of your company for proposals..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
