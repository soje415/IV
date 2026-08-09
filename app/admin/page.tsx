import type { Metadata } from "next";
import { signIn } from "@/app/admin/actions";
import { Dashboard } from "@/components/admin/dashboard";
import { NoPinConfigured, PinGate } from "@/components/pin-gate";
import { db } from "@/lib/db";
import { configuredPin, isSignedIn } from "@/lib/gate";

export const metadata: Metadata = {
  title: "Host dashboard",
  robots: { index: false, follow: false },
};

/**
 * ADMIN_PIN is a runtime secret, so it is absent at build time. Without this,
 * the unset-PIN branch returns before anything touches cookies, Next prerenders
 * "Dashboard locked" as a static page, and the real PIN is never consulted on
 * the deployed site.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await configuredPin("host"))) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <NoPinConfigured title="Dashboard locked" envVar="ADMIN_PIN" />
      </main>
    );
  }

  if (!(await isSignedIn("host"))) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <PinGate
          emoji="🔐"
          title="Host dashboard"
          blurb="Enter the PIN to see the guest list."
          signIn={signIn}
        />
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
