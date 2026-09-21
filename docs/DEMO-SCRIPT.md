# Demo script - Unicorn Finance, live

Companion to the Payments Garage deck hidden behind the Konami code
(`app/client/public/garage`). Run everything on **Local Mock** - no keys, no
server, no Docker needed. `app/server` only exists for the JPMC Mock/CAT
tiers (OAuth2 exchange / mTLS + signed JWT) - Local Mock mocks entirely
in-browser via MSW. Just `cd app/client && pnpm start` (port 3000), or
`docker compose up` where Docker Hub isn't blocked.

Checked against the running app on 2026-09-21 - see the "matches the app"
notes below each beat. A couple of things in the deck are illustrative only
and aren't clickable in the live UI; called out where relevant.

**If a submit ever comes back "500 Internal Server Error" with an empty
body:** MSW's service worker didn't take control of the page in time (seen
once during rehearsal). Hard-reload (Cmd+Shift+R) and resubmit - that's not
an app bug, just a first-load race with the service worker.

## Setup

- Env chip top-left: **Local Mock**.
- The premise: paying a $100,000 supplier invoice, San Jose -> Palo Alto.

## Bay 1 - Global Payments

1. Open **Global Payments**.
2. Payment type: **US Real-Time Payments (RTP)**. (ACH is also selectable;
   FPS/SEPA/PIX/IMPS from the deck's "Behind the API" slides are illustrative
   only - not options in this form.)
3. Debtor account: **UNICORN FINANCE - SAN JOSE**.
4. Creditor account: **PALO ALTO ROBOTICS LLC**.
5. Amount: defaults to `100` - bump it to `100000` for the story.
6. Submit. Open **Preview Request** to show the live `POST
   /payment/v2/payments` body, including the auto-generated `endToEndId`
   (`UF<timestamp>`). There's no remittance/invoice field in this form - the
   deck's `INV-2026-4417` is illustrative.
7. **Checkpoint:** "who's sent one?"

## Bay 1 -> Track Payment

8. Watch the **Payment Status Panel** step through the GPI track:
   RECEIVED -> ACCEPTED -> PROCESSING -> COMPLETED. "Play" mode auto-advances;
   "Debug" mode lets you step it manually.

## Bay 2 - Chaos

9. Back on the Global Payments form, the **Chaos** dropdown is local-mock
   only. Options and outcomes (verified against `mocks/chaosScenarios.ts`):
   - **Operational hiccup** -> RECEIVED -> ACCEPTED -> PROCESSING -> RETRY
     (`RETRYING_CLEARING_SUBMISSION`) -> COMPLETED. Wobbles, still lands.
   - **Funds check failed** -> RECEIVED -> ACCEPTED -> REJECTED
     (`FUNDS_CONTROL_FAILED`).
   - **Fraud hold** -> RECEIVED -> ACCEPTED -> REJECTED (`FRAUD_HOLD`).
10. Pick one, resend, show the track wobble or reject with the reason
    attached - it's data on the response, not a support ticket.
11. **Checkpoint:** "who got some chaos?"

## Bay 3 - Account Validation

12. Open **Account Validation**. Three preset example accounts
    (`ValidationServiceConfig.ts`), same supplier name, different records:
    - **On file** - acct `...4417`, routing `021000021` -> **Match, GREEN**.
    - **Recent email** - acct `...8825`, routing `121000248` -> **No Match,
      RED**.
    - **Today's invoice** - acct `...8825`, routing `121000248` -> **No
      Match, RED**.
13. Run **"Verify and authenticate account"** against all three - the
    payoff is that two of the three fail ownership authentication (RED), even
    though the supplier name matches everywhere. That's the reason to check
    before paying, not after.
14. Run **"Account Confidence Score"** (no profile name in the request body)
    on the same account to show the same URL answering a different question -
    a numeric score + RAG rating instead of a verify/authenticate pass-fail.
    Note: the deck's slide about naming your own profile
    (`MyHighValueProfile` / `MyLowValueProfile`) is conceptual - this app only
    exposes the two fixed profiles above.
15. Close: "same URL, same account - what you pass in the body decides the
    question you're asking."

## Known gaps vs. the deck (don't demo these live)

- International rails (FPS, SEPA Instant, PIX, IMPS) - shown in "Behind the
  API" slides, no adapter in this app.
- Custom-named validation profiles - conceptual only; this app hardcodes
  `authentication` and `acs`.
- JPMC Mock tier for Global Payments is wired but its live smoke test against
  `api-mock.payments.jpmorgan.com` hasn't been run yet - see
  `docs/NEXT-STEPS.md`. Stick to Local Mock for the live demo until that's
  confirmed.
