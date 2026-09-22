# Unicorn Finance

A sample application showcasing J.P. Morgan Payments core external APIs. It is a
clone-and-run demo: every call runs offline against a built-in mock, and the same code
hits the real J.P. Morgan sandbox once you drop in your credentials.

## The three beats

Each page takes you *behind* one API - what it does and how you call it.

| Beat | Page | API | What it shows |
|---|---|---|---|
| Reach | Payments | Global Payments 2 | Initiate a payment (RTP / ACH) across rails from one contract |
| Speed | FX | FX Rate Sheet | Pull a real-time rate sheet - lockable (guaranteed) vs indicative rates |
| Confidence | Validations | Account Validation | Verify an account before you pay it; confidence codes, not a yes/no |

## Getting started (Tier 1 - offline, no credentials)

Everything runs against an in-browser mock ([MSW](https://mswjs.io/)), so you need no
J.P. Morgan network access and no keys.

**Prerequisites:** either **Docker** (Desktop running), or **Node.js >= 20.19** with
**pnpm** (`corepack enable` sets pnpm up for you).

With Docker:

```sh
docker compose up
```

Then open http://localhost:3000.

Or run the client directly:

```sh
cd app/client
corepack enable   # first time only - enables pnpm
pnpm install
pnpm start
```

That's the whole demo - every beat works offline. It opens on a home screen that
introduces the app and points you to the right API for what you're building.

> Port 3000 already in use? Stop the other process or run `pnpm start -- --port 3001`.

> **Bonus stage - get your keys!** Ready to leave the mock behind? Create a project at
> [developer.payments.jpmorgan.com](https://developer.payments.jpmorgan.com) to get a
> **client_id** and **client_secret**, then follow the checklist under **Tiers 2 & 3**
> below to plug them in and switch the app onto the real JPMC Mock sandbox.

## Finding your way around

- **Environment switch** (left navbar): three tiers in graduation order - **Local Mock**
  (in-app, offline, no keys - the default), **JPMC Mock** (PDP's hosted Mock env, via
  OAuth2), and **JPMC CAT** (disabled for now). On the Mock tier, Global Payments and
  Account Validation both hit the real `api-mock` contract; FX shows an in-form notice
  since PDP doesn't offer a Mock tier for it at all.
- **Request Preview drawer**: every form has a **Preview Request** button, and clicking a
  history row re-opens it - this is the "what API am I actually hitting" view, showing the
  exact endpoint, method, headers and body.
- Pages live in `app/client/src/pages`; each beat's logic is under `app/client/src/features`.

## Code with us

1. **Run the container** (above) - see the real request/response shapes now, no keys.
2. **Point your AI agent** (Copilot / Claude Code) at the public **pdp-skills** and
   **pdp-mcp** (github.com/jpmorgan-payments) - they teach it J.P. Morgan's OAuth and API
   contracts so it builds the integration with you. (Today these cover OAuth + Online
   Payments + Checkout; skills for the beats here are a tracked gap - see
   [`docs/pdp-skills-mcp-gaps.md`](docs/pdp-skills-mcp-gaps.md).)
3. **Get your keys** - onboard at
   [developer.payments.jpmorgan.com](https://developer.payments.jpmorgan.com) and graduate
   to the real sandbox (Tier 2 below).

## Tiers 2 & 3 (++ hit real JPMorgan APIs)

Both JPMC tiers run through the express proxy in `app/server` and keep their secrets
server-side. To turn one on:

1. `cp .env.example .env` at the repo root.
2. Set **`VITE_ENABLE_JPMC=true`** in `.env`. This is what unlocks JPMC Mock / JPMC CAT
   in the environment switch - without it, both stay greyed out no matter what else you
   configure.
3. Add that tier's credentials to `.env`:
   - **JPMC Mock** - PDP's hosted Mock environment (`api-mock.payments.jpmorgan.com`).
     Create a project on the [developer portal](https://developer.payments.jpmorgan.com),
     add an API, and put its **client_id / client_secret** in `.env` (`PDP_CLIENT_ID` /
     `PDP_CLIENT_SECRET`). The server exchanges them for an OAuth2 Bearer token
     (`scope=jpm:payments:sandbox`) - no certificates, and the secret never reaches the
     browser.
   - **JPMC CAT** - real Client Acceptance Testing via **mTLS certificates + a signed
     JWT**. Put your certs in `./certs` (gitignored): `jpmc.key`, `jpmc.crt`,
     `digital-signature/key.key`, plus your client/program IDs in `.env`.
4. Rebuild and start everything:

   ```sh
   docker compose up --build   # or: cd app/server && pnpm install && pnpm start:local
   ```

   `docker compose up` always starts the proxy (`server`, :8082) next to the client;
   without a `.env` it just sits idle. `--build` matters here because `VITE_ENABLE_JPMC`
   is baked into the client bundle at build time - skip it and the switch stays disabled
   even with everything else set correctly. This needs Docker Compose 2.24+ (the `.env`
   is optional).

> **JPMC Mock is selectable but every request fails** with `"error": "JPMC Mock
> unavailable", "message": "Mock tier not configured"`? `VITE_ENABLE_JPMC=true` made it
> into the bundle, but `PDP_CLIENT_ID`/`PDP_CLIENT_SECRET` are missing or wrong - the
> server only reads them when a JPMC Mock request comes in. Unlike the client flag,
> credentials are read at container start, not baked into an image, so after editing
> `.env` you only need `docker compose up -d` (no `--build`) to pick them up.

See `app/server/README.md` for details.

> Status: **Local Mock** is the offline default. **JPMC Mock** is selectable behind
> `VITE_ENABLE_JPMC` + your PDP creds - **Global Payments** (`POST /payment/v2/payments`)
> and **Account Validation** (`POST /tsapi/v2/validations/accounts`) are both confirmed
> live against `api-mock.payments.jpmorgan.com`. **FX Rate Sheet** doesn't have a Mock
> tier at all - PDP's own spec lists no `MOCK` server for it, only production/CAT - and
> shows an in-UI notice. See `docs/NEXT-STEPS.md`. **JPMC CAT** is disabled for now.

## What's in this repo

- `app/client` - the React (Vite + Mantine + Tailwind) front end. Offline mock in
  `src/mocks` (MSW).
- `app/server` - the express mTLS + signed-JWT proxy for real mode, and its AWS Lambda
  deployment (`DEPLOYMENT_GUIDE.md`).
- `app/server/mock-server` - an optional Prism/Caddy contract mock driven by the OpenAPI
  specs in `specs/` (`docker compose up` there for a server-side mock on :8081).
- `bruno` - a Bruno collection with a request per beat.

## Testing

```sh
cd app/client
pnpm test          # watch
pnpm test:no-watch # once
```

## Contributing

We welcome contributions.

1. First-time JPMC contributors: complete the Contribution Licence Agreement -
   https://github.com/jpmorganchase/.github/blob/main/CONTRIBUTING.md
2. Open a PR; we'll review and merge if all checks pass.
