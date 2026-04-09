"use client";

import { useState } from "react";
import SignatureModal from "@/components/SignatureModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  proposal: {
    token: string;
    title: string;
  };
}

export default function SignPayButton({ proposal }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign(signData: {
    signer_name: string;
    signer_email: string;
    signature_data: string;
    signature_type: "drawn" | "typed";
  }) {
    setLoading(true);
    setError(null);

    try {
      const signRes = await fetch(`${API_URL}/api/sign/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal_token: proposal.token, ...signData }),
      });
      if (!signRes.ok) throw new Error("Failed to save signature");

      const orderRes = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal_token: proposal.token }),
      });
      if (!orderRes.ok) throw new Error("Failed to create payment order");

      const { order_id, amount, currency, key_id } = await orderRes.json();

      const RazorpayCheckout = (window as { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay;
      if (!RazorpayCheckout) throw new Error("Razorpay not loaded");

      const rzp = new RazorpayCheckout({
        key: key_id,
        amount,
        currency,
        order_id,
        name: "Proposal Payment",
        description: proposal.title,
        prefill: { name: signData.signer_name, email: signData.signer_email },
        handler: function () {
          window.location.href = `/p/${proposal.token}/success`;
        },
        modal: { ondismiss: function () { setLoading(false); } },
      });

      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Sign &amp; Pay
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {showModal && (
        <SignatureModal onSign={handleSign} onClose={() => setShowModal(false)} loading={loading} />
      )}
    </>
  );
}
