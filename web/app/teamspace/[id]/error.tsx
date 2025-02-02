"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Try again
          </button>
          <Link
            href="/teamspace"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Return to group
          </Link>
        </div>
      </div>
    </div>
  );
}
