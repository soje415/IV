# IV — Ajayi Double Birthday Invite & Digital Pass

A mobile-first invite that turns an RSVP into a downloadable **Golden Ticket pass**,
plus a host dashboard and a dead-simple door list.

**Celebrants — one shared party, one date:**

| Celebrant | Turning | World |
|---|---|---|
| **Tabitha Ajayi** | 4 | Pastel sparkle — unicorns, butterflies, rainbows |
| **Abraham Ajayi** | 10 | Bold adventure — comets, space, gaming neon |

---

## 1. Decisions taken

| Question | Decision |
|---|---|
| Guest model | **Family headcount** — adults count + a list of children (name, age, allergy) |
| Backend | **Cloudflare D1** (serverless SQLite), free plan. Local in-memory store as the dev fallback |
| Visual direction | **Split dual-world** — united by a gold `4 & 10` monogram |
| Access | **Open public link** + honeypot and rate limiting |
| Door check-in | **Tap-the-name list. No QR scanner.** See §3 |
| Apple Wallet | **Dropped** — needs a paid Apple Developer cert. PNG + `.ics` + WhatsApp instead |
| Target | **Mobile first.** Designed at 360px, scaled up. See §8 |
| Hosting | **Cloudflare Workers** via `@opennextjs/cloudflare`. Not Pages — see §9 |

## 2. Why family headcount, not "+1"

A "+1" boolean is a wedding model. Guests here arrive as families: one parent RSVPs for
2 adults and 3 children. The whole value of this app is an accurate number on party day, and
that number is what the caterer, the cake, and the goodie bags depend on.

Modelling children individually unlocks, for free:

- **Cake slices** and **goodie bag** counts that are actually right
- An **allergy report** for the kitchen — the single most important field on the form
- **Printable name tags**, one per child, with the sticker avatar they chose
- Activity grouping by age (a 4-year-old and a 10-year-old do not play the same games)

## 3. The door: no scanner

The door has four jobs — confirm the family is expected, hand over the right number of goodie
bags, flag allergies, and record arrival. None of them need a camera.

A QR scanner adds camera permissions, failures in dim light, and an offline sync queue, to
defend against a threat that does not exist at a children's party.

**`/door` instead:**

1. Guest shows their pass on their phone. Bouncer glances at it.
2. Bouncer searches or scrolls their own list, taps the family.
3. A big sheet slides up: family name, `2 adults · 3 children`, **3 goodie bags**, allergy
   warnings in red.
4. One large **MARK ARRIVED** button. The row turns green with a timestamp.

Tapping an already-arrived family shows `ALREADY ARRIVED · 3:42pm` instead of the button — the
same duplicate protection the scanner would have given, without the scanner.

Design constraints: one-handed use, dim light, tired staff. Rows 64px tall, high contrast, no
small text, a live `34 of 52 families arrived` counter pinned at the top.

**Access for bouncers:** a secret link the host sends on WhatsApp that morning, gated by a
4-digit PIN. No accounts, no passwords to distribute.

**Offline:** the list is cached, and "mark arrived" is idempotent (it just sets `arrived_at`),
so a failed write retries safely when signal returns. Far simpler than queuing scans.

The QR still prints on the pass — it opens `/p/<code>` so a parent can reopen their pass or
forward it to their partner. It is just not the check-in mechanism.

## 4. Data model

```sql
rsvps
  id                uuid primary key
  family_name       text not null        -- "The Ajayi Family" / "Mrs Okafor"
  contact           text not null        -- email or phone/WhatsApp
  attending         boolean not null
  adults_count      int  not null default 1
  staying           boolean              -- staying at the party, or drop-off?
  emergency_phone   text
  team              text                 -- 'tabitha' | 'abraham' — party games only
  wish              text                 -- shown on the projector wall
  photo_consent     boolean not null default false
  notes             text
  pass_code         text unique not null
  arrived_at        timestamptz
  created_at        timestamptz default now()

children                                 -- one row per child, FK → rsvps.id
  id                uuid primary key
  rsvp_id           uuid references rsvps(id) on delete cascade
  name              text not null
  age               int
  allergies         text
  avatar            text                 -- chosen sticker id
```

Derived on the dashboard, never stored: `total_adults`, `total_children`,
`cake_slices = adults + children`, `goodie_bags = children`.

Privacy: this is children's data. Fields are minimised, and the dataset is deleted a set number
of days after the event.

## 5. Routes

| Route | Who | What |
|---|---|---|
| `/` | Public | Hero, countdown, details, map, dress code, RSVP flow, pass reveal |
| `/p/<code>` | Public | Read-only pass view — what the QR opens |
| `/admin` | Host | Counts, allergy report, guest list, CSV export, name-tag printing |
| `/door` | Bouncers | Tap-the-name arrival list, PIN gated |
| `/wall` | Projector | Cycling birthday wishes left by guests |

The public RSVP endpoint can insert but never read, so no guest can enumerate the guest list.
`pass_code` carries an HMAC suffix so codes can't be guessed.

## 6. RSVP flow

One question per screen, huge touch targets, a mascot walking a progress bar. Parents fill this
on a phone, one-handed, often holding a toddler.

1. Are you coming? → yes / sorry, can't
2. Your name & contact (WhatsApp number or email)
3. How many adults?
4. Add each child → name, age, allergies, pick a sticker
5. Staying with them, or dropping off? + emergency phone
6. Team Tabitha or Team Abraham? (party games)
7. Leave a birthday wish
8. Photo & video consent
9. **Confetti** → the pass flips into view

## 7. Motion — Framer Motion

The animation is the product here. It is what makes a child lean over their parent's shoulder.

**Landing**
- Split **opens like curtains** on load, the gold `4 & 10` monogram settling on the seam with a spring
- Tabitha's side: butterflies and sparkles drifting on slow loops
- Abraham's side: comet streaks crossing on a longer loop
- Balloons float up the margins, `repeat: Infinity`, staggered so they never sync
- Countdown digits **roll like a scoreboard** via `AnimatePresence`
- Sections rise and stagger in on `whileInView`

**RSVP flow**
- Direction-aware slide + fade between questions, `AnimatePresence mode="wait"`
- A mascot walks the progress bar — a unicorn or a rocket, switching when they pick a team
- Sticker picker: stickers **pop in on a spring**, `whileTap={{ scale: 0.9 }}`
- Adult/child steppers: digits spring up or down with the direction of the change

**The reveal**
- Confetti burst, then the pass **flips in on `rotateY`** and settles with a spring
- A gold shimmer sweeps across the pass on a slow loop
- Balloons release upward behind it

**Performance guardrails** — these matter on a mid-range Android on patchy data:
- Animate `transform` and `opacity` only. Nothing that triggers layout.
- `LazyMotion` + `domAnimation` — roughly 5kb instead of 34kb
- `prefers-reduced-motion` → all of the above become plain cross-fades
- Particle counts scale down on small screens
- Confetti is lazy-loaded, only on submit

## 8. Mobile responsive

Mobile is not a breakpoint here, it is the design target. Every guest opens this from WhatsApp
on a phone.

- Designed at **360px** and scaled up — desktop is the adaptation, not the baseline
- Tap targets ≥ 44px; form controls ≥ 56px
- `100dvh`, never `100vh` — mobile browser chrome eats `vh`
- `env(safe-area-inset-*)` respected for notches and home indicators
- **No horizontal scroll at any width**, ever
- The hero split is **diagonal on desktop, stacked top/bottom on phones** — a diagonal across
  360px is cramped and illegible. The gold monogram sits on the seam either way.
- The pass renders at a fixed aspect ratio and scales to fit; PNG exports at 3x so it stays
  crisp when forwarded on WhatsApp
- Numeric keypads via `inputMode`, real `autoComplete` values — small things that halve form
  abandonment on mobile
- `/admin` tables collapse to cards on phones; `/door` is phone-only by design

## 9. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Fast, deploys to Vercel free |
| Styling | Tailwind CSS | Design tokens per celebrant world |
| Motion | **Framer Motion** | Split reveal, mascot, pass flip, loops |
| Confetti | `canvas-confetti` | Lazy-loaded, cheap |
| Forms | React Hook Form + Zod | One schema, client and server validation |
| QR | `qrcode.react` | Client-side, no backend cost |
| Pass export | `modern-screenshot` | Reliable PNG. `html2canvas` is unmaintained and mangles modern CSS |
| Data | **Cloudflare D1** behind `lib/db-types.ts` | SQLite. Free plan covers this event many times over |
| Hosting | **Cloudflare Workers** | One deploy ships site and database together |

### Why Workers, not Pages

Cloudflare's Next.js guide now targets **Workers** through `@opennextjs/cloudflare`, which
supports server actions and SSR on the Node.js runtime with the `nodejs_compat` flag. The Pages
route uses the older `@cloudflare/next-on-pages` adapter, which requires the edge runtime on
every route — Next 16 with server actions will not build there. A failing Pages build is the
expected outcome, not a misconfiguration.

### Why D1, not Supabase

One vendor, one deploy, no second network hop, and the schema in §4 drops in as-is. Free plan:
5 GB storage, 5 million rows read per day, 100,000 rows written per day. This party will
generate a few hundred rows in total.

`lib/db.ts` picks D1 when the binding is present and the in-memory store otherwise, so
`next dev` still runs with no Cloudflare account and no wrangler in the loop.

## 10. Build phases

1. **Scaffold** — Next.js, Tailwind, tokens for both worlds, `lib/db.ts` adapter + seed data
2. **Landing** — split hero, curtain open, countdown, details, map, dress code
3. **RSVP flow** — multi-step form, mascot progress, validation
4. **Pass** — card design, QR, confetti + flip reveal, PNG, WhatsApp share, `.ics`
5. **`/p/<code>`** — read-only pass view
6. **`/admin`** — counts, allergy report, CSV, name tags
7. **`/door`** — arrival list, PIN gate, offline cache
8. **`/wall`** — projector wishes
9. ~~**Backend swap**~~ — **done early.** D1 adapter, migration and Workers config are in
10. **Deploy** — Workers, custom domain, testing on a real mid-range phone

Phases 1–5 are complete. The D1 layer landed ahead of schedule so the deployed site stores
real RSVPs rather than losing them between requests.

## 11. Still needed from the host

Placeholders go in `config/event.ts` — everything below is content, not architecture, so the
build is not blocked on it.

- [ ] Party date and start/end time
- [ ] Venue name, full address, map link
- [ ] Dress code / theme for guests
- [ ] Gift policy — "no gifts please", or gift ideas per child
- [ ] RSVP deadline
- [ ] Host contact number for guest questions
- [ ] Photos of Tabitha and Abraham (optional, for the hero)
- [ ] Custom domain, if any
