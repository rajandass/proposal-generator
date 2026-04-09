interface Props {
  proposal: {
    title: string;
    client_name: string;
    price: number;
    content: {
      executive_summary: string;
      scope_of_work: { deliverables: string[]; resources: string[] };
      timeline: { phase: string; duration: string }[];
      expenditure: { description: string; cost: number; tax_rate: number }[];
      about_us: string;
      contact: { company: string; address: string; phone: string; email: string };
    };
  };
}

export default function ProposalView({ proposal }: Props) {
  const c = proposal.content;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-12">
      <div className="border-b pb-8">
        <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
        <p className="text-gray-500 mt-2">Prepared for {proposal.client_name}</p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-indigo-600 mb-3">Executive Summary</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{c.executive_summary}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-indigo-600 mb-4">Scope of Work</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Deliverables</h3>
            <ul className="space-y-1">
              {c.scope_of_work.deliverables.map((d, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span> {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Resources</h3>
            <ul className="space-y-1">
              {c.scope_of_work.resources.map((r, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-indigo-600 mb-4">Timeline</h2>
        <div className="space-y-2">
          {c.timeline.map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
              <span className="font-medium text-gray-800 w-40">{item.phase}</span>
              <div className="flex-1 h-2 bg-indigo-100 rounded-full">
                <div
                  className="h-2 bg-indigo-500 rounded-full"
                  style={{ width: `${((i + 1) / c.timeline.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-20 text-right">{item.duration}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-indigo-600 mb-4">Expenditure</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium text-right">Cost</th>
              <th className="pb-2 font-medium text-right">Tax</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {c.expenditure.map((item, i) => {
              const total = item.cost * (1 + item.tax_rate);
              return (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 text-gray-700">{item.description}</td>
                  <td className="py-3 text-right text-gray-700">₹{item.cost.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-right text-gray-500">{(item.tax_rate * 100).toFixed(0)}%</td>
                  <td className="py-3 text-right font-medium text-gray-900">₹{total.toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-3 font-bold text-gray-900">Total</td>
              <td className="pt-3 text-right font-bold text-gray-900 text-base">
                ₹{proposal.price.toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-bold text-indigo-600 mb-3">About Us</h2>
        <p className="text-gray-700 leading-relaxed">{c.about_us}</p>
      </section>

      <section className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-indigo-600 mb-3">Contact</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold">{c.contact.company}</p>
            <p>{c.contact.address}</p>
          </div>
          <div>
            <p>{c.contact.phone}</p>
            <p>{c.contact.email}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
