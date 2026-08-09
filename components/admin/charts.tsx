import { CELEBRANTS, CHILD_AGE } from "@/config/event";
import type { Rsvp } from "@/lib/types";

/**
 * The two pictures worth drawing for party planning.
 *
 * Ages decide the games, the party bags and the cake; teams decide how the
 * games are split. Everything else the host needs is already a number in the
 * stat row above, and a number beats a chart when there is only one of it.
 *
 * Colours are validated against the ink surface for contrast and colour-vision
 * separation — the brand pink (#ff8fc4) is too light on a dark background, so
 * the charts use a deeper step of the same hue.
 */

const CHART = {
  /** Single-series magnitude: one hue, no legend needed — the title names it. */
  magnitude: "#f5c542",
  tabitha: "#e85a98",
  abraham: "#4d8bff",
  undecided: "#7c8195",
};

const PLOT_HEIGHT = 132;

export function AgeHistogram({ rsvps }: { rsvps: Rsvp[] }) {
  const children = rsvps.filter((r) => r.attending).flatMap((r) => r.children);

  const ages = Array.from(
    { length: CHILD_AGE.max - CHILD_AGE.min + 1 },
    (_, i) => CHILD_AGE.min + i,
  );
  const bins = ages.map((age) => ({
    age,
    count: children.filter((child) => child.age === age).length,
  }));
  const unknown = children.filter((child) => child.age === null).length;
  const max = Math.max(1, ...bins.map((b) => b.count));

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h3 className="font-display text-base font-semibold text-cream">
        Children by age
      </h3>
      <p className="mt-1 font-body text-xs text-cream/50">
        {children.length} {children.length === 1 ? "child" : "children"} · ages{" "}
        {CHILD_AGE.min}–{CHILD_AGE.max}
        {unknown > 0 ? ` · ${unknown} without an age` : ""}
      </p>

      {children.length === 0 ? (
        <p className="mt-4 font-body text-sm text-cream/45">
          Nothing to chart yet.
        </p>
      ) : (
        <>
          {/* Bars sit on a recessive baseline; the grid is deliberately absent
              at this size, where it would out-weigh twelve short columns. */}
          <div
            className="mt-4 flex items-end gap-[2px] border-b border-white/15"
            style={{ height: PLOT_HEIGHT }}
            aria-hidden="true"
          >
            {bins.map(({ age, count }) => (
              <div
                key={age}
                className="flex flex-1 flex-col items-center justify-end gap-1"
                title={`Age ${age}: ${count} ${count === 1 ? "child" : "children"}`}
              >
                {/* Selective direct labels — only where there is something to read. */}
                {count > 0 ? (
                  <span className="font-body text-[10px] font-bold text-cream/70 tabular-nums">
                    {count}
                  </span>
                ) : null}
                <div
                  className="w-full rounded-t-[4px]"
                  style={{
                    height:
                      count === 0
                        ? 2
                        : Math.max(4, (count / max) * (PLOT_HEIGHT - 22)),
                    backgroundColor: count === 0 ? "#ffffff1a" : CHART.magnitude,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-1.5 flex gap-[2px]" aria-hidden="true">
            {bins.map(({ age }) => (
              <span
                key={age}
                className="flex-1 text-center font-body text-[10px] text-cream/45 tabular-nums"
              >
                {age}
              </span>
            ))}
          </div>

          {/* The same data as text, for screen readers and for anyone who would
              rather read the numbers than the picture. */}
          <table className="sr-only">
            <caption>Children by age</caption>
            <tbody>
              {bins.map(({ age, count }) => (
                <tr key={age}>
                  <th scope="row">Age {age}</th>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

export function TeamSplit({ rsvps }: { rsvps: Rsvp[] }) {
  const attending = rsvps.filter((r) => r.attending);

  const rows = [
    {
      key: "tabitha",
      label: CELEBRANTS.tabitha.team,
      colour: CHART.tabitha,
      count: attending.filter((r) => r.team === "tabitha").length,
    },
    {
      key: "abraham",
      label: CELEBRANTS.abraham.team,
      colour: CHART.abraham,
      count: attending.filter((r) => r.team === "abraham").length,
    },
    {
      key: "undecided",
      label: "No team yet",
      colour: CHART.undecided,
      count: attending.filter((r) => r.team === null).length,
    },
  ].filter((row) => row.count > 0);

  const total = rows.reduce((n, row) => n + row.count, 0);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h3 className="font-display text-base font-semibold text-cream">
        Party-game teams
      </h3>
      <p className="mt-1 font-body text-xs text-cream/50">
        {total} {total === 1 ? "family" : "families"} coming
      </p>

      {total === 0 ? (
        <p className="mt-4 font-body text-sm text-cream/45">
          Nothing to chart yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="flex items-baseline justify-between gap-3">
                {/* Identity is carried by a swatch beside text in a text token,
                    never by colouring the text itself. */}
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.colour }}
                  />
                  <span className="truncate font-body text-sm text-cream/80">
                    {row.label}
                  </span>
                </span>
                <span className="font-display text-sm font-bold text-cream tabular-nums">
                  {row.count}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(row.count / total) * 100}%`,
                    backgroundColor: row.colour,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
