import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-4">An error occurred while processing your request.</p>
        <Link
          href="/group"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Return to group
        </Link>
      </div>
    </div>
  );
}
