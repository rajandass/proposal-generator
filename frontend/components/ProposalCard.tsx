import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-blue-100 text-blue-700",
  signed: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
};

interface Props {
  proposal: {
    id: string;
    token: string;
    title: string;
    client_name: string;
    status: string;
    price: number;
    created_at: string;
  };
}

export default function ProposalCard({ proposal }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{proposal.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{proposal.client_name}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[proposal.status]}`}>
          {proposal.status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          ₹{proposal.price.toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(proposal.created_at).toLocaleDateString("en-IN")}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        {proposal.status === "draft" && (
          <Link
            href={`/proposals/${proposal.id}/edit`}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Edit
          </Link>
        )}
        {proposal.status !== "draft" && (
          <Link
            href={`/p/${proposal.token}`}
            target="_blank"
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            View proposal
          </Link>
        )}
      </div>
    </div>
  );
}
