# IV — Ajayi double birthday invite

A mobile-first invite that turns an RSVP into a downloadable Golden Ticket pass,
plus a host dashboard and a door check-in list. See [PLAN.md](./PLAN.md) for the
design decisions behind it.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

There is no Cloudflare account or wrangler in the loop for `next dev`: `lib/db.ts`
falls back to an in-memory store, seeded with a few sample families so `/admin`
and `/door` have something to show. RSVPs made this way vanish on restart.

Dev-only PINs, so the staff pages are reachable without setting secrets:

| Page | PIN |
|---|---|
| `/admin` | `0000` |
| `/door` | `1234` |

Both are development-only. In production an unset PIN locks that page outright
rather than falling back to a guessable default — see `lib/gate.ts`.

## Deploying — Workers, not Pages

**This app cannot be built on Cloudflare Pages.** That is a property of the
stack, not a misconfiguration, so a failing Pages build is the expected result
and no amount of build-command tweaking will fix it:

- Pages runs Next.js through `@cloudflare/next-on-pages`, which requires
  `export const runtime = "edge"` on *every* server route. This app uses server
  actions and `node:crypto` on the Node.js runtime.
- Cloudflare has put that adapter into maintenance and now points Next.js users
  at Workers.
- `@opennextjs/cloudflare` — what this project uses — only emits a Worker
  (`.open-next/worker.js`). There is no Pages output to deploy.

If a Pages project is already connected to this repo, delete it and create a
**Worker** instead. One deploy then ships the site and its database together.

### First deploy

```bash
# 1. Create the database, then paste the printed id into wrangler.jsonc
npm run db:create

# 2. Create the schema
npm run db:migrate:remote

# 3. Set the secrets (each prompts for a value)
npx wrangler secret put ADMIN_PIN     # host dashboard
npx wrangler secret put DOOR_PIN      # door list
npx wrangler secret put PASS_SECRET   # signs pass codes and session cookies

# 4. Ship it
npm run deploy
```

`wrangler.jsonc` ships with `"database_id": "REPLACE_WITH_DATABASE_ID"`. Step 1
prints the real id — the deploy fails until it is pasted in.

### Checking it before you ship

```bash
npm run preview   # production build, running locally on workerd + local D1
```

`npm run preview` is the build that matters. A passing `next build` only proves
the app compiles; it says nothing about the Workers bundle.

### Secrets

| Name | Used for | Unset in production |
|---|---|---|
| `ADMIN_PIN` | `/admin` | Dashboard locked |
| `DOOR_PIN` | `/door` | Door list locked |
| `PASS_SECRET` | HMAC for pass codes and session cookies | Falls back to a known dev value — **always set this** |

Rotating a PIN signs out every session using it, because the session cookie is
an HMAC over the PIN itself.

## Routes

| Route | Who | What |
|---|---|---|
| `/` | Public | Hero, countdown, details, RSVP flow, pass reveal |
| `/p/<code>` | Public | Read-only pass — what the QR opens. Shows check-in instead when the visitor holds a door session |
| `/admin` | Host | Counts, allergy report, guest list, CSV export, name tags |
| `/door` | Bouncers | Tap-the-name arrival list |
