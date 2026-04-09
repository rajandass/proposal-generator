"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Props {
  proposal: {
    id: string;
    token: string;
    title: string;
    status: string;
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

export default function ProposalEditor({ proposal }: Props) {
  const [content, setContent] = useState(proposal.content);
  const [title, setTitle] = useState(proposal.title);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    await apiFetch(`/api/proposals/${proposal.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, content }),
    });
    setSaving(false);
  }

  async function handlePublish() {
    setPublishing(true);
    await apiFetch(`/api/proposals/${proposal.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, content, status: "published" }),
    });
    setPublishing(false);
    router.refresh();
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/p/${proposal.token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function updateContent(key: string, value: unknown) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6 gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none flex-1 py-1"
        />
        <div className="flex gap-2">
          {proposal.status === "published" && (
            <button
              onClick={copyLink}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {proposal.status === "draft" && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {publishing ? "Publishing..." : "Publish & Share"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Executive Summary">
          <textarea
            value={content.executive_summary}
            onChange={(e) => updateContent("executive_summary", e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Section>

        <Section title="Scope of Work">
          <div className="grid grid-cols-2 gap-4">
            <ListEditor
              label="Deliverables"
              items={content.scope_of_work.deliverables}
              onChange={(items) =>
                updateContent("scope_of_work", { ...content.scope_of_work, deliverables: items })
              }
            />
            <ListEditor
              label="Resources"
              items={content.scope_of_work.resources}
              onChange={(items) =>
                updateContent("scope_of_work", { ...content.scope_of_work, resources: items })
              }
            />
          </div>
        </Section>

        <Section title="Timeline">
          {content.timeline.map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <input
                value={item.phase}
                onChange={(e) => {
                  const tl = [...content.timeline];
                  tl[i] = { ...tl[i], phase: e.target.value };
                  updateContent("timeline", tl);
                }}
                placeholder="Phase"
                className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                value={item.duration}
                onChange={(e) => {
                  const tl = [...content.timeline];
                  tl[i] = { ...tl[i], duration: e.target.value };
                  updateContent("timeline", tl);
                }}
                placeholder="Duration"
                className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          ))}
        </Section>

        <Section title="About Us">
          <textarea
            value={content.about_us}
            onChange={(e) => updateContent("about_us", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function ListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {items.map((item, i) => (
        <input
          key={i}
          value={item}
          onChange={(e) => {
            const updated = [...items];
            updated[i] = e.target.value;
            onChange(updated);
          }}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      ))}
    </div>
  );
}
