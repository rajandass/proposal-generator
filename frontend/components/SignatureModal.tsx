"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface Props {
  onSign: (data: {
    signer_name: string;
    signer_email: string;
    signature_data: string;
    signature_type: "drawn" | "typed";
  }) => void;
  onClose: () => void;
  loading: boolean;
}

export default function SignatureModal({ onSign, onClose, loading }: Props) {
  const [tab, setTab] = useState<"type" | "draw">("type");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<SignatureCanvas>(null);

  function handleSubmit() {
    if (!signerName || !signerEmail) return;

    if (tab === "type") {
      if (!typedName) return;
      onSign({ signer_name: signerName, signer_email: signerEmail, signature_data: typedName, signature_type: "typed" });
    } else {
      if (!canvasRef.current || canvasRef.current.isEmpty()) return;
      onSign({
        signer_name: signerName,
        signer_email: signerEmail,
        signature_data: canvasRef.current.toDataURL("image/png"),
        signature_type: "drawn",
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Sign Proposal</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="flex border-b mb-4">
            {(["type", "draw"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                  tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "type" ? "Type signature" : "Draw signature"}
              </button>
            ))}
          </div>

          {tab === "type" ? (
            <div>
              <input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.5rem" }}
              />
              {typedName && (
                <p className="mt-3 text-2xl text-gray-800 text-center py-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  {typedName}
                </p>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <SignatureCanvas
                ref={canvasRef}
                penColor="black"
                canvasProps={{ width: 400, height: 150, className: "w-full" }}
              />
              <div className="border-t px-3 py-1.5 flex justify-end">
                <button onClick={() => canvasRef.current?.clear()} className="text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !signerName || !signerEmail}
            className="w-full mt-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
