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
- [x] **End-to-end smoke test of JPMC Mock** - confirmed: OAuth2 client-credentials ->
      Bearer -> `POST /payment/v2/payments` on `api-mock.payments.jpmorgan.com` returns a
      real `201 Created` with a `paymentId`. On a network requiring a corporate egress
      proxy, this also needed a fix in `app/server` (see `app/server/README.md`'s
      "mandatory corporate egress proxy" section + `app.js`) - opt-in via
      `HTTP_PROXY`/`HTTPS_PROXY` env vars, no-op otherwise.
- [x] **Account Validation Mock-tier adapter**: confirmed live against `api-mock` -
      `POST /tsapi/v2/validations/accounts` works, but the Mock tier's differentiator is
      the `x-program-id` header (`VERIAUTH` vs `VERIAUTHUS`), not the `profileName` body
      field CAT uses. `SubmitValidationServicesRequest.ts` now branches on `environment`
      for headers; `x-client-id: CLIENTID` / `x-program-id-type: AVS` are the spec's own
      public sandbox constants, not credentials. `MockTierNotice` dropped from this beat.
- [ ] **Real `docker compose up`** on a network where Docker Hub is reachable (blocked on
      the JPMC network here; verified indirectly via the production build + SPA serve).
- [x] **FX Rate Sheet on JPMC Mock - confirmed unavailable.** The published spec
      (`developer.payments.jpmorgan.com`) lists only PRODUCTION and CLIENT TESTING
      (OAuth/MTLS) servers - no `MOCK` server entry at all, and both guessed Mock paths
      (`/fxapi/v1/rate-sheets`, `/fx/rate-sheet`) 404 with "path...does not exist in the
      specification". The real path is `GET /accounts/{accountId}/ratesheets/current`
      (CAT/production only) - worth fixing in the CAT adapter later, but no Mock work
      possible here. Leave `MockTierNotice` on this beat.
- [x] **Account Balances on JPMC Mock - confirmed unavailable.** Same story: the
      published spec lists no `MOCK` server (PRODUCTION/CLIENT TESTING OAuth+MTLS only),
      and `POST /accessapi/balance` 404s the same way against `api-mock`. Leave
      `MockTierNotice` on this beat. (This 404 was also masking a real client bug -
      `SubmitAccountBalancesRequest.ts` didn't check `res.ok`, so this 404 rendered as
      success data and crashed the whole app via the ErrorBoundary - fixed separately.)
- [ ] **Transactions on JPMC Mock** - `GET /tsapi/v3/transactions` also 404s against
      `api-mock` ("path...does not exist in the specification"), consistent with FX/
      Balances, but no official spec checked yet to confirm there's truly no Mock server
      (unlike FX/Balances, where the spec itself confirms it). Worth a quick check before
      writing this off for good.
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
