# pdp-skills / pdp-mcp gaps for the four-beat demo

Unicorn Finance demos four "behind the API" beats - **Global Payments** (Reach), **FX Rate
Sheet** (Speed), **Account Validation** (Confidence), and **Transactions/Balances**
(Retrieve). The "code with us" story points attendees at the public **pdp-skills** and
**pdp-mcp** so an agent can build the integration with them.

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
| **Global Payments** | `POST /payment/v2/payments` | Only **Online Payments** `POST /api/v2/payments` (card) is public; wholesale Global Payments (GMP) is an internal service, not the public surface | **New `jpm-global-payments` skill** documenting the public Global Payments contract + host, distinct from Online Payments |
| **FX Rate Sheet** | `POST /fxapi/v1/rate-sheets` → `{_metadata, data:[{rateId, baseCurrency, counterCurrency, payoutType, guarenteedRateInd, minTranSize, maxTranSize, effectiveDate, effectiveTime, rate}]}` | Not in pdp-skills; base path **inferred** | **New `jpm-fx-rate-sheet` skill**: confirm base URL + path (`/fx/rate-sheet` vs `/fxapi/v1/rate-sheets`), the request `{accountId, currency}`, and the response schema (incl. the real, misspelled `guarenteedRateInd` field) |
| **Account Validation** | `POST /tsapi/v2/validations/accounts` (verification + authentication code pairs) | Only a **stub** skill; internal AVS is `POST /api/v2/validations/accounts/inquiry` | **Complete `jpm-validation-services`**: confirm public path + the confidence/verification/authentication response schema |
| **Transactions / Balances** | `GET /tsapi/v3/transactions` (+ `POST /accessapi/balance`) | Not in pdp-skills; the internal OBTS service exposes `GET /tsapi/v3/transactions` | **New `jpm-transactions` skill** for the public retrieve/receivables surface (transactions + balances) |

## Public vs internal (so the skills point at the right host)

The four beats are largely **wholesale** APIs whose real implementations live on
internal JPMC networks, not the public
`api-ms[-test]/api-mock.payments.jpmorgan.com` self-service surface. New skills must
document the **public** hosts/paths an onboarded external developer can actually reach -
not the internal gateway hosts - or clearly separate "try it (Mock)" from "wholesale CAT".

## pdp-mcp gaps

- The MCP only returns what the portal publishes. If Global Payments / FX Rate Sheet /
  Transactions docs are missing or thin on the portal, `search_documentation` /
  `read_documentation` can't help an agent build those beats. Portal doc coverage for
  these three products is the upstream dependency.

## Status legend for the demo

- **Confirmed:** OAuth (both tiers), Online Payments `POST /api/v2/payments`.
- **Inferred (confirm before live use):** FX Rate Sheet path, Account Validation public
  path/schema, the public Global Payments and Transactions contracts. The demo runs these
  offline (Local Mock) with realistic shapes and flags them as inferred.
