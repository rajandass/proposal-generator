"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { use } from "react";

export default function SuccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#6366f1", "#8b5cf6", "#a78bfa"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#6366f1", "#8b5cf6", "#a78bfa"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="animate-bounce text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">You&apos;re all set!</h1>
      <p className="text-gray-500 text-lg mb-2">The proposal has been signed and payment received.</p>
      <p className="text-gray-400 text-sm mb-8">You&apos;ll receive a confirmation email shortly.</p>
      <Link href={`/p/${token}`} className="text-indigo-600 hover:underline text-sm font-medium">
        View proposal
      </Link>
    </div>
  );
}
