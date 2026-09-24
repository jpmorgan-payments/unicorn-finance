// FX Rate Sheet API - a rate sheet tied to an account, returned in real time.
// Request: one account + one base currency per call.
// Response: _metadata + data[] of rates vs a set of counter currencies.
//
// Field shapes mirror the (non-public) FX Rate Sheet / Xpedite Remit FX Rate
// Sheet docs, as also modelled in payments-garage-demo. NOTE: `guarenteedRateInd`
// is intentionally spelled to match the real API field (a known JPM typo).
// Path + exact schema are INFERRED - confirm with the API owners before live use.

export type FXRate = {
  rateId: string;
  customRateId: string;
  country: string;
  baseCurrency: string;
  counterCurrency: string;
  payoutType: string;
  guarenteedRateInd: boolean;
  minTranSize: number;
  maxTranSize: number;
  effectiveDate: string;
  effectiveTime: string;
  rate: number;
};

export type FXRateSheetResponse = {
  _metadata: {
    disclaimer: string;
    timestamp: string;
  };
  data: FXRate[];
};

export type FXHistory = {
  accountId: string;
  currency: string;
  requestData: any;
  responseData: any;
  status: "Success" | "Error";
  errorMessage?: string;
};
