# Postman collection

Never mind the code - get straight to the API calls behind the four beats.

`Unicorn Finance - Payments Garage.postman_collection.json` has a request per beat:
Global Payments (Reach), FX Rate Sheet (Speed), Account Validation (Confidence), and
the Transactions/Balances retrieve side.

`baseUrl` defaults to the local Prism mock-server, so you can run the calls offline:

```sh
cd app/server/mock-server
docker compose up
```

Global Payments and Account Validation are backed by the OpenAPI specs in
`app/server/mock-server/specs` and work fully against that mock. FX, Transactions and
Balances currently run in the app itself (via the in-browser MSW mock - open the app's
**Request Preview** drawer to see them) and against the real CAT sandbox once you are
onboarded; adding their Prism specs is a follow-up.

No credentials or secrets are stored in the collection. Real (CAT) mode uses mTLS + a
signed JWT via the express server - see `.env.example`.
