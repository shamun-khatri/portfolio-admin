import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold">Portfolio Admin</h1>
        <p className="text-muted-foreground mt-2">
          Manage your portfolio content. Sign in to access the admin panel.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-semibold">Get Started</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse the public landing info or sign in to manage content.
          </p>
        </div>

        <div className="p-6 border rounded-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sign In</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Authenticate with Google to access the admin dashboard.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
