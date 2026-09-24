# pdp-skills / pdp-mcp gaps for the three-beat demo

Unicorn Finance demos three "behind the API" beats - **Global Payments** (Reach), **FX
Rate Sheet** (Speed), and **Account Validation** (Confidence). The "code with us" story
points attendees at the public **pdp-skills** and **pdp-mcp** so an agent can build the
integration with them.

Today those cover only part of the surface. This doc records the gaps so the pdp-skills /
pdp-mcp teams can close them.

## What exists today

- **pdp-skills** (`github.com/jpmorgan-payments/pdp-skills`): skills for **Checkout** and
  **Online Payments**, the shared **OAuth** skill (`jpm-oauth`), and a **stub** for
  Validation Services. No Global Payments, FX, or Transactions skills.
- **pdp-mcp** (`github.com/jpmorgan-payments/pdp-mcp`): a docs-search MCP over
  `developer.payments.jpmorgan.com` (`search_documentation` / `read_documentation`). It
  holds no contracts itself - it only surfaces what the portal publishes.

## Auth (works today, keep as the model)

- **JPMC Mock tier** - self-service OAuth2 client-credentials: `client_id` + `client_secret`
  → `https://id.payments.jpmorgan.com/am/oauth2/alpha/access_token` (scope
  `jpm:payments:sandbox`) → Bearer → `api-mock.payments.jpmorgan.com`. Confirmed; this is
  what the demo's JPMC Mock tier wires.
- **JPMC CAT/PROD** - IDAnywhere/ADFS signed-JWT client assertion (RFC 7523, RS256)
  against an internal ADFS OAuth token endpoint (separate CAT and PROD hosts)
  → Bearer. This is the `jpm-oauth` skill's flow. (Note: this demo's legacy server still
  uses mTLS + a body-signed JWT for CAT - a separate modernisation item, not a pdp-skills gap.)

## Per-beat gaps

| Beat | Demo call | Public contract today | Gap to close |
|---|---|---|---|
| **Global Payments** | `POST /payment/v2/payments` | Only **Online Payments** `POST /api/v2/payments` (card) is public; wholesale Global Payments (GMP) is an internal service, not the public surface. **Confirmed live** against `api-mock.payments.jpmorgan.com` (JPMC Mock tier) - real `201 Created` with a `paymentId` | **New `jpm-global-payments` skill** documenting the public Global Payments contract + host, distinct from Online Payments |
| **FX Rate Sheet** | Real path per PDP's own published spec: `GET /accounts/{accountId}/ratesheets/current` (this demo's `POST /fxapi/v1/rate-sheets` guess was wrong - corrected here, not yet in the app since it's CAT/production only anyway) | Not in pdp-skills; **no `MOCK` server exists for this API at all** per its own spec (only PRODUCTION/CLIENT TESTING OAuth+MTLS) - confirmed by both the spec and a live 404 against `api-mock` | **New `jpm-fx-rate-sheet` skill** documenting the real path/schema above; note there's no Mock tier to build a "try it" flow against |
| **Account Validation** | `POST /tsapi/v2/validations/accounts` (verification + authentication code pairs) | Only a **stub** skill; internal AVS is `POST /api/v2/validations/accounts/inquiry`. **Confirmed live** against `api-mock` - the Mock tier's real differentiator is the `x-program-id` header (`VERIAUTH` vs `VERIAUTHUS`), not a `profileName` body field | **Complete `jpm-validation-services`**: confirm the public CAT/production path + document the Mock tier's header-driven behavior above |

## Public vs internal (so the skills point at the right host)

These beats are largely **wholesale** APIs whose real implementations live on internal
JPMC networks, not the public `api-ms[-test]/api-mock.payments.jpmorgan.com` self-service
surface. New skills must document the **public** hosts/paths an onboarded external
developer can actually reach - not the internal gateway hosts - or clearly separate
"try it (Mock)" from "wholesale CAT". Note FX has no Mock tier to separate at all.

## pdp-mcp gaps

- The MCP only returns what the portal publishes. If Global Payments / FX Rate Sheet
  docs are missing or thin on the portal, `search_documentation` / `read_documentation`
  can't help an agent build those beats. Portal doc coverage for these products is the
  upstream dependency.

## Status legend for the demo

- **Confirmed live against api-mock:** OAuth (JPMC Mock tier), Global Payments
  `POST /payment/v2/payments`, Account Validation `POST /tsapi/v2/validations/accounts`.
- **Confirmed unavailable on Mock (per FX's own spec):** FX Rate Sheet - runs offline
  (Local Mock) only, with a realistic-but-synthetic shape.
