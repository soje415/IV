import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/dashboard";
import { PinGate } from "@/components/admin/pin-gate";
import { configuredPin, isSignedIn } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Host dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!configuredPin()) return <NoPinConfigured />;

  if (!(await isSignedIn())) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <PinGate />
      </main>
    );
  }

  const [rsvps, totals] = await Promise.all([db.listRsvps(), db.totals()]);

  return (
    <main className="flex-1">
      <Dashboard rsvps={rsvps} totals={totals} />
    </main>
  );
}

/**
 * Production with no ADMIN_PIN set locks the dashboard rather than falling back
 * to a default — a guessable PIN on a page listing children's names and
 * allergies would be worse than no dashboard at all.
 */
function NoPinConfigured() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-5 py-20 text-center">
      <span className="text-4xl" aria-hidden="true">
        🔒
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-cream">
        Dashboard locked
      </h1>
      <p className="mt-3 font-body text-sm text-cream/65">
        No <code className="text-gold">ADMIN_PIN</code> is set for this
        deployment. Set one and redeploy:
      </p>
      <code className="mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-xs text-cream/80">
        npx wrangler secret put ADMIN_PIN
      </code>
    </main>
  );
}
