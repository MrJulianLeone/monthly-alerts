import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="microlabel mb-3">404</p>
        <h1 className="display text-4xl mb-4">Page not found</h1>
        <p className="text-sm text-ink-soft mb-6">
          That page doesn&apos;t exist — it may have been moved, or the link is wrong.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary btn-sm">
            Home
          </Link>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Your projects
          </Link>
        </div>
      </div>
    </main>
  );
}
