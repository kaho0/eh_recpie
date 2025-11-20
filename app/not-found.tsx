import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-serif font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The recipe or page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
