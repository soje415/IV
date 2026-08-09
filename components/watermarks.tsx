/**
 * A large, faint motif behind each celebrant's name.
 *
 * Inline SVG rather than artwork: it weighs nothing on a phone's data plan,
 * stays crisp at any size, and carries no licence. Licensed characters — Disney
 * princesses and the like — are exactly what must not go on a public URL.
 *
 * Opacity is kept low enough that the name over the top keeps its contrast;
 * these are texture, not illustration. They also make a natural backdrop for
 * the children's photos when those arrive.
 */

export function TabithaWatermark() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute inset-0 m-auto h-[62%] w-auto max-w-none text-tab-deep/[0.07] md:h-[78%]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Tiara: three points on a band, with a jewel above each. */}
      <path d="M42 128 L34 66 L74 100 L100 52 L126 100 L166 66 L158 128 Z" />
      <path d="M40 140 H160" />
      <circle cx="34" cy="60" r="7" />
      <circle cx="100" cy="45" r="9" />
      <circle cx="166" cy="60" r="7" />
      {/* A sparkle either side, echoing the drifting particles. */}
      <path d="M28 168 l5 12 12 5 -12 5 -5 12 -5 -12 -12 -5 12 -5 Z" />
      <path d="M172 24 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 Z" />
    </svg>
  );
}

export function AbrahamWatermark() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute inset-0 m-auto h-[62%] w-auto max-w-none text-cream/[0.07] md:h-[78%]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Rocket: nose cone, body, fins and a window. */}
      <path d="M100 26 C124 52 134 84 134 112 H66 C66 84 76 52 100 26 Z" />
      <circle cx="100" cy="80" r="14" />
      <path d="M66 100 L44 130 L66 124 Z" />
      <path d="M134 100 L156 130 L134 124 Z" />
      <path d="M84 112 L92 140 H108 L116 112" />
      {/* Comet arc crossing behind it. */}
      <path d="M20 176 C60 160 96 168 124 186" strokeOpacity="0.8" />
      <circle cx="130" cy="188" r="6" />
    </svg>
  );
}
