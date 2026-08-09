import type { Metadata } from "next";
import { signIn } from "@/app/door/actions";
import { DoorList } from "@/components/door/door-list";
import { NoPinConfigured, PinGate } from "@/components/pin-gate";
import { db } from "@/lib/db";
import { doorList } from "@/lib/door";
import { configuredPin, isSignedIn } from "@/lib/gate";

/**
 * The arrival list. Phone-only by design — see PLAN.md §3.
 *
 * No scanner is required to work this page: the bouncer finds the family by
 * name and taps. A guest who has their pass to hand can be checked in faster by
 * pointing the phone camera at their QR, which opens /p/<code> with the same
 * MARK ARRIVED button on it. Neither route is load-bearing for the other, so a
 * flat battery or a dim doorway never blocks the queue.
 */

export const metadata: Metadata = {
  title: "Door list",
  robots: { index: false, follow: false },
};

// Arrivals change constantly and every bouncer needs the same numbers.
export const dynamic = "force-dynamic";

export default async function DoorPage() {
  if (!(await configuredPin("door"))) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <NoPinConfigured title="Door list locked" envVar="DOOR_PIN" />
      </main>
    );
  }

  if (!(await isSignedIn("door"))) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <PinGate
          emoji="🚪"
          title="Door list"
          blurb="Enter the PIN the host sent you."
          signIn={signIn}
        />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <DoorList families={doorList(await db.listRsvps())} />
    </main>
  );
}
