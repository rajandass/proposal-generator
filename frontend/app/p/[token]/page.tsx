export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import ProposalView from "@/components/ProposalView";
import SignPayButton from "@/components/SignPayButton";

async function getProposal(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/public/${token}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const proposal = await getProposal(token);
  if (!proposal) notFound();

  const canSign = proposal.status === "published";

  return (
    <div className="min-h-screen bg-white">
      <ProposalView proposal={proposal} />
      {canSign && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 px-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Ready to get started?</p>
              <p className="text-sm text-gray-500">Sign and pay to confirm this proposal</p>
            </div>
            <SignPayButton proposal={proposal} />
          </div>
        </div>
      )}
      {proposal.status === "paid" && (
        <div className="sticky bottom-0 bg-green-50 border-t border-green-200 py-3 px-6 text-center text-sm text-green-700 font-medium">
          This proposal has been signed and paid. Thank you!
        </div>
      )}
    </div>
  );
}
