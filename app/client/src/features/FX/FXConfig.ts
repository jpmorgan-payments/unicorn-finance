// Sample accounts + base currencies for the FX Rate Sheet beat. These mirror the
// familiar demo accounts used elsewhere so the beats feel like one product.

export const DEFAULT_FX_ACCOUNTS = [
  { label: "RAPID AUDIO LLC - 000000010900009", value: "000000010900009" },
  { label: "MORRIS ELECTRIC CONTRACTING LLC - 000000010962009", value: "000000010962009" },
  { label: "OFFICE 123 INC - 000000010975001", value: "000000010975001" },
];

// Base currency the account holds / prices from. The rate sheet comes back with
// rates against a set of counter currencies.
export const BASE_CURRENCY_OPTIONS = [
  { label: "USD - US Dollar", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "GBP - British Pound", value: "GBP" },
];
