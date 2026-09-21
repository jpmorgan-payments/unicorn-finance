# Next steps (picking up next week)

Tracks the work deferred from the WAD "Payments Garage" renewal. Grouped by repo. The
per-beat contract detail lives in [`pdp-skills-mcp-gaps.md`](pdp-skills-mcp-gaps.md).

## unicorn-finance (this repo)

- [x] **Global Payments Mock-tier adapter**: `SubmitGlobalPaymentsRequest.ts` now branches
      on `environment` - JPMC Mock hits `/payment/v2/payments` directly (Bearer added
      server-side by the `/mockapi` proxy), CAT keeps the signed-body-JWT
      `/digitalSignature/payment/v2/payments`. Same body/contract on both tiers - this is
      wholesale Global Payments v2, matching the checked-in spec
      (`global_payments_2_0_22.yaml`), not Online Payments (card). `isEnvSelectable` no
      longer force-disables `JPMC_MOCK`; the other four beats show an in-UI
      `MockTierNotice` since they don't have a Mock adapter yet.
- [ ] **End-to-end smoke test of JPMC Mock** once creds + connectivity are available:
      1. Set `PDP_CLIENT_ID`/`PDP_CLIENT_SECRET` in `.env`, `VITE_ENABLE_JPMC=true`.
      2. Run `app/server` (or `docker compose up`) and the client.
      3. Switch to the JPMC Mock chip, submit a Global Payments payment.
      4. Expect a real response from `api-mock.payments.jpmorgan.com` - confirms the
         OAuth2 client-credentials -> Bearer -> api-mock round trip and the
         `/payment/v2/payments` path/body.
      5. If step 4 404s specifically on path, double check whether api-mock also serves
         this at a different mount than the public gateway spec implies.
- [ ] **Real `docker compose up`** on a network where Docker Hub is reachable (blocked on
      the JPMC network here; verified indirectly via the production build + SPA serve).
- [ ] **Per-beat api-mock paths/shapes** for the remaining JPMC Mock beats (Account
      Validation, FX, Transactions, Balances) - still CAT/gateway-shaped; each now shows an
      explicit "not wired up" notice in the UI instead of silently 404ing.
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
