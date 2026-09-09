# Next steps (picking up next week)

Tracks the work deferred from the WAD "Payments Garage" renewal. Grouped by repo. The
per-beat contract detail lives in [`pdp-skills-mcp-gaps.md`](pdp-skills-mcp-gaps.md).

## unicorn-finance (this repo)

- [ ] **End-to-end smoke test of JPMC Mock** once creds + connectivity are available:
      OAuth2 client-credentials (`id.payments.jpmorgan.com`) -> Bearer -> `api-mock`.
- [ ] **Real `docker compose up`** on a network where Docker Hub is reachable (blocked on
      the JPMC network here; verified indirectly via the production build + SPA serve).
- [ ] **Per-beat api-mock paths/shapes** for the JPMC Mock tier - the beat paths currently
      mirror the CAT/gateway shapes. In particular **Global Payments** on the Mock tier is
      Online Payments `POST /api/v2/payments` (Bearer + JSON), not the signed-body-JWT
      `/payment/v2/payments`.
- [ ] **Confirm inferred contracts** with owners: FX Rate Sheet path/schema
      (`/fxapi/v1/rate-sheets` vs `/fx/rate-sheet`; with the FX API owners) and
      the public **Account Validation** path/schema.
- [ ] **Modernise JPMC CAT auth**: move from mTLS + body-signed JWT to the IDAnywhere
      signed-JWT client-assertion -> Bearer flow (align with the `jpm-oauth` skill).
- [ ] **ESLint flat-config migration** - `pnpm lint` is broken on ESLint 9 (legacy
      `.eslintrc.js`).
- [ ] Optional: FX / Transactions / Balances Prism specs + Caddy routes for server-side
      mock-server parity (today those beats are MSW-only).

### Code cleanups (from the review)

- [ ] Extract a shared retrieve-display component - `TransactionsDisplay` duplicates
      `AccountBalancesDisplay`'s SWR + loading/error/table scaffold.
- [ ] Single source of truth for beat metadata (paths/labels) - currently repeated across
      `HomePage`, `Sidebar`, and `App` routes.
- [ ] FX mock: `selectFXRates` falls back to the full multi-base sheet for an unknown base
      currency; return an empty or single-base sheet instead (update the unit test too).
      Low impact - unreachable from the current dropdown.

## pdp-skills (github.com/jpmorgan-payments/pdp-skills)

- [ ] New **`jpm-global-payments`** skill - the public Global Payments contract + host,
      distinct from Online Payments.
- [ ] New **`jpm-fx-rate-sheet`** skill - request `{accountId, currency}`, response
      `{_metadata, data:[...]}` incl. the real (misspelled) `guarenteedRateInd` field.
- [ ] Complete the **`jpm-validation-services`** stub - public path + confidence /
      verification / authentication schema.
- [ ] New **`jpm-transactions`** skill - the retrieve/receivables surface (transactions +
      balances).
- [ ] Ensure every new skill points at **public** hosts (`api-ms[-test]` / `api-mock`),
      not internal JPMC gateways.

## pdp-mcp (github.com/jpmorgan-payments/pdp-mcp)

- [ ] Upstream dependency: the MCP only surfaces what the portal publishes. Confirm
      `developer.payments.jpmorgan.com` has adequate **Global Payments / FX Rate Sheet /
      Transactions** docs so `search_documentation` / `read_documentation` can serve them.
