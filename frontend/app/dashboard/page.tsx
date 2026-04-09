export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import ProposalCard from "@/components/ProposalCard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-500 text-sm mt-1">{proposals?.length || 0} total</p>
        </div>
        <Link
          href="/proposals/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
        >
          + New Proposal
        </Link>
      </div>

      {proposals && proposals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No proposals yet</p>
          <p className="text-sm mt-1">Create your first one to get started</p>
        </div>
      )}
    </div>
  );
}
