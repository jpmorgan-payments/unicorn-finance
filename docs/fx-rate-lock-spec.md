# Spec: FX rate lock -> wire payment -> Cash Reporting settlement

Status: draft, not implemented. Scoped to the app (this repo), not the Payments
Garage slides - the FX beat exists today as an indicative rate sheet only; this
spec adds the missing "book it" step and threads the resulting contract through
the rest of the flow that already exists in the app.

## The flow being specced

1. Grab a rate and book it via an RFQ endpoint -> returns a `contractId`.
2. Inject that `contractId` into the wire payment (GPv2 today; contract shape
   should hold for any channel).
3. See the settlement on Cash Reporting (Transactions / Txn Details) once the
   debit posts, with the FX contract still attached.

## Current state (what's already in the app)

- `FX Rate Sheet` (`POST /api/fxapi/v1/rate-sheets`) returns indicative,
  non-tradable rates - `_metadata.disclaimer` says so explicitly. Rows carry
  `rateId` / `customRateId` / `guarenteedRateInd` but nothing is ever booked.
- `Global Payments` (`POST /api/digitalSignature/payment/v2/payments`) has no
  concept of an FX leg - `value.currency` is just whatever the form sets.
- `Transactions` (`GET /api/tsapi/v3/transactions`) is a static mock list with
  no link back to a payment or an FX contract.
- All three already share one demo narrative thread (account
  `000000010900009`, reference `INV-2026-4417`) but nothing code-level
  connects them - the connection currently only exists in prose across the
  bruno docs.

This spec closes that gap: book a real (mocked) contract, carry its id through
the payment, and surface it on the transaction it settles.

## 1. RFQ / book-the-rate endpoint

New endpoint, separate from the rate sheet (which stays indicative-only).
Booking should only be offered for rows where `guarenteedRateInd: true`.

Path: `POST /api/fxapi/v1/rate-contracts` (inferred - confirm naming with the
FX API owners, same caveat as the existing rate-sheet path).

Request:
```json
{
  "accountId": "000000010900009",
  "rateId": "RS-USD-EUR-001",
  "dealtCurrency": "USD",
  "dealtAmount": "1000000",
  "settlementCurrency": "EUR"
}
```

Response:
```json
{
  "contractId": "FXC-2026-000123",
  "rateId": "RS-USD-EUR-001",
  "rate": 0.9231,
  "dealtCurrency": "USD",
  "dealtAmount": "1000000",
  "settlementCurrency": "EUR",
  "settlementAmount": "923100.00",
  "bookedTimestamp": "2026-09-17T14:03:00Z",
  "contractExpiryDate": "2026-09-18",
  "status": "BOOKED"
}
```

App-side changes:
- `FXTypes.ts`: add `FXBookRequest` / `FXBookedContract` types.
- `SubmitFXRequest.ts`: add `FX_RATE_CONTRACTS_PATH` + `submitFXBookRequest`,
  mirroring the existing `submitFXRequest` shape.
- `FXInputForm.tsx` (or a new `FXBookRateForm`): once a rate sheet comes back,
  let the user pick a guaranteed row and hit "Book rate". Store the resulting
  `contractId` (+ rate, amounts) as the FX beat's "active contract" - simplest
  option is a small context (`FXContractContext`) or just `localStorage`,
  consistent with how `useApiHistory` already persists beat history client-side.
- MSW handler: new `http.post("/api/fxapi/v1/rate-contracts", ...)` that looks
  up the `rateId` in `FXRateSheet.json`, rejects non-guaranteed rows (400), and
  returns a deterministic `contractId` (e.g. hash of accountId+rateId+amount)
  so repeated demo runs are stable.

## 2. Carry the contractId into the wire payment

GPv2 request body needs an FX leg. Inferred shape (confirm with API owners -
real Global Payments FX-linked-payment contract may differ):

```json
{
  "...": "existing payment fields unchanged",
  "value": { "currency": "EUR", "amount": "923100.00" },
  "fx": {
    "contractId": "FXC-2026-000123",
    "dealtCurrency": "USD",
    "dealtAmount": "1000000",
    "rate": 0.9231
  }
}
```

App-side changes:
- `GlobalPaymentTypes.ts`: add an optional `FXDetails` type and `fx?: FXDetails`
  on the request body / `PaymentHistory`.
- `SubmitGlobalPaymentsRequest.ts`: `generateGlobalPaymentsRequestBody` takes
  an optional `fxDetails` param and spreads it in as `fx` when present.
- `GlobalPaymentsInputForm.tsx`: if an active booked contract exists (from
  step 1's context/localStorage), show a read-only "Linked FX contract" panel
  (contractId, rate, settlement amount) and pre-fill `value.currency` /
  `value.amount` from it instead of letting the user re-type them. Payment
  submits with `fx` attached; clear the active contract on success so it can't
  be reused for two payments.
- MSW handler for `/api/digitalSignature/payment/v2/payments`: no behavioural
  change needed to accept `fx`, but the handler should echo it back in the
  response so `PaymentHistory` / the request-preview drawer show it, and it
  needs to know about it for step 3.

## 3. Show the settlement on Cash Reporting (Transactions / Txn Details)

When the debit posts, its transaction record should carry the FX contract
that funded it.

`TransactionsTypes.ts` - extend `Transaction`:
```ts
export type Transaction = {
  // ...existing fields
  fxContractId?: string;
  fxRate?: number;
  dealtCurrency?: string;
  dealtAmount?: number | string;
};
```

Mock wiring (today `transactions.json` is static and disconnected from any
payment call, which is the actual end-to-end gap):
- On a successful mocked payment submission that included `fx`, append (or
  upsert) a matching row to the in-memory transactions mock - `DEBIT`,
  `settlementCurrency`/`amount` from the payment, `fxContractId` /
  `fxRate` / `dealtCurrency` / `dealtAmount` from the `fx` block, `status:
  "BOOKED"`. This is what makes "book -> pay -> see it settle" actually
  demoable end to end instead of three independent mocks.
- Keep one static seeded row for the existing `INV-2026-4417` narrative so the
  page isn't empty on first load, but it doesn't need a real `fxContractId`
  unless we backfill one for consistency with the FX/GPv2 bruno docs.

UI changes:
- `TransactionsDisplay.tsx`: no new column needed for the main table (keep it
  to Transaction ID / Date / Amount / Status per existing convention); surface
  `fxContractId` / rate / dealt amount in the row's request-preview drawer
  (`openDrawer(requestData, selected)`) since that's already the pattern used
  for "click a row to see detail" (Txn Details).

## Open questions / confirm before building

- Real path + request/response shape for booking a rate sheet quote (this
  spec's `/fxapi/v1/rate-contracts` is inferred, same as the existing
  rate-sheet path caveat in `FXTypes.ts`).
- Real GPv2 field name for an FX-linked leg (`fx` here is a guess) - and
  whether Global Payments even accepts a pre-booked contract reference or
  expects the FX deal referenced differently (e.g. in
  `remittanceInformation` instead of a first-class `fx` block).
- Contract expiry handling: what should happen in the UI if the user tries to
  pay against a `contractId` past `contractExpiryDate`? (Out of scope for v1 -
  note as a known gap rather than silently allowing it.)
- Whether "Cash Reporting" here just means the existing Transactions
  (`tsapi/v3`) beat, or a distinct reporting API - there's no separate cash
  reporting beat in the app today, so this spec assumes Transactions is Cash
  Reporting's Txn Details view.

## Out of scope for this spec

- Real JPMC Mock/CAT wiring (tracked separately in
  [`NEXT-STEPS.md`](NEXT-STEPS.md)) - this is MSW-mock-only, same as the
  existing FX/Transactions beats.
- Multi-leg or partial-fill contracts, rate expiry re-quoting, cancellation.
