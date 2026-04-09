import { createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import ProposalEditor from "@/components/ProposalEditor";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) notFound();

  return <ProposalEditor proposal={proposal} />;
}
